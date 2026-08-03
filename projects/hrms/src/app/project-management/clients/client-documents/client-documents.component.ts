import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { Select } from 'primeng/select';
import { AuthService } from '../../../services/auth.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { IEAV } from '../../../settings/project-management-configurations/models/project-type.modal';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { ClientDocumentsTabsComponent } from "../../../shared/project-management-tabs/client-documents-tabs/client-documents-tabs.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-client-documents',
  imports: [Select, TranslateModule, CommonModule, ReactiveFormsModule, DateformatPipe, DataLoaderContentComponent,
    NoDataFoundComponent, DownloadIconComponent, ClientDocumentsTabsComponent, TableModule],
  templateUrl: './client-documents.component.html',
  styleUrl: './client-documents.component.scss'
})

export class ClientDocumentsComponent implements OnInit, OnDestroy {
  @ViewChild('clientDocumentsTable') clientDocumentsTable!: Table;
  updateDocumentForm!: FormGroup;
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
  documentTypes: IEAV[] = [];
  inactiveClientStatus: any;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute,
    private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService, public rbac: RbacService) { }

  ngOnInit() {
    const now = new Date();
    // format YYYY-MM-DD for input[type="date"]
    this.currentDate = now.toISOString().split('T')[0];
    this.createDocumentForm();
    this.getAllActiveEmployees();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = clientID;
        this.getDocumentDetails(clientID);
        this.getClientsData(clientID);
      }
    });
    this.http.documentsDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getDocumentDetails(this.clientID);
    });
    this.getEAV();
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

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Client Document Type').subscribe({
      next: (data: any) => {
        this.documentTypes = data;
      },
      error: (error: any) => {
        this.documentTypes = [];
      }
    });
  }

  // initialization of form
  createDocumentForm() {
    this.updateDocumentForm = this.fb.group({
      // documentName: [null, Validators.required],
      documentType: [null, Validators.required],
      documentUrl: [null, Validators.required],
      signedCopy: [null],
      documentId: [null]
    });
  }

  // Document data fetch function
  getDocumentDetails(entityId: string) {
    this.subscription = this.http.getData(`Documents/?entityType=client&entityId=${entityId}&status=active`).subscribe({
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
    this.updateDocumentForm.patchValue({
      // documentName: data?.documentName,
      documentType: data?.documentType,
      documentUrl: data?.documentUrl,
      documentId: data?.documentId,
      signedCopy: data?.attributes[0]?.attributeValue === "yes" ? true : false,
    });
  }

  // get all active employees function
  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            id: employee.employeeId,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  // change date format to yyyy-mm-dd
  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  // File select function
  onChangeClientAttachment(event: any): void {
    this.displayClientAttachment = '';
    const file: File = event.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (!allowedTypes.includes(file.type)) {
      this.conformationPopup.openErrorModal('Invalid file type. Only PNG, JPEG, PDF, DOC, DOCX, XLS, XLSX are allowed.');
      this.clientAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.clientAttachment = null;
      this.displayClientAttachment = '';
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.clientAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayClientAttachment = this.clientAttachment.name;
    this.updateDocumentForm.patchValue({
      documentUrl: this.clientAttachment.name
    });
  }

  // File rename function
  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  // File reset function
  resetClientFormAttachment() {
    this.updateDocumentForm.get('documentUrl')?.reset();
    this.updateDocumentForm.get('documentUrl')?.markAsUntouched();
  }

  // File upload function
  uploadClientAttachment(payload: any): void {
    const filePath = `/ProjectManagement/Clients/${this.documentdata[0]?.project?.clientId}/Clients/${this.route.snapshot.queryParams['id']}/Documents`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          payload.documentUrl = data.path;
          this.updateDocumentForm.patchValue({
            documentUrl: data.path
          });
          this.saveProjectData(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload failed');
      }
    });
  }

  // Update document payload function
  UpdateDocument(logoPath: string = '') {
    let loggedInUser = this.authService.getToken();
    if (this.updateDocumentForm.invalid) {
      this.updateDocumentForm.markAllAsTouched();
      return;
    }
    const formValue = this.updateDocumentForm.value;
    let documentUrlValue = formValue.documentUrl;
    if (this.clientAttachment) {
      documentUrlValue = logoPath;
    } else {
      documentUrlValue = formValue.documentUrl;
    }
    const payload = {
      entityType: "client",
      entityId: this.route.snapshot.queryParams['id'],
      // documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: documentUrlValue,
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: this.empinfo.employeeId,
      attributes: [
        {
          attributeKey: "signedCopy",
          attributeValue: formValue.signedCopy ? "yes" : "no",
          dataType: "string"
        }
      ]
    };
    return payload;
  }

  // Update document function
  UpdateDocumentdata(): void {
    if (this.updateDocumentForm.valid) {
      this.spinnerLoader = true;
      const payload = this.UpdateDocument();
      if (this.clientAttachment) {
        this.uploadClientAttachment(payload);
      } else {
        this.saveProjectData(payload);
      }
    } else {
      this.updateDocumentForm.markAllAsTouched();
    }
  }

  // Update document  api calling function
  saveProjectData(payload: any): void {
    const updateDocumentId = this.updateDocumentForm.value;
    this.http.putData(`Documents/${updateDocumentId.documentId}`, payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.updateDocumentForm.reset();
        this.modalService.dismissAll();
        const clientID = this.route.snapshot.queryParams['id'];
        this.getDocumentDetails(clientID);
        this.conformationPopup.openSuccessModal('Document updated successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('Failed to update document. Please try again.');
      }
    });
  }

  // Delete document function
  DeleteDocument() {
    const formValue = this.updateDocumentForm.value;
    let loggedInUser = this.authService.getToken();
    const payload = {
      entityType: "client",
      entityId: this.route.snapshot.queryParams['id'],
      // documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: formValue.documentUrl,
      status: 'inactive',
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
        this.http.setnewcountfornewdocumentscount()
        this.conformationPopup.openSuccessModal('Document archived successfully');
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
        if (this.clientDocumentsTable) {
          this.clientDocumentsTable.reset();
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