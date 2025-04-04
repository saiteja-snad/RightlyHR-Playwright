import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IDegre, Ieducation, Ipersonal } from '../../../models/education.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../http-services/http.service';
import { PopupService } from '../../../common-services/popup.service';
@Component({
  selector: 'app-add-education-details',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './add-education-details.component.html',
  styleUrl: './add-education-details.component.scss'
})

export class AddEducationDetailsComponent {
  educationForm!: FormGroup;
  selectedFile: File | null = null;
  subscription!: Subscription;
  postEducationdata = {} as Ieducation;
  empinfo = {} as Ipersonal;
  file: any;
  educationAttachment!: File;
  isfileselected: boolean = false;
  isEndDateValid: boolean = true;
  isStartDateValid: boolean = true;
  currentDate: Date = new Date();
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  degreeDetails = [] as any;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private openPopup:PopupService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getDegree();
    this.initializeEducationForm();
  }

  initializeEducationForm() {
    this.educationForm = this.fb.group({
      education: ['', Validators.required],
      university: ['', Validators.required],
      specialization: ['', Validators.required],
      gpa: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.educationForm.valid) {
      const formData = new FormData();
      formData.append('education', this.educationForm.get('education')?.value);
      formData.append('university', this.educationForm.get('university')?.value);
      formData.append('specialization', this.educationForm.get('specialization')?.value);
      formData.append('gpa', this.educationForm.get('gpa')?.value);
      formData.append('startDate', this.educationForm.get('startDate')?.value);
      formData.append('endDate', this.educationForm.get('endDate')?.value);
      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile);
      }
      // Call your API or service here
      console.log('Form Submitted', formData);
    }
  }

  close(): void {
    this.educationForm.reset();
    this.selectedFile = null;
    this.modalService.dismissAll();
  }

  blockTyping(event: KeyboardEvent): void {
    event.preventDefault();
  }

  allDegrees: any;//array for the all degrees
  getDegree() {
    this.subscription = this.http.getData("PreonboardingDegree").subscribe({
      next: (data: any) => {
        this.degreeDetails = data as IDegre[]
        console.log(this.degreeDetails);
        this.allDegrees = this.degreeDetails.map((item: { degreeName: any; }) => item.degreeName)
      }
    })
  }

  //function to block the special charecters
  blockSpecialCharacters(event: KeyboardEvent) {
    const blockedCharacters = /[~!@#$%^&*+=\-[\]\\';,/{}|\\":<>?()_\d.]/; // Updated regex to block special characters and numbers
    const inputChar = String.fromCharCode(event.charCode);
    if (blockedCharacters.test(inputChar)) {
      event.preventDefault(); // Block the input of the character
    }
  }

  //add degree start date validation //
  AddDegreeStartDateValidity() {
    const enteredDate = new Date(this.postEducationdata.degreeStartDate);
    const currentDate = new Date();
    this.isStartDateValid = enteredDate <= currentDate;
  }

  AddDegreeEndDateValidity(): void {
    if (this.postEducationdata.degreeEndDate < this.postEducationdata.degreeStartDate) {
      this.isEndDateValid = false;
    } else {
      this.isEndDateValid = true;
    }
  }

  //function to select the file
  onChangeEducation(event: any) {
    this.isfileselected = false;
    this.file = event.target.files[0];
    let d: Date = new Date()
    this.educationAttachment = this.renameFiles(this.file, `${this.empinfo.employeeId}_${d.getTime()}_${this.file.name}`)
    console.log(this.educationAttachment);
  }

  onEducChanges(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg','image/*','application/pdf','image/png'];
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
    this.postEducationdata.employeeId = parseInt(this.empinfo.employeeId);
    this.postEducationdata.status = "Active";
    let filepath = `/FusionDocuments/Employee Documents/Education Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath, this.file).subscribe({
      next: (data: any) => {
        this.postEducationdata.attachment = data.path;
        this.postEducationdata.employeeId = this.empinfo.employeeId;
        console.log(this.postEducationdata);
        this.subscription = this.http.postData("PreonboardingEducation", this.postEducationdata).subscribe({
          next: (data: any) => {
            console.log(data);
            this.postEducationdata = data as Ieducation;
            this.modalService.dismissAll();
            this.openPopup.openSuccess("Data Added Successfully");
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
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}