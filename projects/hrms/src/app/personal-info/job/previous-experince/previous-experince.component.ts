import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { IJobtype } from '../../../Interfaces/job-model';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';

@Component({
  selector: 'app-previous-experince',
  imports: [CommonModule, ReactiveFormsModule, Select, DateformatPipe, NoDataFoundComponent, TranslateModule],
  templateUrl: './previous-experince.component.html',
  styleUrl: './previous-experince.component.scss'
})
export class PreviousExperinceComponent implements OnInit, OnDestroy {
  subscription!: Subscription
  selectedexpId: any
  JobtypeDetails: IJobtype[] = []
  employeeExperienceForm!: FormGroup;
  employeeExperienceupdateForm!: FormGroup
  getempexpdata = new BehaviorSubject<any[]>([])
  countryCodes = [];
  selectedid: any
  isCurrentdateDisable = false;
  isDisabletoDate = false;
  disableFromandtovalidationbutton = false;
  isFutureDate = false;
  isInvalidToDate = false;
  showError = false;
  showErrorr = false;
  empinfo: any
  dateofbirth: any
  previousexperincedocument: any
  displaypreviousexperincedocument: any
  currentDate: string = new Date().toISOString().split('T')[0]; // Current date in 'yyyy-MM-dd' format
  spinnerLoader = false;

  constructor(private modalService: NgbModal, private http: HttpService, public formValidation: FormValidationService, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeForm();
    this.getJobtypes();
    this.getexperiencedetailsbyemployeid();
    this.initializeupdateForm();
    this.getEmployeeId()
    this.employeeExperienceForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.employeeExperienceForm.get('toDate')?.reset();
    });
    this.employeeExperienceupdateForm.get('fromDateupdate')?.valueChanges.subscribe(() => {
      this.employeeExperienceupdateForm.get('toDateupdate')?.reset();
    });
  }


  initializeForm(): void {
    this.employeeExperienceForm = this.fb.group({
      isPresent: [false],
      companyName: ['', [Validators.required, Validators.maxLength(100),noWhitespaceValidator]],
      employmentType: [null, Validators.required],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      jobTitle: ['', [Validators.required, Validators.maxLength(50)]],

      previousContactName: ['', [Validators.pattern('^[a-zA-Z\\s]*$'), Validators.maxLength(50),noWhitespaceValidator]],
      previousContactNumber: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      ],
      previousContactEmail: [
        '',
        [Validators.required, Validators.pattern('[A-Za-z0-9._+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')],
      ],
      attachment: ['', Validators.required],
    });

    // Disable "toDate" field if "isPresent" is checked
    this.employeeExperienceForm.get('isPresent')?.valueChanges.subscribe((isPresent) => {
      const toDateControl = this.employeeExperienceForm.get('toDate');
      if (isPresent) {
        toDateControl?.reset();
        toDateControl?.clearValidators();
        toDateControl?.disable();
      } else {
        toDateControl?.enable();
        toDateControl?.setValidators([Validators.required]); // Reapply the required validator when enabling the field
      }
      toDateControl?.updateValueAndValidity(); // Update the validity state of the control
    });
  }


  initializeupdateForm(): void {
    this.employeeExperienceupdateForm = this.fb.group({
      isPresentupdate: [false],
      companyNameupdate: ['', [Validators.required, Validators.maxLength(100),noWhitespaceValidator]],
      employmentTypeudate: [null, Validators.required],
      fromDateupdate: ['', [Validators.required]],
      toDateupdate: ['', [Validators.required]],
      jobTitleupdate: ['', [Validators.required, Validators.maxLength(50)]],

      previousContactNameupdate: ['',[ Validators.pattern('^[a-zA-Z\\s]*$'), Validators.maxLength(50),noWhitespaceValidator]],
      previousContactNumberupdate: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      ],
      previousContactEmailupdate: [
        '',
        [Validators.required, Validators.pattern('[A-Za-z0-9._+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')],
      ],
      attachmentupdate: [null],
    });

    // Disable "toDate" field if "isPresent" is checked
    this.employeeExperienceupdateForm.get('isPresentupdate')?.valueChanges.subscribe((isPresent) => {
      const toDateControl = this.employeeExperienceupdateForm.get('toDateupdate');
      if (isPresent) {
        toDateControl?.reset();
        toDateControl?.clearValidators();
        toDateControl?.disable();
      } else {
        toDateControl?.enable();
        toDateControl?.setValidators([Validators.required]); // Reapply the required validator when enabling the field
      }
      toDateControl?.updateValueAndValidity(); // Update the validity state of the control
    });
  }


  getMinEndDate(): string | null {
    const startDateValue = this.employeeExperienceForm.get('fromDate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; // Return null if no start date is selected
  }

  getupdateMinEndDate(): string | null {
    const startDateValue = this.employeeExperienceupdateForm.get('fromDateupdate')?.value;
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
        this.dateofbirth =this.formatDateToLocal(data.dob)
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    console.log(content)
  }

  currentDateValidation(): void {
    const fromDate = this.employeeExperienceForm.get('fromDate')?.value;
    const currentDate = new Date().toISOString().split('T')[0];
    this.isCurrentdateDisable = fromDate > currentDate;
  }

  toDateValidation(): void {
    const fromDate = this.employeeExperienceForm.get('fromDate')?.value;
    const toDate = this.employeeExperienceForm.get('toDate')?.value;

    if (toDate && fromDate) {
      this.isInvalidToDate = toDate < fromDate;
      this.isFutureDate = toDate > new Date().toISOString().split('T')[0];
    }
  }

  onChangeExperience(event: any): void {
    this.displaypreviousexperincedocument = null
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 25) {
        this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
        this.employeeExperienceForm.get('attachment')?.reset();
        this.employeeExperienceForm.get('attachment')?.markAsUntouched();
        this.employeeExperienceupdateForm.get('attachmentupdate')?.reset();
        this.employeeExperienceupdateForm.get('attachmentupdate')?.markAsUntouched()
        return;
      }
    }
    const timestamp = new Date().getTime();
    this.previousexperincedocument = this.renameFileAttachment(
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

  postExperienceDetails(): void {
    if (this.employeeExperienceForm.valid) {
      const payload = this.createExperiencePayload();

      if (this.previousexperincedocument) {
        this.uploadExperienceAttachment(payload);
      } else {
        this.saveExperienceData(payload);
      }
    } else {
      this.employeeExperienceForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadExperienceAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Previous Experience Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.previousexperincedocument)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path; // Add the uploaded file path to the payload
            console.log('Uploaded file path:', data.path); // Debugging log
            this.saveExperienceData(payload); // Save the data with the updated payload
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

  saveExperienceData(payload: any): void {
    this.subscription = this.http.postdata('ExperienceDetail', payload).subscribe({
      next: () => {
        this.employeeExperienceForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Experience details added successfully');
        console.log('Experience data saved successfully:', payload);
        this.getexperiencedetailsbyemployeid()
      },
      error: (err: any) => {
        console.error('Error saving experience data:', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to save experience details.');
      }
    });
  }

  createExperiencePayload(attachmentPath: string = ''): any {
    return {
      empId: parseInt(this.empinfo.employeeId),
      companyName: this.employeeExperienceForm.get('companyName')?.value,
      employmentType: this.employeeExperienceForm.get('employmentType')?.value?.jobType1,
      fromDate: this.employeeExperienceForm.get('fromDate')?.value,
      toDate: this.employeeExperienceForm.get('isPresent')?.value ? null : this.employeeExperienceForm.get('toDate')?.value,
      jobTitle: this.employeeExperienceForm.get('jobTitle')?.value,
      previousContactName: this.employeeExperienceForm.get('previousContactName')?.value,
      previousContactNumber: this.employeeExperienceForm.get('previousContactNumber')?.value,
      previousContactEmail: this.employeeExperienceForm.get('previousContactEmail')?.value,
      isPresent: this.employeeExperienceForm.get('isPresent')?.value,
      isDeleted: false,
      attachment: attachmentPath || '',
    };
  }

  getJobtypes() {
    this.subscription = this.http.getData("Jobtype").subscribe({
      next: (data: any) => {
        this.JobtypeDetails = data as IJobtype[];
      }
    })

  }


  getJobtype(): Observable<IJobtype[]> {
    return this.http.getData("Jobtype").pipe(
      tap((data: any) => {
        this.JobtypeDetails = data as IJobtype[];
      })
    );
  }

  //function to get all experiences 
  getexperiencedetailsbyemployeid() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    console.log(EmployeeId);
    this.subscription = this.http.getData(`ExperienceDetail/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getempexpdata.next(data);
      }
    })

  }

  //download Functionality
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
            file.attachment?.split('/')[file.attachment?.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }


  restrictInputaccteponlynumber(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;

    // Allow navigation keys and backspace/delete
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }

    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow only numeric characters
    const isNumeric = /^[0-9]$/.test(key);
    if (!isNumeric) {
      event.preventDefault();
    }
  }

  //aplicatives
  restrictInput(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;

    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }

    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    const isAlphabetic = /^[A-Za-z\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModalupdate(content: any, experienceDetail: any): void {
    this.selectedid = experienceDetail.id;

    this.getJobtype().subscribe(() => {
      console.log('Experience Detail:', experienceDetail);

      const startDate = this.formatDateToLocal(experienceDetail.fromDate) || null;
      const endDate = this.formatDateToLocal(experienceDetail.toDate) || null;

      const selectedJobType = this.JobtypeDetails.find(
        (jobType) => jobType.jobType1 === experienceDetail?.employmentType
      );

      this.employeeExperienceupdateForm.patchValue({
        jobTitleupdate: experienceDetail.jobTitle,
        companyNameupdate: experienceDetail.companyName,
        employmentTypeudate: selectedJobType,
        fromDateupdate: startDate,
        toDateupdate: endDate,
        previousContactNameupdate: experienceDetail?.previousContactName,
        previousContactNumberupdate: experienceDetail?.previousContactNumber,
        previousContactEmailupdate: experienceDetail?.previousContactEmail,
        isPresentupdate: experienceDetail.isPresent,
      });
      this.previousexperincedocument = experienceDetail.attachment;


      this.displaypreviousexperincedocument = experienceDetail.attachment
        ? experienceDetail.attachment.split('/').pop()
        : null;
      // Handle "toDateupdate" field based on "isPresent" or absence of "toDate"
      const toDateControl = this.employeeExperienceupdateForm.get('toDateupdate');
      if (experienceDetail.isPresent || !experienceDetail.toDate) {
        toDateControl?.reset();
        toDateControl?.clearValidators();
        toDateControl?.disable();
      } else {
        toDateControl?.enable();
        toDateControl?.setValidators([Validators.required]); // Reapply the required validator when enabling the field
      }

      toDateControl?.updateValueAndValidity()
      

      this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    });
  }


  saveUpdatedExperienceDetails(): void {

    const currentDate = new Date().toISOString().split('T')[0];
    if (this.employeeExperienceupdateForm.valid) {
      const formData = this.employeeExperienceupdateForm.value;
      // Prepare the payload
      const payload = {
        id: this.selectedid,
        empId: parseInt(this.empinfo.employeeId),
        jobTitle: formData.jobTitleupdate,
        companyName: formData.companyNameupdate,
        employmentType: formData.employmentTypeupdate?.jobType1 || formData.employmentTypeupdate,
        fromDate: formData.fromDateupdate,
        toDate: formData.isPresentupdate ? null : formData.toDateupdate,
        previousContactName: formData.previousContactNameupdate,
        previousContactNumber: formData.previousContactNumberupdate,
        previousContactEmail: formData.previousContactEmailupdate,
        isPresent: formData.isPresentupdate,
        createdAt: currentDate,
        updatedAt: currentDate,
        isDeleted: false,
        attachment:this.previousexperincedocument

      };

      console.log('Payload being sent:', payload);

      // Check if a new attachment is selected
      if (this.previousexperincedocument instanceof File) {
        this.uploadUpdatedExperienceAttachment(payload);
      } else {
        this.saveupdateExperienceData(payload);
      }
    } else {
      this.employeeExperienceupdateForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadUpdatedExperienceAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Previous Experience Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.previousexperincedocument)
      .subscribe({
        next: (data: any) => {
          this.spinnerLoader=false
          if (data) {
            payload.attachment = data.path; // Update the payload with the uploaded file path
            this.saveExperienceData(payload);
          }
        },
        error: () => {
          this.spinnerLoader=false
          console.error('File upload failed');
          this.conformationPopup.openErrorModal('Failed to upload experience document. Please try again.');
        }
      });
  }

  saveupdateExperienceData(payload: any): void {
    this.subscription = this.http.postdata('ExperienceDetail/Update', payload).subscribe({
      next: (data: any) => {
        console.log('Experience details updated successfully:', data);
        this.employeeExperienceupdateForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Experience details updated successfully');
        this.getexperiencedetailsbyemployeid(); // Refresh the experience details list
      },
      error: (reason: any) => {
        console.error('Error updating experience details:', reason);
        this.conformationPopup.openErrorModal(reason.error.message || 'Failed to update experience details. Please check all fields.');
      }
    });
  }

  opendeletModal(content: any, empexperimentdata: any): void {
    this.selectedexpId = empexperimentdata.id; // Store the selected identityId
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  experienceDelete(): void {
    if (!this.selectedexpId) {
      console.error('No identityId selected for deletion');
      return;
    }

    this.subscription = this.http
      .getData(`ExperienceDetail/Deletebyid/${this.selectedexpId}`)
      .subscribe({
        next: (data: any) => {

          this.modalService.dismissAll()
          this.getexperiencedetailsbyemployeid()
          this.conformationPopup.openSuccessModal('Experience details deleted successfully');
        },
        error: (err: any) => {
          console.error('Error deleting identity:', err);
          this.conformationPopup.openErrorModal('Experience details deleted failed');
        }
      });
  }

  resetFrom() {
    this.employeeExperienceForm.reset()
    this.isInvalidToDate = false;
    this.isFutureDate = false
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
