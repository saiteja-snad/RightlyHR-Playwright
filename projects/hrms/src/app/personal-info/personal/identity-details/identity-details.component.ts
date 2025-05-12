import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
  selector: 'app-identity-details',
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
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
  spinnerLoader=false
  loading=false
  selectedIdentityTypetoUpdate: any;
  constructor(private modalService: NgbModal, private http: HttpService,
     private fb: FormBuilder, private conformationPopup: OpenModalService,public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    console.log('Employee info:', this.empinfo);
    this.getIdentityDropDown();
    this.initializeForm();
    this.initializeupdateForm();
    this.getIdentityByEmpid();
    this.getEmployeeId();
  }

  initializeForm(): void {
    this.identityForm = this.fb.group({
      identityType: ['', Validators.required],
      identityNumber: ['', [
        Validators.required,
        this.invalidIdentityNumberValidator(),
        Validators.minLength(this.IdentityMinNumber),
        Validators.maxLength(this.IdentityMaxNumber)
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
      Validators.minLength(this.IdentityMinNumber)
        , Validators.maxLength(this.IdentityMaxNumber)
      ]],
      identityupdateAttachment: [null,attachmentValidators]
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

    console.log(this.identityForm.value);
  }
  // Fetch identity details by employee ID
  getIdentityByEmpid(): void {
    this.loading=true
    const EmpId = parseInt(this.empinfo.employeeId);
    if (!EmpId) {
      console.error('Invalid Employee ID');
      return;
    }

    this.subscription = this.http.getData(`IdentityTable/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getIdentitydetails.next(data);
        this.loading=false
      },
      error: (err: any) => {
        this.loading=false
        console.error('Error fetching identity details:', err);
      },
    });
  }

  // Fetch identity dropdown options
  getIdentityDropDown(): void {
    this.subscription = this.http.getData(`IdentityType`).subscribe({
      next: (data: any) => {
        this.getidentitydropdetails = data;
        console.log('Identity dropdown:', this.getidentitydropdetails);

      },
      error: (err: any) => {
        console.error('Error fetching identity dropdown:', err);
      },
    });
  }



  onIdentityAttachmentSelected(event: any): void {
    this.displayidentiydocument = null; // Reset the displayed document name
    const file = event.target.files[0];
    if (file) {
      this.IdentityAttachment = file; // Store the selected file
      console.log('Selected file:', file);
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 25) {
        this.IdentityAttachment = null;
        this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
        this.identityForm.get('identityAttachment')?.setValue(null);
        this.identityForm.get('identityAttachment')?.markAsUntouched();
        this.identityupdateForm.get('identityupdateAttachment')?.setValue(null);
        this.identityupdateForm.get('identityupdateAttachment')?.markAsUntouched();

        return;
      }
    }
    const timestamp = new Date().getTime();
    this.IdentityAttachment = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
    console.log('Identity attachment:', this.IdentityAttachment);
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  submitIdentityForm(form: FormGroup): void {
    if (form.valid) {
      this.spinnerLoader=true
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
            this.spinnerLoader=false
            payload.attachment = data.path;
            this.saveIdentityData(payload);
          }
        },
        error: () => {
          this.spinnerLoader=false
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
        this.spinnerLoader=false
        this.modalService.dismissAll()
        this.identityForm.reset();
        this.getIdentityByEmpid()
        this.conformationPopup.openSuccessModal('Identity details added successfully');
        console.log('Data saved successfully');
      },
      error: () => {
        this.spinnerLoader=false
        console.error('Error saving data');
        this.conformationPopup.openErrorModal('Identity details added failed');
      }
    });
  }

  createPayload(attachmentPath: string = ''): any {
    return {

      empId: parseInt(this.empinfo.employeeId),
      identityType: this.identityForm.get('identityType')?.value?.identityType1,
      identityNumber: this.identityForm.get('identityNumber')?.value,
      attachment: attachmentPath || '',

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

    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateIdentity(form: FormGroup): void {
    if (form.valid) {
      this.spinnerLoader=true
      const formData = form.value;

      //payload
      const payload = {
        identityId: this.selectedIdentityId,
        identityType: this.selectedIdentityTypetoUpdate.identityType1,
        identityNumber: formData.identityupdateNumber,
        attachment: this.IdentityAttachment || '',
        empId: this.empinfo.employeeId,
        isDeleted: false
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
            this.spinnerLoader=false
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedIdentity(payload);
          }
        },
        error: () => {
          this.spinnerLoader=true
          console.error('File upload failed');
        }
      });
  }


  saveUpdatedIdentity(payload: any): void {
    this.subscription = this.http.postdata(`IdentityTable/Update`, payload).subscribe({
      next: (data: any) => {
        console.log('Identity updated successfully:', data);
        this.spinnerLoader=false
        // Close the modal and refresh the data
        this.getIdentityByEmpid();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Identity details updated successfully');
      },
      error: (err: any) => {
        this.spinnerLoader=false
        console.error('Error updating identity:', err);
        this.conformationPopup.openErrorModal('Failed to update identity details');
      }
    });
  }


  opendeletModal(content: any, identityDetails: any): void {
    this.selectedIdentityId = identityDetails.identityId; // Store the selected identityId
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  identityDelete(): void {
    if (!this.selectedIdentityId) {
      console.error('No identityId selected for deletion');
      return;
    }

    this.subscription = this.http
      .getData(`IdentityTable/deletebyid/${this.selectedIdentityId}`)
      .subscribe({
        next: (data: any) => {
          console.log('Identity deleted successfully:', data);
          this.modalService.dismissAll()
          this.getIdentityByEmpid();
          this.conformationPopup.openSuccessModal('Identity details deleted successfully');
        },
        error: (err: any) => {
          console.error('Error deleting identity:', err);
          this.conformationPopup.openErrorModal('Identity details deleted failed');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}