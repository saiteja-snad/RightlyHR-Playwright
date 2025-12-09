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

  loadKpiList() {
    const params = {
      page: this.page,
      pageSize: this.rows,
      ...(this.searchText && { searchQuery: this.searchText }),
    };

    this.dataload = true;
    this.subscription = this.http.getpagentiontData('kpi', params).subscribe({
      next: (res: any) => {
        this.kpiList = res.items || [];
        this.collectionSize = res.totalCount || 0;
        this.filteredDetails = this.kpiList;
        this.dataload = false;
      },
      error: (err) => {
        console.error(err);
        this.dataload = false;
      },
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

    const formValue = this.kpiForm.getRawValue(); // safer for typed reactive forms

    const kpiRowsValue = this.kpiRows.getRawValue(); // always FormArray[], never undefined

    const payload = {
      kraId: formValue.kraId,
      weightage: String(formValue.weightage),
      effectiveDate: formValue.effectiveDate,
      targetDate: formValue.targetDate,

      kpis: kpiRowsValue.map((row) => ({
        kpiName: row.kpiName.trim(),
        weightage: String(row.weightage),
        unitOfMeasurement: row.uom,
        targetValue: String(row.targetValue),
        targetDate: row.targetDate,
        description: row.description.trim(),
      })),
    };

    this.http.postdata('kpi/bulk', payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadKpiList();
        alert('KPIs created successfully!');
      },
      error: (err) => {
        console.error('Error:', err);
        alert(
          'Failed to create KPIs: ' + (err.error?.message || 'Unknown error')
        );
      },
      complete: () => {
        this.isSubmitting = false;
        this.kpiForm.reset();
        this.kpiRows.clear();
      },
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
