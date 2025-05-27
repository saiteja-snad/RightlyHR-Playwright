import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { PopupService } from '../../../common-services/popup.service';
import { HttpService } from '../../../http-services/http.service';
import { IDegre } from '../../../models/education.model';
import { Ipersonal } from '../../../models/personal-details.model';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DataService } from '../../../common-services/data.service';
import { FormValidationService } from '../../../common-services/form-validation.service';
@Component({
  selector: 'app-update-education-details',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './update-education-details.component.html',
  styleUrl: './update-education-details.component.scss'
})

export class UpdateEducationDetailsComponent {
  educationForm!: FormGroup;
  subscription!: Subscription;
  @Input() educationData: any;
  empinfo = {} as Ipersonal;
  file: any;
  educationAttachment!: File;
  isfileselected: boolean = false;
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  degreeDetails = [] as any;
  selectedfields = {} as any
  selectedValueDegreeNameUpdateInitial: string = '';//previously selected value
  selectedValueDegreeNameUpdate: string = '';//to post the data
  selectedFile: File | null = null;
startDatevalidate:any;
  constructor(private modalService: NgbModal,private formValidationService:FormValidationService, private fb: FormBuilder, private http: HttpService, private openPopup: PopupService,
     private getData:DataService) { }
  
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.selectedfields=this.educationData;
    this.getDegree();
    this.initializeEducationForm();
  }

  initializeEducationForm() {
    this.educationForm = this.fb.group({
      education: [this.educationData?.degree || '', Validators.required],
      university: [this.educationData?.university || '', [Validators.required, Validators.pattern(/^[^\d]+$/),Validators.maxLength(100)]],
      // specialization: [this.educationData?.specialization || '', Validators.required],
      // gpa: [this.educationData?.gpa || '', Validators.required],
      specialization: [this.educationData?.specialization || '', [Validators.required, Validators.pattern(/^[A-Za-z,._-][A-Za-z ,._-]*$/),Validators.maxLength(100)]],
      // gpa: [this.educationData?.gpa || '', [Validators.required,Validators.pattern(/^([0-3](\.\d{1,2})?|4(\.00?)?)$/)]],
      gpa: [this.educationData?.gpa || '', [
        Validators.required,
        Validators.pattern(/^([1-9](\.\d{1,2})?|10(\.0{1,2})?)$/)
      ]],
      startDate: [this.formatDate(this.educationData?.degreeStartDate) || '', Validators.required],
      endDate: [this.formatDate(this.educationData?.degreeEndDate) || '', Validators.required],
    },
    { validators: [this.DateValidator()] }
  );
  }
    oncheckdates(value:any){
    if(value){
      this.educationForm.get('endDate')?.setValue(null);
    }
  }
//function for the date validation
DateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('startDate')?.value;

    if (!startDate) return null;

    const formattedStart = moment(startDate, 'YYYY-MM-DD');
    const startOfCurrentMonth = moment().startOf('month');

    // Save formatted value (optional)
    this.startDatevalidate = formattedStart.format('YYYY-MM-DD');

    

    return null; // valid
  };
}
  getDegree() {
    this.subscription = this.http.getData("PreonboardingDegree").subscribe({
      next: (data: any) => {
        this.degreeDetails = data as IDegre[]
      }
    })
  }

  //function to formate the data
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  //function to select the file
  fileAttachment(event: any) {
    this.isfileselected = false;
    this.file = event.target.files[0];
    let d: Date = new Date()
     const removeSpaceFileName = this.formValidationService.sanitizeFileName(this.file.name);
        const newFileName = `${this.empinfo.employeeId}_${d.getTime()}_${removeSpaceFileName}`;
    this.educationAttachment = this.renameFiles(this.file, newFileName)
  }

  fileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
      'application/pdf', 'image/jpeg', 'image/png'
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

  //function to update the education data
  updateEducation() {
    this.educationForm.value,
    this.selectedfields.id=this.educationData.id,
    this.selectedfields.status=this.educationData.status,
    this.selectedfields.degree= this.educationForm.value.education,
    this.selectedfields.university= this.educationForm.value.university,
    this.selectedfields.specialization= this.educationForm.value.specialization,
    this.selectedfields.gpa= this.educationForm.value.gpa,
    this.selectedfields.degreeStartDate= this.educationForm.value.startDate,
    this.selectedfields.degreeEndDate=this.educationForm.value.endDate,
    this.selectedfields.employeeId=parseInt(this.empinfo.employeeId)
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
                this.getData.getEducation.set(true);
                this.openPopup.openSuccess("Education Details updated successfully");
                this.educationForm.reset();
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
          this.modalService.dismissAll();
          this.getData.getEducation.set(true);
          this.openPopup.openSuccess("Education Details updated successfully");
          this.educationForm.reset();
        },
        error: (reason: any) => {
          console.log(reason);
          this.openPopup.openError("Something went wrong. Please check all the fields ");
        }
      })
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
