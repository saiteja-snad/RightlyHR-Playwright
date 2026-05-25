import { Component } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { AuthService } from '../../../services/auth.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { ProjectDocumentsSideTabsComponent } from "../../../shared/project-management-tabs/project-documents-side-tabs/project-documents-side-tabs.component";
@Component({
  selector: 'app-inactive-project-documents',
  imports: [NoDataFoundComponent, DataLoaderContentComponent, DownloadIconComponent, DateformatPipe,
    TranslateModule, CommonModule, DateformatPipe, ConfirmationIconComponent, ProjectDocumentsSideTabsComponent],
  templateUrl: './inactive-project-documents.component.html',
  styleUrl: './inactive-project-documents.component.scss'
})

export class InactiveProjectDocumentsComponent {
  subscription!: Subscription;
  documentdata = [] as any;
  entitytype = 'client';
  loading = false;
  projectId: any;
  empinfo: any;
  currentDate: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  employeeDetails: any;
  clientAttachment: File | null = null;
  spinnerLoader: boolean = false;
  displayClientAttachment: string = '';
  inactiveStatus: any;
  selecteddata: any;

  constructor(private route: ActivatedRoute, private http: HttpService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public rbac: RbacService, private authService: AuthService) { }

  ngOnInit() {
    const now = new Date();
    // format YYYY-MM-DD for input[type="date"]
    this.currentDate = now.toISOString().split('T')[0];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = projectId;
        this.getDocumentDetails(projectId);
        this.getProject(projectId);
      }
    });
  }

  getProject(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveStatus = (res?.data ?? []).some((p: any) =>
          p.status?.toLowerCase() === 'inactive' || p.client?.status?.toLowerCase() === 'inactive'
        ) ? 'inactive' : 'active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
      },
    });
  }

  // Document data fetch function
  getDocumentDetails(entityId: string) {
    this.subscription = this.http.getData(`Documents/?entityType=project&entityId=${entityId}&status=inactive`).subscribe({
      next: (data: any) => {
        this.documentdata = data.data;
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
      entityType: "project",
      entityId: this.route.snapshot.queryParams['id'],
      // documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: formValue.documentUrl,
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: loggedInUser.employeeId,
    };
    const projectId = this.route.snapshot.queryParams['id'];
    this.http.putData(`Documents/${formValue.documentId}`, payload).subscribe({
      next: (res) => {
        this.getDocumentDetails(projectId);
        this.modalService.dismissAll();
        this.http.setnewcountfornewdocumentscount()
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}