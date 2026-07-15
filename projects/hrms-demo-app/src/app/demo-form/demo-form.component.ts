import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InputOtpModule } from 'primeng/inputotp';

type VerifyTarget = 'email' | 'mobile';

export const OTP_LENGTH = 6;
const CODE_TIMER_SECONDS = 105;
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s.'-]{1,79}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const MOBILE_PATTERN = /^\+?[0-9\s-]{10,15}$/;

@Component({
  selector: 'app-demo-form',
  imports: [ReactiveFormsModule, FormsModule, InputOtpModule],
  templateUrl: './demo-form.component.html',
  styleUrl: './demo-form.component.scss'
})
export class DemoFormComponent implements OnDestroy {
  private readonly fb = new FormBuilder();

  @ViewChild('verifyModal') verifyModalTpl!: TemplateRef<unknown>;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]],
    mobile: ['', [Validators.pattern(MOBILE_PATTERN)]],
    demoPreference: ['prefilled' as 'prefilled' | 'custom', Validators.required],
    agreeTerms: [false, Validators.requiredTrue],
  });

  submitted = false;
  submittedSuccessfully = false;

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
  private emailInterval?: ReturnType<typeof setInterval>;
  private mobileInterval?: ReturnType<typeof setInterval>;
  private modalRef?: NgbModalRef;

  constructor(private readonly modalService: NgbModal) {}

  ngOnDestroy(): void {
    clearInterval(this.emailInterval);
    clearInterval(this.mobileInterval);
  }

  get mobileProvided(): boolean {
    return !!this.form.controls.mobile.value?.trim();
  }

  get canSubmit(): boolean {
    return (
      this.form.valid &&
      this.emailVerified &&
      (!this.mobileProvided || this.mobileVerified)
    );
  }

  get step1Done(): boolean {
    return (
      !!this.form.controls.fullName.value?.trim() &&
      !!this.form.controls.companyName.value?.trim() &&
      this.emailVerified
    );
  }

  get step2Done(): boolean {
    return this.step1Done;
  }

  get step3Done(): boolean {
    return this.submittedSuccessfully;
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

    this.modalRef = this.modalService.open(this.verifyModalTpl, { centered: true, backdrop: 'static' });

    this.modalRef.result.finally(() => {
      this.activeTarget = null;
      this.otpError = null;
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
    const target = this.activeTarget;
    if (!target) {
      return;
    }
    if (this.currentOtpValue.length !== OTP_LENGTH) {
      this.otpError = 'Enter the full 6-digit code.';
      return;
    }

    if (target === 'email') {
      this.emailVerified = true;
    } else {
      this.mobileVerified = true;
    }
    this.modalRef?.close();
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
      this.fileError = 'Only PNG, JPG or SVG files are allowed.';
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      this.fileError = 'File size must be 5MB or smaller.';
      return;
    }
    this.fileError = null;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
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
    this.submitted = true;
    this.form.markAllAsTouched();
    if (!this.canSubmit) {
      return;
    }

    console.log('Demo request submitted:', {
      ...this.form.value,
      companyLogo: this.selectedFile?.name ?? null,
      emailVerified: this.emailVerified,
      mobileVerified: this.mobileVerified,
    });

    this.submittedSuccessfully = true;
  }
}
