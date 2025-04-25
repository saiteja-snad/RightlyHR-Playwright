import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IDegre, Ieducation, Ipersonal } from '../../../models/education.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../http-services/http.service';
import { PopupService } from '../../../common-services/popup.service';
import { DataService } from '../../../common-services/data.service';
@Component({
  selector: 'app-add-education-details',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './add-education-details.component.html',
  styleUrl: './add-education-details.component.scss'
})

export class AddEducationDetailsComponent {
  educationForm!: FormGroup;
  empinfo = {} as Ipersonal;
  postEducationdata = {} as Ieducation;
  file: any;
  selectedFile: File | null = null;
  educationAttachment!: File;
  isfileselected: boolean = false;
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  subscription!: Subscription;
  degreeDetails = [] as any;
  showError: boolean = false;
  showErrorr: boolean = false;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private openPopup: PopupService, private getData: DataService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getDegree();
    this.initializeEducationForm();
  }

  getDegree() {
    this.subscription = this.http.getData("PreonboardingDegree").subscribe({
      next: (data: any) => {
        this.degreeDetails = data as IDegre[]
      }
    })
  }

  initializeEducationForm() {
    this.educationForm = this.fb.group({
      education: ['', Validators.required],
      university: ['', [Validators.required,Validators.maxLength(100)]],
      specialization: ['', [Validators.required, Validators.pattern(/^[A-Za-z ,._-]+$/),Validators.maxLength(100)]],
      // specialization: ['', Validators.required,Validators.pattern('^[A-Za-z,.\-_\s]+$')],
      gpa: ['', [
        Validators.required,
        Validators.pattern(/^([1-9](\.\d{1,2})?|10(\.0{1,2})?)$/)
      ]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  //function to select the file
  fileAttachment(event: any) {
    this.isfileselected = false;
    this.file = event.target.files[0];
    let d: Date = new Date()
    this.educationAttachment = this.renameFiles(this.file, `${this.empinfo.employeeId}_${d.getTime()}_${this.file.name}`)
  }

  fileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/*', 'application/pdf', 'image/png'];
      const maxSizeInBytes = 25 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        this.showErrorforpdf = true;
        this.showErrorforsize = false;
        input.value = '';
      }
      else if (file.size > maxSizeInBytes) {
        this.showErrorforsize = true;
        this.showErrorforpdf = false;
        input.value = '';
      }
      else {
        this.showErrorforpdf = false;
        this.showErrorforsize = false;
      }
    }
  }

  private renameFiles(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //function to post the Education Details
  postEducation() {
    if (this.educationForm.valid && this.educationAttachment) {
      this.postEducationdata = {
        ...this.educationForm.value,
        degree: this.educationForm.value.education,
        university: this.educationForm.value.university,
        specialization: this.educationForm.value.specialization,
        gpa: this.educationForm.value.gpa,
        degreeStartDate: this.educationForm.value.startDate,
        degreeEndDate: this.educationForm.value.endDate,
        employeeId: parseInt(this.empinfo.employeeId),
      }
      this.postEducationdata.employeeId = parseInt(this.empinfo.employeeId);
      let filepath = `/FusionDocuments/Employee Documents/Education Documents/${this.empinfo.employeeId}`;
      this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath, this.file).subscribe({
        next: (data: any) => {
          this.postEducationdata.attachment = data.path;
          this.postEducationdata.employeeId = this.empinfo.employeeId;
          this.subscription = this.http.postData("PreonboardingEducation", this.postEducationdata).subscribe({
            next: (data: any) => {
              this.postEducationdata = data as Ieducation;
              this.modalService.dismissAll();
              this.openPopup.openSuccess("Data Added Successfully");
              this.getData.getEducation.set(true);
              this.educationForm.reset();
            },
            error: (reason: any) => {
              console.log(reason);
              if (reason.status == 500) {
                this.openPopup.openError(reason.error.Message);
              }
              else if (reason.status == 400) {
                this.openPopup.openError(reason.error.Message);
              }
            }
          });
        },
      });
    } else {
      this.openPopup.openError("Please fill all the required fields");
    }
  }

  close(): void {
    this.educationForm.reset();
    this.selectedFile = null;
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}