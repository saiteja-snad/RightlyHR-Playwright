import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private openPopup: PopupService,
     private getData:DataService) { }
  
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getDegree();
    this.initializeEducationForm();
  }

  initializeEducationForm() {
    this.educationForm = this.fb.group({
      education: [this.educationData?.degree || '', Validators.required],
      university: [this.educationData?.university || '', Validators.required],
      specialization: [this.educationData?.specialization || '', Validators.required],
      gpa: [this.educationData?.gpa || '', Validators.required],
      startDate: [this.formatDate(this.educationData?.degreeStartDate) || '', Validators.required],
      endDate: [this.formatDate(this.educationData?.degreeEndDate) || '', Validators.required],
    });
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
    this.educationAttachment = this.renameFiles(this.file, `${this.empinfo.employeeId}_${d.getTime()}_${this.file.name}`)
    console.log(this.educationAttachment);
  }

  fileChange(event: Event) {
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

  //function to update the education data
  updateEducation() {
    this.selectedfields = {
      ...this.selectedfields,
      ...this.educationForm.value,
        id:this.educationData.id,
        status:this.educationData.status,
        degree: this.educationForm.value.education,
        university: this.educationForm.value.university,
        specialization: this.educationForm.value.specialization,
        gpa: this.educationForm.value.gpa,
        degreeStartDate: this.educationForm.value.startDate,
        degreeEndDate: this.educationForm.value.endDate,
        employeeId: parseInt(this.empinfo.employeeId),
    };
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
                this.openPopup.openSuccess("Data updated successfully");
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
          this.openPopup.openSuccess("Data updated successfully");
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
