import { OpenModalService } from './../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormGroup,
} from '@angular/forms';
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
import { MODULE_INFOS } from '../../shared/modules-info';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';

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
    AccordionModule,
    TooltipModule,
    DropdownModule,
    SelectModule
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
  private conformationPopup= inject(OpenModalService);

  moduleinfo = '';
  searchText = '';
  kpiList: any[] = [];
  filteredDetails: any[] = [];
  dataload = false;
  isSubmitting = false;
  groupedKpis: { kraId: number; kraName: string; kpis: any[] }[] = [];

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

  // KRA List (to show in dropdown)
  kraList: any[] = [];

  // Main form
  kpiForm = this.fb.group(
    {
      kraId: [null, Validators.required],
      weightage: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      effectiveDate: ['', Validators.required],
      targetDate: ['', Validators.required],
      kpiRows: this.fb.array([]), // Dynamic KPI rows
    },
    { validators: this.targetDateValidator }
  );

  // Getter for form controls
  get f() {
    return this.kpiForm.controls;
  }

  // Getter for KPI rows FormArray
  get kpiRows(): FormArray {
    return this.kpiForm.get('kpiRows') as FormArray;
  }

  private subscription!: Subscription;

  ngOnInit(): void {
    this.loadKraList(); // Load KRA dropdown
    this.loadKpiList(); // Load existing KPIs
    this.updateModuleInfo();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateModuleInfo());
  }

  updateModuleInfo() {
    const url = this.router.url;
    // this.moduleinfo = url.includes('/pms/kpi') ? MODULE_INFOS.PMS_KPI_LIST_MODULE_INFO : '';
  }

  // Load KRA dropdown
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

  onKraChange() {
  const selectedKraId = this.kpiForm.get('kraId')?.value;
  if (selectedKraId) {
    const selectedKra = this.kraList.find(k => k.kraId === selectedKraId);
    if (selectedKra) {
      this.kpiForm.patchValue({
        weightage: selectedKra.weightageValue,           // auto-fill weightage
        effectiveDate: selectedKra.effectiveDate.split('T')[0], // format YYYY-MM-DD
        targetDate: selectedKra.targetDate.split('T')[0],       // format YYYY-MM-DD
      });
    }
  }
}

loadKpiList() {
  const params = {
    page: this.page,
    pageSize: this.rows,
    ...(this.searchText && { searchQuery: this.searchText }),
  };

  this.dataload = true;
  this.subscription = this.http.getDataIncludeParams('Kpi/getAll', params).subscribe({
    next: (res: any) => {
      const kpis = res.data || [];
      this.collectionSize = res.pagination?.totalRecords || 0;

      // Group KPIs by kraId + kraName
      const map = new Map<number, { kraId: number; kraName: string; kpis: any[] }>();

      kpis.forEach((kpi: any) => {
        const kraId = kpi.kraId;
        const kraName = kpi.kraName || 'Unknown KRA';

        if (!map.has(kraId)) {
          map.set(kraId, { kraId, kraName, kpis: [] });
        }
        map.get(kraId)!.kpis.push(kpi);
      });

      this.groupedKpis = Array.from(map.values())
        .sort((a, b) => a.kraName.localeCompare(b.kraName));

      this.filteredDetails = kpis;
      this.dataload = false;

      console.log("Grouped KPIs =>", this.groupedKpis);
console.log("Raw KPIs =>", kpis);
console.log("Data load =>", this.dataload);

    },
    error: (err) => {
      console.error(err);
      this.groupedKpis = [];
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
    this.kpiForm.reset();
    this.kpiRows.clear();
    this.addKpiRow(); // Start with one empty row
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
  }

  targetDateValidator(control: AbstractControl): ValidationErrors | null {
    const effective = control.get('effectiveDate')?.value;
    const target = control.get('targetDate')?.value;
    if (effective && target && new Date(target) < new Date(effective)) {
      return { targetDateBeforeEffective: true };
    }
    return null;
  }

  // Add a new KPI row
  addKpiRow() {
    this.kpiRows.push(
      this.fb.group({
        kpiName: ['', [Validators.required, Validators.minLength(5)]],
        weightage: [
          null,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        uom: ['', Validators.required],
        targetValue: [null, Validators.required],
        targetDate: ['', Validators.required],
        description: ['', [Validators.required, Validators.minLength(10)]],
      })
    );
  }

  // Remove a KPI row
  removeKpiRow(index: number) {
    this.kpiRows.removeAt(index);
  }

onSubmitKpi() {
  if (this.kpiForm.invalid || this.kpiRows.length === 0) return;

  this.isSubmitting = true;

  const formValue = this.kpiForm.getRawValue();
  const selectedKra = this.kraList.find(k => k.kraId === formValue.kraId);

  const payload = this.kpiRows.getRawValue().map((row: any) => ({
    kraId: formValue.kraId,
    kpiName: row.kpiName.trim(),
    targetType: row.uom,                    // assuming UOM = targetType
    targetValue: String(row.targetValue),
    weightageValue: String(row.weightage),
    targetDate: row.targetDate,
    description: row.description.trim(),
    status: "Created",
    kraName: selectedKra?.kraName,
    kraWeightage: String(selectedKra?.weightageValue),
    kraEffectiveDate: selectedKra?.effectiveDate,
    kraTargetDate: selectedKra?.targetDate,
  }));

  this.http.postdata('Kpi/upsertkra', payload).subscribe({
    next: () => {
      this.modalService.dismissAll();
      this.loadKpiList();
      this.conformationPopup.openSuccessModal('KPIs created successfully');
    },
    error: (err) => {
      console.error(err);
      this.conformationPopup.openErrorModal(err.error?.message || 'Failed to create KPIs');
    },
    complete: () => {
      this.isSubmitting = false;
      this.kpiForm.reset();
      this.kpiRows.clear();
    }
  });
}

  hasAnyActionPermission(): boolean {
    return (
      this.rbac.allowedToAccess('Update KPI.view') ||
      this.rbac.allowedToAccess('View KPI.view')
    );
  }

  onUpdate(kpi: any) {
    alert('Update: ' + (kpi.kpiTitle || kpi.kpiName));
  }

  onView(kpi: any) {
    alert('View: ' + (kpi.kpiTitle || kpi.kpiName));
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
