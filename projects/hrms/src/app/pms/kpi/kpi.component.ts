import { OpenModalService } from './../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';

@Component({
  selector: 'app-kpi',
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
    TooltipModule,
    SelectModule,
    TooltipModule,
    InfoIconComponent
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KpiComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private http = inject(HttpService);
  private modalService = inject(NgbModal);
  public rbac = inject(RbacService);
  private router = inject(Router);
  private conformationPopup = inject(OpenModalService);

  moduleinfo = '';
  searchText = '';
  kpiList: any[] = [];
  filteredDetails: any[] = [];
  dataload = false;
  isSubmitting = false;

  page = 1;
  rows = 10;
  first = 0;
  collectionSize = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  // Dropdown options
  kpiTypes = [
    { label: 'Quantitative', value: 'Quantitative' },
    { label: 'Qualitative', value: 'Qualitative' }
  ];

  uomOptions = [
    { label: 'Percentage (%)', value: '%' },
    { label: 'Currency ($)', value: '$' },
    { label: 'Numbers (Nos)', value: 'Nos' },
    { label: 'Hours (Hrs)', value: 'Hrs' },
    { label: 'Days', value: 'Days' }
  ];

  // KRA List (still loaded if needed elsewhere in template)
  kraList: any[] = [];
  isEditMode = false;
  currentKpiId: number | null = null;

  // Simplified single KPI form
  kpiForm = this.fb.group({
    kpiName: ['', [Validators.required, Validators.minLength(5)]],
    uom: ['', Validators.required],
    targetValue: [null as number | null, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
  });

  // Getter for form controls
  get f() {
    return this.kpiForm.controls;
  }

  private subscription!: Subscription;

  ngOnInit(): void {
    this.loadKraList();
    this.loadKpiList();
    this.updateModuleInfo();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateModuleInfo());
  }

  updateModuleInfo() {
    const url = this.router.url;
    // this.moduleinfo = url.includes('/pms/kpi') ? MODULE_INFOS.PMS_KPI_LIST_MODULE_INFO : '';
  }

  loadKraList() {
    this.http.getData('Kra/getAll').subscribe({
      next: (res: any) => {
        if (res.success) {
          this.kraList = res.data || [];
        }
      },
      error: (err) => console.error('Error loading KRAs:', err),
    });
  }

  loadKpiList() {
  const params = {
    pageNumber: this.page,
    pageSize: this.rows,
    ...(this.searchText && { searchQuery: this.searchText }),
  };

  this.dataload = true;
  this.subscription = this.http.getDataIncludeParams('Kpi/getAll', params).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.kpiList = res.data || [];
        this.collectionSize = res.pagination?.totalRecords || 0;
        this.filteredDetails = this.kpiList; // Flat list now
      } else {
        this.kpiList = [];
        this.filteredDetails = [];
        this.collectionSize = 0;
      }
      this.dataload = false;
    },
    error: (err) => {
      console.error(err);
      this.kpiList = [];
      this.filteredDetails = [];
      this.collectionSize = 0;
      this.dataload = false;
    }
  });
}

  onSearchTextChange() {
    this.page = 1;
    this.first = 0;
    this.loadKpiList();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadKpiList();
  }

  onPageSizeChange(newSize: number) {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.loadKpiList();
  }

  openModal(content: any) {
    this.isEditMode = false;
    this.currentKpiId = null;
    this.kpiForm.reset();

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  onSubmitKpi() {
    if (this.kpiForm.invalid) return;

    this.isSubmitting = true;

    // Safely extract values — all are guaranteed non-null due to Validators.required
    const formValue = this.kpiForm.getRawValue();

    const payload = {
      kpiId: this.currentKpiId || 0,
      kpiName: formValue.kpiName!.trim(),
      targetType: formValue.uom!,
      targetValue: String(formValue.targetValue!),
      description: formValue.description!.trim(),
      status: "Created"
      // kraId: ... (add if required by backend)
    };

    const endpoint = this.isEditMode ? 'Kpi/upsertkra' : 'Kpi/upsertkra';

    this.http.postdata(endpoint, payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadKpiList();
        this.conformationPopup.openSuccessModal(
          this.isEditMode ? 'KPI updated successfully' : 'KPI created successfully'
        );
      },
      error: (err) => {
        console.error(err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to save KPI');
      },
      complete: () => {
        this.isSubmitting = false;
        this.isEditMode = false;
        this.currentKpiId = null;
        this.kpiForm.reset();
      }
    });
  }

    hasAnyActionPermission(): boolean {
    return true;
  }

  onUpdate(kpi: any, content: any) {
    this.isEditMode = true;
    this.currentKpiId = kpi.kpiId || kpi.id || 0;

    this.kpiForm.patchValue({
      kpiName: kpi.kpiName || '',
      uom: kpi.targetType || '',
      targetValue: kpi.targetValue != null ? Number(kpi.targetValue) : null,
      description: kpi.description || ''
    });

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  onView(kpi: any) {
    alert('View: ' + (kpi.kpiName || 'KPI'));
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

  onMakeInactive(kpi: any) {
  if (confirm(`Are you sure you want to make "${kpi.kpiName}" Inactive?`)) {
    const payload = {
      kpiId: kpi.kpiId,
      status: 'Inactive',
      updatedBy: JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')?.employeeId || 0
    };

    this.http.postdata('Kpi/upsertkra', payload).subscribe({
      next: () => {
        this.loadKpiList();
        this.conformationPopup.openSuccessModal('KPI status updated to Inactive');
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }
}

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
