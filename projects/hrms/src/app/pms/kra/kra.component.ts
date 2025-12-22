import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  NgbModal,
  NgbOffcanvas,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { OpenModalService } from '../../services/open-modal.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { MODULE_INFOS } from '../../shared/modules-info';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SelectModule } from 'primeng/select';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { DocumentViewIconComponent } from '../../icons/document-view-icon/document-view-icon.component';

@Component({
  selector: 'app-kra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    PaginatorModule,
    TranslateModule,
    DataLoaderContentComponent,
    NoDataFoundComponent,
    ModuleInformationComponent,
    ModuleInfoIconComponent,
    SelectModule,
    InfoIconComponent,
    DocumentViewIconComponent,
  ],
  templateUrl: './kra.component.html',
  styleUrl: './kra.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KraComponent implements OnInit, OnDestroy {
  moduleinfo = '';
  searchText = '';
  kraList: any[] = [];
  filteredDetails: any[] = [];
  dataload = false;
  isSubmitting = false;

  page = 1;
  rows = 10;
  first = 0;
  collectionSize = 0;

  selectedKraId: number = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  kraCategories: { id: number; name: string }[] = [];
  private pendingKraPayload: any = null;

  isEditMode = false;
  currentEditingKraId: number | null = null;
  kraFilterApplied: boolean = false; // button text initially "Inactive KRA"
  showInactiveFilter: boolean = false; // page load: show all data

  kraForm: any;
  get f() {
    return this.kraForm.controls;
  }

  assignKpiForm: any;

  assignByRoleForm: any;
  selectedKraTitle = '';
  selectedKpiCount = 0;

  existingAttachmentName: string = '';
existingDocumentUrl: string = '';

  jobRoleOptions = [
    { label: 'Software Engineer', value: 1 },
    { label: 'Senior Developer', value: 2 },
    { label: 'Team Lead', value: 3 },
  ];

  employeeOptions = [
    { label: 'John Doe', value: 101 },
    { label: 'Alice Smith', value: 102 },
    { label: 'Michael Lee', value: 103 },
  ];

  dummyKpiList = [
    'KPI 1 – Quality of Work',
    'KPI 2 – Productivity Score',
    'KPI 3 – Timeline Adherence',
    'KPI 4 – Communication',
  ];

  kpiList: any[] = [];

  pendingKraName: string = '';
  pendingNewStatus: string = '';
  pendingKraId: number = 0;

  ExpenseImageUrl: SafeUrl | null = null;
  ExpenseViewURL: SafeResourceUrl | null = null;

  private subscription!: Subscription;
  @ViewChild('createKraModal') createKraModal: any;
  @ViewChild('assignKpiModal') assignKpiModal: any;
  @ViewChild('assignByRoleModal') assignByRoleModal: any;

  @ViewChild('statusConfirmModal') statusConfirmModal: any;
  @ViewChild('viewattamchment') viewattamchment!: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas,
    private sanitizer: DomSanitizer
  ) {
    // Form initialized safely in constructor
    this.kraForm = this.fb.group(
      {
        categoryId: [null as number | null, Validators.required],
        kraName: ['', [Validators.required, Validators.minLength(5)]],
        description: ['', [Validators.required, Validators.minLength(10)]],
        attachment: [null as File | null],
      },
      {}
    );

    this.assignKpiForm = this.fb.group({
      kraName: [{ value: '', disabled: true }],
      weightageValue: [{ value: '', disabled: true }],
      effectiveDate: [{ value: '', disabled: true }],
      targetDate: [{ value: '', disabled: true }],

      kpiRows: this.fb.array([this.createKpiRow()]),
    });

    this.assignByRoleForm = this.fb.group({
      roleRows: this.fb.array([this.createRoleRow()]),
    });
  }

  createKpiRow() {
    return this.fb.group({
      kpiName: ['', Validators.required],
      weightage: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      unit: ['', Validators.required],
      targetValue: ['', Validators.required],
      targetDate: ['', Validators.required],
    });
  }

  createRoleRow() {
    return this.fb.group({
      jobRole: ['', Validators.required],
      employee: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      targetDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadKraList();
    this.updateModuleInfo();
    this.loadKraCategories();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateModuleInfo());
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.moduleinfo = url.includes('/pms/kra')
      ? MODULE_INFOS.PMS_KRA_LIST_MODULE_INFO
      : '';
  }

  toggleInactiveKra(): void {
    this.showInactiveFilter = !this.showInactiveFilter;

    this.kraFilterApplied = this.showInactiveFilter;

    this.page = 1;
    this.first = 0;

    this.loadKraList();
  }

  loadKraList() {
    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
      ...(this.searchText && { search: this.searchText }),
    };

    this.dataload = true;

    this.subscription = this.http
      .getDataIncludeParams('Kra/getAll', params)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            const allData = res.data || [];

            this.kraList = this.showInactiveFilter
              ? allData.filter((kra: any) => kra.status === 'Inactive')
              : allData.filter((kra: any) => kra.status !== 'Inactive');

            this.filteredDetails = this.kraList;
            this.collectionSize = this.filteredDetails.length;
          } else {
            this.kraList = [];
            this.filteredDetails = [];
            this.collectionSize = 0;
          }

          this.dataload = false;
        },
        error: () => {
          this.kraList = [];
          this.filteredDetails = [];
          this.collectionSize = 0;
          this.dataload = false;
        },
      });
  }

  loadKraCategories(): void {
    this.http.getData('Kra/getallconfiguration').subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // Map API response to format expected by p-select
          this.kraCategories = res.data.map((cat: any) => ({
            id: cat.categoryId,
            name: cat.categoryName,
          }));
        } else {
          this.kraCategories = [];
        }
      },
      error: (err: any) => {
        console.error('Error loading KRA categories:', err);
        this.kraCategories = [];
      },
    });
  }

  onSearchTextChange() {
    this.page = 1;
    this.first = 0;
    this.loadKraList();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadKraList();
  }

  onPageSizeChange(newSize: number) {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.loadKraList();
  }

  openCreateModal(kra?: any) {
    // Made optional param for create mode
    this.isEditMode = !!kra; // true if editing
    this.currentEditingKraId = kra ? kra.kraId : null;

    if (this.isEditMode) {
      // Load categories first to ensure options are available
      this.loadKraCategories();

      // Pass the kra object via modal config (we'll use it after open)
      this.modalService
        .open(this.createKraModal, {
          centered: true,
          backdrop: 'static',
          size: 'lg',
        })
        .result.then(
          () => {},
          () => {
            // Optional: reset on dismiss if needed
          }
        );

      // Defer patching and disabling to after modal is opened
      setTimeout(() => {
        // Patch form values
        this.kraForm.patchValue({
          categoryId: kra.kraCategoryId,
          kraName: kra.kraName,
          description: kra.description,
          attachment: null
        });

        if (kra.documentUrl) {
    this.existingDocumentUrl = kra.documentUrl;
    // Extract filename from the URL
    const fileName = kra.documentUrl.split('/').pop() || 'attachment';
    this.existingAttachmentName = decodeURIComponent(fileName);
  } else {
    this.existingAttachmentName = '';
    this.existingDocumentUrl = '';
  }

        // Disable category if status is NOT 'Created'
        const categoryControl = this.kraForm.get('categoryId');
        if (kra.status === 'Created') {
          categoryControl?.enable();
        } else {
          categoryControl?.disable();
        }
      }, 300); // Small delay to ensure modal & p-select are rendered
    } else {
      // Create mode
      this.kraForm.reset();
      this.kraForm.get('categoryId')?.enable(); // Always enabled for create
      this.modalService.open(this.createKraModal, {
        centered: true,
        backdrop: 'static',
        size: 'lg',
      });
    }
  }

  onUpdate(kra: any) {
    this.openCreateModal(kra); // Now passes the kra object
  }

  getCategoryName(id: number): string {
    return this.kraCategories.find((c) => c.id === id)?.name || '-';
  }

  uploadKraAttachment(kraId: number, file: File): void {
    const filePath = `/KRA/${kraId}/Documents`;

    this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          if (data?.path && this.pendingKraPayload) {
            this.pendingKraPayload.kraId = kraId;
            this.pendingKraPayload.documentUrl = data.path;

            this.http
              .postdata('Kra/upsertkra', this.pendingKraPayload)
              .subscribe(() => {
                this.afterKraSaveSuccess();
              });
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.conformationPopup.openErrorModal('File upload failed');
        },
      });
  }

  afterKraSaveSuccess(): void {
    this.modalService.dismissAll();
    this.loadKraList();

    this.conformationPopup.openSuccessModal(
      this.isEditMode ? 'KRA updated successfully' : 'KRA created successfully'
    );

    this.isSubmitting = false;
    this.isEditMode = false;
    this.currentEditingKraId = null;
    this.pendingKraPayload = null;
    this.kraForm.reset();
  }

  saveKraData(payload: any): void {
    const file: File | null = this.kraForm.value.attachment;

    this.http.postdata('Kra/upsertkra', payload).subscribe({
      next: (res: any) => {
        const kraId = this.isEditMode
          ? this.currentEditingKraId
          : res?.data?.kraId;

        if (file && kraId) {
          this.uploadKraAttachment(kraId, file);
        } else {
          this.afterKraSaveSuccess();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.conformationPopup.openErrorModal(
          err.error?.message || 'Operation failed'
        );
      },
    });
  }

  onSubmitKra() {
    if (this.kraForm.invalid) return;

    this.isSubmitting = true;

    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = user?.employeeId || 0;

    const payload: any = {
      kraId: this.isEditMode ? this.currentEditingKraId : 0,
      kraCategoryId: this.kraForm.value.categoryId,
      kraName: this.kraForm.value.kraName?.trim(),
      description: this.kraForm.value.description?.trim(),
      createdBy: this.isEditMode ? undefined : employeeId,
      updatedBy: employeeId,
      documentUrl: null,
    };

    this.pendingKraPayload = payload;

    if (!this.isEditMode) {
      payload.createdBy = employeeId;
    }

    this.saveKraData(payload);
  }

  hasAnyActionPermission(): boolean {
    return true;
  }

  onAssignKpi(kra: any) {
    // Reset form
    this.assignKpiForm.reset();
    this.kpiRows.clear();
    this.kpiRows.push(this.createKpiRow());

    // Patch KRA values
    this.assignKpiForm.patchValue({
      kraName: kra.kraName,
      weightageValue: kra.weightageValue,
      effectiveDate: kra.effectiveDate.split('T')[0],
      targetDate: kra.targetDate.split('T')[0],
    });

    this.modalService.open(this.assignKpiModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  onAssignByRole(kra: any) {
    // Set header values
    this.selectedKraTitle = kra.kraName;
    this.selectedKpiCount = kra.kpiCount || 0; // If API gives count
    this.selectedKraId = kra.kraId;

    // Reset form and rows
    this.assignByRoleForm.reset();
    this.roleRows.clear();
    this.roleRows.push(this.createRoleRow());

    this.modalService.open(this.assignByRoleModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  openStatusConfirmModal(kra: any, newStatus: string) {
    this.pendingKraName = kra.kraName;
    this.pendingNewStatus = newStatus;
    this.pendingKraId = kra.kraId;

    this.modalService.open(this.statusConfirmModal, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
  }

  confirmStatusChange() {
    this.isSubmitting = true;

    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = user?.employeeId || 0;

    const payload = {
      kraId: this.pendingKraId,
      kraName: this.pendingKraName,
      status: this.pendingNewStatus,
      updatedBy: employeeId,
      createdBy: employeeId,
    };

    this.http.postdata('Kra/upsertkra', payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadKraList();
        this.conformationPopup.openSuccessModal(
          `KRA status updated to ${this.pendingNewStatus}`
        );
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.conformationPopup.openErrorModal(
          err.error?.message || 'Failed to update status'
        );
      },
    });
  }

  // private updateKraStatus(kraId: number, kraName: string, newStatus: string) {
  //   const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  //   const employeeId = user?.employeeId || 0;

  //   const payload = {
  //     kraId: kraId,
  //     status: newStatus,
  //     kraName: kraName,
  //     updatedBy: employeeId,
  //     createdBy:employeeId
  //   };

  //   this.http.postdata('Kra/upsertkra', payload).subscribe({
  //     next: () => {
  //       this.loadKraList();
  //       this.conformationPopup.openSuccessModal(`KRA status updated to ${newStatus}`);
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
  //     }
  //   });
  // }

onFileChange(event: any) {
  const file = event.target.files[0] as File;
  if (file) {
    this.kraForm.patchValue({ attachment: file });
    // Show the newly selected file name (replaces existing name display)
    this.existingAttachmentName = file.name;
  }
}

  getStatusClass(status: string) {
    switch (status) {
      case 'Created':
        return 'status-created';
      case 'Active':
        return 'status-active';
      case 'On Hold':
        return 'status-onhold';
      default:
        return '';
    }
  }

  get kpiRows() {
    return this.assignKpiForm.get('kpiRows');
  }

  addKpiRow() {
    this.kpiRows.push(this.createKpiRow());
  }

  removeKpiRow(index: number) {
    this.kpiRows.removeAt(index);
  }

  get roleRows() {
    return this.assignByRoleForm.get('roleRows');
  }

  addRoleRow() {
    this.roleRows.push(this.createRoleRow());
  }

  removeRoleRow(index: number) {
    this.roleRows.removeAt(index);
  }

  loadKpisForKra(kraId: number) {
    this.http
      .getDataIncludeParams('Kpi/getAll', { page: 1, pageSize: 100 })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.kpiList = (res.data || []).filter(
              (k: any) => k.kraId === kraId
            );
          } else {
            this.kpiList = [];
          }
        },
        error: (err) => {
          console.error('Error loading KPIs:', err);
          this.kpiList = [];
        },
      });
  }

  openKpiCanvas(content: TemplateRef<any>, modalRef: any, kraId: number) {
    modalRef.dismiss(); // Close modal first
    this.loadKpisForKra(kraId); // Load real KPIs

    setTimeout(() => {
      this.offcanvasService.open(content, {
        position: 'end',
        backdrop: 'static',
        panelClass: 'custom-kpi-canvas',
      });
    }, 300);
  }

  closeKpiCanvas() {
    this.offcanvasService.dismiss();
  }

  isViewableFile(url: string): boolean {
    const lowerUrl = url?.toLowerCase();
    return (
      lowerUrl.endsWith('.jpg') ||
      lowerUrl.endsWith('.jpeg') ||
      lowerUrl.endsWith('.png') ||
      lowerUrl.endsWith('.pdf')
    );
  }

  onSelectDownload(url: string) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res.body]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = url.split('/').pop() || 'file';
        link.click();
      },
    });
  }

onViewAttachement(url: string) {
  const lowerUrl = url.toLowerCase();

  // Handle images (keep your working logic)
  if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png')) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res.body], { type: 'image/jpeg' }); // or 'image/png' as needed
        const objectURL = URL.createObjectURL(blob);
        this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.ExpenseViewURL = null;
        this.toggleViewModal();
      },
      error: (err) => console.error('Image load failed', err)
    });
  }
  // Handle PDF and Excel
  else if (lowerUrl.endsWith('.pdf') || lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx')) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
      next: (res: any) => {
        const mimeType = lowerUrl.endsWith('.pdf')
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // for .xlsx

        const blob = new Blob([res.body], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        this.ExpenseViewURL = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.ExpenseImageUrl = null;
        this.toggleViewModal();

        // Optional: Revoke later when modal closes (see cleanup below)
      },
      error: (err) => {
        console.error('File load failed', err);
        // Optional: show error in modal
      }
    });
  }
}

  toggleViewModal() {
    this.modalService.dismissAll();
    this.modalService.open(this.viewattamchment, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
