import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IJob } from '../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { AuthService } from '../../services/auth.service';
import { Idocsdetail } from '../../Interfaces/personal-modal';

@Component({
  selector: 'app-onboarding-request',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe,NgxDocViewerModule],
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
  rerequestdisplayforrejected: boolean = false;
  constructor(private authService: AuthService,private http: HttpService,private conformationPopup: OpenModalService,private modalService: NgbModal) 
  { }
 
  ngOnInit(): void {
    
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.getdocumentdeatilsbyempid();
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
        error: (reason) => console.log(reason),
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
              this.conformationPopup.openErrorModal(reason.error.message);
        },
      });
  }
  //function to reject the document
  submitRejectReason(data: any) {
    this.rejectionData = data;

    // Send the updated rejectionData to the backend
    this.http
      .postdata('OnBoardingDocuments/Update', this.rejectionData)
      .subscribe({
        next: (updatedData: any) => {
          // Add any further processing if needed
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
