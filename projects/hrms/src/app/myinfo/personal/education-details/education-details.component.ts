import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { IDegre, Ieducation } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-education-details',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})

export class EducationDetailsComponent implements OnInit,OnDestroy {
  educationForm!: FormGroup;
  educationupdateForm!: FormGroup;
  selectedEducationId: any
  educationData = new BehaviorSubject<Ieducation[]>([])
  degreeDetails: IDegre[] = [];
  educationAttachment: any;
  displalyeducationattachment:any
  selectedEducationDetails: any
  subscription!: Subscription;
  currentDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  showError = false;
  showErrors = false;
  issStartDateValid = true;
  issEndDateValid = true;
  islistedItem = true;
  buttondisable = true;
  empinfo: any = {}

  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService,public rbac: RbacService,public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.initializeupdateForm()
    this.getDegree()
    this.getEducationEmpid();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  initializeForm(): void {
    this.educationForm = this.fb.group({
      education: ['', Validators.required],
      university: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      specialization: ['', [Validators.required, Validators.pattern('^[^\\s].*$')],],
      gpa: ['', [Validators.required, Validators.min(1), Validators.max(10)],],
      degreeStartDate: ['', Validators.required],
      degreeEndDate: ['', Validators.required],
      attachment: [null, Validators.required],
    });
    this.validations()
  }

  initializeupdateForm(): void {
    this.educationupdateForm = this.fb.group({
      educationupdate: ['', Validators.required],
      universityupdate: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      specializationupdate: ['', [Validators.required, Validators.pattern('^[^\\s].*$')],],
      gpaupdate: ['', [Validators.required, Validators.min(1), Validators.max(10)],],
      degreeStartDateupdate: ['', Validators.required],
      degreeEndDateupdate: ['', Validators.required],
      attachmentupdate: ['',],
    });
    this.validations()
  }

  validations() {
    // Add validation for start and end dates
    this.educationForm.get('degreeStartDate')?.valueChanges.subscribe((startDate) => {
      const endDate = this.educationForm.get('degreeEndDate')?.value;
      this.issStartDateValid = new Date(startDate) <= new Date(this.currentDate);
      if (endDate) {
        this.issEndDateValid = new Date(endDate) > new Date(startDate);
      }
    });
    this.educationForm.get('degreeEndDate')?.valueChanges.subscribe((endDate) => {
      const startDate = this.educationForm.get('degreeStartDate')?.value;
      this.issEndDateValid = new Date(endDate) > new Date(startDate);
    });
  }

  postEducation(): void {
    if (this.educationForm.valid) {
      const payload = this.createEducationPayload();
      if (this.educationAttachment) {
        this.uploadEducationAttachment(payload);
      } else {
        this.saveEducationData(payload);
      }
    } else {
      this.educationForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadEducationAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Education Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.educationAttachment)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path; // Add the uploaded file path to the payload
            this.saveEducationData(payload); // Save the data with the updated payload
          }
        },
        error: () => {
          console.error('File upload failed');
        }
      });
  }

  saveEducationData(payload: any): void {
    this.subscription = this.http.postdata('Education', payload).subscribe({
      next: () => {
        this.educationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Education details added successfully');
        this.getEducationEmpid();
      },
      error: (err: any) => {
        console.error('Error saving education data:', err);
        this.conformationPopup.openErrorModal(err.error.Message);
      }
    });
  }

  createEducationPayload(attachmentPath: string = ''): any {
    return {
      employeeId: parseInt(this.empinfo.employeeId),
      degree: this.educationForm.get('education')?.value?.degreeName,
      university: this.educationForm.get('university')?.value,
      specialization: this.educationForm.get('specialization')?.value,
      gpa: this.educationForm.get('gpa')?.value,
      degreeStartDate: this.educationForm.get('degreeStartDate')?.value,
      degreeEndDate: this.educationForm.get('degreeEndDate')?.value,
      attachment: attachmentPath || '',
      status: 'Active',
      isDeleted: false,
    };
  }

  onChangeEducation(event: any): void {
    const file = event.target.files[0];
    const timestamp = new Date().getTime();
    this.educationAttachment = this.renameFileAttachment(
      file,`${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
    console.log('Identity attachment:', this.educationAttachment);
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

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

  getDegree() {
    this.subscription = this.http.getData('Degree').subscribe({
      next: (data: any) => {
        this.degreeDetails = data as IDegre[];
      },
    });
  }

  getEducationEmpid() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Education/${employeeId}`).subscribe({
      next: (data: any) => {
        localStorage.setItem('educationinfodata', JSON.stringify(data));
        this.educationData.next(data);
      },
    });
  }

  //openupdate
  openModalupdate(content: any, educationDetails: any): void {
    this.selectedEducationId=educationDetails.id
    const selectedEducationType = this.degreeDetails.find(
      (item) => item.degreeName === educationDetails.degree
    );
    // Convert dates to 'YYYY-MM-DD' format
    const degreeStartDate = educationDetails.degreeStartDate ? new Date(educationDetails.degreeStartDate).toISOString().split('T')[0] : null;
    const degreeEndDate = educationDetails.degreeEndDate ?  new Date(educationDetails.degreeEndDate).toISOString().split('T')[0] : null;
    this.educationupdateForm.patchValue({
      educationupdate: selectedEducationType,
      universityupdate: educationDetails.university,
      specializationupdate: educationDetails.specialization,
      gpaupdate: educationDetails.gpa,
      degreeStartDateupdate: degreeStartDate,
      degreeEndDateupdate: degreeEndDate,
    });
    this.educationAttachment = educationDetails.attachment
    this.displalyeducationattachment=educationDetails.attachment ? educationDetails.attachment.split('/').pop() : null;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateEducation(): void {
    if (this.educationupdateForm.valid) {
      const formData = this.educationupdateForm.value;
      const payload = {
        id:this.selectedEducationId,
        university:formData.universityupdate,
        degree: formData.educationupdate?.degreeName,
        specialization: formData.specializationupdate,
        gpa: formData.gpaupdate,
        status: "Active",
        degreeStartDate: formData.degreeStartDateupdate,
        degreeEndDate: formData.degreeEndDateupdate,
        attachment: this.educationAttachment || '', // Use the existing attachment or the new one
        employeeId: this.empinfo.employeeId // Add employee ID if required
      };

      // Check if a new attachment is selected
      if (this.educationAttachment instanceof File) {
        this.uploadUpdatedEducationAttachment(payload);
      } else {
        this.saveUpdatedEducation(payload);
      }
    } else {
      this.educationupdateForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadUpdatedEducationAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Education Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.educationAttachment)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedEducation(payload);
          }
        },
        error: () => {
          console.error('File upload failed');

        }
      });
  }

  saveUpdatedEducation(payload: any): void {
    this.subscription = this.http.postdata(`Education/UPDATER`, payload).subscribe({
      next: (data: any) => {
        console.log('Education updated successfully', data);
        this.getEducationEmpid()
        this.educationupdateForm.reset()
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal('Education updated successfully')
      },
      error: (reason: any) => {
        console.error('Error updating education:', reason);
        if (reason.error.includes('is already')) {
          this.conformationPopup.openErrorModal(reason.error);
        } else {
          this.conformationPopup.openErrorModal('Something went wrong. Please check all the fields.');
        }
      }
    });
  }

  opendeletModal(content: any, educationDetails: any): void {
    this.selectedEducationId = educationDetails.id;
    this.selectedEducationDetails = educationDetails;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  educationDelete() {
    if (!this.selectedEducationId || !this.selectedEducationDetails) {
      console.error('No education record selected for deletion');
      return;
    }
    const payload = {
      status: 'Void',
      id: this.selectedEducationDetails.id,
      employeeId: this.selectedEducationDetails.employeeId,
      degree: this.selectedEducationDetails.degree,
      university: this.selectedEducationDetails.university,
      specialization: this.selectedEducationDetails.specialization,
      gpa: this.selectedEducationDetails.gpa,
      degreeStartDate: this.selectedEducationDetails.degreeStartDate,
      degreeEndDate: this.selectedEducationDetails.degreeEndDate,
    };
    // Send the delete request
    this.subscription = this.http.postdata('Education/UPDATER', payload).subscribe({
      next: (data: any) => {
        console.log('Education record deleted successfully:', data);
        this.modalService.dismissAll()
        this.getEducationEmpid();
        this.conformationPopup.openSuccessModal('Education detalis deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting education record:', err);
        this.conformationPopup.openErrorModal('Education detalis deleted failed');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}