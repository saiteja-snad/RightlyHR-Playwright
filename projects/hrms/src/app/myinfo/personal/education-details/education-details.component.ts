import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { Ieducation } from '../../../Interfaces/personal-modal';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-education-details',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})
export class EducationDetailsComponent {
  educationForm!: FormGroup;
  geteducationdata: Ieducation[] = [];
  educationData: Ieducation[] = [];
  educationAttachment: any;
  subscription!: Subscription;
  currentDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  showError = false;
  showErrors = false;
  issStartDateValid = true;
  issEndDateValid = true;
  islistedItem = true;
  buttondisable = true;
  empinfo: any = {}
  educationtypes = [
    'scc']
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    this.initializeForm();
    this.getAllEducation();
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
      attachment: ['', Validators.required],
    });

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
      const payload = this.createEducationPayload(); // Create the payload

      if (this.educationAttachment) {
        this.uploadEducationAttachment(payload); 
      } else {
        this.saveEducationData(payload); // Save the data directly if no attachment
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
        this.conformationPopup.openSuccessModal('Education details Added successfully');
        console.log('Education data saved successfully:', payload);
        this.getEducationEmpid();
      },
      error: (err: any) => {
        console.error('Error saving education data:', err);
        this.conformationPopup.openErrorModal('Education details Added failed');
      }
    });
  }
  createEducationPayload(attachmentPath: string = ''): any {
    return {
      employeeId: parseInt(this.empinfo.employeeId),
      degree: this.educationForm.get('education')?.value,
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
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
    console.log('Identity attachment:', this.educationAttachment);
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }
  getAllEducation() {
    this.subscription = this.http.getData(`Education`).subscribe({
      next: (data: any) => {
        this.geteducationdata = data as Ieducation[];
      },
    });
  }

  getEducationEmpid() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Education/${employeeId}`).subscribe({
      next: (data: any) => {
        localStorage.setItem('educationinfodata', JSON.stringify(data));
        this.educationData = data as Ieducation[];
        // this.educationData.degreeStartDate = this.formatDate(
        //   this.educationData.degreeStartDate
        // );
        // this.educationData.degreeEndDate = this.formatDate(
        //   this.educationData.degreeEndDate
        // );
      },
    });
  }

}
