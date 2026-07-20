import { Component, OnDestroy, TemplateRef, ViewChild, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InputOtpModule } from 'primeng/inputotp';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import parsePhoneNumberFromString, { getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import { VerificationserviceService } from '../services/verificationservice.service';
import { HttpserviceService } from '../services/httpservice.service';
import { OpenSuccessModalService } from '../services/opensucess-modal.service';

type VerifyTarget = 'email' | 'mobile';

export const OTP_LENGTH = 6;
const CODE_TIMER_SECONDS = 300;
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

const NAME_PATTERN = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const BLOCKED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'icloud.com', 'live.com'];

function workEmailValidator(control: AbstractControl) {
  const value: string = control.value || '';
  const domain = value.split('@')[1]?.toLowerCase();
  return domain && BLOCKED_EMAIL_DOMAINS.includes(domain) ? { workEmail: true } : null;
}

// Mirrors ContactDetailsComponent.phoneNumberValidator in hrms/personal-info/personal/contact-details
function mobileNumberValidator(countryCode: string) {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!countryCode || !value) {
      return null;
    }
    const phoneNumber = parsePhoneNumberFromString(String(value), countryCode as any);
    return phoneNumber && phoneNumber.isValid() ? null : { invalidPhoneNumber: true };
  };
}

@Component({
  selector: 'app-demo-form',
  imports: [ReactiveFormsModule, FormsModule, InputOtpModule, NgxCountriesDropdownModule],
  templateUrl: './demo-form.component.html',
  styleUrl: './demo-form.component.scss',
})

export class DemoFormComponent implements OnDestroy {
  private readonly fb = new FormBuilder();
  @ViewChild('verifyModal') verifyModalTpl!: TemplateRef<unknown>;
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(NAME_PATTERN)]],
    middleName: ['', [Validators.maxLength(50), Validators.pattern(NAME_PATTERN)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(NAME_PATTERN)]],
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN), workEmailValidator]],
    mobile: ['', [mobileNumberValidator('IN')]],
    demoPreference: ['prefilled' as 'prefilled' | 'custom', Validators.required],
    agreeTerms: [false, Validators.requiredTrue],
  });
  submitted = false;
  submittedSuccessfully = false;
  companyDuplicateMessage: string | null = null;
  emailDuplicateMessage: string | null = null;
  currentStep = 0;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean } = {
    hideCode: true,
    hideName: true,
  };
  countryListConfig = { hideCode: true };
  selectedCountryCode = signal<any>('IN');
  mobileDialCode: string | null = null;
  mobilePlaceholder = 'Please enter mobile number';
  selectedFile: File | null = null;
  logoPreviewUrl: string | null = null;
  fileError: string | null = null;
  dragOver = false;
  emailVerified = false;
  mobileVerified = false;
  activeTarget: VerifyTarget | null = null;
  emailOtpValue = '';
  mobileOtpValue = '';
  otpError: string | null = null;
  emailTimer = 0;
  mobileTimer = 0;
  errormsg: string | null = null;
  emailVerifyLoader = false;
  mobileVerifyLoader = false;
  submitLoader = false;
  private emailInterval?: ReturnType<typeof setInterval>;
  private mobileInterval?: ReturnType<typeof setInterval>;
  private modalRef?: NgbModalRef;

  constructor(private readonly modalService: NgbModal, private verificationService: VerificationserviceService, 
    private httpService: HttpserviceService, private confirmationpopup: OpenSuccessModalService) { }

  ngOnDestroy(): void {
    clearInterval(this.emailInterval);
    clearInterval(this.mobileInterval);
  }

  get mobileProvided(): boolean {
    return !!this.form.controls.mobile.value?.trim();
  }

  onCountryChange(country: any): void {
    this.selectedCountryCode.set(country.code);
    this.mobileDialCode = country.dialling_code;
    this.form.controls.mobile.setValidators([mobileNumberValidator(country.code)]);
    this.form.controls.mobile.updateValueAndValidity();

    const example = getExampleNumber(country.code, examples as any);
    this.mobilePlaceholder = example ? `e.g. ${example.formatNational()}` : 'Please enter mobile number';
  }

  onMobileNumberInput(): void {
    const control = this.form.controls.mobile;
    if (!control.value) {
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(String(control.value), this.selectedCountryCode());
    if (phoneNumber && phoneNumber.isValid()) {
      control.setValue(phoneNumber.formatNational(), { emitEvent: false });
    }
  }

  trimNameField(controlName: 'firstName' | 'middleName' | 'lastName' | 'companyName'): void {
    const control = this.form.controls[controlName];
    const trimmed = (control.value ?? '').trim();
    if (trimmed !== control.value) {
      control.setValue(trimmed);
    }
  }

  onCompanyNameInput(): void {
    if (this.companyDuplicateMessage) {
      this.companyDuplicateMessage = null;
      const errors = { ...this.form.controls.companyName.errors };
      delete errors['duplicate'];
      this.form.controls.companyName.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  onEmailInput(): void {
    if (this.emailDuplicateMessage) {
      this.emailDuplicateMessage = null;
      const errors = { ...this.form.controls.email.errors };
      delete errors['duplicate'];
      this.form.controls.email.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  get canSubmit(): boolean {
    return (this.form.valid && this.emailVerified);
  }

  get step1Valid(): boolean {
    return (
      this.form.controls.firstName.valid &&
      this.form.controls.lastName.valid &&
      this.form.controls.middleName.valid &&
      this.form.controls.companyName.valid &&
      this.form.controls.mobile.valid &&
      this.emailVerified
    );
  }

  get step2Valid(): boolean {
    return true;
  }

  get step3Valid(): boolean {
    return this.form.controls.agreeTerms.value === true;
  }

  get currentStepValid(): boolean {
    if (this.currentStep === 0) {
      return this.step1Valid;
    }
    if (this.currentStep === 1) {
      return this.step2Valid;
    }
    return this.step3Valid;
  }

  // get navHint(): string {
  //   // if (this.currentStep === 0) {
  //   //   return this.step1Valid ? 'Looks good — continue.' : 'Fill the required fields and verify your email.';
  //   // }
  //   // if (this.currentStep === 1) {
  //   //   return 'Logo is optional — continue when ready.';
  //   // }
  //   // return this.step3Valid ? 'All set — create your demo instance.' : 'Accept the terms to continue.';
  // }

  nextStep(): void {
    if (this.currentStep === 2) {
      this.submitted = true;
    }
    if (!this.currentStepValid) {
      return;
    }
    if (this.currentStep < 2) {
      this.currentStep++;
    } else {
      this.onSubmit();
    }
  }

  backStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  cancelForm(): void {
    this.form.controls.email.enable();
    this.form.reset({
      firstName: '',
      middleName: '',
      lastName: '',
      companyName: '',
      email: '',
      mobile: '',
      demoPreference: 'prefilled',
      agreeTerms: false,
    });
    this.currentStep = 0;
    this.submitted = false;
    this.emailVerified = false;
    this.mobileVerified = false;
    this.otpError = null;
    this.companyDuplicateMessage = null;
    this.emailDuplicateMessage = null;
    this.selectedFile = null;
    this.logoPreviewUrl = null;
    this.fileError = null;
    this.dragOver = false;
    this.selectedCountryCode.set('IN');
    this.mobileDialCode = null;
  }

  get currentOtpValue(): string {
    return this.activeTarget === 'mobile' ? this.mobileOtpValue : this.emailOtpValue;
  }

  set currentOtpValue(value: string) {
    if (this.activeTarget === 'mobile') {
      this.mobileOtpValue = value;
    } else {
      this.emailOtpValue = value;
    }
  }

  get currentTimer(): number {
    return this.activeTarget === 'mobile' ? this.mobileTimer : this.emailTimer;
  }

  formattedTimer(): string {
    const seconds = this.currentTimer;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // --- Verification flow ---
  openVerify(target: VerifyTarget): void {
    const control = target === 'email' ? this.form.controls.email : this.form.controls.mobile;
    control.markAsTouched();
    if (control.invalid || !control.value) {
      return;
    }
    this.activeTarget = target;
    this.otpError = null;
    this.currentOtpValue = '';
    this.startTimer(target);
    if (target === 'email' && this.form.get('email')?.value) {
      this.sendEmailVerificationCode(target);
    }
  }

  sendEmailVerificationCode(fieldname: any): void {
    if (fieldname === 'email') { this.emailVerifyLoader = true; }
    if (fieldname === 'mobile') { this.mobileVerifyLoader = true; }
    const email = this.form.get('email')?.value;
    if (!email) {
      this.confirmationpopup.openErrorModal('Please enter an email address first!');
      return;
    }
    const fullName = [this.form.get('firstName')?.value, this.form.get('middleName')?.value, 
      this.form.get('lastName')?.value].filter(name => name?.trim()).join(' ');
    this.verificationService.sendVerificationCode(email, fullName).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          //console.log(res.message);
          this.emailVerifyLoader = false;
          this.mobileVerifyLoader = false;
          this.modalRef = this.modalService.open(this.verifyModalTpl, { centered: true, backdrop: 'static' });
          this.modalRef.result.finally(() => {
            this.activeTarget = null;
            this.otpError = null;
          });
        } else {
          this.confirmationpopup.openErrorModal(res.message || 'Failed to send verification code.');
        }
      },
      error: (err: any) => {
        this.emailVerifyLoader = false;
        this.mobileVerifyLoader = false;
        const errBody = err?.error;
        const msg = errBody?.errors ? Object.values(errBody.errors).join(', ')
          : errBody?.message || 'Failed to send verification code. Please try again.';
        this.confirmationpopup.openErrorModal(msg);
      }
    });
  }

  private startTimer(target: VerifyTarget): void {
    if (target === 'email') {
      clearInterval(this.emailInterval);
      this.emailTimer = CODE_TIMER_SECONDS;
      this.emailInterval = setInterval(() => {
        if (this.emailTimer > 0) {
          this.emailTimer--;
        } else {
          clearInterval(this.emailInterval);
        }
      }, 1000);
    } else {
      clearInterval(this.mobileInterval);
      this.mobileTimer = CODE_TIMER_SECONDS;
      this.mobileInterval = setInterval(() => {
        if (this.mobileTimer > 0) {
          this.mobileTimer--;
        } else {
          clearInterval(this.mobileInterval);
        }
      }, 1000);
    }
  }

  resendCode(): void {
    const target = this.activeTarget;
    if (!target) {
      return;
    }
    this.currentOtpValue = '';
    this.otpError = null;
    this.startTimer(target);
  }

  verifyCode(): void {
    if (this.currentOtpValue.length !== OTP_LENGTH) {
      return;
    }
    const email = this.form.get('email')?.value;
    if (!email) return;

    if (this.currentTimer <= 0) {
      this.otpError = "This OTP is no longer valid. Please click 'Resend OTP' to receive a new one.";
      return;
    }

    this.verificationService.verifyEmailCode(email, this.currentOtpValue).subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.verified) {
          this.emailVerified = true;
          this.otpError = null;
          // Disable the email field
          this.form.get('email')?.disable();
          this.modalRef?.close();
        } else {
          const backendMsg = (res.message || '').toLowerCase();
          this.otpError = backendMsg.includes('expired')
            ? "This OTP is no longer valid. Please click 'Resend OTP' to receive a new one."
            : 'The OTP you entered is invalid. Please try again.';
        }
      },
      error: (err) => {
        console.error('Error verifying email:', err);
        const backendMsg = (err?.error?.message || '').toLowerCase();
        if (backendMsg.includes('expired')) {
          this.otpError = "This OTP is no longer valid. Please click 'Resend OTP' to receive a new one.";
        } else if (!err?.status || err.status >= 500) {
          this.otpError = 'Unable to verify the OTP at this time. Please try again later.';
        } else {
          this.otpError = 'The OTP you entered is invalid. Please try again.';
        }
      }
    });
  }

  dismissModal(): void {
    this.modalRef?.dismiss();
  }

  // --- Company logo upload ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setLogoFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setLogoFile(file);
    }
  }

  private setLogoFile(file: File): void {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      this.fileError = 'Only PNG, JPG, JPEG or SVG files are supported.';
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      this.fileError = 'File size cannot exceed 5 MB.';
      return;
    }
    this.fileError = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFile = file;
      this.logoPreviewUrl = reader.result as string;
    };
    reader.onerror = () => {
      this.fileError = 'Unable to upload the selected image.';
      this.selectedFile = null;
      this.logoPreviewUrl = null;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.logoPreviewUrl = null;
    this.fileError = null;
  }

  // --- Submit ---
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (!this.canSubmit) {
      return;
    }
    this.submitLoader = true;
    const formvalue = this.form.getRawValue();
    let payload = {
      firstName: formvalue.firstName,
      middleName: formvalue.middleName,
      lastName: formvalue.lastName,
      emailAddress: formvalue.email,
      contactNumber: formvalue.mobile,
      isPrefilledData: true,
      companyLogo: this.selectedFile?.name ?? null,
      companyName: formvalue.companyName
    }
    this.httpService.createdemoinstance(payload).subscribe({
      next: (response: any) => {
        this.submitLoader = false;
        //this.confirmationpopup.openSuccessModal('Demo instance created successfully!');
        if (response.statusCode === 201) {
          this.submittedSuccessfully = true;
        }
      },
      error: (error: any) => {
        this.submitLoader = false;
        const errBody = error?.error;
        const msg = errBody?.errors ? Object.values(errBody.errors).join(', ')
          : errBody?.message || 'Something went wrong. Please try again.';
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('already been created')) {
          this.emailDuplicateMessage = msg;
          this.emailVerified = false;
          this.form.controls.email.enable();
          this.form.controls.email.setErrors({ duplicate: true });
          this.form.controls.email.markAsTouched();
          this.currentStep = 0;
          return;
        }
        if (lowerMsg.includes('already exists')) {
          this.companyDuplicateMessage = msg;
          this.form.controls.companyName.setErrors({ ...this.form.controls.companyName.errors, duplicate: true });
          this.form.controls.companyName.markAsTouched();
          this.currentStep = 0;
          return;
        }
        this.confirmationpopup.openErrorModal(msg);
        console.error('API Error:', error);
      }
    });
  }
}