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
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-education-details',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})

export class EducationDetailsComponent implements OnInit, OnDestroy {
  educationForm!: FormGroup;
  educationupdateForm!: FormGroup;
  selectedEducationId: any
  educationData = new BehaviorSubject<Ieducation[]>([])
  degreeDetails: IDegre[] = [];
  educationAttachment: any;
  displalyeducationattachment: any
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
  employedata = {} as any;
  showErrorr = false;
  spinnerLoader = false
  loading = false
  dateofbirth: any;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService,
    public formValidation: FormValidationService, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }
  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.initializeupdateForm()
    this.getDegree()

    this.educationForm.get('degreeStartDate')?.valueChanges.subscribe(() => {
      this.educationForm.get('degreeEndDate')?.reset();
    });
    this.educationupdateForm.get('degreeStartDateupdate')?.valueChanges.subscribe(() => {
      this.educationupdateForm.get('degreeEndDateupdate')?.reset();
    });
  }
  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }


  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getEducationEmpid();

    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getEducationEmpid();
    }
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  initializeForm(): void {
    this.educationForm = this.fb.group({
      education: ['', Validators.required],
      university: ['', [Validators.required, , Validators.maxLength(50)]],
      specialization: ['', [Validators.required, Validators.pattern('^[^\\s].*$'), Validators.maxLength(50)],],
      gpa: ['', [Validators.required, Validators.min(1), Validators.max(10)],],
      degreeStartDate: ['', Validators.required],
      degreeEndDate: ['', Validators.required],
      attachment: [null, Validators.required],
    });
    this.validations()

  }

  initializeupdateForm(): void {
    const attachmentValidators = this.displalyeducationattachment ? [] : [Validators.required];
    this.educationupdateForm = this.fb.group({
      educationupdate: ['', Validators.required],
      universityupdate: ['', [Validators.required, , Validators.maxLength(50)]],
      specializationupdate: ['', [Validators.required, Validators.pattern('^[^\\s].*$'), Validators.maxLength(50)],],
      gpaupdate: ['', [Validators.required, Validators.min(1), Validators.max(10)],],
      degreeStartDateupdate: ['', Validators.required],
      degreeEndDateupdate: ['', Validators.required],
      attachmentupdate: ['', attachmentValidators],
    });
    this.validations()

  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.dateofbirth = this.formatDateToLocal(this.employedata.dob)
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  getMinEndDate(): string | null {
    const startDateValue = this.educationForm.get('degreeStartDate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; // Return null if no start date is selected
  }

  getupdateMinEndDate(): string | null {
    const startDateValue = this.educationupdateForm.get('degreeStartDateupdate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null;
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
      this.spinnerLoader = true
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
            this.spinnerLoader = false
            payload.attachment = data.path; // Add the uploaded file path to the payload
            this.saveEducationData(payload); // Save the data with the updated payload
          }
        },
        error: () => {
          this.spinnerLoader = false
          console.error('File upload failed');
        }
      });
  }

  saveEducationData(payload: any): void {
    this.subscription = this.http.postdata('Education', payload).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false
        this.educationForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Education details added successfully');
        this.getEducationEmpid();
      },
      error: (err: any) => {
        this.spinnerLoader = false
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
    this.displalyeducationattachment = '';
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
      this.educationAttachment = '';
      this.resetEducationForms();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.educationAttachment = '';
      this.displalyeducationattachment = '';
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.resetEducationForms();
      return;
    }
    const timestamp = new Date().getTime();
    this.educationAttachment = this.renameFileAttachment(
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
  resetEducationForms() {
    this.educationForm.get('attachment')?.reset();
    this.educationForm.get('attachment')?.markAsUntouched();
    this.educationupdateForm.get('attachmentupdate')?.reset();
    this.educationupdateForm.get('attachmentupdate')?.markAsUntouched();
    const attachmentValidators = this.displalyeducationattachment ? [] : [Validators.required];
    this.educationupdateForm.get('attachmentupdate')?.setValidators(attachmentValidators);
    this.educationupdateForm.get('attachmentupdate')?.updateValueAndValidity();
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
    this.loading = true
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Education/${employeeId}`).subscribe({
      next: (data: any) => {
        localStorage.setItem('educationinfodata', JSON.stringify(data));
        this.loading = false
        this.educationData.next(data);
      },
    });
  }

  //openupdate
  openModalupdate(content: any, educationDetails: any): void {
    // Reinitialize the form to update validators
    this.selectedEducationId = educationDetails.id
    const selectedEducationType = this.degreeDetails.find(
      (item) => item.degreeName === educationDetails?.degree
    );
    // Convert dates to 'YYYY-MM-DD' format
    const degreeStartDate = this.formatDateToLocal(educationDetails.degreeStartDate)
    const degreeEndDate = this.formatDateToLocal(educationDetails.degreeEndDate)
    this.educationupdateForm.patchValue({
      educationupdate: selectedEducationType,
      universityupdate: educationDetails.university,
      specializationupdate: educationDetails.specialization,
      gpaupdate: educationDetails.gpa,
      degreeStartDateupdate: degreeStartDate,
      degreeEndDateupdate: degreeEndDate,
    });
    this.educationAttachment = educationDetails.attachment
    this.displalyeducationattachment = educationDetails.attachment
      ? educationDetails.attachment.split('/').pop()
      : null;
    // Dynamically update validators for the attachment field
    const attachmentValidators = this.displalyeducationattachment ? [] : [Validators.required];
    this.educationupdateForm.get('attachmentupdate')?.setValidators(attachmentValidators);
    this.educationupdateForm.get('attachmentupdate')?.updateValueAndValidity();
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateEducation(): void {
    if (this.educationupdateForm.valid) {
      this.spinnerLoader = true
      const formData = this.educationupdateForm.value;
      const payload = {
        id: this.selectedEducationId,
        university: formData.universityupdate,
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
            this.spinnerLoader = false
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedEducation(payload);
          }
        },
        error: () => {
          this.spinnerLoader = false
          console.error('File upload failed');

        }
      });
  }

  saveUpdatedEducation(payload: any): void {
    this.subscription = this.http.postdata(`Education/UPDATER`, payload).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false
        this.getEducationEmpid()
        this.educationupdateForm.reset()
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal('Education details updated successfully')

      },
      error: (reason: any) => {
        this.spinnerLoader = false
        this.conformationPopup.openErrorModal(reason.error.Message);

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
        this.modalService.dismissAll()
        this.getEducationEmpid();
        this.conformationPopup.openSuccessModal('Education details deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting education record:', err);
        this.conformationPopup.openErrorModal('Education details deleted failed');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}