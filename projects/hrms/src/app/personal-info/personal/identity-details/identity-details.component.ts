import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Iidentity, Iidentitydrop } from '../../../Interfaces/personal-modal';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';

@Component({
  selector: 'app-identity-details',
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, NgbPopoverModule, InfoIconComponent, DownloadIconComponent],
  templateUrl: './identity-details.component.html',
  styleUrls: ['./identity-details.component.scss']
})
export class IdentityDetailsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  unmatchedIdentityDetails: any = [];
  displayidentiydocument: any
  selectedIdentityId: any
  getidentitydropdetails: Iidentitydrop[] = [];
  getIdentitydetails = new BehaviorSubject<Iidentity[]>([]);
  identityForm!: FormGroup;
  identityupdateForm!: FormGroup
  empinfo: any = {};
  IdentityAttachment: any;
  IdentityMaxNumber = 12;
  IdentityMinNumber = 12;
  employedata = {} as any;
  spinnerLoader = false
  loading = false
  selectedIdentityTypetoUpdate: any;
  isMyInfoRoute = false;
  getFieldsApprovalStatusList: any[] = [];
  activeMessage: string = '';
  addedRecords=[] as any;
  constructor(private modalService: NgbModal, private http: HttpService, public formValidation: FormValidationService,
    private fb: FormBuilder, private conformationPopup: OpenModalService, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.getIdentityDropDown();
    this.initializeForm();
    this.initializeupdateForm();
    this.vadationfotidentitytype()
    this.vadationfoforupdatetidentitytype();
    this.getFieldsApprovalStatus();
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getIdentityByEmpid();
      this.isMyInfoRoute = false;
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getIdentityByEmpid();
      this.isMyInfoRoute = true;
    }
  }

  initializeForm(): void {
    this.identityForm = this.fb.group({
      identityType: ['', Validators.required],
      identityNumber: ['', [
        Validators.required,
        this.invalidIdentityNumberValidator(),
      ]],
      identityAttachment: ['', Validators.required]
    });
  }

  initializeupdateForm(): void {
    const attachmentValidators = this.displayidentiydocument ? [] : [Validators.required];
    this.identityupdateForm = this.fb.group({
      identityupdateType: [{ value: null, disabled: true }, Validators.required],
      identityupdateNumber: ['', [Validators.required,
      this.invalidIdentityNumberValidator(),

      ]],
      identityupdateAttachment: [null, attachmentValidators]
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  invalidIdentityNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && /^0+$/.test(value)) {
        return { invalidIdentityNumber: true }; // Return error if identity number is all zeros
      }
      return null; // Valid identity number
    };
  }

  vadationfotidentitytype() {
    this.identityForm.get('identityType')?.valueChanges.subscribe(selected => {
      const identityNumberControl = this.identityForm.get('identityNumber');
      identityNumberControl?.clearValidators();

      if (selected?.identityType1 === 'Passport') {
        // Passport: Alphanumeric + special characters
        identityNumberControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9!@#\$%\^\&*\)]+$/),
          Validators.maxLength(10),
          Validators.minLength(10)
        ]);
      } else if (selected?.identityType1 === 'Pan' || selected?.identityType1 === 'PAN') {
        // PAN: CamelCase pattern (example: AbcDef1234)
        identityNumberControl?.setValidators([
          Validators.required,

          Validators.maxLength(10),
          Validators.minLength(10)
        ]);
      } else {
        // Other types: Only numbers
        identityNumberControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.maxLength(this.IdentityMaxNumber),
          Validators.minLength(this.IdentityMinNumber)
        ]);
      }

      identityNumberControl?.updateValueAndValidity({ emitEvent: false });
    });
  }
  toUppercase(controlName: string) {
    const control = this.identityForm.get(controlName);
    if (control && control.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  toUppercaseforupdate(controlName: string) {
    const control = this.identityupdateForm.get(controlName);
    if (control && control.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }


  vadationfoforupdatetidentitytype() {
    this.identityupdateForm.get('identityupdateType')?.valueChanges.subscribe(selected => {
      const identityNumberControl = this.identityupdateForm.get('identityupdateNumber');
      identityNumberControl?.clearValidators();

      if (selected?.identityType1 === 'Passport') {
        // Passport: Alphanumeric + special characters
        identityNumberControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9!@#\$%\^\&*\)]+$/),
          Validators.maxLength(10),
          Validators.minLength(10)
        ]);
      } else if (selected?.identityType1 === 'Pan' || selected?.identityType1 === 'PAN') {
        // PAN: CamelCase pattern (example: AbcDef1234)
        identityNumberControl?.setValidators([
          Validators.required,

          Validators.maxLength(10),
          Validators.minLength(10)
        ]);
      } else {
        // Other types: Only numbers
        identityNumberControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.maxLength(this.IdentityMaxNumber),
          Validators.minLength(this.IdentityMinNumber)
        ]);
      }

      identityNumberControl?.updateValueAndValidity({ emitEvent: false }); // Prevents recursive valueChanges
    });
  }
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.patchForm(data);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  patchForm(data: any): void {
    this.identityForm.patchValue({
      identityType: data.identityType || '',
      identityNumber: data.identityNumber || '',
      identityAttachment: data.identityAttachment || '',
    });

  }
  // Fetch identity details by employee ID
  getIdentityByEmpid(): void {
    this.loading = true
    const EmpId = parseInt(this.empinfo.employeeId);
    if (!EmpId) {
      return;
    }

    this.subscription = this.http.getData(`IdentityTable/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getIdentitydetails.next(data);
        this.loading = false
      },
      error: (err: any) => {
        this.loading = false
      },
    });
  }

  // Fetch identity dropdown options
  getIdentityDropDown(): void {
    this.subscription = this.http.getData(`IdentityType`).subscribe({
      next: (data: any) => {
        this.getidentitydropdetails = data;
      },
      error: (err: any) => {
        console.error('Error fetching identity dropdown:', err);
      },
    });
  }


  onIdentityAttachmentSelected(event: any): void {
    this.displayidentiydocument = '';
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
      this.IdentityAttachment = '';
      this.displayidentiydocument = '';
      this.resetForms();
      return;
    }

    if (fileSizeInMB > maxSizeInMB) {
      this.IdentityAttachment = '';
      this.displayidentiydocument = '';
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.resetForms();
      return;
    }

    const timestamp = new Date().getTime();
    this.IdentityAttachment = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
  }
  resetForms() {
    this.identityForm.get('identityAttachment')?.setValue('');
    this.identityForm.get('identityAttachment')?.markAsUntouched();
    this.identityupdateForm.get('identityupdateAttachment')?.setValue('');
    this.identityupdateForm.get('identityupdateAttachment')?.markAsUntouched();
    const attachmentValidators = this.displayidentiydocument ? [] : [Validators.required];
    this.identityupdateForm.get('identityupdateAttachment')?.setValidators(attachmentValidators);
    this.identityupdateForm.get('identityupdateAttachment')?.updateValueAndValidity();

  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  submitIdentityForm(form: FormGroup): void {
    if (form.valid) {
      this.spinnerLoader = true
      const payload = this.createPayload();
      if (this.IdentityAttachment) {
        this.uploadIdentityAttachment(payload);
      } else {
        this.saveIdentityData(payload);
      }
    } else {
      form.markAllAsTouched();
    }
  }


  uploadIdentityAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Identity Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.IdentityAttachment)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.spinnerLoader = false
            payload.attachment = data.path;
            this.saveIdentityData(payload);
          }
        },
        error: () => {
          this.spinnerLoader = false
          console.error('File upload failed');
        }
      });
  }

  saveIdentityData(payload?: any): void {
    if (!payload) {
      payload = this.createPayload();
    }

    this.subscription = this.http.postdata('IdentityTable', payload).subscribe({
      next: () => {
        this.spinnerLoader = false
        this.modalService.dismissAll()
        this.identityForm.reset();
        this.getIdentityByEmpid();
        this.getFieldsApprovalStatus();
        this.conformationPopup.openSuccessModal('Identity information added successfully');
      },
      error: (error) => {
        this.spinnerLoader = false
        this.conformationPopup.openErrorModal(error.error.Message || 'Identity information added failed');
      }
    });
  }

  createPayload(attachmentPath: string = ''): any {
    return {
      empId: parseInt(this.empinfo.employeeId),
      identityType: this.identityForm.get('identityType')?.value?.identityType1,
      identityNumber: this.identityForm.get('identityNumber')?.value,
      attachment: attachmentPath || '',
      selfUpdate: this.isMyInfoRoute,
      moduleName: "Identity Info",
      displayName: "Personal",
      createdBy: this.empinfo.employeeId
    };
  }

  //download
  onSelectIdentityAttachmentDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.attachment)
      .subscribe({
        next: (res: any) => {
          const fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.attachment.split('/')[file.attachment.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }
  //openupdate
  openModalupdate(content: any, identityDetails: any): void {
    this.selectedIdentityId = identityDetails.identityId;
    const selectedIdentityType = this.getidentitydropdetails.find(
      (item) => item.identityType1 === identityDetails.identityType
    );
    this.selectedIdentityTypetoUpdate = selectedIdentityType
    this.identityupdateForm.patchValue({
      identityupdateType: selectedIdentityType,
      identityupdateNumber: identityDetails.identityNumber,

    });

    this.displayidentiydocument = identityDetails.attachment
      ? identityDetails.attachment.split('/').pop()
      : null;
    this.IdentityAttachment = identityDetails.attachment
    // Dynamically update validators for the attachment field
    const attachmentValidators = this.displayidentiydocument ? [] : [Validators.required];
    this.identityupdateForm.get('identityupdateAttachment')?.setValidators(attachmentValidators);
    this.identityupdateForm.get('identityupdateAttachment')?.updateValueAndValidity();

    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateIdentity(form: FormGroup): void {
    if (form.valid) {
      this.spinnerLoader = true
      const formData = form.value;

      //payload
      const payload = {
        identityId: this.selectedIdentityId,
        identityType: this.selectedIdentityTypetoUpdate.identityType1,
        identityNumber: formData.identityupdateNumber,
        attachment: this.IdentityAttachment || '',
        empId: this.empinfo.employeeId,
        isDeleted: false,
        selfUpdate: this.isMyInfoRoute,
        moduleName: "Identity Info",
        displayName: "Personal",
        createdBy: this.empinfo.employeeId
      };

      // Check if a new attachment is selected
      if (this.IdentityAttachment instanceof File) {
        this.uploadUpdatedIdentityAttachment(payload);
      } else {
        this.saveUpdatedIdentity(payload);
      }
    } else {
      form.markAllAsTouched();
    }
  }

  uploadUpdatedIdentityAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Identity Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.IdentityAttachment)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.spinnerLoader = false
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedIdentity(payload);
          }
        },
        error: () => {
          this.spinnerLoader = true
          console.error('File upload failed');
        }
      });
  }


  saveUpdatedIdentity(payload: any): void {
    this.subscription = this.http.postdata(`IdentityTable/Update`, payload).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false
        // Close the modal and refresh the data
        this.getIdentityByEmpid();
        this.getFieldsApprovalStatus();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Identity information updated successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false

        this.conformationPopup.openErrorModal('Failed to update identity information');
      }
    });
  }
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  opendeletModal(content: any, identityDetails: any): void {
    this.selectedIdentityId = identityDetails; // Store the selected identityId
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  identityDelete(): void {
    if (!this.selectedIdentityId) {
      console.error('No identityId selected for deletion');
      return;
    }
    const payload = {
      identityId: this.selectedIdentityId.identityId,
      empId: this.selectedIdentityId.empId,
      selfUpdate: this.isMyInfoRoute,
      moduleName: "Identity Info",
      displayName: "Personal",
      requestedBy: this.empinfo.employeeId
    };
    this.subscription = this.http.DeleteData(`IdentityTable/delete`,payload)
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.getIdentityByEmpid();
          this.getFieldsApprovalStatus();
          this.conformationPopup.openSuccessModal('Identity information deleted successfully');
        },
        error: (err: any) => {
          console.error('Error deleting identity:', err);
          this.conformationPopup.openErrorModal('Identity information deleted failed');
        }
      });
  }
  resetData() {
    this.identityupdateForm.reset();
    this.identityForm.reset();
    this.modalService.dismissAll()
  }
 getFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Identity Info',
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
            //this.disablePendingFields();
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
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}