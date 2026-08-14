import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { BulkuploadSidebarTabsComponent } from '../bulkupload-sidebar-tabs/bulkupload-sidebar-tabs.component';
import { ModuleInfoIconComponent } from "../../../icons/module-info-icon/module-info-icon.component";
import { Router, RouterModule } from '@angular/router';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';

interface HistoryBatchItem {
  jobId: number;
  jobReference: string;
  moduleName: string;
  status: string;
  currentStage: string;
  jobType: string;
  filePath?: string;
  totalRows: number;
  successRows: number;
  failureRows: number;
  createdBy: { id: number; name: string; fusionEmpId: string; workMail: string };
  createdOn: string;
  lastUpdatedOn?: string;
  startedAt: string;
  completedAt?: string;
  stageFiles: StageFile[];
  subStatus: string;
}

type FileType = 'ERROR_DETAILS' | 'SUCCESS_DETAILS' | 'SUMMARY';

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
    { label: 'Import', link: '/settings/bulkupload-configurations/historylog', permission: { feature: 'View History Import Tab', action: 'view' } },
    // { label: 'Export', link: '/settings/bulkupload-configurations/export-history', permission: { feature: 'View History Export Tab', action: 'view' } },
  ];
  searchSubject = new Subject<string>();
  searchValue: any;

  constructor(private http: HttpService, private router: Router, private rbac: RbacService) { }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  ngOnInit() {
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
          this.historylog = Array.isArray(res?.data) ? res.data : [];
          this.collectionSize = res?.paginatedData?.totalRecords ?? 0;
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

  downloadFile(filepath: string) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', filepath)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          let filename = filepath.split('/')[filepath.split('/').length - 1] || 'download';
          if (!filename) {
            filename = filepath.split('/')[filepath.split('/').length - 1] || 'download';
          }
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

  downloadErrorFile(item: HistoryBatchItem) {
    const errorFile = item.stageFiles?.find(
      f => f.fileType === 'ERROR_DETAILS' && f.stageName === 'VALIDATE'
    );

    if (!errorFile?.filePath) {
      console.warn('No error file available');
      return;
    }

    const filepath = errorFile.filePath;
    const fileName = `${item.jobReference}_Failed_Records.csv`;

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

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
