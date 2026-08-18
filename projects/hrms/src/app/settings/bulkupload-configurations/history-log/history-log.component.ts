import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInfoIconComponent } from "../../../icons/module-info-icon/module-info-icon.component";
import { Router, RouterModule } from '@angular/router';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { BulkUploadStore } from '../bulk-upload/models/bulk-upload.store';

interface ChildJob {
  jobId: number;
  jobReference?: string;
  status?: string;
}

interface HistoryBatchItem {
  jobId: number;
  jobReference: string;
  moduleName: string;
  moduleId?: number;
  status: string;
  currentStage: string;
  jobType: string;
  filePath?: string;
  sourceFileName?: string;
  displayFileName?: string;
  totalRows: number;
  successRows: number;
  failureRows: number;
  hasErrors?: boolean;
  hasChildJobs?: boolean;
  parentJobId?: number | null;
  childJobs?: (ChildJob | number | string)[];
  createdBy: { id: number; name: string; fusionEmpId: string; workMail: string };
  createdOn: string;
  lastUpdatedOn?: string;
  startedAt: string;
  completedAt?: string;
  stageFiles: StageFile[];
  subStatus: string;
  parentModuleName?: string;
  subModuleName?: string
}

type FileType = 'ERROR_DETAILS' | 'SUCCESS_DETAILS' | 'SUMMARY' | 'FAILED_ROWS' | 'SUCCESS_ROWS' | 'INPUT';

interface StageFile {
  id: number;
  stageName: string;
  fileType: FileType;
  fileName: string;
  filePath: string;
  versionNumber: number;
  createdOn: string;
}

@Component({
  selector: 'app-history-log',
  imports: [CommonModule, FormsModule, RouterModule, PaginatorModule, TabsModule, DateformatPipe, DataLoaderContentComponent, NoDataFoundComponent,
    TranslateModule, ModuleInfoIconComponent, ModuleInformationComponent, NgbPopoverModule, DownloadIconComponent],
  templateUrl: './history-log.component.html',
  styleUrl: './history-log.component.scss'
})

export class HistoryLogComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  empdata = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  historylog: HistoryBatchItem[] = [];
  dataload: boolean = false;

  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  filteredTabs: any[] = [];
  navTabs = [
    { label: 'Imports History', link: '/settings/bulkupload-configurations/historylog', permission: { feature: 'View History', action: 'view' } },
    // { label: 'Export', link: '/settings/bulkupload-configurations/export-history', permission: { feature: 'View History', action: 'view' } },
  ];
  searchSubject = new Subject<string>();
  searchValue: any;
  @ViewChild('jobDetailsModal') jobDetailsModal!: TemplateRef<any>;
  selectedParentJob: HistoryBatchItem | null = null;
  detailJobs: HistoryBatchItem[] = [];
  detailsLoading = false;

  constructor(
    private http: HttpService,
    private router: Router,
    public rbac: RbacService,
    private store: BulkUploadStore,
    private modalService: NgbModal
  ) { }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  ngOnInit() {
    if (!this.rbac.allowedToAccess('View History.view') && !this.rbac.allowedToAccess('Bulk Import/Upload Configuration Module.view')) {
      this.router.navigate(['/uservalidation']);
      return;
    }
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.filterTabsByRbac();
    this.updateModuleInfo();
    this.loadHistory(this.page, this.pageSize);
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.loadHistory(this.page, this.pageSize);
    });
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  loadHistory(page: number, pageSize: number) {
    const employeeId = this.empdata?.employeeId;
    if (!employeeId) {
      this.historylog = [];
      this.collectionSize = 0;
      return;
    }
    this.dataload = true;
    const payload = {
      // employeeIds: String(employeeId),
      moduleId: 1001,
      jobIds: '',
      jobType: 'IMPORT',
      status: 'completed',
      pageNumber: page,
      pageSize: pageSize,
      searchTerm: this.searchValue ? this.searchValue.trim() : ''
    };
    this.http.postdata('jobs/query', payload)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const jobs: HistoryBatchItem[] = Array.isArray(res?.data) ? res.data : [];
          this.historylog = jobs.filter(job => !job.parentJobId);
          this.collectionSize = res?.paginatedData?.totalRecords ?? this.historylog.length;
          this.dataload = false;
        },
        error: () => {
          this.historylog = [];
          this.collectionSize = 0;
          this.dataload = false;
        }
      });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.rows = event.rows;
    this.first = event.first;
    this.loadHistory(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadHistory(this.page, this.pageSize);
  }

  toTitleCase(value: any): string {
    if (value === null || value === undefined) return '-';
    const str = String(value).trim();
    if (!str) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/settings/bulkupload-configurations/historylog': MODULE_INFOS.TIMESHEET_HISTORY_LOG,
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  downloadFile(filepath: string, downloadName?: string) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', filepath)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          let filename = downloadName
            || filepath.split('/')[filepath.split('/').length - 1]
            || 'download';
          const blob: Blob = res.body as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (reason) => console.log(reason),
      });
  }

  getStageFile(item: HistoryBatchItem, fileType: FileType): StageFile | undefined {
    return item?.stageFiles?.find(f => f.fileType === fileType);
  }

  hasStageFile(item: HistoryBatchItem, fileType: FileType): boolean {
    return !!this.getStageFile(item, fileType)?.filePath;
  }

  downloadStageFile(item: HistoryBatchItem, fileType: FileType) {
    const stageFile = this.getStageFile(item, fileType);
    if (!stageFile?.filePath) {
      return;
    }

    const ext = stageFile.filePath.endsWith('.xlsx') ? 'xlsx' : 'csv';
    const prefix = item?.jobReference ? `${item.jobReference}_` : '';

    let fileName = '';
    if (fileType === 'SUCCESS_ROWS') {
      fileName = `${prefix}SUCCESS_Import_Records.${ext}`;
    } else if (fileType === 'FAILED_ROWS' || fileType === 'ERROR_DETAILS') {
      fileName = `${prefix}Failed_Import_Records.${ext}`;
    } else {
      const rawName = stageFile.fileName && !['success_rows', 'failed_rows', 'success_rows.csv', 'failed_rows.csv', 'success_details', 'error_details'].includes(stageFile.fileName.toLowerCase())
        ? stageFile.fileName
        : `${prefix}Import_Records.${ext}`;
      fileName = rawName;
    }

    this.downloadNamedFile(stageFile.filePath, fileName);
  }

  downloadErrorFile(item: HistoryBatchItem) {
    const failedRows = this.getStageFile(item, 'FAILED_ROWS');
    const errorDetails = this.getStageFile(item, 'ERROR_DETAILS');
    const stageFile = failedRows?.filePath ? failedRows : errorDetails;

    if (!stageFile?.filePath) {
      return;
    }

    const ext = stageFile.filePath.endsWith('.xlsx') ? 'xlsx' : 'csv';
    const prefix = item?.jobReference ? `${item.jobReference}_` : '';
    const fileName = `${prefix}Failed_Import_Records.${ext}`;

    this.downloadNamedFile(stageFile.filePath, fileName);
  }

  private downloadNamedFile(filepath: string, fileName: string) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', filepath)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const blob: Blob = res.body as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (reason) => console.log(reason),
      });
  }

  canRetry(item: HistoryBatchItem): boolean {
    return item?.hasErrors === true && item?.hasChildJobs === false;
  }

  canViewDetails(item: HistoryBatchItem): boolean {
    return item?.hasChildJobs === true;
  }

  hasActions(item: HistoryBatchItem): boolean {
    return this.canRetry(item) || this.canViewDetails(item);
  }

  getJobType(item: HistoryBatchItem): string {
    if (this.selectedParentJob && item.jobId === this.selectedParentJob.jobId) {
      return 'Parent';
    }
    return item.parentJobId ? 'Child' : 'Parent';
  }

  openJobDetails(item: HistoryBatchItem) {
    this.selectedParentJob = item;
    this.detailJobs = [item];
    this.detailsLoading = true;
    this.modalService.open(this.jobDetailsModal, { centered: true, size: 'lg', backdrop: 'static' });

    this.http.postdata('jobs/query', {
      moduleId: 1001,
      jobIds: '',
      jobType: 'IMPORT',
      parentJobId: item.jobId,
      pageNumber: 1,
      pageSize: 50,
      searchTerm: ''
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (childRes: any) => {
        const children: HistoryBatchItem[] = (Array.isArray(childRes?.data) ? childRes.data : [])
          .filter((child: HistoryBatchItem) => child.jobId !== item.jobId);
        this.detailJobs = [item, ...children];
        this.detailsLoading = false;
      },
      error: () => {
        this.detailsLoading = false;
      }
    });
  }

  retryJob(item: HistoryBatchItem) {
    const parentJobId = Number(item?.jobId);
    if (!parentJobId || !this.canRetry(item)) {
      return;
    }

    this.store.reset();
    this.store.setParentJobId(parentJobId);
    localStorage.setItem('bulkImportStep', '2');
    if (item.moduleId) {
      localStorage.setItem('bulkImportModuleId', String(item.moduleId));
    }

    this.router.navigate(['/settings/bulkupload-configurations/bulk-import']);
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
