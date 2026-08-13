import { Component, ViewChild } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { ActivatedRoute } from '@angular/router';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { ClientDocumentsTabsComponent } from "../../../shared/project-management-tabs/client-documents-tabs/client-documents-tabs.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-inactive-client-documents',
  imports: [DataLoaderContentComponent, NoDataFoundComponent, DownloadIconComponent, TranslateModule, CommonModule, DateformatPipe, ConfirmationIconComponent, ClientDocumentsTabsComponent, TableModule],
  templateUrl: './inactive-client-documents.component.html',
  styleUrl: './inactive-client-documents.component.scss'
})

export class InactiveClientDocumentsComponent {
  @ViewChild('inactiveClientDocumentsTable') inactiveClientDocumentsTable!: Table;
  subscription!: Subscription;
  documentdata = [] as any;
  originalDocumentdata: any[] = [];
  entitytype = 'client';
  loading = false;
  clientID: any;
  empinfo: any;
  currentDate: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  employeeDetails: any;
  clientAttachment: File | null = null;
  spinnerLoader: boolean = false;
  displayClientAttachment: string = '';
  inactiveClientStatus: any;
  selecteddata: any;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private route: ActivatedRoute, private http: HttpService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public rbac: RbacService, private authService: AuthService) { }

  ngOnInit() {
    const now = new Date();
    // format YYYY-MM-DD for input[type="date"]
    this.currentDate = now.toISOString().split('T')[0];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = clientID;
        this.getDocumentDetails(clientID);
        this.getClientsData(clientID);
      }
    });
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  // Document data fetch function
  getDocumentDetails(entityId: string) {
    this.subscription = this.http.getData(`Documents/?entityType=client&entityId=${entityId}&status=inactive`).subscribe({
      next: (data: any) => {
        this.documentdata = data.data;
        this.originalDocumentdata = [...data.data];
      },
      error: (reason: any) => { }
    });
  }

  // delete Modal open function
  opendeletModal(content: any,): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // Edit Modal open function
  openModal(content: any, data: any, size: any) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    this.selecteddata = data;
  }

  // File rename function
  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  // Delete document function
  DeleteDocument() {
    const formValue = this.selecteddata;
    let loggedInUser = this.authService.getToken();
    const payload = {
      entityType: "client",
      entityId: this.route.snapshot.queryParams['id'],
      //  documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: formValue.documentUrl,
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: loggedInUser.employeeId,
      attributes: [
        {
          attributeKey: "signedCopy",
          attributeValue: formValue.signedCopy ? "yes" : "no",
          dataType: "string"
        }
      ]
    };
    const clientID = this.route.snapshot.queryParams['id'];
    this.http.putData(`Documents/${formValue.documentId}`, payload).subscribe({
      next: (res) => {
        this.getDocumentDetails(clientID);
        this.modalService.dismissAll();
          this.http.setnewcountfornewdocumentscount();
        this.conformationPopup.openSuccessModal('Document restored successfully');
      },
      error: (err) => {
        console.error('Error updating document:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update document');
      }
    });
  }

  onAttachmentDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        const fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: (reason) => console.log(reason),
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
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
        this.documentdata = [...this.originalDocumentdata];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.inactiveClientDocumentsTable) {
          this.inactiveClientDocumentsTable.reset();
        }
        return;
      } else {
        // Currently reset, use PrimeNG's order
        this.currentSortOrder = event.order;
      }
    } else {
      // New field clicked - use PrimeNG's default order
      this.currentSortField = field;
      this.currentSortOrder = event.order;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field === 'createdAt') {
        // Handle date sorting
        val1 = new Date(a[field] ?? 0).getTime();
        val2 = new Date(b[field] ?? 0).getTime();
        return event.order * (val1 - val2);
      } else if (field === 'signedCopy') {
        // Handle signed copy (yes/no)
        val1 = String(a?.attributes?.[0]?.attributeValue ?? '').toLowerCase();
        val2 = String(b?.attributes?.[0]?.attributeValue ?? '').toLowerCase();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      } else if (field === 'attachment') {
        // Handle attachment (file name from path)
        val1 = String(a?.documentUrl?.split('/').pop() ?? '').trim();
        val2 = String(b?.documentUrl?.split('/').pop() ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      } else {
        // Default string comparison
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}