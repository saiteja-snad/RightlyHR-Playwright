import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, } from 'primeng/paginator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { Idocsdetail, Ipersonal } from '../../../Interfaces/personal-modal';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { DocumentData } from '../../../Interfaces/document.model';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-onboarding-request',
  imports: [CommonModule, TranslateModule, NgbPopoverModule, ReactiveFormsModule, FormsModule, PaginatorModule, DropdownModule,
    DateformatPipe, NgxDocViewerModule, NoDataFoundComponent, DataLoaderContentComponent, DownloadIconComponent, TableModule],
  templateUrl: './onboarding-request.component.html',
  styleUrl: './onboarding-request.component.scss'
})

export class OnboardingRequestComponent implements OnInit, OnDestroy {
  @ViewChild('documentsTable') documentsTable!: Table;
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
  loading: boolean = false;
  // For modal view
  @ViewChild('viewmodel') viewmodel!: NgbModal;
  
  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  originalDocumentData: any[] = [];

  constructor(private authService: AuthService, private fb: FormBuilder, private http: HttpService, private router: Router, public formvalidation: FormValidationsService,
    private conformationPopup: OpenModalService, private modalService: NgbModal, public rbac: RbacService) { this.intitalizeForm(); }

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
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
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
        if (data) {
          this.reRequestForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Email has been sent successfully')
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //function to get the details of the document
  getdocumentdeatilsbyempid() {
    this.loading = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`OnBoardingDocuments/${EmpId}`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.originalDocumentData = [...data]; // Store original data
        this.documentData.next(data);
        this.subscription = this.documentData.subscribe((documents: any[]) => {
          let disablerejectvalue = !documents.some((element: any) => {
            return element.status === 'Rejected';
          });
          this.rerequestdisplayforrejected = disablerejectvalue;
        });
      },
      error: (reason: any) => {
        this.loading = false;
        console.log(reason);
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
    this.OnbViewURL = null;
    this.modalService.dismissAll();
  }

  //function to approve the document
  approveDocument(id: number, empId: number, documentType: string, documentUrl: string, rejectedBy: number,
    reason: string, referenceNumber: number, referenceId: number) {
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
        this.conformationPopup.openSuccessModal('Document verified successfully');
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
isSubmitting = false;
  updaterejectdocs(modal: any) {
    this.isSubmitting = true;
     if (this.rejectDocument.invalid) {
    this.rejectDocument.markAllAsTouched();
    return;
  }
    // Setting the status for Reject button
    let loggedInUser = this.authService.getToken();
    this.rejectionData.status = 'Rejected';
    this.rejectionData.rejectedBy = loggedInUser.employeeId;
    this.rejectionData.reason = this.rejectDocument.get('comments')?.value;
    this.http.postdata('OnBoardingDocuments/Update', this.rejectionData).subscribe({
      next: (updatedData: any) => {
         this.isSubmitting = false;
        modal.close();
        setTimeout(() => {
        this.conformationPopup.openSuccessModal('Document rejected successfully');
        this.rejectDocument.reset();
        this.getdocumentdeatilsbyempid();
        this.getEmployeeId();
      }, 150);
      },
      error: (reason: any) => {
         this.isSubmitting = false;
        this.conformationPopup.openErrorModal(reason.error.Message
        );
      },
    });
  }

  closeModal(modal: any) {
    modal.dismiss();
    this.rejectDocument.reset();
  }

  get shouldShowActionColumn(): boolean {
    if (!this.documentData) return false;
    const docs: DocumentData[] = this.documentData.value; // get the current value from BehaviorSubject
    return docs.some((data: DocumentData) =>
      data.status !== 'Verified' && data.status !== 'Rejected' && data.status === 'Submitted' && !!data.documentUrl
    );
  }

  sortDocuments(field: string): void {
    const currentData = this.documentData.value;
    
    // Determine sort order
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
      } else if (this.currentSortOrder === -1) {
        // Reset to original order
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.documentData.next([...this.originalDocumentData]);
        return;
      } else {
        this.currentSortOrder = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
    }

    // Sort the data
    const sortedData = [...currentData].sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field === 'submittedDate') {
        val1 = new Date(a[field] ?? 0).getTime();
        val2 = new Date(b[field] ?? 0).getTime();
        return this.currentSortOrder * (val1 - val2);
      } else if (field === 'referenceNumber') {
        val1 = parseInt(a[field] ?? 0) || 0;
        val2 = parseInt(b[field] ?? 0) || 0;
        return this.currentSortOrder * (val1 - val2);
      } else {
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return this.currentSortOrder * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });

    this.documentData.next(sortedData);
  }

  getSortIcon(field: string): string {
    if (this.currentSortField !== field || this.currentSortOrder === 0) {
      return 'bi-arrow-down-up text-muted'; // Default unsorted icon with muted color
    }
    return this.currentSortOrder === 1 ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary';
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.documentData.next([...this.originalDocumentData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.documentsTable) {
          this.documentsTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field === 'submittedDate') {
        val1 = new Date(a[field] ?? 0).getTime();
        val2 = new Date(b[field] ?? 0).getTime();
        return event.order * (val1 - val2);
      } else if (field === 'referenceNumber') {
        val1 = parseInt(a[field] ?? 0) || 0;
        val2 = parseInt(b[field] ?? 0) || 0;
        return event.order * (val1 - val2);
      } else {
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
