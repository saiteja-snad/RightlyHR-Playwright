import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { PopupService } from '../../../common-services/popup.service';
import { HttpService } from '../../../http-services/http.service';
import { Ieducation, IDegre } from '../../../models/education.model';
import { Ipersonal } from '../../../models/personal-details.model';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-update-education-details',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './update-education-details.component.html',
  styleUrl: './update-education-details.component.scss'
})

export class UpdateEducationDetailsComponent {
  educationForm!: FormGroup;
  subscription!: Subscription;
  getEducationData = [] as any;
  empinfo = {} as Ipersonal;
  file: any;
  educationAttachment!: File
  isfileselected: boolean = false;
  isEndDateValid: boolean = true;
  isStartDateValid: boolean = true;
  currentDate: Date = new Date();
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  islistedItem: boolean = true;
  degreeDetails = [] as any;
  selectedValueDegreeName: string = '';//to post the data
  selectedfields = {} as any
  isUpdateDegreeStart: boolean = true;
  isUpdateDegreeEnd: boolean = true;
  EduImageUrl!: any;
  EduViewURL!: any;
  selectedValueDegreeNameUpdateInitial: string = '';//previously selected value
  selectedValueDegreeNameUpdate: string = '';//to post the data
  selectedattachmentname: string = '';///previously selected value
  educationupdate = {} as Ieducation;
  getedudata = {} as any;
  selectedFile: File | null = null;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService,
     private openPopup: PopupService ) { }
  
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getDegree();
    this.getEducationEmpid();
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

  //function for date validation in update
  updateDegreeStartDateValidity() {
    const enteredDate = new Date(this.selectedfields.degreeStartDate);
    console.log(enteredDate);
    const currentDate = new Date();
    this.isStartDateValid = enteredDate <= currentDate;
  }

  updateDegreeEndDateValidity(): void {
    if (this.selectedfields.degreeEndDate < this.selectedfields.degreeStartDate) {
      this.isUpdateDegreeEnd = false;
    } else {
      this.isUpdateDegreeEnd = true;
    }
  }

  //function to formate the data
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  //function to get the education details
  getEducationEmpid() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    console.log(EmployeeId)
    this.subscription = this.http.getData(`PreonboardingEducation/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        localStorage.setItem("educationinfodata", JSON.stringify(data));
        this.getEducationData = data as Ieducation
        this.getEducationData.degreeStartDate = this.formatDate(this.getEducationData.degreeStartDate);
        console.log(this.getEducationData.degreeStartDate)
        this.getEducationData.degreeEndDate = this.formatDate(this.getEducationData.degreeEndDate)
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
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
      const allowedTypes = [
        'image/jpeg',
        'image/*',
        'application/pdf',
        'image/png'
      ];
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

  //function to get file 
  getFileName(attachmentPath: string): string {
    if (attachmentPath) {
      const splitPath = attachmentPath.split('/');
      let fileName = splitPath[splitPath.length - 1];
      if (fileName.length > 12) {
        fileName = fileName.substring(12);  // Exclude the first 12 characters
      }
      return fileName;
    }
    return '';
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

  //function to update the education data
  updateEducation() {
    if (this.selectedValueDegreeNameUpdate.length < 1) {
      this.selectedfields.degree = this.selectedValueDegreeNameUpdateInitial;
    }
    else {
      this.selectedfields.degree = this.selectedValueDegreeNameUpdate;
    }
    if (this.file) {
      let filepath = `/FusionDocuments/Employee Documents/Education Documents/${this.empinfo.employeeId}`;
      this.subscription = this.http
        .uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath, this.file)
        .subscribe({
          next: (data: any) => {
            this.selectedfields.attachment = data.path;
            this.subscription = this.http.postData(`PreonboardingEducation/UPDATER`, this.selectedfields).subscribe({
              next: (data: any) => {
                console.log(data);
                this.modalService.dismissAll();
                this.openPopup.openSuccess("Data updated successfully");
              },
              error: (reason: any) => {
                console.log(reason);
                this.openPopup.openError("Something went wrong. Please check all the fields ");
              }
            })
          }
        })
    }
    else {
      this.subscription = this.http.postData(`PreonboardingEducation/UPDATER`, this.selectedfields).subscribe({
        next: (data: any) => {
          console.log(data);
          this.modalService.dismissAll();
          this.openPopup.openSuccess("Data updated successfully");
        },
        error: (reason: any) => {
          console.log(reason);
          this.openPopup.openError("Something went wrong. Please check all the fields ");
        }
      })
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
