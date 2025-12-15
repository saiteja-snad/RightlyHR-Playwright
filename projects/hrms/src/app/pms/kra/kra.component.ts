import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
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
    InfoIconComponent
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

  isEditMode = false;
currentEditingKraId: number | null = null;

  kraForm: any;
  get f() { return this.kraForm.controls; }

  assignKpiForm: any;

assignByRoleForm: any;
selectedKraTitle = '';
selectedKpiCount = 0;


jobRoleOptions = [
  { label: 'Software Engineer', value: 1 },
  { label: 'Senior Developer', value: 2 },
  { label: 'Team Lead', value: 3 },
];

employeeOptions = [
  { label: 'John Doe', value: 101 },
  { label: 'Alice Smith', value: 102 },
  { label: 'Michael Lee', value: 103 }
];

dummyKpiList = [
  'KPI 1 – Quality of Work',
  'KPI 2 – Productivity Score',
  'KPI 3 – Timeline Adherence',
  'KPI 4 – Communication'
];

kpiList: any[] = [];



  private subscription!: Subscription;
  @ViewChild('createKraModal') createKraModal: any;
  @ViewChild('assignKpiModal') assignKpiModal: any;
  @ViewChild('assignByRoleModal') assignByRoleModal: any;



  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) {
    // Form initialized safely in constructor
    this.kraForm = this.fb.group({
      categoryId: [null as number | null, Validators.required],
      kraName: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      attachment: [null as File | null],
    }, {});

    this.assignKpiForm = this.fb.group({
  kraName: [{ value: '', disabled: true }],
  weightageValue: [{ value: '', disabled: true }],
  effectiveDate: [{ value: '', disabled: true }],
  targetDate: [{ value: '', disabled: true }],

  kpiRows: this.fb.array([
    this.createKpiRow()
  ])
});

this.assignByRoleForm = this.fb.group({
  roleRows: this.fb.array([
    this.createRoleRow()
  ])
});

  }

  createKpiRow() {
  return this.fb.group({
    kpiName: ['', Validators.required],
    weightage: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
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
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateModuleInfo());
  }

  updateModuleInfo() {
    const url = this.router.url;
    // this.moduleinfo = url.includes('/pms/kra') ? MODULE_INFOS.PMS_KRA_LIST_MODULE_INFO : '';
  }

  loadKraList() {
    const params = {
      pageNumber: this.page,
      pageSize: this.rows,
      ...(this.searchText && { searchQuery: this.searchText }),
    };

    this.dataload = true;
    this.subscription = this.http
      .getDataIncludeParams('Kra/getAll', params)
      .subscribe({
        next: (res: any) => {
        if (res.success) {
          this.kraList = res.data || [];
          this.collectionSize = res.pagination?.totalRecords || 0;
          this.filteredDetails = this.kraList;
        } else {
          this.kraList = [];
          this.collectionSize = 0;
          this.filteredDetails = [];
        }
        this.dataload = false;
      },
      error: (err) => {
        console.error('Error loading KRAs:', err);
        this.kraList = [];
        this.collectionSize = 0;
        this.filteredDetails = [];
        this.dataload = false;
      }
    });
  }

  loadKraCategories(): void {

  this.http.getData('Kra/getallconfiguration').subscribe({
    next: (res: any) => {
      if (res.success && res.data) {
        // Map API response to format expected by p-select
        this.kraCategories = res.data.map((cat: any) => ({
          id: cat.categoryId,
          name: cat.categoryName
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

openCreateModal() {
  this.isEditMode = false;
  this.currentEditingKraId = null;
  this.kraForm.reset();
  this.modalService.open(this.createKraModal, { centered: true, backdrop: 'static', size: 'lg' });
}


  getCategoryName(id: number): string {
    return this.kraCategories.find(c => c.id === id)?.name || '-';
  }


  uploadKraAttachment(payload: any): void {
  const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  const employeeId = user?.employeeId || 0;

  const filePath = `/FusionDocuments/Employee Documents/KRA Documents/${employeeId}`;

  this.http
    .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.kraForm.value.attachment)
    .subscribe({
      next: (data: any) => {
        if (data) {
          payload.documentUrl = data.path;   // IMPORTANT → API needs this
          this.saveKraData(payload);         // Continue saving KRA
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.conformationPopup.openErrorModal("File upload failed");
      }
    });
}


saveKraData(payload: any): void {
  this.http.postdata('Kra/upsertkra', payload).subscribe({
    next: () => {
      this.modalService.dismissAll();
      this.loadKraList();

      this.conformationPopup.openSuccessModal(
        this.isEditMode ? 'KRA updated successfully' : 'KRA created successfully'
      );
    },
    error: (err) => {
      this.conformationPopup.openErrorModal(err.error?.message || 'Operation failed');
    },
    complete: () => {
      this.isSubmitting = false;
      this.isEditMode = false;
      this.currentEditingKraId = null;
      this.kraForm.reset();
    }
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
    updatedBy: employeeId
  };

  if (!this.isEditMode) {
    payload.createdBy = employeeId;
  }

  const file = this.kraForm.value.attachment;

  // If a file is selected → upload first and get documentUrl
  if (file) {
    this.uploadKraAttachment(payload);
  } else {
    // No file → directly save with documentUrl = null
    payload.documentUrl = null;
    this.saveKraData(payload);
  }
}

  hasAnyActionPermission(): boolean {
    return true;
  }

onUpdate(kra: any) {
  this.isEditMode = true;
  this.currentEditingKraId = kra.kraId;

  // Patch the form with existing values
  this.kraForm.patchValue({
    categoryId: kra.categoryId,
    kraName: kra.kraName,
    description: kra.description,
  });

  // Open the same modal
  this.modalService.open(this.createKraModal, { centered: true, backdrop: 'static', size: 'lg' });
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
    effectiveDate: kra.effectiveDate.split("T")[0],
    targetDate: kra.targetDate.split("T")[0]
  });

  this.modalService.open(this.assignKpiModal, {
    centered: true,
    size: 'xl',
    backdrop: 'static'
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
    backdrop: 'static'
  });
}


onMakeInactive(kra: any) {
  if (confirm(`Are you sure you want to make "${kra.kraName}" Inactive?`)) {
    this.updateKraStatus(kra.kraId, 'Inactive');
  }
}

onHold(kra: any) {
  if (confirm(`Put "${kra.kraName}" on Hold?`)) {
    this.updateKraStatus(kra.kraId, 'On Hold');
  }
}

onResume(kra: any) {
  if (confirm(`Resume "${kra.kraName}"?`)) {
    this.updateKraStatus(kra.kraId, 'Active');
  }
}

onView(kra: any) {
  alert(`Viewing details of: ${kra.kraName}`);
}

private updateKraStatus(kraId: number, newStatus: string) {
  const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  const employeeId = user?.employeeId || 0;

  const payload = {
    kraId: kraId,
    status: newStatus,
    updatedBy: employeeId,
  };

  this.http.postdata('Kra/upsertkra', payload).subscribe({
    next: () => {
      this.loadKraList();
      this.conformationPopup.openSuccessModal(`KRA status updated to ${newStatus}`);
    },
    error: (err) => {
      console.error(err);
      this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
    }
  });
}

onFileChange(event: any) {
  const file = event.target.files[0] as File;
  if (file) {
    this.kraForm.patchValue({ attachment: file });
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
  this.http.getDataIncludeParams('Kpi/getAll', { page: 1, pageSize: 100 }).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.kpiList = (res.data || []).filter((k: any) => k.kraId === kraId);
      } else {
        this.kpiList = [];
      }
    },
    error: (err) => {
      console.error('Error loading KPIs:', err);
      this.kpiList = [];
    }
  });
}

openKpiCanvas(content: TemplateRef<any>, modalRef: any, kraId: number) {
  modalRef.dismiss(); // Close modal first
  this.loadKpisForKra(kraId); // Load real KPIs

  setTimeout(() => {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'custom-kpi-canvas'
    });
  }, 300);
}

closeKpiCanvas() {
  this.offcanvasService.dismiss();
}



  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
