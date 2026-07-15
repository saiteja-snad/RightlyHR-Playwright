import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Ibank, Ibankdetails } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { IProbationEmployees } from '../../../admin/probation-employees/probation-emp-module';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
@Component({
  selector: 'app-bank-details',
  imports: [Select, CommonModule, ReactiveFormsModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, NgbPopoverModule, InfoIconComponent, DownloadIconComponent, TableModule],
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.scss'
})

export class BankDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('bankTable') bankTable!: Table;
  banknames: Ibank[] = [];
  bankDetailsForm!: FormGroup;
  bankid: any
  bankDetailsUpdateForm!: FormGroup
  bankTableData: Ibankdetails[] = []; // Data bound to the table
  originalBankData: Ibankdetails[] = []; // Store original unsorted data for reset
  empinfo: any = {};
  subscription!: Subscription
  proofValid: boolean = true;
  bankdocument: any
  displayblankdocument: any
  employedata = {} as IProbationEmployees;
  spinnerLoader = false;
  loading = false
  isMyInfoRoute = false;
  getFieldsApprovalStatusList: any[] = [];
  activeMessage: string = '';
  addedRecords=[] as any;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private readonly modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService, public formValidation: FormValidationService, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeBankDetailsForm();
    this.initializeBankDetailsupdateForm()
    this.getbanknames()
    this.getFieldsApprovalStatus();
    
  }


  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.isMyInfoRoute=false;
      this.getbankempid()
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.isMyInfoRoute=true;
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getbankempid()
      this.getEmployeeId();
    }
  }
  initializeBankDetailsForm(): void {
    this.bankDetailsForm = this.fb.group({
      bankName: ['', Validators.required],
      accountName: ['', [Validators.required, Validators.maxLength(50)]],
      accountNo: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$'),]],
      ifscCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{11}$'), this.invalidIfscCodeValidator(),]],
      isPrimary: [false],
      attachment: [null, Validators.required]
    });
  }

  initializeBankDetailsupdateForm(): void {
    const attachmentValidators = this.displayblankdocument ? [] : [Validators.required];
    this.bankDetailsUpdateForm = this.fb.group({
      bankNameupdate: ['', Validators.required],
      accountNameupdate: ['', [Validators.required, Validators.maxLength(50)]],
      accountNoupdate: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$'),]],
      ifscCodeupdate: ['', [Validators.required, Validators.pattern('^[^\s].*$')]],
      isPrimaryupdate: [false],
      attachmentupdate: [null, attachmentValidators]
    });
  }


  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.patchForm(data);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      }

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
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
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
          this.banknames = data.sort((a: any, b: any) => (a.bankName1 || '').localeCompare(b.bankName1 || ''));
        } else {
          this.banknames = [];
        }
      }

    });
  }

  //Bank Details
  getbankempid() {
    this.loading = true
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`BankDetail/${EmpId}`).subscribe({
      next: (data: any) => {
        this.loading = false
        // Store the original data for resetting sorts
        this.originalBankData = [...data];
        this.bankTableData = [...data];
        // Reset sorting state when new data is loaded
        this.currentSortField = '';
        this.currentSortOrder = 0;
      },
      error: (err) => {
        this.loading = false
      },
    });
  }


  onBankProofSelected(event: any): void {
    this.displayblankdocument = null;
    const file: File = event.target.files[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg',
      'image/*',
      'application/pdf',
      'image/png',];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);

    if (!allowedTypes.includes(file.type)) {
      this.conformationPopup.openErrorModal('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.');
      this.displayblankdocument = '';
      this.resetForms();
      return;
    }

    if (fileSizeInMB > maxSizeInMB) {
      this.bankdocument = '';
      this.displayblankdocument = '';
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.resetForms();
      return;
    }

    const timestamp = new Date().getTime();
    this.bankdocument = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );


  }
  resetForms() {
    this.bankDetailsForm.get('attachment')?.reset();
    this.bankDetailsForm.get('attachment')?.markAsUntouched();
    this.bankDetailsUpdateForm.get('attachmentupdate')?.reset();
    this.bankDetailsUpdateForm.get('attachmentupdate')?.markAsUntouched();
    const attachmentValidators = this.displayblankdocument ? [] : [Validators.required];
    this.bankDetailsUpdateForm.get('attachmentupdate')?.setValidators(attachmentValidators);
    this.bankDetailsUpdateForm.get('attachmentupdate')?.updateValueAndValidity();
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  postBankDetails(): void {
    if (this.bankDetailsForm.valid) {
      this.spinnerLoader = true
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
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankdocument).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false
          payload.docUrl = data.path;
          this.saveBankDetails(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false

      }
    });
  }

  saveBankDetails(payload: any): void {
    this.subscription = this.http.postdata('BankDetail', payload).subscribe({
      next: () => {
        this.spinnerLoader = false
        this.getbankempid()
        this.getFieldsApprovalStatus();
        this.bankDetailsForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Bank information added successfully')
      },
      error: (err: any) => {
        this.spinnerLoader = false
        this.conformationPopup.openErrorModal(err.error.Message || 'Bank information added failed')
      }
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
      selfUpdate: this.isMyInfoRoute,
      moduleName: "Bank Info",
      displayName: "Personal",
      createdBy: this.empinfo.employeeId
    };
  }

  //download Functionality
  onSelectBankProofDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.docUrl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.docUrl.split('/')[file.docUrl.split('/').length - 1];
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
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
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
    this.bankid = bankDetail.bankId
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
    this.displayblankdocument = bankDetail.docUrl ? bankDetail.docUrl.split('/').pop() : null;
    this.bankdocument = bankDetail.docUrl
    // Dynamically update validators for the attachment field
    const attachmentValidators = this.displayblankdocument ? [] : [Validators.required];
    this.bankDetailsUpdateForm.get('attachmentupdate')?.setValidators(attachmentValidators);
    this.bankDetailsUpdateForm.get('attachmentupdate')?.updateValueAndValidity();
    // Open the modal
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateBankDetails(): void {
    if (this.bankDetailsUpdateForm.valid) {
      this.spinnerLoader = true
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
        selfUpdate: this.isMyInfoRoute,
        moduleName: "Bank Info",
        displayName: "Personal",
        createdBy: this.empinfo.employeeId
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
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankdocument).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false
          payload.docUrl = data.path; // Update the payload with the uploaded file path
          this.saveUpdatedBankDetails(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false
        this.conformationPopup.openErrorModal('Failed to upload bank proof. Please try again.');
      }
    });
  }

  saveUpdatedBankDetails(payload: any): void {
    this.subscription = this.http.postdata(`BankDetail/Update`, payload).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false
        this.bankDetailsUpdateForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Bank information updated successfully');
        this.getFieldsApprovalStatus();
        this.getbankempid(); // Refresh the bank details list
      },
      error: (reason: any) => {
        this.spinnerLoader = false
        this.conformationPopup.openErrorModal(reason.error.Message || 'Bank information update failed');
      }
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
 
  const payload = {
    bankId: this.bankid,
    empId: this.empinfo.employeeId,    // Set from logged-in user context
    requestedBy: this.empinfo.employeeId, // Logged-in user ID
    selfUpdate: this.isMyInfoRoute,  // Setting true so approval is applied
    moduleName: "Bank Info",
    displayName: "Personal"
  };
 
  this.subscription = this.http.postdata(`BankDetail/delete`, payload).subscribe({
    next: () => {
      this.getbankempid(); // Refresh bank list
      this.getFieldsApprovalStatus();
      this.modalService.dismissAll(); // Close modal
      this.conformationPopup.openSuccessModal(
        'Bank information deleted successfully.'
      );
    },
    error: () => {
      this.conformationPopup.openErrorModal(
        'Failed to submit delete bank request. Please try again.'
      );
    }
  });
}
   openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  resetdata() {
    this.modalService.dismissAll()
    this.bankDetailsUpdateForm.reset();
    this.bankDetailsForm.reset()
  }
 getFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Bank Info',
      employeeId: parseInt(this.empinfo.employeeId),
    };
    this.subscription = this.http
      .getDataIncludeParams(
        `EmployeeInfoFieldUpdate/getLatestFieldApprovalStatus`,
        params
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.getFieldsApprovalStatusList = data.data;
            this.addedRecords=this.getFieldsApprovalStatusList.filter((item:any)=>item.approvalStatus?.toLowerCase()==='pending' && item.fieldName==='Add');

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
      });
  }
    // Add this new method
 disablePendingFields(referenceid: any): boolean {
  const pendingFields = this.getFieldsApprovalStatusList
    .filter(item =>
      String(item.referenceCategory) === String(referenceid) &&
      item.approvalStatus?.toLowerCase() === 'pending'
    );
  return pendingFields.length > 0;
}
    getPendingApprovalMessage(referenceid: string): string {
    const pendingItem = this.getFieldsApprovalStatusList.find(
      (item: any) =>
        String(item.referenceCategory) === String(referenceid) &&
      item.approvalStatus?.toLowerCase() === 'pending'
    );
    return (
      pendingItem?.message || 'This field change request is awaiting approval.'
    );
  }
    setActiveMessage(referenceid:any) {
  this.activeMessage = this.getPendingApprovalMessage(referenceid);
}

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.bankTableData = [...this.originalBankData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.bankTable) {
          this.bankTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      // Handle null/undefined values
      if (val1 == null && val2 == null) return 0;
      if (val1 == null) return event.order;
      if (val2 == null) return -event.order;

      // Handle boolean sorting for isPrimary field
      if (field === 'isPrimary') {
        const bool1 = val1 ? 1 : 0;
        const bool2 = val2 ? 1 : 0;
        return event.order * (bool1 - bool2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1).trim();
      val2 = String(val2).trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}