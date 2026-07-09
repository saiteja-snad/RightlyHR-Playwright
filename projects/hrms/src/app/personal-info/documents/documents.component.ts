import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentService } from '../../services/document/document.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { ICreateSubDir, IFolders } from '../../Interfaces/document.model';
import { Subscription } from 'rxjs';
import { LastValuePipe } from '../../Pipes/last-value/last-value.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../services/http.service';
import { FileSizePipe } from "../../Pipes/file-size.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../services/access-for-employeeinfo.service';
import { Skeleton } from 'primeng/skeleton';
import { DownloadIconComponent } from "../../icons/download-icon/download-icon.component";
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-documents',
  imports: [LastValuePipe, DateformatPipe, ReactiveFormsModule, FormsModule, Skeleton, TranslateModule,
    CommonModule, FileSizePipe, NoDataFoundComponent, DataLoaderContentComponent, DownloadIconComponent, TableModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})

export class DocumentsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  spinnerLoader = false;
  selectedMainFolder = {} as IFolders
  isMainfolderTouched: boolean = false;
  folders = [] as IFolders[];
  selectedFile !: any;
  selectedFolder = [] as IFolders[];
  mainDir = {} as ICreateSubDir;
  Files = [] as IFolders[];
  loading = false
  empdata: any;
  searchfolder!: string;
  uploadfrom!: FormGroup;
  file: any;
  showUploadIcon: boolean = false;
  subDir = {} as ICreateSubDir;
  visibleFiles: IFolders[] = [];
  private originalVisibleFiles: IFolders[] = [];
  @ViewChild('dt') dt!: Table;
  currentSortField: 'fileName' | 'createdOn' | 'contentLength' | '' = '';
  currentSortOrder: number = 0;
  constructor(private documentService: DocumentService, private modalService: NgbModal, private conformationPopup: OpenModalService,
     private fb: FormBuilder, private http: HttpService, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.getMainFolders()
    this.initializejobForm();
  }

  initializejobForm(): void {
    this.uploadfrom = this.fb.group({
      filename: ['', Validators.required],
    });
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empdata = JSON.parse(localStorage.getItem("personaldata") || '{}');
    } else if (fullPath.startsWith('/myinfo')) {
      this.empdata = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    }
  }

  getMainFolders(dirPath?: string) {
    this.loading = true;
    dirPath = dirPath ? dirPath : '/FusionDocuments';
    this.subscription = this.documentService.getMainFolders(dirPath).subscribe({
      next: (data: any) => {
        this.folders = data as IFolders[];
        this.folders.forEach((folder: any) => {
          folder.expanded = false;
          this.getFolders(folder.name, folder);
          this.loading = false;
        });
        this.selectedFolder = this.folders[0]['subfolders'] as IFolders[];
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  getFolders(dirPath: string, folder: IFolders) {
    this.subscription = this.documentService.getMainFolders(dirPath).subscribe({
      next: (data: any) => {
        folder.subfolders = data as IFolders[];
        folder.subfolders.forEach((subfolder: any) => {
          subfolder['isCompanyDir'] = subfolder.name.includes('Company Documents');
        });
      },
      error: (reason) => console.log(reason),
    });
  }

  toggleFolder(folder: any): void {
    this.Files = []// or however you're using getVisibleFiles
    this.selectedFile = null
    this.searchfolder = ''
    // Collapse all other folders
    this.folders.forEach((f) => {
      if (f !== folder) {
        f.expanded = false; // Collapse other folders
      }
    });
    folder.expanded = !folder.expanded;
    this.selectedMainFolder = folder;
    if (!folder.subfolders || folder.subfolders.length === 0) {
      this.Files = []// or however you're using getVisibleFiles
      this.selectedFile = null
    }
  }

  onSubFolderSelected(subFolder: any): void {
    this.searchfolder = ''
    this.selectedFile = subFolder;
    if (subFolder.isDirectory) {
      this.getAllFiles();
    } else {
      this.Files = [] as IFolders[];
      this.visibleFiles = [];
      this.originalVisibleFiles = [];
    }
  }

  getVisibleFiles() {
    return this.visibleFiles;
  }

  customSort(event: any): void {
    const field = event.field;
    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.visibleFiles = [...this.originalVisibleFiles];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) {
          this.dt.reset();
        }
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      if (field === 'fileName') {
        const n1 = this.getFileDisplayName(a);
        const n2 = this.getFileDisplayName(b);
        return event.order * n1.localeCompare(n2, undefined, { sensitivity: 'base' });
      }
      if (field === 'createdOn') {
        const t1 = Date.parse(a?.createdOn ?? '') || 0;
        const t2 = Date.parse(b?.createdOn ?? '') || 0;
        return event.order * (t1 - t2);
      }
      const s1 = Number(a?.contentLength ?? 0) || 0;
      const s2 = Number(b?.contentLength ?? 0) || 0;
      return event.order * (s1 - s2);
    });
  }

  private getFileDisplayName(file: IFolders): string {
    const raw = (file as any)?.name ?? '';
    const parts = String(raw).split('/');
    return (parts[parts.length - 1] ?? '').trim();
  }

  getAllFiles() {
    this.loading = true;
    // Check if it's organization policy folder by checking the full path
    const isOrgPolicyFolder = this.selectedFile?.name.includes('FusionDocuments/organizationPolicy');
    // Fix the template literal syntax
    const queryPath = isOrgPolicyFolder
      ? `${this.selectedFile?.name}`  // Just use the folder name for organization policy
      : `${this.selectedFile?.name}/${this.empdata.employeeId}`; // Append employee ID for other folders
    if (!this.selectedFile?.isEmpDir) {
      this.subscription = this.http
        .getDataWithQuery('FileSystem/Files', queryPath)
        .subscribe({
          next: (data: any) => {
            this.loading = false
            this.Files = data as IFolders[];
            this.visibleFiles = [...this.Files];
            this.originalVisibleFiles = [...this.visibleFiles];
            this.currentSortField = '';
            this.currentSortOrder = 0;
          },
          error: (err: any) => {
            this.loading = false
            this.Files = [];
            this.visibleFiles = [];
            this.originalVisibleFiles = [];
            this.currentSortField = '';
            this.currentSortOrder = 0;
          },
        });
    } else {
      this.subscription = this.http
        .getDataWithQuery(
          'FileSystem/Files',
          `${this.selectedFile?.name}/${this.empdata.employeeId}`
        )
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.Files = data as IFolders[];
            this.visibleFiles = [...this.Files];
            this.originalVisibleFiles = [...this.visibleFiles];
            this.currentSortField = '';
            this.currentSortOrder = 0;
          },
          error: (err: any) => {
            console.error(err);
            this.Files = [];
            this.visibleFiles = [];
            this.originalVisibleFiles = [];
            this.currentSortField = '';
            this.currentSortOrder = 0;

          },
        });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }

  filechange(event: any) {
    this.file = event.target.files[0];
    if (this.file) {
      const fileSizeInMB = this.file.size / (1024 * 1024);
      if (fileSizeInMB > 25) {
        this.file = null;
        this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
        this.uploadfrom.get('filename')?.reset();
        this.uploadfrom.get('filename')?.markAsUntouched();
        return;
      }
    }
  }

  filterFolder() {
    const value: string = this.searchfolder.toLowerCase();
    const filteredData = this.Files.filter((o) =>
      Object.entries(o).some((entry) =>
        String(entry[1]).toLowerCase().includes(value)
      )
    );
    this.visibleFiles = filteredData;
    this.originalVisibleFiles = [...this.visibleFiles];
    this.currentSortField = '';
    this.currentSortOrder = 0;
    if (this.dt) {
      this.dt.reset();
    }
  }

  fileUploaded() {
    if (this.selectedFile?.name) {
      this.spinnerLoader = true;
      let filePath = `${this.selectedFile?.name}/${this.empdata.employeeId}`;
      this.subscription = this.http
        .uploadFileWithQuery(
          'FileSystem/uploadfiletodirectory',
          filePath,
          this.file
        )
        .subscribe({
          next: (data: any) => {
            this.spinnerLoader = false;
            this.getAllFiles();
            this.uploadfrom.reset();
            this.conformationPopup.openSuccessModal(
              'File uploaded successfully',
            );
            this.modalService.dismissAll();
          },
          error: (reason: any) => {
            this.spinnerLoader = false;
            this.conformationPopup.openErrorModal(reason.error.message,)
          },
        });
    }
  }

  onSelectDownload(file: IFolders) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.name)
      .subscribe({
        next: (res: any) => {
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename = file?.name?.split('/')[file?.name?.split('/')?.length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }

  private getDownloadFileName(contentDisposition: string | null, filePath?: string): string {
    const fileNameFromHeader = this.extractFileNameFromContentDisposition(contentDisposition);
    if (fileNameFromHeader) {
      return fileNameFromHeader;
    }

    if (typeof filePath === 'string' && filePath.trim()) {
      const normalizedPath = filePath.split('?')[0];
      const pathParts = normalizedPath.split('/').filter(Boolean);
      const lastPathPart = pathParts[pathParts.length - 1];
      if (lastPathPart) {
        return decodeURIComponent(lastPathPart);
      }
    }

    return 'document';
  }

  private extractFileNameFromContentDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, '').trim());
    }

    const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (standardMatch?.[1]) {
      return standardMatch[1].trim();
    }

    return null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
