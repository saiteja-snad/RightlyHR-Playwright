import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { IJob } from '../../../Interfaces/letters-model';
import { Idocsdetail } from '../../../Interfaces/personal-modal';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment.dev';


@Component({
  selector: 'app-onboarding-request',
  imports: [CommonModule, TranslateModule,NgbPopoverModule,ReactiveFormsModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe,NgxDocViewerModule],
  templateUrl: './onboarding-request.component.html',
  styleUrl: './onboarding-request.component.scss'
})
export class OnboardingRequestComponent implements OnInit, OnDestroy{
  documentData = [] as any;
  empinfo = {} as IJob;
  subscription!: Subscription;
  documentSelectFields = {} as any;
  OnbImageUrl!: any;
  OnbViewURL!: any;
  doumentsapprovedata: any = {} as any;
  rejectionData = {} as Idocsdetail;
  rejectDocument!:FormGroup;
  rerequestdisplayforrejected: boolean = false;
 modelref!:NgbModal;
  constructor(private authService: AuthService,private fb: FormBuilder,private http: HttpService,
    private conformationPopup: OpenModalService,private modalService: NgbModal,) 
  {this.intitalizeForm(); }
 
  ngOnInit(): void {
    
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.getdocumentdeatilsbyempid();
    this.intitalizeForm();
  }
  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }
  intitalizeForm() {
    this.rejectDocument =this.fb.group({
      comments: ['', [Validators.required,Validators.maxLength(250)]],
        });
    }

 //function to get the details of the document
  getdocumentdeatilsbyempid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`OnBoardingDocuments/${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.documentData = data;
          let disablerejectvalue = !this.documentData.some((element: any) => {
            return element.status === 'Rejected';
          });
          this.rerequestdisplayforrejected = disablerejectvalue;
        },
      });
  }
  //onclik for document
  onClickEditDocument(data: any) {
    this.documentSelectFields = JSON.parse(JSON.stringify(data));
  }
    private handleImage(url: string) {
      const baseUrl = '/';
      const imageUrl = `${baseUrl}${url}`;
      this.OnbImageUrl = `${environment.viewUrl}${imageUrl}`;
      console.log(`Image URL: ${this.OnbImageUrl}`);
    }
  
    private handlePDF(url: string) {
      // Assuming NgxDocViewerModule supports PDFs directly
      const baseUrl = '/';
      const pdfUrl = `${baseUrl}${url}`;
      this.OnbViewURL = `${environment.viewUrl}${pdfUrl}`;
      // Log pdfUrl to console
      console.log(`PDF URL: ${this.OnbViewURL}`);
    }
  //function to view the doc
  onViewClick(url: string,viewmodel: any) {
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
    this.openModal(viewmodel)
  }
  //function to download the doc
  onSelectDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file)
      .subscribe({
        next: (res: any) => {
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename = file.split('/')[file.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason: any) => console.log(reason),
      });
  }
  //function to reload the page
  reload() {
    window.location.reload();
  }
//function to approve the document
  approveDocument(
    id: number,
    empId: number,
    documentType: string,
    documentUrl: string,
    rejectedBy: number,
    reason: string,
    referenceNumber: number,
    referenceId: number
  ) {
    let loggedInUser = this.authService.getToken();
    this.doumentsapprovedata = {
      id: id,
      empId: empId,
      documentType: documentType,
      documentUrl: documentUrl,
      rejectedBy: loggedInUser.employeeId,
      reason: null,
      status: 'Verified',
      referenceId: referenceId,
      referenceNumber: referenceNumber,
    };

  }
  approvedocuments() {
    this.subscription = this.http
      .postdata('OnBoardingDocuments/Update', this.doumentsapprovedata)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Document Approved Successfully');
          setTimeout(() => {
            this.modalService.dismissAll();
            this.getdocumentdeatilsbyempid();
          }, 2000);
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal(reason.error.Message
          );
        },
      });
  }
  //function to reject the document
  submitRejectReason(data: any) {
    this.rejectionData = data;
  }
  updaterejectdocs() {
    // Setting the status for Reject button
    let loggedInUser = this.authService.getToken();
    this.rejectionData.status = 'Rejected';

    this.rejectionData.rejectedBy = loggedInUser.employeeId;
    this.rejectionData.reason = this.rejectDocument.get('comments')?.value;
    this.http
      .postdata('OnBoardingDocuments/Update', this.rejectionData)
      .subscribe({
        next: (updatedData: any) => {
          this.conformationPopup.openSuccessModal('Document Rejected Successfully');
          setTimeout(() => {
            this.modalService.dismissAll();
            this.getdocumentdeatilsbyempid();
          }, 2000);

        },

        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal(reason.error.Message
          );

        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
