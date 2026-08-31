import { Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { RbacService } from '../../../services/rbac.service';

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
    { id: 1, name: 'Select Module' },
    { id: 2, name: 'Upload File' },
    { id: 3, name: 'Validation' },
    { id: 4, name: 'Submission' }
  ];
  progress = 1;

  modules = [
    {
      id: (environment as any).compensationImportId || 1001,
      name: 'Employees',
      submodules: [
        { id: (environment as any).compensationImportId || 1001, name: 'Compensation' }
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
  public rbac = inject(RbacService);
  importForm: FormGroup = this.fb.group({
    moduleId: [null, Validators.required],
    submoduleId: [null, Validators.required]
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

  get selectedModuleLabel(): string {
    if (!this.canProceedFromModuleStep) {
      return '';
    }
    return `Module: ${this.selectedModuleName} / Submodule: ${this.selectedSubmoduleName}`;
  }

  get canProceedFromModuleStep(): boolean {
    const moduleId = this.selectedModuleId;
    const submoduleId = this.selectedSubmoduleId;
    if (!moduleId || !submoduleId) {
      return false;
    }
    return this.currentSubmodules.some(sub => sub.id === Number(submoduleId));
  }

  isFieldInvalid(controlName: 'moduleId' | 'submoduleId'): boolean {
    const control = this.importForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onModuleChange() {
    const modId = this.importForm.get('moduleId')?.value;
    if (modId) {
      localStorage.setItem('bulkImportModuleId', String(modId));
    } else {
      localStorage.removeItem('bulkImportModuleId');
    }
    this.importForm.patchValue({ submoduleId: null });
    this.importForm.get('submoduleId')?.markAsPristine();
    this.importForm.get('submoduleId')?.markAsUntouched();
    localStorage.removeItem('bulkImportSubmoduleId');
  }

  onModuleClear() {
    this.importForm.patchValue({ moduleId: null, submoduleId: null });
    this.importForm.get('moduleId')?.markAsTouched();
    this.importForm.get('moduleId')?.markAsDirty();
    this.importForm.get('submoduleId')?.markAsPristine();
    this.importForm.get('submoduleId')?.markAsUntouched();
    localStorage.removeItem('bulkImportModuleId');
    localStorage.removeItem('bulkImportSubmoduleId');
  }

  onSubmoduleChange() {
    const subId = this.importForm.get('submoduleId')?.value;
    if (subId) {
      localStorage.setItem('bulkImportSubmoduleId', String(subId));
    } else {
      localStorage.removeItem('bulkImportSubmoduleId');
    }
  }

  onSubmoduleClear() {
    this.importForm.patchValue({ submoduleId: null });
    this.importForm.get('submoduleId')?.markAsTouched();
    this.importForm.get('submoduleId')?.markAsDirty();
    localStorage.removeItem('bulkImportSubmoduleId');
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
      const combinedErrors = this.formatErrorsForCsv(row);
      const rowValues = cols.map(c => {
        let val = c === 'errorMessage' ? combinedErrors : (row[c] ?? '');
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      if (!cols.includes('errorMessage')) {
        rowValues.push(`"${combinedErrors.replace(/"/g, '""')}"`);
      }
      csvContent += rowValues.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const modName = (this.selectedSubmoduleName || 'Bulk_Import').replace(/\s+/g, '_');
    link.download = `${modName}_Error_Report_${this.http.formattedDate || new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  @ViewChild('errorsModal') errorsModal!: TemplateRef<any>;
  selectedErrorRow: any = null;
  selectedRowErrors: { field: string; message: string; suggestedFix: string }[] = [];
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
  readonly dateFormat = environment.dateformat;
  readonly sampleGuidelineDate = new Date(2026, 7, 15);
  private readonly datePipe = new DatePipe('en-US');
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
          if (Array.isArray(val)) {
            return val.map((item: any) =>
              item && typeof item === 'object' ? Object.values(item).join(' ') : String(item)
            ).join(' ').toLowerCase();
          }
          return String(val).toLowerCase();
        });
      rowValues.push(statusText);
      return rowValues.some(val => val.includes(term));
    });
  });

  readonly displayColumns = computed(() => {
    const rawCols = this.store.columns() ?? [];
    let cols: string[] = [];

    if (rawCols.length > 0) {
      cols = rawCols.filter((k: string) => k !== 'errors' && k !== 'errorMessage' && k !== 'isValid' && k !== 'status' && !k.startsWith('parsed') && !k.endsWith('Meta'));
    } else {
      const rows = this.store.filteredRows();
      if (rows && rows.length > 0) {
        const ignore = ['isValid', 'status', 'action', 'errorCode', 'errorField', 'suggestedFix', 'errors', 'errorMessage', 'hasErrors'];
        cols = Object.keys(rows[0]).filter((k: string) => !ignore.includes(k) && !k.startsWith('parsed') && !k.endsWith('Meta'));
      }
    }

    if (cols.includes('rowNumber')) {
      cols = ['rowNumber', ...cols.filter((k: string) => k !== 'rowNumber')];
    } else {
      cols = ['rowNumber', ...cols];
    }

    return [
      ...cols,
      'isValid',
      'errorMessage'
    ];
  });

  readonly displaySubmissionColumns = computed(() => {
    const rawCols = this.store.columns() ?? [];
    let cols: string[] = [];

    if (rawCols.length > 0) {
      const errorKeys = ['errors', 'errorMessage', 'errorCode', 'errorField', 'suggestedFix', 'hasErrors', 'isValid', 'status', 'action'];
      cols = rawCols.filter((k: string) => !errorKeys.includes(k) && !k.startsWith('parsed') && !k.endsWith('Meta'));
    } else {
      const rows = this.submissionRows();
      if (rows && rows.length > 0) {
        const errorKeys = ['errors', 'errorMessage', 'errorCode', 'errorField', 'suggestedFix', 'hasErrors', 'isValid', 'status', 'action', 'id'];
        cols = Object.keys(rows[0]).filter((k: string) => !errorKeys.includes(k) && !k.startsWith('parsed') && !k.endsWith('Meta'));
      }
    }

    if (cols.includes('rowNumber')) {
      cols = ['rowNumber', ...cols.filter((k: string) => k !== 'rowNumber')];
    }

    return cols;
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
  submissionPageSize = 50;
  submissionFirst = 0;
  submissionSearchValue = '';
  private submissionJobId: number | null = null;
  private submissionSearchSubject = new Subject<string>();
  page = 1;
  pageSize = 50;
  first = 0;
  rows = 50;
  collectionSize = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];

  constructor(private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public store: BulkUploadStore,
    private service: BulkUploadConfigService,
    private router: Router,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    if (!this.rbac.allowedToAccess('Bulk Import/Upload.view') && !this.rbac.allowedToAccess('Bulk Import/Upload Configuration Module.view')) {
      this.router.navigate(['/uservalidation']);
      return;
    }
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    this.updateModuleInfo();

    const savedStep = localStorage.getItem('bulkImportStep');
    const savedModuleId = localStorage.getItem('bulkImportModuleId');
    const savedSubmoduleId = localStorage.getItem('bulkImportSubmoduleId');
    this.progress = savedStep ? +savedStep : 1;
    const savedJobId = this.store.jobId();
    const savedStage = this.store.currentStage();

    if (savedStep === '4' && savedStage === 'IMPORT') {
      const savedSubmissionJobId = this.store.submissionJobId();
      const restoreJobId = savedSubmissionJobId || savedJobId;
      if (restoreJobId) {
        this.submissionJobId = restoreJobId;
        this.loadSubmittedDetails();
      } else {
        this.store.reset();
        this.progress = 1;
        localStorage.setItem('bulkImportStep', '1');
      }
    } else if (savedStep === '3' && savedJobId && savedStage === 'VALIDATE') {
      this.store.setLoading(true);
      this.service.getImportPreview(savedJobId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (previewRes: any) => {
            const previewData = previewRes?.data;
            if (previewData) {
              this.store.setPreview(previewData);
            }
            this.store.setLoading(false);
          },
          error: () => {
            this.store.reset();
            this.progress = 1;
            localStorage.setItem('bulkImportStep', '1');
            this.store.setLoading(false);
          }
        });
    } else if (savedStep === '2') {
      this.progress = 2;
    } else if (savedStep === '1') {
      this.progress = 1;
    } else {
      this.store.reset();
      this.progress = 1;
      localStorage.setItem('bulkImportStep', '1');
    }

    if (savedModuleId) {
      this.importForm.patchValue({
        moduleId: Number(savedModuleId),
        submoduleId: savedSubmoduleId ? Number(savedSubmoduleId) : null
      });
    } else {
      this.importForm.patchValue({
        moduleId: null,
        submoduleId: null
      });
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
      this.resetSubmissionPaging();
      this.loadSubmittedDetails();
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = Number(event.rows);
    this.rows = this.pageSize;
    this.first = event.first;
    this.syncSubmissionPaging();
    this.loadSubmittedDetails();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = Number(newPageSize);
    this.rows = this.pageSize;
    this.page = 1;
    this.first = 0;
    this.syncSubmissionPaging();
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
      this.conformationPopup.openErrorModal('Invalid file format. Please upload a valid Excel file (.xlsx / .xls / .csv)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.conformationPopup.openErrorModal('File size must be less than 5MB');
      return;
    }

    if (file.name.length > 255) {
      this.conformationPopup.openErrorModal('File name must not exceed 255 characters.');
      return;
    }

    this.onFileSelected(file, undefined, isReupload);
  }

  onFileSelected(file: File, modal?: any, isReupload = false) {
    this.store.setLoading(true);
    this.store.setUploadProgress(0);
    this.conformationPopup.openLoaderModal('Uploading...');

    const previousJobId = isReupload ? this.store.jobId() : undefined;
    const parentJobId = this.store.parentJobId() ?? undefined;
    const modId = Number(this.selectedModuleId) || 1001;
    const modName = this.selectedSubmoduleName || 'Compensation';

    const start$ = isReupload
      ? this.service.executeImportStage('RE_UPLOAD', this.employeeId, previousJobId ?? undefined, file, true, modId, modName, parentJobId).pipe(
        switchMap(() => this.service.executeImportStage('UPLOAD', this.employeeId, previousJobId ?? undefined, file, false, modId, modName, parentJobId))
      )
      : this.service.executeImportStage('UPLOAD', this.employeeId, undefined, file, false, modId, modName, parentJobId);

    let uploadData: any;
    start$
      .pipe(
        switchMap((uploadRes: any) => {
          uploadData = uploadRes?.data ?? uploadRes;
          const jobId = uploadRes?.data?.jobId ?? uploadRes?.jobId;
          if (!jobId) throw new Error('Upload failed: no job ID returned');
          const responseParentId = uploadRes?.data?.parentJobId ?? uploadRes?.parentJobId;
          if (responseParentId && !String(responseParentId).toUpperCase().startsWith('JOB-')) {
            this.store.setParentJobId(Number(responseParentId));
          }
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
            this.store.setPreview(previewData, uploadData);
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
    const modName = this.selectedSubmoduleName || 'Compensation';

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
            this.conformationPopup.openSuccessModal("Data imported successfully")
            this.totalSuccessCount = importRes.data?.successCount || 0;
            this.failureCount = importRes.data?.failureCount || 0;
            this.totalCount = importRes.data?.totalRows || 0;
            const resolvedJobId = importRes.data?.jobId ?? jobId;
            this.submissionJobId = resolvedJobId;
            this.store.setSubmissionJobId(resolvedJobId);
            this.store.setCurrentStage('IMPORT');
            this.resetSubmissionPaging();
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
    const validRows = this.store.validRows() ?? [];
    if (this.store.response()) {
      this.applySubmissionPaging(validRows);
      return;
    }

    const jobId = this.submissionJobId || this.store.jobId();
    if (!jobId) {
      this.applySubmissionPaging([]);
      return;
    }

    this.store.setLoading(true);
    this.service.getImportPreview(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (previewRes: any) => {
          const previewData = previewRes?.data;
          if (previewData) {
            this.store.setPreview(previewData);
          }
          this.store.setLoading(false);
          this.applySubmissionPaging(this.store.validRows() ?? []);
        },
        error: () => {
          this.store.setLoading(false);
          this.applySubmissionPaging([]);
        }
      });
  }

  private applySubmissionPaging(validRows: any[]) {
    this.store.setLoading(false);
    this.submissionTotalCount = this.totalSuccessCount || validRows.length;

    const search = (this.submissionSearchValue || '').trim().toLowerCase();
    let filtered = validRows;
    if (search) {
      filtered = validRows.filter((row: any) =>
        Object.values(row).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(search))
      );
    }

    const pageSize = Number(this.pageSize) || 50;
    this.collectionSize = filtered.length;
    const start = (this.page - 1) * pageSize;
    const end = start + pageSize;
    this.submissionRows.set(filtered.slice(start, end));
  }

  private resetSubmissionPaging() {
    this.page = 1;
    this.first = 0;
    this.submissionPage = 1;
    this.submissionFirst = 0;
    this.syncSubmissionPaging();
  }

  private syncSubmissionPaging() {
    this.submissionPage = this.page;
    this.submissionPageSize = Number(this.pageSize) || 50;
    this.submissionFirst = this.first;
  }

  onSubmissionSearchChange() {
    this.submissionSearchSubject.next(this.submissionSearchValue);
  }

  onSubmissionPageChange(event: any) {
    this.onPageChange(event);
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  downloadTemplate() {
    if (!this.canProceedFromModuleStep) {
      this.importForm.markAllAsTouched();
      this.conformationPopup.openErrorModal(this.getModuleSelectionErrorMessage());
      return;
    }

    this.isDownloadingTemplate = true;
    const targetModuleId = Number(this.selectedSubmoduleId || this.selectedModuleId);
    const targetModuleName = this.selectedSubmoduleName || 'Import';

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
    this.submissionSearchValue = '';
    this.submissionRows.set([]);
    this.submissionTotalCount = 0;
    this.collectionSize = 0;
    this.resetSubmissionPaging();
    this.importForm.reset({ moduleId: null, submoduleId: null });
    this.setStep(1);
    localStorage.removeItem('bulkImportStep');
    localStorage.removeItem('bulkImportModuleId');
    localStorage.removeItem('bulkImportSubmoduleId');
  }

  navigateToHistoryView() {
    this.store.setParentJobId(null);
    this.reset();
    localStorage.removeItem('bulkImportBatchId');
    this.router.navigate(['/settings/bulkupload-configurations/bulk-import']);
  }

  setStep(step: number) {
    this.progress = step;
    localStorage.setItem('bulkImportStep', step.toString());
  }

  nextStep() {
    if (this.progress === 1 && !this.canProceedFromModuleStep) {
      return;
    }
    if (this.progress === 2 && !this.store.response()) {
      return;
    }
    if (this.progress < 4) {
      const next = this.progress + 1;
      if (next === 3) {
        this.store.setCurrentStage('VALIDATE');
      }
      this.setStep(next);
      this.persistWizardDetails();
    }
  }

  private getModuleSelectionErrorMessage(): string {
    if (!this.selectedModuleId && !this.selectedSubmoduleId) {
      return 'Please select module and submodule';
    }
    if (!this.selectedModuleId) {
      return 'Please select module';
    }
    return 'Please select submodule';
  }

  prevStep() {
    if (this.progress <= 1) {
      return;
    }

    if (this.progress === 3) {
      this.store.setCurrentStage('UPLOAD');
      this.setStep(2);
      this.persistWizardDetails();
      return;
    }

    if (this.progress === 2) {
      this.store.reset();
      this.searchValue = '';
      this.searchTerm.set('');
      this.setStep(1);
      this.persistWizardDetails();
    }
  }

  private persistWizardDetails() {
    const moduleId = this.selectedModuleId;
    const submoduleId = this.selectedSubmoduleId;
    if (moduleId) {
      localStorage.setItem('bulkImportModuleId', String(moduleId));
    } else {
      localStorage.removeItem('bulkImportModuleId');
    }
    if (submoduleId) {
      localStorage.setItem('bulkImportSubmoduleId', String(submoduleId));
    } else {
      localStorage.removeItem('bulkImportSubmoduleId');
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
      'duration', 'amountYearlyCtc', 'variablePay', 'variablePayAmount', 'compensationAmount',
      'reason', 'description'
    ];
    return centeredCols.includes(col) || col.toLowerCase().includes('date') || col.toLowerCase().includes('status');
  }

  isDateColumn(col: string): boolean {
    if (!col) return false;
    const dateCols = ['effectiveDate', 'entryDate', 'createdAt', 'nextCompensationReviewDate', 'submittedDate'];
    return dateCols.includes(col) || col.toLowerCase().includes('date');
  }

  formatDateCellValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    const raw = String(value);
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return raw;
    }
    try {
      return this.datePipe.transform(parsed, this.dateFormat) || raw;
    } catch {
      return raw;
    }
  }

  formatHeader(col: string): string {
    if (!col) return '';
    if (col === 'rowNumber' || col.toLowerCase() === 'rownumber') return 'S.No';
    if (col === 'errorMessage' || col === 'errors') return 'Validation Errors';
    if (col === 'isValid' || col === 'status') return 'Status';

    let result = col
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result.replace(/\bI d\b/gi, 'ID').replace(/\bC t c\b/gi, 'CTC').replace(/\bI D\b/g, 'ID');
  }
  formatCellValue(row: any, col: string): string {
    if (!row) return '-';
    let value = row[col];

    if (col === 'rowNumber' || col.toLowerCase() === 'rownumber' || col.toLowerCase() === 's.no') {
      const num = Number(value);
      if (!isNaN(num) && num >= 2) {
        return String(num - 1);
      }
      if (!isNaN(num) && num >= 1) {
        return String(num);
      }
    }

    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }

  getRowErrors(row: any): { field: string; message: string; suggestedFix: string }[] {
    if (!row) return [];
    if (Array.isArray(row.errors) && row.errors.length > 0) {
      return row.errors.map((err: any) => ({
        field: err?.field || err?.errorField || '-',
        message: err?.message || err?.errorMessage || '-',
        suggestedFix: err?.suggestedFix || '-'
      }));
    }
    if (row.errorMessage) {
      return [{
        field: row.errorField || '-',
        message: row.errorMessage,
        suggestedFix: row.suggestedFix || '-'
      }];
    }
    return [];
  }

  hasRowErrors(row: any): boolean {
    return this.getRowErrors(row).length > 0;
  }

  openErrorsModal(row: any, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.selectedErrorRow = row;
    this.selectedRowErrors = this.getRowErrors(row);
    if (!this.errorsModal || this.selectedRowErrors.length === 0) {
      return;
    }
    this.modalService.open(this.errorsModal, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  formatErrorsForCsv(row: any): string {
    return this.getRowErrors(row)
      .map(err => `${err.field}: ${err.message}${err.suggestedFix && err.suggestedFix !== '-' ? ` (${err.suggestedFix})` : ''}`)
      .join('; ');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
