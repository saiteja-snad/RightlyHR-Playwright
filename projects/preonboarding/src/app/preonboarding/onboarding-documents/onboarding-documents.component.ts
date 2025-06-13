import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IdocumentType } from '../../models/documents.model';
import { HttpService } from '../../http-services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { PopupService } from '../../common-services/popup.service';
import { Ipersonal } from '../../models/personal-details.model';
import { DateFormatPipe } from '../../Pipes/date-format.pipe';
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
import { FormValidationService } from '../../common-services/form-validation.service';
@Component({
  selector: 'app-onboarding-documents',
  imports: [CommonModule, ReactiveFormsModule, DateFormatPipe, NgbPopoverModule, NgxDocViewerModule, RouterModule, DetailedStepProgressbarComponent],
  templateUrl: './onboarding-documents.component.html',
  styleUrl: './onboarding-documents.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class OnboardingDocumentsComponent implements OnInit, OnDestroy {
  currentStep: string = '';
  subscription!: Subscription;
  loading: any;
  loadingcircle: boolean = false;
  file: any;
  documentType: any;
  employeeinfo = {} as any;
  prosempdata = {} as any;
  getDocumentsDetails = [] as any;
  submitbuttondisable: boolean = false;
  submitbuttondisableforrejected: boolean = false;
  getDocumentDropdown = [] as IdocumentType[];
  documentAttachment!: File
  documentSelectFields = {} as any
  DocViewURL!: any;
  DocImageUrl!: any;
  showErrorrforsize: boolean = false;
  showErrorforpdf: boolean = false;
  Status: any;
  documentForm!: FormGroup;
  selectedItem: any;
  IdentityMaxNumber: number = 15;   // used to max fields for comparision
  IdentityMinNumber: number = 12;
  isMandatory: boolean = false;
  pattern!:any;
  @ViewChild('uploadPopup') uploadPopup: any;
  @ViewChild('viewpopup') viewpopup: any;
  @ViewChild('confirmationPopup') confirmationPopup: any;

  constructor(private router: Router, private modalService: NgbModal, private http: HttpService, private location: Location,
     private fb: FormBuilder, private openPopup: PopupService,private formValidationService:FormValidationService) { }

  ngOnInit(): void {
    this.employeeinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getprospectivempdata();
    this.initializeForm();
    const storedstep = 2;
    localStorage.setItem('currentStep',storedstep.toString());
  }

  // Prospective Employee Data
  getprospectivempdata() {
    let employeeId = parseInt(this.employeeinfo.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.prosempdata = data as Ipersonal;
        this.getDocuments();
      },
      error: (reason: any) => {
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['']);
        }
      }
    });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  navigatePrevious() {
    this.router.navigate(['/personal-details']);
  }

  initializeForm() {
    this.documentForm = this.fb.group({
      documentType: [{ value: '', disabled: true }, Validators.required],
      documentNumber: ['', [ Validators.minLength(this.IdentityMinNumber), Validators.maxLength(this.IdentityMaxNumber), Validators.pattern(this.pattern)]],
      docFile: [null],
    });
  }

  // Submit Form Data
  onDocumentSubmit() {
    if (this.documentForm.valid) {
      console.log('Form Data:', this.documentForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  openConfirmation() {
    this.modalService.open(this.confirmationPopup, { backdrop: 'static', centered: true })
  }

  close() {
    this.showErrorforpdf=false;
    this.showErrorrforsize=false;
    this.modalService.dismissAll();
    this.documentForm.reset(); // Reset form to initial state
    this.documentForm.markAsPristine(); // Mark as pristine (optional)
    this.documentForm.markAsUntouched(); // Mark as untouched (optional)
  }

  //function to view the doc
  onViewClick(url: string) {
    const isImage = url.match(/\.(jpg|jpeg|png)$/i);
    const isPDF = url.toLowerCase().endsWith('pdf');
    if (isImage) {
      // Generate absolute URL for image
      this.handleImage(url);
    } else if (isPDF) {
      // Generate absolute URL for PDF
      this.handlePDF(url);
    } else {
      // Handle other document types
      console.log(`Unsupported file type: ${url}`);
    }
    this.modalService.open(this.viewpopup, { centered: true, backdrop: 'static', size: 'lg' });
  }

  private handleImage(url: string) {
    const baseUrl = this.location.normalize('/');
    const imageUrl = `${baseUrl}${url}`;
    this.DocImageUrl = `${environment.viewUrl}${imageUrl}`;
    console.log(`Image URL: ${this.DocImageUrl}`);
  }

  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = this.location.normalize('/');
    const pdfUrl = `${baseUrl}${url}`;
    this.DocViewURL = `${environment.viewUrl}${pdfUrl}`;
    // Log pdfUrl to console
    console.log(`PDF URL: ${this.DocViewURL}`);
  }

  //function to get the document type
  documentypelist = [] as any
  getDocumentType() {
    this.subscription = this.http.getData('PreonboardingDocumentList').subscribe({
      next: (data: any) => {
        this.getDocumentDropdown = data;
      }
    })
  }

  //function to get the file 
  onChange(event: any) {
    this.file = event.target.files[0];
  }

  //onclik for document

  errorMsg = 'Special characters are not allowed';
  onClickEditDocument(data: any) {
    this.documentSelectFields = JSON.parse(JSON.stringify(data));
    // this.isMandatory = this.documentSelectFields.isMandatory;
    // if(this.isMandatory){
    //   this.documentForm
    //   .get('documentNumber')
    //   ?.setValidators([
    //     Validators.required,
    //     Validators.pattern(this.pattern),
    //     Validators.minLength(this.IdentityMinNumber),
    //     Validators.maxLength(this.IdentityMaxNumber),
    //   ]);

    // this.documentForm.get('documentNumber')?.updateValueAndValidity();
    // }else{
    //   this.documentForm .get('documentNumber')?.clearValidators();
    // }
    if (this.documentSelectFields.documentType?.toLowerCase() === "pan") {
      this.isMandatory = this.documentSelectFields.isMandatory
      this.IdentityMaxNumber = 10;
      this.IdentityMinNumber = 10;
      this.pattern = "[a-zA-Z0-9]*";
      this.errorMsg = 'Special characters are not allowed';
         // Set value false or clear the value if needed
         this.documentForm.get('documentNumber')?.setValue('');
       // Apply validators dynamically
       if(this.isMandatory){
        this.documentForm
        .get('documentNumber')
        ?.setValidators([
          Validators.required,
          Validators.pattern(this.pattern),
          Validators.minLength(this.IdentityMinNumber),
          Validators.maxLength(this.IdentityMaxNumber),
        ]);

      this.documentForm.get('documentNumber')?.updateValueAndValidity();
      }
      else{
       this.documentForm
        .get('documentNumber')?.clearValidators();
      }

    }
    
    if (this.documentSelectFields.documentType?.toLowerCase() === "aadhaar") {
      this.isMandatory = this.documentSelectFields.isMandatory;

      // Set value false or clear the value if needed
      this.documentForm.get('documentNumber')?.setValue('');

      this.IdentityMaxNumber = 12;
      this.IdentityMinNumber = 12;
      this.pattern = '[0-9]*';
      this.errorMsg = 'Alphabets and special characters are not allowed';

      // Apply validators dynamically
      if (this.isMandatory) {
        this.documentForm
          .get('documentNumber')
          ?.setValidators([
            Validators.required,
            Validators.pattern(this.pattern),
            Validators.minLength(this.IdentityMinNumber),
            Validators.maxLength(this.IdentityMaxNumber),
          ]);

        this.documentForm.get('documentNumber')?.updateValueAndValidity();
      } else {
        this.documentForm.get('documentNumber')?.clearValidators();
        this.documentForm.get('documentNumber')?.updateValueAndValidity();
      }
    }

    if (this.documentSelectFields.documentType?.toLowerCase() === "uan") {
      this.isMandatory = this.documentSelectFields.isMandatory;
      this.IdentityMaxNumber = 12;
      this.IdentityMinNumber = 12;
      this.pattern = "[0-9]*";
      this.errorMsg = 'Alphabets and special characters are not allowed';
      // Set value false or clear the value if needed
      this.documentForm.get('documentNumber')?.setValue('');
      // Apply validators dynamically
      if(this.isMandatory){
        this.documentForm
        .get('documentNumber')
        ?.setValidators([
          Validators.required,
          Validators.pattern(this.pattern),
          Validators.minLength(this.IdentityMinNumber),
          Validators.maxLength(this.IdentityMaxNumber),
        ]);

      this.documentForm.get('documentNumber')?.updateValueAndValidity();
      }
      else {
          this.documentForm
        .get('documentNumber')?.clearValidators();
         }
    }
  }
  
documentUrl:any;
  openModal(item: any) {

    this.selectedItem = item;
    this.documentForm?.patchValue({ 
      documentType: item.documentType || '', 
      documentNumber: item.referenceNumber || item.documentNumber || '',
    });
    
  if (!item.documentUrl) {
    this.documentUrl = item.documentUrl;

    // Fake a valid file value to pass validation
    this.documentForm.get('docFile')?.setValue(null)
    this.documentForm.get('docFile')?.setValidators( Validators.required)
    this.documentForm.get('docFile')?.markAsTouched();
    this.documentForm.get('docFile')?.updateValueAndValidity();
  }else{
    this.documentForm .get('docFile')?.clearValidators();
  }
    this.modalService.open(this.uploadPopup, { centered: true, backdrop: 'static' });
  }

  onCheckMandatory(Value: number) {
    if (Value) {
      this.isMandatory = false;
    }
    else {
      this.isMandatory = this.documentSelectFields.isMandatory;
    }
  }

  //to select the attached file
  onDocAttachmentSelected(event: any) {
      if(event){
        let file = event.target.files[0];
        let d: Date = new Date()
        let documentType = this.documentSelectFields.documentType.replace(/\//g, ' ')
        const removeSpaceFileName = this.formValidationService.sanitizeFileName(file.name);
        const newFileName = `${this.prosempdata.employeeId}_${documentType}_${d.getTime()}_${removeSpaceFileName}`;
        this.documentAttachment = this.renameFileAttchment(file, newFileName)
      }
    
  }

  private renameFileAttchment(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //function to update the   document 
  updateDocuments() {
    if (this.documentForm.valid) {
      if (this.documentSelectFields.isIdentityType == true) {
        let IdentityfilePath = `/FusionDocuments/Employee Documents/Identity Documents/${this.prosempdata.employeeId}`;
        this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', IdentityfilePath, this.documentAttachment)
          .subscribe({
            next: (data: any) => {
              this.modalService.dismissAll();
            }
          });
      }
      let filePath = `/FusionDocuments/Employee Documents/Pre Onboarding Documents/${this.prosempdata.employeeId}`;
      this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, this.documentAttachment).subscribe({
        next: (data: any) => {
          if (data) {
            this.file = null
          }
          let postdata = {
            id: this.documentSelectFields.id,
            empId: this.prosempdata.employeeId,
            documentType: this.documentSelectFields.documentType,
            documentUrl: data.path,
            status: 'Waiting for submission',
            rejectedBy: this.documentSelectFields.rejectedBy,
            reason: this.documentSelectFields.reason,
            referenceId: this.documentSelectFields.referenceId,
            referenceNumber: this.documentForm.get('documentNumber')?.value,
          }
          this.subscription = this.http.postData(`PreonboardingDocuments/Update`, postdata).subscribe({
            next: (data: any) => {
              this.openPopup.openSuccess("Document uploaded successfully");
              setTimeout(() => {
                this.modalService.dismissAll();
                this.documentForm.reset();
                this.getDocuments();
              }, 3000);
            }
          })
        },
        error: (reason: any) => {
          console.log(reason);
          if (reason.status == 400) {
            this.openPopup.openError(reason.error.Message);
          } else {
            this.openPopup.openError("file upload  is failed");
          }
          setTimeout(() => {
            this.modalService.dismissAll();
            this.getDocuments();
          }, 2000);
        },
      });
    }
  }

  //function validate the file
  onChanges(event: Event) {
    if(event){

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSizeInBytes = 25 * 1024 * 1024;
  
      if (!allowedTypes.includes(file.type)) {
        this.showErrorforpdf = true;
        this.showErrorrforsize = false;
        this.documentForm.get('docFile')?.setValue(null);
        return;
      } else if (file.size > maxSizeInBytes) {
        this.showErrorrforsize = true;
        this.showErrorforpdf = false;
        this.documentForm.get('docFile')?.setValue(null);
        return;
      }
  
      // Everything is valid, update form control
      this.showErrorforpdf = false;
      this.showErrorrforsize = false;
      this.documentForm?.get('docFile')?.setValue(file);
    } else {
      this.documentForm.get('docFile')?.setValue(null);
    }
          
  }
  }

  //function to get the document
  aftersubmitbuttondisable: boolean = true
  getDocuments() {
    let Id = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingDocuments/Preonboarding/${Id}`).subscribe({
      next: (data: any) => {
        this.getDocumentsDetails = data;
        let disablerejectvalue = !this.getDocumentsDetails.some((element: any) => {
          return element.status === 'Rejected';
        });
        let countofDocumentssubmitted = this.getDocumentsDetails.filter((element: any) => {
          return element.isMandatory === true && element.documentUrl !== null && element.documentUrl !== '';
        }).length
        let countMandatoryTrue = this.getDocumentsDetails.filter((element: any) => {
          return element.isMandatory === true;
        }).length;
        if (countofDocumentssubmitted == countMandatoryTrue) {
          this.aftersubmitbuttondisable = true;
        }
        else {
          this.aftersubmitbuttondisable = false;
        }
        this.submitbuttondisableforrejected = disablerejectvalue;
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: reason => console.log(reason)
    })
  }

  //function to submit the documents 
  submit() {
    this.loadingcircle = true;
    let empId = this.prosempdata.employeeId;
    let data = { empId: this.prosempdata.employeeId };
    this.subscription = this.http.putData(`PreonboardingDocuments/submit/${empId}`, data).subscribe({
      next: (data: any) => {
       
        if (data == true) {
          this.submitEmail();
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //function to send the email 
  submitEmail() {
    let data = {
      empId: this.prosempdata.employeeId,
      userName: `${this.prosempdata.firstName} ${this.prosempdata.middleName} ${this.prosempdata.lastName}`,
    }
    if (this.prosempdata.middleName) {
      data.userName = `${this.prosempdata.firstName} ${this.prosempdata.middleName} ${this.prosempdata.lastName}`
    } else {
      data.userName = `${this.prosempdata.firstName} ${this.prosempdata.lastName}`
    }
    this.subscription = this.http.postData(`PreonboardingEmail/DocumentsUpload`, data).subscribe({
      next: (data: any) => {
        this.loadingcircle = false;
        this.submitNotification();
        this.emailacknowledgementtoemp();
        this.openPopup.openSuccess("Submitted successfully, We’ll get back to you soon!!");
        setTimeout(() => {
          this.modalService.dismissAll();
          this.http.logOut();
        }, 2000);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //function to send to notification
  submitNotification() {
    const currentDate = new Date();
    let senddata = {
      message: `Document Submitted`,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${this.prosempdata.firstName} ${this.prosempdata.middleName} ${this.prosempdata.lastName} has submitted the documents`,
      empId: this.prosempdata.employeeId
    }
    if (this.prosempdata.middleName) {
      senddata.notificationType = `${this.prosempdata.firstName} ${this.prosempdata.middleName} ${this.prosempdata.lastName}`;
    }
    else {
      senddata.notificationType = `${this.prosempdata.firstName} ${this.prosempdata.lastName}`;
    }
    this.subscription = this.http.postData(`preonboardingNotifications/cretedempid`, senddata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  emailacknowledgementtoemp() {
    let data = { empId: this.prosempdata.employeeId };
    this.subscription = this.http.postData(`PreonboardingEmail/SubmitEmployeeDocumentsAndNotify`, data).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}