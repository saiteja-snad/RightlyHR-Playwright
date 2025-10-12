import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { ActivatedRoute } from '@angular/router';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { Select } from 'primeng/select';
import { IEAV } from '../../../settings/project-management-configurations/models/project-type.modal';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-project-documents',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent,
    ConfirmationIconComponent, Select, DownloadIconComponent],
  templateUrl: './project-documents.component.html',
  styleUrl: './project-documents.component.scss'
})

export class ProjectDocumentsComponent implements OnInit {
  updateDocumentForm!: FormGroup;
  subscription!: Subscription;
  documentdata = [] as any;
  empinfo: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  employeeDetails: any;
  loading = false;
  projectId: any;
  clientAttachment: File | null = null;
  spinnerLoader: boolean = false;
  displayClientAttachment: string = '';
  currentDate: any;
  documentTypes: IEAV[] = [];
  fileErrorMessage: string = '';
  inactiveStatus: any;
  selecteddata: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, public formValidations: FormValidationsService,
    private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService, public rbac: RbacService) { }

  ngOnInit() {
    this.http.setRequest(null);
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    this.createDocumentForm();
    this.getAllActiveEmployees();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = projectId;
        this.getDocumentDetails(projectId);
        this.getProject(projectId);
      }
      this.http.documentsDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.getDocumentDetails(this.projectId);
      });
    });
    this.getEAV();
  }

  getProject(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveStatus = (res?.data ?? []).some((p: any) =>
          p.status === 'Inactive' || p.client.status === 'Inactive') ? 'Inactive' : 'Active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
      },
    });
  }

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Project Document Type').subscribe({
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
      documentName: [null, [Validators.required, Validators.maxLength(101),
      Validators.minLength(2),
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(101),
      Validators.pattern(/^[^\s].*$/)
      ]],
      documentType: [null, Validators.required],
      documentUrl: [null],
      documentId: [null]
    });
  }

  // Document data fetch function
  getDocumentDetails(entityId: string) {
    this.loading = true;
    this.subscription = this.http.getData(`Documents/?entityType=Project&entityId=${entityId}&status=active`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.documentdata = data.data;
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

  // delete Modal open function
  opendeletModal(content: any,): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // Edit Modal open function
  openModal(content: any, data: any, size: any) {
    this.selecteddata = data
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    this.updateDocumentForm.patchValue({
      documentName: data?.documentName,
      createdDate: this.formatDateToLocal(data?.createdAt),
      documentType: data?.documentType,
      documentId: data?.documentId
    });
    this.displayClientAttachment = data?.documentUrl ? data?.documentUrl.split('/').pop() : null;
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
    this.fileErrorMessage = '';
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
      this.fileErrorMessage = 'Invalid file type. Only PNG, JPEG, PDF, DOC, DOCX, XLS, XLSX are allowed.';
      this.clientAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.clientAttachment = null;
      this.displayClientAttachment = '';
      this.fileErrorMessage = 'The file size should be less than 25MB.';
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.clientAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayClientAttachment = this.clientAttachment.name;
  }

  // File rename function
  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  // File reset function
  resetClientFormAttachment(input?: HTMLInputElement) {
    this.updateDocumentForm.get('documentUrl')?.reset();
    this.updateDocumentForm.get('documentUrl')?.markAsUntouched();
    this.clientAttachment = null;
    this.displayClientAttachment = '';
    if (input) {
      input.value = ''; // clear the actual <input type="file">
    }
  }

  // File upload function
  uploadClientAttachment(payload: any): void {
    const filePath = `/ProjectManagement/Clients/${this.documentdata[0]?.project.clientId}/Projects/${this.route.snapshot.queryParams['id']}/Documents`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          payload.documentUrl = data.path;
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
      entityType: "project",
      entityId: this.route.snapshot.queryParams['id'],
      documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: documentUrlValue,
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: loggedInUser.employeeId,
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
        const projectId = this.route.snapshot.queryParams['id'];
        this.getDocumentDetails(projectId);
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
    const formValue = this.selecteddata;
    let loggedInUser = this.authService.getToken();
    const payload = {
      entityType: "project",
      entityId: this.route.snapshot.queryParams['id'],
      documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: formValue.documentUrl,
      status: 'inactive',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: loggedInUser.employeeId,
    };
    const projectId = this.route.snapshot.queryParams['id'];
    this.http.putData(`Documents/${formValue.documentId}`, payload).subscribe({
      next: (res) => {
        this.getDocumentDetails(projectId);
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Document Archived successfully');
      },
      error: (err) => {
        console.error('Error updating document:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update document');
      }
    });
  }

  // File download function
  onAttachmentDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file?.documentUrl).subscribe({
      next: (res: any) => {
        const fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file?.documentUrl.split('/')[file?.documentUrl.split('/').length - 1];
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}