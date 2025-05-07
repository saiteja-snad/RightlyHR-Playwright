import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { Ibank, Ibankdetails } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { IProbationEmployees } from '../../../admin/probation-employees/probation-emp-module';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-bank-details',
  imports: [
    Select,
    CommonModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    TranslateModule,
  ],
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.scss',
})
export class BankDetailsComponent implements OnInit, OnDestroy {
  banknames: Ibank[] = [];
  bankDetailsForm!: FormGroup;
  bankid: any;
  bankDetailsUpdateForm!: FormGroup;
  bankDetails = new BehaviorSubject<Ibankdetails[]>([]);
  empinfo: any = {};
  subscription!: Subscription;
  proofValid: boolean = true;
  bankdocument: any;
  displayblankdocument: any;
  employedata = {} as IProbationEmployees;
  spinnerLoader = false;
  constructor(
    private readonly modalService: NgbModal,
    private http: HttpService,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    public formValidation: FormValidationService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeBankDetailsForm();
    this.initializeBankDetailsupdateForm();
    this.getbanknames();
    this.getbankempid();
    this.getEmployeeId();
  }

  initializeBankDetailsForm(): void {
    this.bankDetailsForm = this.fb.group({
      bankName: ['', Validators.required],
      accountName: ['', [Validators.required]],
      accountNo: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{12,20}$')],
      ],
      ifscCode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9]{11}$'),
          this.invalidIfscCodeValidator(),
        ],
      ],
      isPrimary: [false],
      attachment: [null, Validators.required],
    });
  }

  initializeBankDetailsupdateForm(): void {
    const attachmentValidators = this.displayblankdocument ? [] : [Validators.required];
    this.bankDetailsUpdateForm = this.fb.group({
      bankNameupdate: ['', Validators.required],
      accountNameupdate: ['', [Validators.required]],
      accountNoupdate: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{12,20}$')],
      ],
      ifscCodeupdate: [
        '',
        [Validators.required, Validators.pattern('^[^s].*$')],
      ],
      isPrimaryupdate: [false],
      attachmentupdate: [null,attachmentValidators]
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.employedata = data;
          this.patchForm(data);
          localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
        },
        error: (reason) =>
          console.error('Error fetching employee data:', reason),
      });
  }

  patchForm(data: any): void {
    this.bankDetailsForm.patchValue({
      bankName: data.bankName || '',
      accountName: data.accountName || '',
      accountNo: data.accountNo || '',
      ifscCode: data.ifscCode || '',
      isPrimary: data.isPrimary || false,
      attachment: data.attachment || null,
    });
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
  invalidBankNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && /^0+$/.test(value)) {
        return { invalidbankNumber: true }; // Return error if account number is all zeros
      }
      return null; // Valid account number
    };
  }

  invalidIfscCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && /^0+$/.test(value)) {
        return { invalidIfscCode: true }; // Return error if IFSC Code is all zeros
      }
      return null; // Valid IFSC Code
    };
  }
  //drop drown
  getbanknames(): void {
    this.subscription = this.http.getData(`Bank`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.banknames = data.sort((a: any, b: any) =>
            (a.bankName1 || '').localeCompare(b.bankName1 || '')
          );
        } else {
          this.banknames = [];
        }
      },
      error: (err: any) => {
        console.error('Error fetching bank names:', err);
      },
    });
  }

  //Bank Details
  getbankempid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`BankDetail/${EmpId}`).subscribe({
      next: (data: any) => {
        this.bankDetails.next(data);
      },
    });
  }

  onBankProofSelected(event: any): void {
    this.displayblankdocument = null;
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      // const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      // const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileSizeInMB > 25) {
        this.bankdocument = null;
        this.conformationPopup.openErrorModal(
          'The file size should be less than 25MB.'
        );
        this.bankDetailsForm.get('attachment')?.reset();
        this.bankDetailsForm.get('attachment')?.markAsUntouched();
        this.bankDetailsUpdateForm.get('attachmentupdate')?.reset();
        this.bankDetailsUpdateForm.get('attachmentupdate')?.markAsUntouched();

        return;
      }
    }
    const timestamp = new Date().getTime();
    this.bankdocument = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  postBankDetails(): void {
    if (this.bankDetailsForm.valid) {
      this.spinnerLoader = true;
      const payload = this.createBankDetailsPayload();
      if (this.bankdocument) {
        this.uploadBankProof(payload);
      } else {
        this.saveBankDetails(payload);
      }
    } else {
      this.bankDetailsForm.markAllAsTouched();
    }
  }

  uploadBankProof(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Bank Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.bankdocument
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.spinnerLoader = false;
            payload.docUrl = data.path;
            this.saveBankDetails(payload);
          }
        },
        error: () => {
          this.spinnerLoader = false;
          console.error('File upload failed');
        },
      });
  }

  saveBankDetails(payload: any): void {
    this.subscription = this.http.postdata('BankDetail', payload).subscribe({
      next: () => {
        this.spinnerLoader = false;
        this.getbankempid();
        this.bankDetailsForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(
          'Bank details added successfully'
        );
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(
          err.error.Message || 'Bank details added failed'
        );
      },
    });
  }

  createBankDetailsPayload(attachmentPath: string = ''): any {
    return {
      empId: parseInt(this.empinfo.employeeId),
      bankName: this.bankDetailsForm.get('bankName')?.value?.bankName1,
      accountName: this.bankDetailsForm.get('accountName')?.value,
      accountNo: this.bankDetailsForm.get('accountNo')?.value,
      ifscCode: this.bankDetailsForm.get('ifscCode')?.value,
      isPrimary: this.bankDetailsForm.get('isPrimary')?.value || false,
    };
  }

  //download Functionality
  onSelectBankProofDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.docUrl)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.docUrl.split('/')[file.docUrl.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }

  //keypress
  restrictInput(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight'
    ) {
      return;
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    const isAlphabetic = /^[A-Za-z\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
  }

  openModalupdate(content: any, bankDetail: any): void {
    this.bankid = bankDetail.bankId;
    const selectedBank = this.banknames.find(
      (bank) => bank.bankName1 === bankDetail.bankName
    );
    // Patch the values into the form
    this.bankDetailsUpdateForm.patchValue({
      bankNameupdate: selectedBank,
      accountNameupdate: bankDetail.accountName,
      accountNoupdate: bankDetail.accountNo,
      ifscCodeupdate: bankDetail.ifscCode,
      isPrimaryupdate: bankDetail.isPrimary,
    });
    this.displayblankdocument = bankDetail.docUrl
      ? bankDetail.docUrl.split('/').pop()
      : null;
    this.bankdocument = bankDetail.docUrl;
    // Open the modal
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  updateBankDetails(): void {
    if (this.bankDetailsUpdateForm.valid) {
      this.spinnerLoader = true;
      const formData = this.bankDetailsUpdateForm.value;
      // Prepare the payload
      const payload = {
        bankId: this.bankid,
        empId: parseInt(this.empinfo.employeeId),
        docUrl: this.bankdocument,
        bankName: formData.bankNameupdate?.bankName1 || formData.bankNameupdate, // Extract bank name
        accountName: formData.accountNameupdate, // Account holder's name
        accountNo: formData.accountNoupdate, // Account number
        ifscCode: formData.ifscCodeupdate,
        isPrimary: formData.isPrimaryupdate || false,
        isDeleted: false,
      };
      // Check if a new attachment is selected
      if (this.bankdocument instanceof File) {
        this.uploadUpdatedBankAttachment(payload);
      } else {
        this.saveUpdatedBankDetails(payload);
      }
    } else {
      this.bankDetailsUpdateForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadUpdatedBankAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Bank Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.bankdocument
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.spinnerLoader = false;
            payload.docUrl = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedBankDetails(payload);
          }
        },
        error: () => {
          this.spinnerLoader = false;
          this.conformationPopup.openErrorModal(
            'Failed to upload bank proof. Please try again.'
          );
        },
      });
  }

  saveUpdatedBankDetails(payload: any): void {
    this.subscription = this.http
      .postdata(`BankDetail/Update`, payload)
      .subscribe({
        next: (data: any) => {
          this.spinnerLoader = false;
          this.bankDetailsUpdateForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Bank details updated successfully'
          );
          this.getbankempid(); // Refresh the bank details list
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          console.error('Error updating bank details:', reason);
          this.conformationPopup.openErrorModal(
            'Failed to update bank details. Please check all fields.'
          );
        },
      });
  }

  opendeletModal(content: any, bankDetail: any): void {
    this.bankid = bankDetail.bankId;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  bankDelete(): void {
    if (!this.bankid) {
      console.error('Bank ID is not set. Cannot delete bank details.');
      return;
    }
    this.subscription = this.http
      .getData(`BankDetail/deletebyid/${this.bankid}`)
      .subscribe({
        next: (data: any) => {
          this.getbankempid(); // Refresh the bank details list
          this.modalService.dismissAll(); // Close the modal
          this.conformationPopup.openSuccessModal(
            'Bank details deleted successfully'
          );
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(
            'Failed to delete bank details. Please try again.'
          );
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}