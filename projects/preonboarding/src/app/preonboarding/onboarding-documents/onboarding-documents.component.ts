import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressService } from '../../common-services/progress.service';
import { Subscription } from 'rxjs';
import { IdocumentType } from '../../models/documents.model';
import { HttpService } from '../../http-services/http.service';
import { NgForm, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-onboarding-documents',
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './onboarding-documents.component.html',
  styleUrl: './onboarding-documents.component.scss'
})
export class OnboardingDocumentsComponent implements OnInit, OnDestroy {
  currentStep: string = '';
  @ViewChild('uploadPopup') uploadPopup: any;
  subscription!: Subscription;
  a = false;
  b = true;
  loading: any;
  loadingcircle: boolean = false
  file: any;
  documentType: any;
  prosempdata = {} as any;
  getDocumentsDetails = [] as any;
  submitbuttondisable: boolean = false;
  submitbuttondisableforrejected: boolean = false;
  getDocumentDropdown = [] as IdocumentType[];//variable to get list to documenttypes
  documentAttachment!: File
  documentSelectFields = {} as any
  DocViewURL!: any;
  DocImageUrl!: any;
  showErrorrforsize: boolean = false;
  showErrorforpdf: boolean = false;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Status: any;

  constructor(private router: Router, private modalService: NgbModal, private ProgressServices: ProgressService
    , private http: HttpService, private location: Location
  ) { }

  ngOnInit(): void {
    this.ProgressServices.step$.subscribe((step) => {
      this.currentStep = '1';
    });
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.getDocuments();
  }

  openUpload() {
    this.modalService.open(this.uploadPopup, { centered: true, backdrop: 'static' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  close() {
    this.modalService.dismissAll();
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
  }
  private handleImage(url: string) {
    const baseUrl = this.location.normalize('/');
    const imageUrl = `${baseUrl}${url}`;
    this.DocImageUrl = `${environment.viewUrl}${imageUrl}`;

    // Log imageUrl to console
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
  reload() {
    window.location.reload()
    //f.resetForm()
  }
  change() {
    this.a = false;
    this.b = true;
  }

  submittedsuccess() {
    const modelDivSuccess = document.getElementById("submittedsuccess");
    if (modelDivSuccess != null) {
      modelDivSuccess.style.display = 'block'
    }
  }

  //function to get the document type
  documentypelist = [] as any
  getDocumentType() {
    this.subscription = this.http.getData('PreonboardingDocumentList').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.getDocumentDropdown = data
        let experienceType = this.prosempdata.experienceType
        console.log(experienceType);
      }
    })
  }
  //function to get the file 
  onChange(event: any) {
    this.file = event.target.files[0];
  }
  onFormClose(f: NgForm) {
    //console.log(f);

    f.resetForm()
  }

  //function to upload the document 
  UploadDocuments(f: any) {
    let filePath = `/FusionDocuments/Employee Documents/Pre Onboarding Documents/${this.prosempdata.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.file)
      .subscribe({
        next: (data: any) => {
          // console.log(data);
          if (data) {
            this.file = null
            //this.getAllFiles()
          }
          let postdata = {
            empId: this.prosempdata.employeeId,
            documentType: this.documentType,
            documentUrl: data.path,
            status: null,
            rejectedBy: null,
            reason: null
          }
          this.subscription = this.http.postData(`PreonboardingDocuments`, postdata).subscribe({
            next: (data: any) => {
              // console.log(data);
              this.a = false;
              this.b = true;
              // this.toaster.success({
              //   detail: 'SUCCESS',
              //   summary: 'Document uploaded successfully',
              //   duration: 5000,
              // });
              setTimeout(() => {
                window.location.reload();
              }, 2000);

              this.getDocuments();
            }
          })

        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  
  //onclik for document
  IdentityMaxNumber: number = 15   // used to max fields for comparision
  IdentityMinNumber: number = 12
  isMandatory: boolean = false;
  pattern: any;
  errorMsg = 'Special characters are not allowed';
  onClickEditDocument(data: any) {
    this.documentSelectFields = JSON.parse(JSON.stringify(data))
    console.log(this.documentSelectFields);
    this.isMandatory = false
    if (this.documentSelectFields.documentType?.toLowerCase() === "pan") {
      this.isMandatory = this.documentSelectFields.isMandatory
      this.IdentityMaxNumber = 10
      this.IdentityMinNumber = 10
      this.pattern = "[a-zA-Z0-9]*"
      this.errorMsg = 'Special characters are not allowed'
    }
    if (this.documentSelectFields.documentType?.toLowerCase() === "aadhaar") {
      this.isMandatory = this.documentSelectFields.isMandatory
      this.IdentityMaxNumber = 12
      this.IdentityMinNumber = 12
      this.pattern = "[0-9]*"
      this.errorMsg = 'Alphabets and special characters are not allowed'
    }
    if (this.documentSelectFields.documentType?.toLowerCase() === "uan") {
      this.isMandatory = this.documentSelectFields.isMandatory
      this.IdentityMaxNumber = 12
      this.IdentityMinNumber = 12
      this.pattern = "[0-9]*"
      this.errorMsg = 'Alphabets and special characters are not allowed'
    }
  }

  onCheckMandatory(Value: number) {
    if (Value) {
      this.isMandatory = false
    }
    else {
      this.isMandatory = this.documentSelectFields.isMandatory
    }
  }

  //to select the attached file
  onDocAttachmentSelected(event: any) {
    let file = event.target.files[0];
    let d: Date = new Date()
    let documentType = this.documentSelectFields.documentType.replace(/\//g, ' ')
    this.documentAttachment = this.renameFileAttchment(file, `${this.prosempdata.employeeId}_${documentType}_${d.getTime()}_${file.name}`)
    // console.log(this.documentAttachment);
  }

  private renameFileAttchment(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //function to update the   document 
  updateDocuments(f: NgForm) {
    if (this.documentSelectFields.isIdentityType == true) {
      let IdentityfilePath = `/FusionDocuments/Employee Documents/Identity Documents/${this.prosempdata.employeeId}`;
      this.subscription = this.http
        .uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', IdentityfilePath, this.documentAttachment)
        .subscribe({
          next: (data: any) => {
            console.log(data);
          }
        });
    }
    let filePath = `/FusionDocuments/Employee Documents/Pre Onboarding Documents/${this.prosempdata.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, this.documentAttachment)
      .subscribe({
        next: (data: any) => {
          console.log(data);
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
            referenceNumber: this.documentSelectFields.referenceNumber
          }
          this.subscription = this.http.postData(`PreonboardingDocuments/Update`, postdata).subscribe({
            next: (data: any) => {
              this.getDocuments();
            }
          })
        },
        error: (reason: any) => {
          console.log(reason);
          if (reason.status == 400) {
          }
        },
      });
  }

  //function validate the file
  onoChanges(event: Event) {
    if (event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const allowedTypes = ['image/jpeg', 'image/*', 'application/pdf', 'image/png'];
        const maxSizeInBytes = 25 * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) {
          this.showErrorforpdf = true;
          this.showErrorrforsize = false;
          input.value = '';
        }
        else if (file.size > maxSizeInBytes) {
          this.showErrorrforsize = true;
          this.showErrorforpdf = false;
          input.value = '';
        }
        else {
          this.showErrorforpdf = false;
          this.showErrorrforsize = false;
        }
      }
    }
  }

  //function to get the document
  aftersubmitbuttondisable: boolean = true
  getDocuments() {
    let Id = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingDocuments/Preonboarding/${Id}`).subscribe({
      next: (data: any) => {
        console.log(data);
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
          this.aftersubmitbuttondisable = true
        }
        else {
          this.aftersubmitbuttondisable = false
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
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename
        a.click()
      },
      error: reason => console.log(reason)
    })
  }

  //function to submit the documents 
  submit() {
    let empId = this.prosempdata.employeeId
    let data = { empId: this.prosempdata.employeeId }
    this.subscription = this.http.putData(`PreonboardingDocuments/submit/${empId}`, data).subscribe({
      next: (data: any) => {
        this.loadingcircle = true;
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
        //console.log(data);
        this.loadingcircle = false;
        this.submitNotification();
        this.emailacknowledgementtoemp();
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
      senddata.notificationType = `${this.prosempdata.firstName} ${this.prosempdata.middleName} ${this.prosempdata.lastName}`
    }
    else {
      senddata.notificationType = `${this.prosempdata.firstName} ${this.prosempdata.lastName}`
    }
    this.subscription = this.http.postData(`preonboardingNotifications/cretedempid`, senddata).subscribe({
      next: (data: any) => {
        // console.log(data);

      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  emailacknowledgementtoemp() {
    let data = {
      empId: this.prosempdata.employeeId,
    }
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