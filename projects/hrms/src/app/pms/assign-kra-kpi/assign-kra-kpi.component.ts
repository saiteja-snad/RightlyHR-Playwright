import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
// assign-kra-kpi.component.ts
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { TableModule, Table } from 'primeng/table';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { IRole } from '../../Interfaces/letters-model';
import { IDepartment } from '../apprisal-list/review-cycle-emp.model';

@Component({
  selector: 'app-assign-kra-kpi',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SelectModule,
    TableModule,
    DataLoaderContentComponent,
    NoDataFoundComponent,
    ModuleInformationComponent,
    ModuleInfoIconComponent,
    NgbPopoverModule,
    PaginatorModule,
    MultiSelectModule,
  ],
  templateUrl: './assign-kra-kpi.component.html',
  styleUrl: './assign-kra-kpi.component.scss',
})
export class AssignKraKpiComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  private fb = inject(FormBuilder);
  private http = inject(HttpService);
  private modalService = inject(NgbModal);
  private popup = inject(OpenModalService);
  private router = inject(Router);

  kraList: any[] = [];
  allKraData: any[] = []; // For filtering/sorting in table
  selectedKraKpis: any[] = [];
  allKpiOptions: any[] = []; // For KPI dropdown in modal
  isSubmitting = false;
  moduleinfo = '';

  // Table selection logic
  selectedItems: any[] = [];
  multiSelect = false;
  dataLoad = false;
  previousSearchValue = '';
  hasSelectedAllOnce = false;

  page = 1;
  rows = 10;
  first = 0;
  collectionSize = 0;
  searchText = ''; // Replace searchValue
  dataload = false; // Replace dataLoad
  kraListForDropdown: any[] = [];
  joblocid: string = '';

  // Static dropdown options
  reviewCycleOptions: { label: string; value: string }[] = [];
  ratingScaleOptions: { label: string; value: string }[] = [];

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  uomOptions = [
    { label: 'Percentage (%)', value: '%' },
    { label: 'Currency ($)', value: '$' },
    { label: 'Numbers (Nos)', value: 'Nos' },
    { label: 'Hours (Hrs)', value: 'Hrs' },
    { label: 'Days', value: 'Days' },
    { label: 'Rating', value: 'Rating' },
  ];

  filterForm = this.fb.group({
    jobRole: [null],
    department: [[]], // ← Array for multi-select
    team: [[]],
    location: [null],
    subLocation: [null],
  });

  activeEmplist = [] as any;
  JobroleDesignation = [] as IRole[];
  departmentDetails = [] as IDepartment[];
  teamDropdownValues: any[] = [];
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  selectedlocationid: any;
  filteredEmployees: any[] = []; // Will hold the list from JobDetails API
  selectedEmployeeIds: string = '';

  assignForm = this.fb.group({
    kraId: [null, Validators.required],
    weightage: [
      null,
      [Validators.required, Validators.min(1), Validators.max(100)],
    ],
    effectiveDate: ['', Validators.required],
    targetDate: ['', Validators.required],
    reviewCycle: ['', Validators.required],
    ratingScale: ['', Validators.required],
    kpiRows: this.fb.array([]),
  });

  get kpiRows(): FormArray {
    return this.assignForm.get('kpiRows') as FormArray;
  }

  get totalExistingWeightage(): number {
    return this.selectedKraKpis.reduce(
      (sum, kpi) => sum + (Number(kpi.weightageValue) || 0),
      0
    );
  }

  get totalNewKpiWeightage(): number {
    return this.kpiRows.controls.reduce(
      (sum, row) => sum + Number(row.get('weightage')?.value || 0),
      0
    );
  }

  canAddRow(): boolean {
    return this.totalNewKpiWeightage < 100;
  }

  ngOnInit(): void {
    this.loadKraList();
    this.loadAllKpis(); // Load all KPIs for dropdown in modal
    this.updateModuleInfo();
    this.loadReviewCycles();
    this.loadRatingScales();
    this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters());
    this.getAllEmployeeDetails();
    this.getJobDesignation();
    this.getDepartment();
    this.getjobLocationList();
  }

  updateModuleInfo() {
    const url = this.router.url;
    // this.moduleinfo = url.includes('/pms/kpi') ? MODULE_INFOS.PMS_KPI_LIST_MODULE_INFO : '';
  }

  getAllEmployeeDetails() {
    const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${status}`)
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            }  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
            value: employee.employeeId,
          }));
        },
      });
  }

  getJobDesignation() {
    this.http.getData('DesignationGradeMapper?sort=designationName').subscribe({
      next: (data: any) => {
        this.JobroleDesignation = data as IRole[];
      },
      error: () => {
        console.error('Error fetching job designations');
      },
    });
  }

  getDepartment() {
    this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
    });
  }

  onDepartmentChange(selectedDepartments: any[]): void {
    const departmentIds = selectedDepartments?.map((d) => d.sno) || [];

    if (departmentIds.length === 0) {
      this.teamDropdownValues = [];
      this.JobroleDesignation = []; // Clear job roles if no department
      return;
    }

    const departmentIdStr = departmentIds.join(',');

    // Load Teams (existing)
    this.http
      .getData(`Subdepartments/Getnames/V2/${departmentIdStr}`)
      .subscribe({
        next: (data: any) => {
          this.teamDropdownValues = data || [];
          // After teams are loaded, if there are already selected teams, trigger job details
          this.loadJobDetailsIfPossible();
        },
        error: () => {
          this.teamDropdownValues = [];
        },
      });
  }

  private loadJobDetailsIfPossible(): void {
    const selectedDepts = this.filterForm.get('department')?.value || [];
    const selectedTeams = this.filterForm.get('team')?.value || [];

    const deptIds = selectedDepts
      .map((d: any) => d.sno)
      .filter(Boolean)
      .join(',');
    const teamIds = selectedTeams
      .map((t: any) => t.sno || t.id || t.subdepartmentId)
      .filter(Boolean)
      .join(',');

    if (!deptIds) {
      this.filteredEmployees = [];
      this.selectedEmployeeIds = '';
      this.page = 1; // Reset page
      this.first = 0; // Critical for PrimeNG paginator
      this.applyFilters();
      return;
    }

    let query = `departmentId=${deptIds}`;
    if (teamIds) query += `&teamId=${teamIds}`;

    this.http.getData(`JobDetails/getdepartmentteam?${query}`).subscribe({
      next: (res: any) => {
        const employees = Array.isArray(res) ? res : res.data || [];

        this.filteredEmployees = employees;
        this.selectedEmployeeIds = employees
          .map((emp: any) => emp.employeeId)
          .filter(Boolean)
          .join(',');

        // Reset pagination before applying new filter
        this.page = 1;
        this.first = 0;

        this.applyFilters(); // This will now load correct page 1 data
      },
      error: (err) => {
        console.error('Failed to load employees by dept/team', err);
        this.filteredEmployees = [];
        this.selectedEmployeeIds = '';
        this.page = 1;
        this.first = 0;
        this.applyFilters();
      },
    });
  }

  onTeamChange(selectedTeams: any[]): void {
    this.loadJobDetailsIfPossible(); // Re-fetch job roles whenever team changes
  }

  //function to get joblocations in to a dropdown
  getjobLocationList() {
    this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data;
      },
    });
  }

  getSubLocationByid(selectedLocations: any[]): void {
  if (!selectedLocations || selectedLocations.length === 0) {
    this.subLocationsDropdown = [];
    this.joblocid = '';
    // Clear location-based employee filter
    this.loadEmployeesByLocation();
    return;
  }

  this.joblocid = selectedLocations.map(loc => loc.id).join(',');

  this.http.get(`SubLocation/getsublocations?joblocid=${this.joblocid}`).subscribe({
    next: (data: any) => {
      this.subLocationsDropdown = data || [];
      // After loading sub-locations, trigger employee fetch
      this.loadEmployeesByLocation();
    },
    error: () => {
      this.subLocationsDropdown = [];
      this.loadEmployeesByLocation(); // still try to fetch with only location
    }
  });
}

onSubLocationChange(selectedSubLocations: any[]): void {
  this.loadEmployeesByLocation();
}

  private loadEmployeesByLocation(): void {
  const selectedLocations = this.filterForm.get('location')?.value || [];
  const selectedSubLocations = this.filterForm.get('subLocation')?.value || [];

  const locationIds = selectedLocations
    .map((loc: any) => loc.id)
    .filter(Boolean)
    .join(',');

  const subLocationIds = selectedSubLocations
    .map((sub: any) => sub.id || sub.sno)
    .filter(Boolean)
    .join(',');

  // If no location selected → clear employee filter
  if (!locationIds) {
    this.filteredEmployees = [];
    this.selectedEmployeeIds = '';
    this.page = 1;
    this.first = 0;
    this.applyFilters();
    return;
  }

  let query = `locationId=${locationIds}`;
  if (subLocationIds) {
    query += `&subLocationId=${subLocationIds}`;
  }

  this.http.getData(`JobDetails/getlocationsublocation?${query}`).subscribe({
    next: (res: any) => {
      const employees = Array.isArray(res) ? res : (res.data || []);

      this.filteredEmployees = employees;
      this.selectedEmployeeIds = employees
        .map((emp: any) => emp.employeeId)
        .filter(Boolean)
        .join(',');

      // Reset pagination and apply filter
      this.page = 1;
      this.first = 0;
      this.applyFilters();
    },
    error: (err) => {
      console.error('Failed to load employees by location', err);
      this.filteredEmployees = [];
      this.selectedEmployeeIds = '';
      this.page = 1;
      this.first = 0;
      this.applyFilters();
    }
  });
}

  loadReviewCycles(): void {
    this.http.getData('reviewCycleHeader/getallnames').subscribe({
      next: (res: any) => {
        // Response is direct array → no .data wrapper
        if (Array.isArray(res)) {
          this.reviewCycleOptions = res.map((item: any) => ({
            label: item.reviewCycleName,
            value: item.id, // Use ID as value (best practice)
          }));
        } else {
          this.reviewCycleOptions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load review cycles', err);
        this.popup.openErrorModal('Failed to load review cycles');
        this.reviewCycleOptions = [];
      },
    });
  }

  loadRatingScales(): void {
    this.http.getData('Form/getallratings').subscribe({
      next: (res: any) => {
        // Response is direct array → no .data wrapper
        if (Array.isArray(res)) {
          this.ratingScaleOptions = res.map((item: any) => ({
            label: `${item.minimumRatingScale} - ${item.maximumRatingScale}`,
            value: item.id, // Use ID as value (recommended)
            // Or use: value: `${item.minimumRatingScale}-${item.maximumRatingScale}` if no id
          }));
        } else {
          this.ratingScaleOptions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load rating scales', err);
        this.popup.openErrorModal('Failed to load rating scales');
        this.ratingScaleOptions = [];
      },
    });
  }

  loadKraList(): void {
    const params = {
      pageNumber: this.page,
      pageSize: this.rows,
      ...(this.searchText && { searchQuery: this.searchText }),
    };

    this.dataload = true;
    this.http.getDataIncludeParams('Kra/getAll', params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.kraListForDropdown = res.data || [];
          this.collectionSize = res.pagination?.totalRecords || 0;
        } else {
          this.kraListForDropdown = [];
          this.collectionSize = 0;
        }
        this.dataload = false;
      },
      error: (err) => {
        console.error('Failed to load KRAs', err);
        this.kraListForDropdown = [];
        this.collectionSize = 0;
        this.dataload = false;
      },
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.getRawValue(); // Use getRawValue() to get actual values

    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
    };

    // Only add param if value exists and is not null/undefined
    if (this.searchText?.trim()) {
      params.searchQuery = this.searchText.trim();
    }
    if (filters.jobRole) {
      params.designationId = filters.jobRole;
    }

    if (this.selectedEmployeeIds) {
      params.employeeIds = this.selectedEmployeeIds;
    }

    this.loadAssignedKraKpiListWithFilters(params);
  }

  // New method — for showing assigned KRA/KPI records in the table
  loadAssignedKraKpiListWithFilters(params: any): void {
    this.dataload = true;
    this.http.getDataIncludeParams('Kpi/getAllAssignKpiKra', params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.kraList =
            res.data?.map((x: any) => ({
              ...x,
              employeedata: {
                ...x.employeedata,
                fullName: [
                  x.employeedata.firstName,
                  x.employeedata.middleName,
                  x.employeedata.lastName,
                ]
                  .filter(Boolean) // remove empty values
                  .join(' ') // join with space
                  .trim(),
              },
            })) || [];

          this.collectionSize = res.pagination?.totalRecords || 0;
        }
        this.dataload = false;
      },
      error: () => {
        this.kraList = [];
        this.collectionSize = 0;
        this.dataload = false;
      },
    });
  }

  private getCurrentFilters(): any {
    const filters = this.filterForm.getRawValue();

    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
    };

    if (this.searchText?.trim()) {
      params.searchQuery = this.searchText.trim();
    }
    if (filters.jobRole) params.designationId = filters.jobRole;
    if (filters.department) params.departmentId = filters.department;
    if (filters.team) params.subDepartmentId = filters.team;
    if (filters.location) params.locationId = filters.location;
    if (filters.subLocation) params.subLocationId = filters.subLocation;

    return params;
  }

  loadAllKpis(): void {
    this.http.getData('Kpi/getAll').subscribe({
      next: (res: any) => {
        if (res.success) {
          this.allKpiOptions = res.data || [];
        }
      },
      error: (err) => {
        console.error('Failed to load KPIs', err);
        this.popup.openErrorModal('Failed to load KPI list');
      },
    });
  }

  onSelectionChange(value: any[]) {
    this.multiSelect = value.length > 0;
    this.selectedItems = value || [];
  }

  onKraSelected(): void {
    const kraId = this.assignForm.get('kraId')?.value;
    if (!kraId) {
      this.selectedKraKpis = [];
      return;
    }

    // Load assigned KPIs only—not auto populate form fields
    this.http.getDataIncludeParams('Kpi/getAll', { kraId }).subscribe({
      next: (res: any) => {
        this.selectedKraKpis = res.data || [];
      },
      error: () => {
        this.selectedKraKpis = [];
        this.popup.openErrorModal('Failed to load existing KPIs');
      },
    });
  }

  addKpiRow(): void {
    if (!this.canAddRow()) {
      this.popup.openErrorModal('Total weightage cannot exceed 100%');
      return;
    }

    this.kpiRows.push(
      this.fb.group({
        kpiId: [null], // For selecting existing KPI
        uom: ['', Validators.required],
        weightage: [
          null,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        targetValue: [null, Validators.required],
        targetDate: ['', Validators.required],
        description: ['', [Validators.required, Validators.minLength(10)]],
      })
    );
  }

  removeKpiRow(index: number): void {
    this.kpiRows.removeAt(index);
  }

  openAssignModal(content: any): void {
    this.assignForm.reset();
    this.kpiRows.clear();
    this.selectedKraKpis = [];

    // Explicitly reset new fields
    this.assignForm.patchValue({
      kraId: null,
      weightage: null,
      effectiveDate: '',
      targetDate: '',
      reviewCycle: '',
      ratingScale: '',
    });

    this.addKpiRow(); // Start with one row
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
  }

  onSubmitAssign(): void {
    if (
      this.assignForm.invalid ||
      this.kpiRows.length === 0 ||
      this.totalNewKpiWeightage > 100
    ) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = user?.employeeId || 0;

    this.isSubmitting = true;

    const formValue = this.assignForm.getRawValue();

    // Get selected employee IDs from table selection
    const selectedEmployeeIds = this.selectedItems
      .map((item: any) => item.employeeId)
      .filter(Boolean)
      .join(',');

    // Find the selected KRA to get its name and category
    const selectedKra = this.kraListForDropdown.find(
      (k) => k.kraId === formValue.kraId
    );
    if (!selectedKra) {
      this.popup.openErrorModal('Selected KRA not found');
      this.isSubmitting = false;
      return;
    }

    // Build KPIs array
    const kpis = this.kpiRows.getRawValue().map((row: any) => ({
      kpiId: row.kpiId || 0,
      kraId: formValue.kraId,
      kpiName: this.getKpiNameById(row.kpiId),
      weightageValue: String(row.weightage || 0),
      targetValue: String(row.targetValue || ''),
      targetDate: row.targetDate || null,
      targetType: row.uom || '',
      description: row.description?.trim() || '',
      reviewCycleId: Number(formValue.reviewCycle),
      ratingScaleId: Number(formValue.ratingScale),
      createdBy: employeeId,
      updatedBy: employeeId,
    }));

    // Final payload matching your API
    const payload = {
      kraId: formValue.kraId,
      kraName: selectedKra.kraName,
      kraCategoryId: selectedKra.kraCategoryId || selectedKra.categoryId || 0,
      kraCategoryName: selectedKra.kraCategoryName || '',
      employeeIds: selectedEmployeeIds,
      effectiveDate: formValue.effectiveDate,
      targetDate: formValue.targetDate,
      weightageValue: String(selectedKra.weightageValue || 100),
      reviewCycleId: Number(formValue.reviewCycle),
      ratingScaleId: Number(formValue.ratingScale),
      status: 'Active',
      createdBy: employeeId,
      updatedBy: employeeId,
      kpis: kpis,
    };

    console.log('Submitting payload:', payload); // For debugging

    this.http.postdata('Kpi/updatekrakpi', payload).subscribe({
      next: (res: any) => {
        this.popup.openSuccessModal('KRA & KPIs assigned successfully!');
        this.modalService.dismissAll();
        this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters()); // Refresh table
        this.selectedItems = []; // Clear selection
      },
      error: (err: any) => {
        console.error('Assignment failed:', err);
        this.popup.openErrorModal(
          err.error?.message || 'Failed to assign KRA/KPIs. Please try again.'
        );
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
  getKpiNameById(id: number | null): string {
    if (!id) return 'Select KPI';
    const found = this.allKpiOptions.find((k) => k.kpiId === id);
    return found ? found.kpiName : 'Select KPI';
  }

  onSearchTextChange(): void {
    this.page = 1;
    this.first = 0;
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters());
  }

  onPageSizeChange(newSize: number): void {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters());
  }

  onUpdate(kraAssignment: any): void {
    // Open the same modal in edit mode
    this.assignForm.patchValue({
      kraId: kraAssignment.kraId,
      weightage: kraAssignment.weightageValue,
      effectiveDate: kraAssignment.effectiveDate?.split('T')[0],
      targetDate: kraAssignment.targetDate?.split('T')[0],
      reviewCycle:
        kraAssignment.reviewCycleData?.id || kraAssignment.reviewCycleId,
      ratingScale: kraAssignment.ratingScaleId || kraAssignment.ratingScale,
    });

    // Load existing KPIs for this assignment (if needed)
    this.selectedKraKpis = kraAssignment.kpis || [];

    // Clear and repopulate KPI rows if you have them
    this.kpiRows.clear();
    // If you have KPI data in kraAssignment.kpis, map them here
    // Example:
    // (kraAssignment.kpis?.forEach((kpi: any) => this.addKpiRowWithData(kpi));

    // this.modalService.open(this.assignKraKpiModal, {
    //   centered: true,
    //   backdrop: 'static',
    //   size: 'xl'
    // });
  }

  onHold(kraAssignment: any): void {
    if (confirm(`Put "${kraAssignment.employeeName}"'s KRA on Hold?`)) {
      const payload = {
        assignmentId: kraAssignment.id, // or whatever your ID field is
        status: 'On Hold',
        updatedBy:
          JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
            ?.employeeId || 0,
      };

      this.http.postdata('KraAssignment/hold', payload).subscribe({
        next: () => {
          this.popup.openSuccessModal('KRA assignment put on hold');
          this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters()); // Refresh table
        },
        error: (err) => {
          this.popup.openErrorModal(
            err.error?.message || 'Failed to hold assignment'
          );
        },
      });
    }
  }

  get topWeightageExceeds(): boolean {
    return Number(this.assignForm.get('weightage')?.value || 0) > 100;
  }

  clearAllFilters(): void {
    this.filterForm.reset();
    this.searchText = '';
    this.selectedEmployeeIds = '';
    this.filteredEmployees = [];
    this.teamDropdownValues = [];
    this.subLocationsDropdown = [];

    this.page = 1;
    this.first = 0;

    this.loadAssignedKraKpiListWithFilters({
      pageNumber: 1,
      pageSize: this.rows,
    });
  }
}
