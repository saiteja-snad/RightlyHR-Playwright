import { Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { BulkUploadConfigService } from '../../../services/bulk-upload-config.service';
import { BulkUploadStore } from '../bulk-upload/models/bulk-upload.store';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { PaginatorModule } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { HttpResponse } from '@angular/common/http';
import { Select } from 'primeng/select';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-bulk-import',
  imports: [CommonModule, ReactiveFormsModule,
    NoDataFoundComponent, InfoIconComponent,
    DateformatPipe, NgbPopoverModule, FormsModule, ConfirmationIconComponent,
    ModuleInformationComponent, ModuleInfoIconComponent, DataLoaderContentComponent, PaginatorModule, DownloadIconComponent, Select],
  templateUrl: './bulk-import.component.html',
  styleUrl: './bulk-import.component.scss'
})

export class BulkImportComponent implements OnInit, OnDestroy {
  steps = [
    { id: 1, name: 'Select & Template' },
    { id: 2, name: 'Upload File' },
    { id: 3, name: 'Validation & Re-verify' },
    { id: 4, name: 'Submission' }
  ];
  progress = 1;

  modules = [
    {
      id: environment.compensationImportId,
      name: 'Compensation',
      submodules: [
        { id: environment.compensationImportId, name: 'Compensation Import' }
      ]
    },
    // {
    //   id: 1002,
    //   name: 'Timesheet',
    //   submodules: [
    //     { id: 10021, name: 'Timesheet Entries' },
    //     { id: 10022, name: 'Project Task Allocations' }
    //   ]
    // },
    // {
    //   id: 1003,
    //   name: 'Attendance & Leave',
    //   submodules: [
    //     { id: 10031, name: 'Attendance Logs' },
    //     { id: 10032, name: 'Leave Balances & Allocations' }
    //   ]
    // }
  ];

  private fb = inject(FormBuilder);
  importForm: FormGroup = this.fb.group({
    moduleId: ['', Validators.required],
    submoduleId: ['', Validators.required]
  });

  get selectedModuleId(): number | null {
    return this.importForm?.get('moduleId')?.value ?? null;
  }

  get selectedSubmoduleId(): number | null {
    return this.importForm?.get('submoduleId')?.value ?? null;
  }

  get currentSubmodules() {
    const mod = this.modules.find(m => m.id === Number(this.selectedModuleId));
    return mod ? mod.submodules : [];
  }

  get selectedModuleName(): string {
    const mod = this.modules.find(m => m.id === Number(this.selectedModuleId));
    return mod ? mod.name : 'Module';
  }

  get selectedSubmoduleName(): string {
    const sub = this.currentSubmodules.find(s => s.id === Number(this.selectedSubmoduleId));
    return sub ? sub.name : 'Submodule';
  }

  onModuleChange() {
    const modId = this.importForm.get('moduleId')?.value;
    if (modId) {
      localStorage.setItem('bulkImportModuleId', String(modId));
    }
    const subs = this.currentSubmodules;
    const subId = (subs && subs.length > 0) ? subs[0].id : '';
    this.importForm.patchValue({
      submoduleId: subId
    });
    if (subId) {
      localStorage.setItem('bulkImportSubmoduleId', String(subId));
    }
  }

  onSubmoduleChange() {
    const subId = this.importForm.get('submoduleId')?.value;
    if (subId) {
      localStorage.setItem('bulkImportSubmoduleId', String(subId));
    }
  }

  downloadErrorReport() {
    const invalidRows = this.store.invalidRows();
    if (!invalidRows || invalidRows.length === 0) {
      this.conformationPopup.openErrorModal('No error records found to download.');
      return;
    }

    const cols = this.displayColumns();
    const headers = cols.map(c => this.formatHeader(c));
    if (!headers.includes('Error / Warning')) {
      headers.push('Error / Warning');
    }

    let csvContent = headers.join(',') + '\n';

    invalidRows.forEach(row => {
      const rowValues = cols.map(c => {
        let val = row[c] ?? '';
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      if (!cols.includes('errorMessage')) {
        let errVal = row.errorMessage ?? '';
        if (typeof errVal === 'string') {
          errVal = `"${errVal.replace(/"/g, '""')}"`;
        }
        rowValues.push(errVal);
      }
      csvContent += rowValues.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const modName = (this.selectedModuleName || 'Bulk_Import').replace(/\s+/g, '_');
    link.download = `${modName}_Error_Report_${this.http.formattedDate || new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
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
      const statusText = row.isValid ? 'valid' : 'invalid';
      const rowValues = Object.keys(row)
        .filter(key => key !== 'projectMeta' && key !== 'clientMeta' && key !== 'phaseMeta')
        .map(key => {
          const val = row[key];
          if (val === null || val === undefined) return '';
          if (typeof val === 'boolean') return val ? 'yes valid' : 'no invalid';
          return String(val).toLowerCase();
        });
      rowValues.push(statusText);
      return rowValues.some(val => val.includes(term));
    });
  });

  readonly displayColumns = computed(() => {
    const cols = this.store.columns();
    if (cols && cols.length > 0) {
      return cols;
    }
    const rows = this.store.filteredRows();
    if (rows && rows.length > 0) {
      const ignoreKeys = ['isValid', 'action', 'errorCode', 'errorField', 'suggestedFix', 'projectMeta', 'clientMeta', 'phaseMeta', 'compensationAmount', 'isVariablePay'];
      return Object.keys(rows[0]).filter(k => !ignoreKeys.includes(k) && !k.startsWith('parsed'));
    }
    return [];
  });

  readonly displaySubmissionColumns = computed(() => {
    const cols = this.store.columns();
    if (cols && cols.length > 0) {
      return cols.filter(c => c !== 'errorMessage' && c !== 'errorCode' && c !== 'suggestedFix');
    }
    const rows = this.submissionRows();
    if (rows && rows.length > 0) {
      const ignoreKeys = ['timesheetEntryId', 'projectMeta', 'clientMeta', 'phaseMeta', 'employeeId', 'employeeMeta', 'id', 'isValid', 'action', 'errorCode', 'errorField', 'errorMessage', 'suggestedFix', 'compensationAmount', 'isVariablePay'];
      return Object.keys(rows[0]).filter(k => !ignoreKeys.includes(k) && !k.startsWith('parsed'));
    }
    return [];
  });

  readonly validRowsCount = computed(() => {
    const rows = this.store.allRows() ?? [];
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

  constructor(private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public store: BulkUploadStore,
    private service: BulkUploadConfigService,
    private router: Router,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    this.updateModuleInfo();

    const savedModuleId = localStorage.getItem('bulkImportModuleId');
    const savedSubmoduleId = localStorage.getItem('bulkImportSubmoduleId');
    const initialModId = savedModuleId ? Number(savedModuleId) : 1001;
    const initialSubId = savedSubmoduleId ? Number(savedSubmoduleId) : 10011;

    this.importForm.patchValue({
      moduleId: initialModId,
      submoduleId: initialSubId
    });

    const savedStep = localStorage.getItem('bulkImportStep');
    this.progress = savedStep ? +savedStep : 1;
    const savedJobId = this.store.jobId();
    const savedStage = this.store.currentStage();

    if (savedStep === '4' && savedStage === 'IMPORT') {
      const savedSubmissionJobId = this.store.submissionJobId();
      if (savedSubmissionJobId) {
        this.submissionJobId = savedSubmissionJobId;
        this.loadSubmittedDetails();
      } else {
        this.store.reset();
        localStorage.removeItem('bulkImportStep');
        this.progress = 1;
      }
    } else if (savedStep === '3' && savedJobId && savedStage === 'VALIDATE') {
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
                  columns: previewData.columns ?? [],
                  rows: previewData.rows ?? [],
                }
              } as any);
            }
            this.store.setLoading(false);
          },
          error: () => {
            this.store.reset();
            localStorage.removeItem('bulkImportStep');
            this.progress = 1;
            this.store.setLoading(false);
          }
        });
    } else {
      this.store.reset();
      localStorage.removeItem('bulkImportStep');
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
      this.loadSubmittedDetails();
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.rows = event.rows;
    this.first = event.first;
    this.loadSubmittedDetails();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadSubmittedDetails();
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/project-management/timesheet/bulk-upload': MODULE_INFOS.TIMESHEET_BULK_UPLOAD,
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

  confirmUpload(content?: any, event?: Event) {
    if (event && event.target) {
      (event.target as HTMLElement).blur();
    }
    const modalRef = content || this.confirmModal;
    if (modalRef) {
      this.modalService.open(modalRef, { centered: true, backdrop: 'static' });
    }
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
    this.conformationPopup.openLoaderModal('Uploading...');

    const previousJobId = isReupload ? this.store.jobId() : undefined;
    const modId = Number(this.selectedModuleId) || 1001;
    const modName = this.selectedModuleName || 'Compensation';

    const start$ = isReupload
      ? this.service.executeImportStage('RE_UPLOAD', this.employeeId, previousJobId ?? undefined, file, true, modId, modName).pipe(
        switchMap(() => this.service.executeImportStage('UPLOAD', this.employeeId, undefined, file, false, modId, modName))
      )
      : this.service.executeImportStage('UPLOAD', this.employeeId, undefined, file, false, modId, modName);

    start$
      .pipe(
        switchMap((uploadRes: any) => {
          const jobId = uploadRes?.data?.jobId ?? uploadRes?.jobId;
          if (!jobId) throw new Error('Upload failed: no job ID returned');
          this.store.setJobId(jobId);
          this.store.setCurrentStage('UPLOAD');
          if (modal) modal.close();
          return this.service.executeImportStage('PARSE', this.employeeId, jobId, undefined, false, modId, modName);
        }),
        switchMap(() => {
          const jobId = this.store.jobId()!;
          this.store.setCurrentStage('PARSE');
          return this.service.executeImportStage('VALIDATE', this.employeeId, jobId, undefined, false, modId, modName);
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
                columns: previewData.columns ?? [],
                rows: previewData.rows ?? [],
              }
            } as any);
            this.setStep(3);
          }
          this.store.setLoading(false);
          this.store.setUploadProgress(0);
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          console.log(err);
          this.conformationPopup.openErrorModal(err?.error.Message || err?.error?.message || 'Failed to process file');
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
    const modId = Number(this.selectedModuleId) || 1001;
    const modName = this.selectedModuleName || 'Compensation';

    this.store.setLoading(true);
    this.service.executeImportStage('TRANSFORM', this.employeeId, jobId, undefined, false, modId, modName)
      .pipe(
        switchMap((transformRes: any) => {
          const currentJobId = transformRes?.data?.jobId ?? jobId;
          return this.service.executeImportStage('IMPORT', this.employeeId, currentJobId, undefined, false, modId, modName);
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (importRes: any) => {
          this.store.setLoading(false);
          this.modalService.dismissAll();
          if (importRes?.success !== false) {
            this.conformationPopup.openSuccessModal("Data submitted successfully")
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
            this.setStep(4);
            this.loadSubmittedDetails();
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

  loadSubmittedDetails() {
    this.store.setLoading(false);
    const validRows = this.store.validRows() ?? [];
    this.submissionTotalCount = this.totalSuccessCount || validRows.length;
    
    const search = (this.submissionSearchValue || '').trim().toLowerCase();
    let filtered = validRows;
    if (search) {
      filtered = validRows.filter((row: any) =>
        Object.values(row).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(search))
      );
    }
    
    this.collectionSize = filtered.length;
    const start = (this.submissionPage - 1) * this.submissionPageSize;
    const end = start + this.submissionPageSize;
    this.submissionRows.set(filtered.slice(start, end));
  }

  onSubmissionSearchChange() {
    this.submissionSearchSubject.next(this.submissionSearchValue);
  }

  onSubmissionPageChange(event: any) {
    this.submissionPage = event.page + 1;
    this.submissionPageSize = event.rows;
    this.submissionFirst = event.first;
    this.loadSubmittedDetails();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  downloadTemplate() {
    this.isDownloadingTemplate = true;
    const targetModuleId = Number(this.selectedModuleId) || 1001;
    const targetModuleName = this.selectedModuleName || 'Import';

    this.service.downloadTemplate(targetModuleId, 'csv')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.isDownloadingTemplate = false;
          let filename = `${targetModuleName.replace(/\s+/g, '_')}_Import_Template - ${this.http.formattedDate}.csv`;

          const contentDisposition = response?.headers?.get('content-disposition');
          if (contentDisposition) {
            const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
            const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

            if (utf8FilenameMatch && utf8FilenameMatch[1]) {
              filename = decodeURIComponent(utf8FilenameMatch[1]);
            } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
              filename = asciiFilenameMatch[1];
            }
          }
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
    localStorage.removeItem('bulkImportStep');
  }

  navigateToHistoryView() {
    this.reset();
    localStorage.removeItem('bulkImportBatchId');
    this.router.navigate(['/settings/bulkupload-configurations/historylog']);
  }

  setStep(step: number) {
    this.progress = step;
    localStorage.setItem('bulkImportStep', step.toString());
  }

  nextStep() {
    if (this.progress < 4) {
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

  hasStatusColumn(): boolean {
    const cols = this.displayColumns();
    return cols.includes('isValid') || cols.includes('status');
  }

  isCenteredColumn(col: string): boolean {
    if (!col) return false;
    const centeredCols = [
      'rowNumber', 'isValid', 'status', 'errorMessage', 'action',
      'effectiveDate', 'entryDate', 'createdAt', 'nextCompensationReviewDate',
      'payType', 'frequency', 'billable', 'isBillable', 'overtimeEligibility',
      'duration', 'amountYearlyCtc', 'variablePayAmount', 'compensationAmount'
    ];
    return centeredCols.includes(col) || col.toLowerCase().includes('date') || col.toLowerCase().includes('status');
  }

  isDateColumn(col: string): boolean {
    if (!col) return false;
    const dateCols = ['effectiveDate', 'entryDate', 'createdAt', 'nextCompensationReviewDate', 'submittedDate'];
    return dateCols.includes(col) || col.toLowerCase().includes('date');
  }

  formatHeader(col: string): string {
    if (!col) return '';
    const customHeaders: { [key: string]: string } = {
      rowNumber: 'Row #',
      employeeId: 'Employee ID',
      employeeName: 'Employee Name',
      workEmail: 'Work Email',
      effectiveDate: 'Effective Date',
      reason: 'Reason',
      payType: 'Pay Type',
      overtimeEligibility: 'Overtime Eligibility',
      frequency: 'Frequency',
      amountYearlyCtc: 'Amount / Yearly CTC',
      variablePay: 'Variable Pay',
      variablePayAmount: 'Variable Pay Amount',
      nextCompensationReviewDate: 'Next Compensation Review Date',
      errorMessage: 'Error / Warning',
      isValid: 'Status',
      action: 'Action',
      clientName: 'Client',
      projectName: 'Project',
      projectCode: 'Project Code',
      phaseName: 'Phase',
      duration: 'Duration (HH:MM)',
      billable: 'Billable (Yes/No)',
      taskName: 'Task Type',
      createdAt: 'Submitted Date'
    };
    if (customHeaders[col]) {
      return customHeaders[col];
    }
    const result = col
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  formatCellValue(row: any, col: string): string {
    if (!row) return '-';
    let value = row[col];

    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
