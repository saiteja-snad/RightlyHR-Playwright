import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";

@Component({
  selector: 'app-certification',
  imports: [CommonModule, ReactiveFormsModule, DateformatPipe],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss'
})
export class CertificationComponent {
  subscription!: Subscription;
  selectedCertification: any;
  empcertsdata = new BehaviorSubject<any>([]);
  empinfo: any
  certificationForm!: FormGroup;
  updateCertificationForm!: FormGroup;
  certificationDocument: any;
  currentDate: string = new Date().toISOString().split('T')[0]; // Current date in 'yyyy-MM-dd' format
  isDisableExpirydate: boolean = false;
  showError: boolean = false;
  showErrorr: boolean = false;
  selectedid: any;


  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getEmpcertdata();
    this.initializeForm();
    this.initializeupdateForm();
  }

  initializeForm(): void {
    this.certificationForm = this.fb.group({
      certificationName: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      certificationId: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
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
    this.updateCertificationForm = this.fb.group({
      certificationName: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      certificationId: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      issuedDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      isExpired: [false],
      attachment: ['', ],
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
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Validate file type and size
      this.showError = !allowedExtensions.includes(fileExtension || '');
      this.showErrorr = fileSizeInMB > 25;

      if (!this.showError && !this.showErrorr) {
        // Rename the file if it passes validation
        const timestamp = new Date().getTime();
        this.certificationDocument = this.renameFileAttachment(
          file,
          `${this.empinfo.employeeId}_${timestamp}_${file.name}`
        );
        console.log('Renamed attachment:', this.certificationDocument);
      } else {
        this.certificationDocument = null; // Reset the document if validation fails
        console.error('File validation failed');
      }
    }
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  postCertificationDetails(): void {
    if (this.certificationForm.valid) {
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
        this.certificationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Certification details added successfully');
        console.log('Certification data saved successfully:', payload);
        this.getEmpcertdata(); // Refresh the certification data
      },
      error: (err: any) => {
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
      isExpired: this.certificationForm.get('isExpired')?.value,
      isDeleted: false,
      isdeleted: false,
      createdAt: currentDate,
    };
  }
  getEmpcertdata() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(`Certification/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.empcertsdata.next(data);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
  onReset(): void {
    this.certificationForm.reset();
  }


  openModalupdate(content: any, data: any) {
    this.selectedid= data.id; // Store the selected identityId
    const startDate = data.issuedDate
    ? new Date(data.issuedDate).toISOString().split('T')[0]
    : null;

  const EndDate = data.expirationDate
    ? new Date(data.expirationDate).toISOString().split('T')[0]
    : null;

    this.updateCertificationForm.patchValue({
      certificationName: data.certificationName,
      certificationId: data.certificationId,
      issuedDate:startDate,
      expiryDate: EndDate,
      isExpired: data.isExpired,
    });
    this.certificationDocument=data.attachment; // Set the selected document for the update form
    ;
     // Reset the document for the update form
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }


  updateCertificationDetails(): void {
    if (this.updateCertificationForm.valid) {
      const payload = this.createUpdateCertificationPayload();

      if (this.certificationDocument) {
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
          if (data) {
            payload.attachment = data.path; // Add the uploaded file path to the payload
            console.log('Uploaded file path:', data.path); // Debugging log
            this.saveUpdatedCertificationData(payload); // Save the data with the updated payload
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

  saveUpdatedCertificationData(payload: any): void {
    this.subscription = this.http.postdata('Certification/Update', payload).subscribe({
      next: () => {
        this.updateCertificationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Certification details updated successfully');
        console.log('Certification data updated successfully:', payload);
        this.getEmpcertdata(); // Refresh the certification data
      },
      error: (err: any) => {
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
      isExpired: this.updateCertificationForm.get('isExpired')?.value,
      isDeleted: false,
      isdeleted: false,
      attachment: attachmentPath || '',
      createdAt: currentDate, 
      updatedAt: currentDate, 
  

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
        this.conformationPopup.openSuccessModal('Certification deleted successfully');
        this.getEmpcertdata();
      },
      error: (err: any) => {
        console.error('Error deleting certification:', err);
        this.conformationPopup.openErrorModal('Failed to delete the certification. Please try again.');
      },
    });
  }
}

