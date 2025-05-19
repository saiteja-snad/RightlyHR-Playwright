import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certification',
  imports: [CommonModule, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss'
})
export class CertificationComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  selectedCertification: any;
  empcertsdata = new BehaviorSubject<any>([]);
  empinfo: any
  loading = false
  certificationForm!: FormGroup;
  updateCertificationForm!: FormGroup;
  certificationDocument: any;
  currentDate: string = new Date().toISOString().split('T')[0]; // Current date in 'yyyy-MM-dd' format
  isDisableExpirydate: boolean = false;
  showError: boolean = false;
  showErrorr: boolean = false;
  selectedid: any;
  dateofbirth: any;
  displaycertification: any
  spinnerLoader = false;
  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService, public formValidation: FormValidationService,
    public rbac: RbacService,public permissionRouteService: AccessForEmployeeinfoService, private router: Router
  ) { }

  ngOnInit(): void {
    
   this.getEmpInfoFromRoute();
    this.initializeForm();
    this.initializeupdateForm();
   
  }

 
  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getEmpcertdata();
      
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getEmpcertdata();
    }
  }

  initializeForm(): void {
    this.certificationForm = this.fb.group({
      certificationName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/), noWhitespaceValidator]],
      certificationId: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z0-9])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~ ]+$/), Validators.maxLength(50)]],
      issuedDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      isExpired: [false],
      attachment: ['', Validators.required],
    });
    // Disable "expiryDate" field if "isExpired" is checked
    this.certificationForm.get('isExpired')?.valueChanges.subscribe((isExpired) => {
      const expiryDateControl = this.certificationForm.get('expiryDate');
      if (isExpired) {
        expiryDateControl?.reset();
        expiryDateControl?.clearValidators();
        expiryDateControl?.disable();
      } else {
        expiryDateControl?.enable();
        expiryDateControl?.setValidators([Validators.required]);
      }
      expiryDateControl?.updateValueAndValidity();
    });
  }



  initializeupdateForm(): void {
    const attachmentValidators = this.displaycertification ? [] : [Validators.required];
    this.updateCertificationForm = this.fb.group({
      certificationName: ['', [Validators.required, Validators.pattern(/^[^\s].*$/), Validators.maxLength(50)]],
      certificationId: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z0-9])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~ ]+$/), Validators.maxLength(50)]],
      issuedDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      isExpired: [false],
      attachment: ['', attachmentValidators],
    });

    // Disable "expiryDate" field if "isExpired" is checked
    this.updateCertificationForm.get('isExpired')?.valueChanges.subscribe((isExpired) => {
      const expiryDateControl = this.updateCertificationForm.get('expiryDate');
      if (isExpired) {
        expiryDateControl?.reset();
        expiryDateControl?.clearValidators();
        expiryDateControl?.disable();
      } else {
        expiryDateControl?.enable();
        expiryDateControl?.setValidators([Validators.required]);
      }
      expiryDateControl?.updateValueAndValidity();
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  changesstartdate() {
    if (this.certificationForm.get('issuedDate')?.value) {
      this.certificationForm.get('expiryDate')?.reset();
    }
  }
  changesstartdateupdate() {
    if (this.updateCertificationForm.get('issuedDate')?.value) {
      this.updateCertificationForm.get('expiryDate')?.reset();
    }
  }

  getMinEndDate(): string | null {
    const startDateValue = this.certificationForm.get('issuedDate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; // Return null if no start date is selected
  }

  getupdateMinEndDate(): string | null {
    const startDateValue = this.updateCertificationForm.get('issuedDate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; // Return null if no start date is selected
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.dateofbirth = this.formatDateToLocal(data.dob)
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  onSelectBankProofDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.attachment)
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
            file.attachment.split('/')[file.attachment.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }

  onFileChange(event: any): void {
    this.displaycertification = null
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 25) {
        this.certificationDocument = null;
        this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
        this.certificationForm.get('attachment')?.reset();
        this.certificationForm.get('attachment')?.markAsUntouched();
        this.updateCertificationForm.get('attachment')?.reset();
        this.updateCertificationForm.get('attachment')?.markAsUntouched();

        return;
      }
    }

    const timestamp = new Date().getTime();
    this.certificationDocument = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  postCertificationDetails(): void {
    if (this.certificationForm.valid) {
      this.spinnerLoader = true
      const payload = this.createCertificationPayload();

      if (this.certificationDocument) {
        this.uploadCertificationAttachment(payload);
      } else {
        this.saveCertificationData(payload);
      }
    } else {
      this.certificationForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadCertificationAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Certifications/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.certificationDocument)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path; // Add the uploaded file path to the payload
            console.log('Uploaded file path:', data.path); // Debugging log
            this.saveCertificationData(payload); // Save the data with the updated payload
          } else {
            console.error('File upload response is invalid:', data);
          }
        },
        error: () => {
          console.error('File upload failed');
          this.conformationPopup.openErrorModal('Failed to upload the file. Please try again.');
        }
      });
  }

  saveCertificationData(payload: any): void {
    this.subscription = this.http.postdata('Certification', payload).subscribe({
      next: () => {
        this.spinnerLoader = false
        this.certificationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Certification details added successfully');
        console.log('Certification data saved successfully:', payload);
        this.getEmpcertdata(); // Refresh the certification data
      },
      error: (err: any) => {
        this.spinnerLoader = false
        console.error('Error saving certification data:', err);
        if (err.status === 400) {
          this.conformationPopup.openErrorModal(err.error?.message || 'Failed to save certification details.');
        } else {
          this.conformationPopup.openErrorModal('Either the same certification name or certification ID already exists.');
        }
      }
    });
  }

  createCertificationPayload(attachmentPath: string = ''): any {
    const currentDate = new Date().toISOString();
    return {
      empId: parseInt(this.empinfo.employeeId),
      certificationName: this.certificationForm.get('certificationName')?.value,
      certificationId: this.certificationForm.get('certificationId')?.value,
      issuedDate: this.certificationForm.get('issuedDate')?.value,
      expirationDate: this.certificationForm.get('expiryDate')?.value,
      isExpired: this.certificationForm.get('isExpired')?.value || false,
      isDeleted: false,
      isdeleted: false,
      createdAt: currentDate,
    };
  }
  getEmpcertdata() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.loading = true
    this.subscription = this.http
      .getData(`Certification/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {

          this.loading = false
          this.empcertsdata.next(data);
        },
        error: (err: any) => {
          console.log(err);
          this.loading = false
        },
      });
  }

  onReset(): void {
    this.certificationForm.reset();

  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModalupdate(content: any, data: any) {
    this.selectedid = data.id; // Store the selected identityId
    const startDate = this.formatDateToLocal(data.issuedDate)

    const EndDate = this.formatDateToLocal(data.expirationDate)

    this.updateCertificationForm.patchValue({
      certificationName: data.certificationName,
      certificationId: data.certificationId,
      issuedDate: startDate,
      expiryDate: EndDate,
      isExpired: data.isExpired,
    });
    this.certificationDocument = data.attachment; // Set the selected document for the update form

    this.displaycertification = data?.attachment?.split('/')?.pop()
    // Dynamically update validators for the attachment field
    const attachmentValidators = this.displaycertification ? [] : [Validators.required];
    this.updateCertificationForm.get('attachment')?.setValidators(attachmentValidators);
    this.updateCertificationForm.get('attachment')?.updateValueAndValidity();

    // Reset the document for the update form
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }


  updateCertificationDetails(): void {
    if (this.updateCertificationForm.valid) {
      this.spinnerLoader = true
      const payload = this.createUpdateCertificationPayload();

      if (this.certificationDocument instanceof File) {
        this.uploadUpdatedCertificationAttachment(payload);
      } else {
        this.saveUpdatedCertificationData(payload);
      }
    } else {
      this.updateCertificationForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadUpdatedCertificationAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Certifications/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.certificationDocument)
      .subscribe({
        next: (data: any) => {
          this.spinnerLoader = false
          if (data) {
            payload.attachment = data.path; // Add the uploaded file path to the payload
            console.log('Uploaded file path:', data.path); // Debugging log
            this.saveUpdatedCertificationData(payload); // Save the data with the updated payload
          } else {
            console.error('File upload response is invalid:', data);
          }
        },
        error: () => {
          this.spinnerLoader = false
          console.error('File upload failed');
          this.conformationPopup.openErrorModal('Failed to upload the file. Please try again.');
        }
      });
  }

  saveUpdatedCertificationData(payload: any): void {
    this.subscription = this.http.postdata('Certification/Update', payload).subscribe({
      next: () => {
        this.spinnerLoader = false
        this.updateCertificationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Certification details updated successfully');
        console.log('Certification data updated successfully:', payload);
        this.getEmpcertdata(); // Refresh the certification data
      },
      error: (err: any) => {
        this.spinnerLoader = false
        console.error('Error updating certification data:', err);
        if (err.status === 400) {
          this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update certification details.');
        } else {
          this.conformationPopup.openErrorModal('Either the same certification name or certification ID already exists.');
        }
      }
    });
  }

  createUpdateCertificationPayload(attachmentPath: string = ''): any {
    const currentDate = new Date().toISOString(); // Current date in ISO format

    return {
      id: this.selectedid,
      empId: parseInt(this.empinfo.employeeId),
      certificationName: this.updateCertificationForm.get('certificationName')?.value,
      certificationId: this.updateCertificationForm.get('certificationId')?.value,
      issuedDate: this.updateCertificationForm.get('issuedDate')?.value,
      expirationDate: this.updateCertificationForm.get('expiryDate')?.value,
      isExpired: this.updateCertificationForm.get('isExpired')?.value || false,
      isDeleted: false,
      isdeleted: false,
      createdAt: currentDate,
      updatedAt: currentDate,
      attachment: this.certificationDocument

    };
  }
  opendeletModal(content: any, empexperimentdata: any): void {
    this.selectedCertification = empexperimentdata; // Store the selected identityId
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  deleteCertification(): void {
    const empcertsdata = {
      isDeleted: true,
      id: this.selectedCertification.id,
      empId: this.selectedCertification.empId,
      certificationName: this.selectedCertification.certificationName,
      issuedDate: this.selectedCertification.issuedDate,
      expirationDate: this.selectedCertification.expirationDate,
      certificationId: this.selectedCertification.certificationId,
      attachment: this.selectedCertification.attachment,
    };

    this.subscription = this.http.postdata('Certification/Update', empcertsdata).subscribe({
      next: (data: any) => {
        console.log('Certification deleted successfully:', data);
        this.modalService.dismissAll();
        this.selectedCertification = null;
        this.conformationPopup.openSuccessModal('Certification details deleted successfully');
        this.getEmpcertdata();
      },
      error: (err: any) => {
        console.error('Error deleting certification:', err);
        this.conformationPopup.openErrorModal('Failed to delete the certification. Please try again.');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

