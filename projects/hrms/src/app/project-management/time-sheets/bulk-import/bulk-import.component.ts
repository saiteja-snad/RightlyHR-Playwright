import { Component, computed, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { CommonModule } from '@angular/common';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import {  HttpResponse } from '@angular/common/http';
import { BulkUploadStore } from '../bulk-upload/models/bulk-upload.store';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { FormsModule } from '@angular/forms';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { PaginatorModule } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { environment } from '../../../../environments/environment';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { BulkUploadService } from '../../../services/bulk-upload.service';
@Component({
  selector: 'app-bulk-import',
  imports: [TimesheetsTabsComponent, CommonModule,
    NoDataFoundComponent, InfoIconComponent,
    DateformatPipe, NgbPopoverModule, FormsModule, ConfirmationIconComponent,
    ModuleInformationComponent, ModuleInfoIconComponent, DataLoaderContentComponent, PaginatorModule, DownloadIconComponent],
  templateUrl: './bulk-import.component.html',
  styleUrl: './bulk-import.component.scss'
})

export class BulkImportComponent implements OnInit, OnDestroy {
  steps = [
    { id: 1, name: 'Upload File' },
    { id: 2, name: 'Validation' },
    { id: 3, name: 'Submission' }
  ];
  progress = 1;
  destroy$: Subject<boolean> = new Subject<boolean>();
  empdata = {} as any;
  employeeId: any;
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  resourceData: any[] = [];
  groupedProjects: any[] = [];
  availableYears: { label: string; value: number }[] = [];
  selectedYear: number = new Date().getFullYear();
  isDragging = false;
  isLoading = signal(false);
  searchValue: string = '';
  @ViewChild('successSummaryModal') successSummaryModal!: TemplateRef<any>;
  @ViewChild('stagingLoadingModal') stagingLoadingModal!: TemplateRef<any>;
  private searchSubject = new Subject<string>();
  isDownloadingTemplate = false;
  readonly filteredRows = computed(() => {
    const rows = this.store.filteredRows();
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return rows;
    }
    return rows.filter((row: any) => {
      const parts: string[] = [];
      parts.push(row.rowNumber != null ? String(row.rowNumber) : '');
      parts.push(row.clientName || '');
      parts.push(row.projectName || '');
      parts.push(row.projectCode || '');
      parts.push(row.phaseName || '');

      const billableRaw = row.billable;
      let billableText = '';
      if (typeof billableRaw === 'boolean') {
        billableText = billableRaw ? 'yes' : 'no';
      } else if (billableRaw != null) {
        billableText = String(billableRaw);
      }
      parts.push(billableText);

      const statusText = row.isValid ? 'valid' : 'invalid';
      parts.push(statusText);

      const haystack = parts.join(' ').toLowerCase();
      return haystack.includes(term);
    });
  });
  readonly validRowsCount = computed(() => {
  const rows = this.store.allRows() ?? []; // or better: rawRows if available
  return rows.filter(row => row?.isValid).length;
});
  readonly isSubmitDisabled = computed(() => {
    return this.store.loading()
      || !this.store.response()
      || this.validRowsCount() === 0;
  });

  private searchTerm = signal('');
  totalSuccessCount = 0;
  failureCount = 0;
  totalCount = 0;
  uploadedFileName = '';
  submissionBatch = signal<any | null>(null);
  submissionRows = signal<any[]>([]);
  submissionTotalCount = 0;
  submissionPage = 1;
  submissionPageSize = 15;
  submissionFirst = 0;
  submissionSearchValue = '';
  private submissionJobId: number | null = null;
  private submissionSearchSubject = new Subject<string>();
    page = 1;
  pageSize = 15;
  first = 0;
  rows = 15;
  collectionSize = 0;
  options = [
    { label: '15', value: 15 },
    { label: '30', value: 30 },
    { label: '45', value: 45 },
    { label: '60', value: 60 },
  ];
  // moduleinfo: string = '';

  constructor(private conformationPopup: OpenModalService,
    private modalService:NgbModal,
    public store: BulkUploadStore,
    private service: BulkUploadService,
    private router: Router,
    private http: HttpService,
  ){

  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    this.updateModuleInfo();
    const savedStep = localStorage.getItem('timesheetImportStep');
    this.progress = savedStep ? +savedStep : 1;
    const savedJobId = this.store.jobId();
    const savedStage = this.store.currentStage();

    if (savedStep === '3' && savedStage === 'IMPORT') {
      // Restore step 3 — reload submission details from persisted submissionJobId
      const savedSubmissionJobId = this.store.submissionJobId();
      if (savedSubmissionJobId) {
        this.submissionJobId = savedSubmissionJobId;
        this.loadTimesheetDetails();
      } else {
        this.store.reset();
        localStorage.removeItem('timesheetImportStep');
        this.progress = 1;
      }
    } else if (savedStep === '2' && savedJobId && savedStage === 'VALIDATE') {
      // Restore preview from previous session after refresh
      this.store.setLoading(true);
      this.service.getImportPreview(savedJobId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (previewRes: any) => {
            const previewData = previewRes?.data;
            if (previewData) {
              this.store.setResponse({
                success: true,
                statusCode: 200,
                message: 'Preview loaded',
                data: {
                  totalRows: previewData.totalRows,
                  validRows: previewData.validRows,
                  invalidRows: previewData.invalidRows,
                  insertCount: previewData.insertCount,
                  updateCount: previewData.updateCount,
                  skipCount: previewData.skipCount,
                  fileName: previewData.fileName,
                  filePath: previewData.filePath,
                  rows: previewData.rows ?? [],
                }
              } as any);
            }
            this.store.setLoading(false);
          },
          error: () => {
            this.store.reset();
            localStorage.removeItem('timesheetImportStep');
            this.progress = 1;
            this.store.setLoading(false);
          }
        });
    } else {
      this.store.reset();
      localStorage.removeItem('timesheetImportStep');
    }
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchTerm.set(value || '');
    });

    this.submissionSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.submissionPage = 1;
      this.submissionFirst = 0;
      this.loadTimesheetDetails();
    });
  }

    onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.rows = event.rows;
    this.first = event.first;
    this.loadTimesheetDetails();

  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadTimesheetDetails();
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/project-management/timesheet/bulk-upload': MODULE_INFOS.TIMESHEET_BULK_UPLOAD,
      // '/project-management/timesheet/summary': MODULE_INFOS.Team_Timesheet_Summary_view
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

    openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
    navigatetomy() {
      this.modalService.dismissAll();
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      this.handleModalFile(event.dataTransfer.files[0]);
    }
  }

  formatCount(value: number | null | undefined): string {
    const n = value ?? 0;
    return n < 10 ? `0${n}` : String(n);
  }

  confirmUpload(content: any, event?: Event) {
    if (event && event.target) {
      (event.target as HTMLElement).blur();
    }
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  private handleModalFile(file: File, isReupload = false) {
    const isValidExtension =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv');

    if (!isValidExtension) {
      this.conformationPopup.openErrorModal('Please upload a valid Excel file (.xlsx or .xls) or .csv file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.conformationPopup.openErrorModal('File size must be less than 5MB');
      return;
    }

    this.onFileSelected(file, undefined, isReupload);
  }

  onFileSelected(file: File, modal?: any, isReupload = false) {
      this.store.setLoading(true);
      this.store.setUploadProgress(0);
      this.conformationPopup.openLoaderModal('Uploading...')

      const previousJobId = isReupload ? this.store.jobId() : undefined;

      // If reupload: RE_UPLOAD (archive old job) → UPLOAD (new job) → PARSE → VALIDATE
      // If fresh:    UPLOAD → PARSE → VALIDATE
      const start$ = isReupload
        ? this.service.executeImportStage('RE_UPLOAD', this.employeeId, previousJobId ?? undefined, file, true).pipe(
            switchMap(() => this.service.executeImportStage('UPLOAD', this.employeeId, undefined, file))
          )
        : this.service.executeImportStage('UPLOAD', this.employeeId, undefined, file);

      start$
        .pipe(
          switchMap((uploadRes: any) => {
            const jobId = uploadRes?.data?.jobId ?? uploadRes?.jobId;
            if (!jobId) throw new Error('Upload failed: no job ID returned');
            this.store.setJobId(jobId);
            this.store.setCurrentStage('UPLOAD');
            if (modal) modal.close();
            return this.service.executeImportStage('PARSE', this.employeeId, jobId);
          }),
          switchMap(() => {
            const jobId = this.store.jobId()!;
            this.store.setCurrentStage('PARSE');
            return this.service.executeImportStage('VALIDATE', this.employeeId, jobId);
          }),
          switchMap(() => {
            const jobId = this.store.jobId()!;
            this.store.setCurrentStage('VALIDATE');
            return this.service.getImportPreview(jobId);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (previewRes: any) => {
            this.modalService.dismissAll();
            const previewData = previewRes?.data;
            if (previewData) {
              this.store.setResponse({
                success: true,
                statusCode: 200,
                message: 'Preview loaded',
                data: {
                  totalRows: previewData.totalRows,
                  validRows: previewData.validRows,
                  invalidRows: previewData.invalidRows,
                  insertCount: previewData.insertCount,
                  updateCount: previewData.updateCount,
                  skipCount: previewData.skipCount,
                  fileName: previewData.fileName,
                  filePath: previewData.filePath,
                  rows: previewData.rows ?? [],
                }
              } as any);
              this.setStep(2);
            }
            this.store.setLoading(false);
            this.store.setUploadProgress(0);
          },
          error: (err: any) => {
            this.modalService.dismissAll();
            console.log(err);
            this.conformationPopup.openErrorModal(err?.error.Message|| err?.error?.message || 'Failed to process file');
            this.store.setError(err?.error.Message || err?.error?.message || 'Failed to process file');
            this.store.setLoading(false);
            this.store.setUploadProgress(0);
          }
        });
    }

  onModalFileSelected(event: Event, isReupload = false) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleModalFile(input.files[0], isReupload);
      input.value = '';
    }
  }


  onConfirmUpload() {
    this.modalService.dismissAll();
    this.modalService.open(this.stagingLoadingModal, { centered: true, backdrop: 'static' });
    const rows = this.store.validRows();
    if (!rows || rows.length === 0) {
      this.modalService.dismissAll();
      this.conformationPopup.openErrorModal('No valid rows to upload');
      return;
    }

    const jobId = this.store.jobId()!;
    this.store.setLoading(true);
    this.service.executeImportStage('TRANSFORM', this.employeeId, jobId)
      .pipe(
        switchMap((transformRes: any) => {
          const currentJobId = transformRes?.data?.jobId ?? jobId;
          return this.service.executeImportStage('IMPORT', this.employeeId, currentJobId);
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (importRes: any) => {
          this.store.setLoading(false);
          this.modalService.dismissAll();
          if (importRes?.success !== false) {
            this.conformationPopup.openSuccessModal("Timesheet entries submitted successfully")
            this.totalSuccessCount = importRes.data?.successCount || 0;
            this.failureCount = importRes.data?.failureCount || 0;
            this.totalCount = importRes.data?.totalRows || 0;
            const resolvedJobId = importRes.data?.jobId ?? jobId;
            this.submissionJobId = resolvedJobId;
            this.store.setSubmissionJobId(resolvedJobId);
            this.store.setCurrentStage('IMPORT');
            this.submissionPage = 1;
            this.submissionFirst = 0;
            this.submissionSearchValue = '';
            this.setStep(3);
            this.loadTimesheetDetails();
          } else {
            this.conformationPopup.openErrorModal(importRes.message || 'Failed to upload data');
          }
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          this.store.setLoading(false);
          this.conformationPopup.openErrorModal(err.error?.message || 'Failed to upload data');
        }
      });
  }

  loadTimesheetDetails() {
    if (!this.submissionJobId) return;
    this.store.setLoading(true);
    const payload = {
      employeeIds: String(this.employeeId),
      jobIds: String(this.submissionJobId),
      searchQuery: this.submissionSearchValue.trim(),
      page: this.page,
      pageSize: this.pageSize,
    };
    this.http.postdata('Timesheet/details', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.store.setLoading(false);
        this.submissionRows.set(Array.isArray(res?.data?.items) ? res.data?.items : []);
        this.submissionTotalCount = res?.data?.page?.totalItems ?? res?.data?.page?.totalItems ?? 0;
        this.collectionSize = this.submissionTotalCount;
      },
      error: (err: any) => {
        this.store.setLoading(false);
        this.submissionRows.set([]);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to load submitted records');
      }
    });
  }

  onSubmissionSearchChange() {
    this.submissionSearchSubject.next(this.submissionSearchValue);
  }

  onSubmissionPageChange(event: any) {
    this.submissionPage = event.page + 1;
    this.submissionPageSize = event.rows;
    this.submissionFirst = event.first;
    this.loadTimesheetDetails();
  }
  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  downloadTemplate() {
    this.isDownloadingTemplate = true;
    this.service.downloadTemplate(environment.timesheetModuleId,'csv')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.isDownloadingTemplate = false;
          // Extract filename from Content-Disposition
        let filename = `Timesheet_Import_Template - ${this.http.formattedDate}.csv`;
        
        const contentDisposition = response?.headers?.get('content-disposition');
        if (contentDisposition) {
          // Handle both regular and UTF-8 encoded filenames
          const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
          const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

          if (utf8FilenameMatch && utf8FilenameMatch[1]) {
            filename = decodeURIComponent(utf8FilenameMatch[1]);
          } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
            filename = asciiFilenameMatch[1];
          }
        }
                // Download the blob as before
        const blob = new Blob([response.body!], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Downloaded file:', filename);
        },
        error: (err) => {
            this.isDownloadingTemplate = false;
          console.error('Failed to download template', err);
          this.conformationPopup.openErrorModal('Failed to download template. Please try again later.');
        }
      });
  }


  reset() {
    this.store.reset();
    this.searchValue = '';
    this.searchTerm.set('');
    this.setStep(1);
    localStorage.removeItem('timesheetImportStep');
  }
  navigateToHistoryView() {
    
    this.reset();
    //clear the batch id from the local storage
    localStorage.removeItem('bulkImportBatchId');
    this.router.navigate(['/project-management/timesheet/historylog']);
  }
  setStep(step: number) {
    this.progress = step;
    localStorage.setItem('timesheetImportStep', step.toString());
  }

  nextStep() {
    if (this.progress < 3) {
      this.setStep(this.progress + 1);
    }
  }

  prevStep() {
    if (this.progress > 1) {
      this.setStep(this.progress - 1);
    }
  }

  getLighterColor(color: string, amount: number = 0.9): any {
  if (!color) return '#d8d8daff';
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
