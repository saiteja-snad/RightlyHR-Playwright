import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
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

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  // Static KRA Categories
  kraCategories = [
    { id: 1, name: 'Financial Performance' },
    { id: 2, name: 'Customer Satisfaction' },
    { id: 3, name: 'Operational Excellence' },
    { id: 4, name: 'Team Development' },
    { id: 5, name: 'Innovation & Growth' },
  ];

  isEditMode = false;
currentEditingKraId: number | null = null;

  kraForm: any;
  get f() { return this.kraForm.controls; }

  private subscription!: Subscription;
  @ViewChild('createKraModal') createKraModal: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router
  ) {
    // Form initialized safely in constructor
    this.kraForm = this.fb.group({
      categoryId: [null as number | null, Validators.required],
      kraName: ['', [Validators.required, Validators.minLength(5)]],
      effectiveDate: ['', Validators.required],
      targetDate: ['', Validators.required],
      weightageValue: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      attachment: [null as File | null],
    }, { validators: this.targetDateValidator });
  }

  ngOnInit(): void {
    this.loadKraList();
    this.updateModuleInfo();

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

  targetDateValidator(control: AbstractControl): ValidationErrors | null {
    const effective = control.get('effectiveDate')?.value;
    const target = control.get('targetDate')?.value;
    if (effective && target && new Date(target) < new Date(effective)) {
      return { targetDateBeforeEffective: true };
    }
    return null;
  }

  getCategoryName(id: number): string {
    return this.kraCategories.find(c => c.id === id)?.name || '-';
  }

 onSubmitKra() {
  if (this.kraForm.invalid) return;

  this.isSubmitting = true;

  const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  const employeeId = user?.employeeId || 0;

  const payload = {
    kraId: this.isEditMode ? this.currentEditingKraId : 0,
    categoryId: this.kraForm.value.categoryId,
    kraName: this.kraForm.value.kraName?.trim(),
    effectiveDate: this.kraForm.value.effectiveDate,
    targetDate: this.kraForm.value.targetDate,
    weightageValue: String(this.kraForm.value.weightageValue),
    description: this.kraForm.value.description?.trim(),
    createdBy: this.isEditMode ? undefined : employeeId,
    updatedBy: employeeId,
  };

  // Remove undefined fields (API doesn't expect them on update)
  if (!this.isEditMode) {
    delete payload.createdBy;
  }


  this.http.postdata('Kra/upsertkra', payload).subscribe({
    next: () => {
      this.modalService.dismissAll();
      this.loadKraList();
      this.conformationPopup.openSuccessModal(
        this.isEditMode ? 'KRA updated successfully' : 'KRA created successfully'
      );
    },
    error: (err) => {
      console.error('API Error:', err);
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
    effectiveDate: kra.effectiveDate.split('T')[0], // Format: YYYY-MM-DD
    targetDate: kra.targetDate.split('T')[0],
    weightageValue: kra.weightageValue,
    description: kra.description,
  });

  // Open the same modal
  this.modalService.open(this.createKraModal, { centered: true, backdrop: 'static', size: 'lg' });
}

onAssignKpi(kra: any) {
  alert(`Assign KPI to: ${kra.kraName}`);
}

onAssignByRole(kra: any) {
  alert(`Assign By Role for: ${kra.kraName}`);
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


  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
