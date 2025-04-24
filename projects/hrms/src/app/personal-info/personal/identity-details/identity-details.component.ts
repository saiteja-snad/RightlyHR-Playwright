import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Iidentity, Iidentitydrop } from '../../../Interfaces/personal-modal';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-identity-details',
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, NoDataFoundComponent],
  templateUrl: './identity-details.component.html',
  styleUrls: ['./identity-details.component.scss']
})
export class IdentityDetailsComponent implements OnInit,OnDestroy {
  subscription!: Subscription;
  unmatchedIdentityDetails: any = [];
  displayidentiydocument:any
  selectedIdentityId: any
  getidentitydropdetails: Iidentitydrop[] = [];
  getIdentitydetails = new BehaviorSubject<Iidentity[]>([]);
  identityForm!: FormGroup;
  identityupdateForm!: FormGroup
  empinfo: any = {};
  IdentityAttachment: any;
  IdentityMaxNumber = 12;
  IdentityMinNumber = 12;
  employedata={} as any;
  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

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
        Validators.minLength(this.IdentityMinNumber),
        Validators.maxLength(this.IdentityMaxNumber)
      ]],
      identityAttachment: ['', Validators.required]
    });
  }

  initializeupdateForm(): void {
    this.identityupdateForm = this.fb.group({
      identityupdateType: [{ value: null, disabled: true }, Validators.required],
      identityupdateNumber: ['', [Validators.required,
        Validators.minLength(this.IdentityMinNumber),Validators.maxLength(this.IdentityMaxNumber)
      ]],
      identityupdateAttachment: [null]
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
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
    const EmpId = parseInt(this.empinfo.employeeId);
    if (!EmpId) {
      console.error('Invalid Employee ID');
      return;
    }

    this.subscription = this.http.getData(`IdentityTable/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getIdentitydetails.next(data);

      },
      error: (err: any) => {
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
    const file = event.target.files[0];
    if (file) {
      this.IdentityAttachment = file; // Store the selected file
      console.log('Selected file:', file);
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
            payload.attachment = data.path;
            this.saveIdentityData(payload);
          }
        },
        error: () => {
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
        this.modalService.dismissAll()
        this.identityForm.reset();
        this.getIdentityByEmpid()
        this.conformationPopup.openSuccessModal('Identity details added successfully');
        console.log('Data saved successfully');
      },
      error: () => {
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
    this.selectedIdentityId=identityDetails.identityId;
    const selectedIdentityType = this.getidentitydropdetails.find(
      (item) => item.documentName === identityDetails.identityType
    );
    this.identityupdateForm.patchValue({
      identityupdateType: selectedIdentityType,
      identityupdateNumber: identityDetails.identityNumber,

    });

    this.displayidentiydocument=identityDetails.attachment
    ? identityDetails.attachment.split('/').pop()
    : null;
    this.IdentityAttachment = identityDetails.attachment
      
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateIdentity(form: FormGroup): void {
    if (form.valid) {
      const formData = form.value;

    //payload
      const payload = {
        identityId: this.selectedIdentityId,
        identityType: formData.identityupdateType?.identityType1,
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
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedIdentity(payload);
          }
        },
        error: () => {
          console.error('File upload failed');
        }
      });
  }


  saveUpdatedIdentity(payload: any): void {
    this.subscription = this.http.postdata(`IdentityTable/Update`, payload).subscribe({
      next: (data: any) => {
        console.log('Identity updated successfully:', data);

        // Close the modal and refresh the data
        this.getIdentityByEmpid();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Identity details updated successfully');
      },
      error: (err: any) => {
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