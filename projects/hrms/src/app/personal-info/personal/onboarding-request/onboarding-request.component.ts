import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, } from 'primeng/paginator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { Idocsdetail, Ipersonal } from '../../../Interfaces/personal-modal';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-onboarding-request',
  imports: [CommonModule, TranslateModule, NgbPopoverModule, ReactiveFormsModule, FormsModule, PaginatorModule, DropdownModule,
     DateformatPipe, NgxDocViewerModule, NoDataFoundComponent],
  templateUrl: './onboarding-request.component.html',
  styleUrl: './onboarding-request.component.scss'
})

export class OnboardingRequestComponent implements OnInit, OnDestroy {
  documentData = new BehaviorSubject<any[]>([]);
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  subscription!: Subscription;
  documentSelectFields = {} as any;
  OnbImageUrl!: any;
  OnbViewURL!: any;
  doumentsapprovedata: any = {} as any;
  rejectionData = {} as Idocsdetail;
  rejectDocument!: FormGroup;
  reRequestForm!: FormGroup;
  rerequestdisplayforrejected: boolean = false;
  modelref!: NgbModal;
  @ViewChild('viewmodel') viewmodel!: NgbModal;
  
  constructor(private authService: AuthService, private fb: FormBuilder, private http: HttpService, private router: Router,
    private conformationPopup: OpenModalService, private modalService: NgbModal,public rbac: RbacService) { this.intitalizeForm(); }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.getdocumentdeatilsbyempid();
    this.intitalizeForm();
    this.getEmployeeId();
  }

  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
      },
      error: (reason) => console.log(reason),
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  openModal(content: any) {
    this.modalService.open(content, {centered: true, backdrop: 'static', keyboard: false});
  }

  intitalizeForm() {
    this.rejectDocument = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
    this.reRequestForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  reRequestEmail(f: FormGroup) {
    let loggedInUser = this.authService.getToken();
    let pdata = {
      empId: this.empinfo.employeeId,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      comments: this.reRequestForm.get('comments')?.value,
    };
    if (loggedInUser.middleName) {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.subscription = this.http.postdata(`CustomEmail/RerequestDocuments`, pdata).subscribe({
      next: (data: any) => {
        if(data){
          this.reRequestForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Email Sent Successfully')
        }
        
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //function to get the details of the document
  getdocumentdeatilsbyempid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`OnBoardingDocuments/${EmpId}`).subscribe({
      next: (data: any) => {
        this.documentData.next(data);
        this.subscription = this.documentData.subscribe((documents: any[]) => {
          let disablerejectvalue = !documents.some((element: any) => {
            return element.status === 'Rejected';
          });
          this.rerequestdisplayforrejected = disablerejectvalue;
        });
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
  }

  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = '/';
    const pdfUrl = `${baseUrl}${url}`;
    this.OnbViewURL = `${environment.viewUrl}${pdfUrl}`;
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
    }
    this.modalService.open(this.viewmodel, { centered: true, backdrop: 'static', size: 'xl' });
  }

  //function to download the doc
  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
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
    this.OnbViewURL=null;
   this.modalService.dismissAll();
  }

  //function to approve the document
  approveDocument(id: number,empId: number,documentType: string,documentUrl: string,rejectedBy: number,
    reason: string,referenceNumber: number,referenceId: number) {
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
    this.subscription = this.http.postdata('OnBoardingDocuments/Update', this.doumentsapprovedata).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Document Approved Successfully');
        setTimeout(() => {
          this.getdocumentdeatilsbyempid();
          this.getEmployeeId();
        }, 2000);
      },
      error: (reason: any) => {
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
    this.http.postdata('OnBoardingDocuments/Update', this.rejectionData).subscribe({
      next: (updatedData: any) => {
        this.conformationPopup.openSuccessModal('Document Rejected Successfully');
        setTimeout(() => {
          this.rejectDocument.reset();
          this.modalService.dismissAll();
          this.getdocumentdeatilsbyempid();
          this.getEmployeeId();
        }, 2000);
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.Message
        );
      },
    });
  }

  closeModal(modal: any) {
    modal.dismiss();
    this.rejectDocument.reset();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}