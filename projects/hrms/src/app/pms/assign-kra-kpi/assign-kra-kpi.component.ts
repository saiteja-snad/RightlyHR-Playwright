import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
// assign-kra-kpi.component.ts
import {
  Component,
  OnInit,
  inject,
  ViewChild,
  TemplateRef,
} from '@angular/core';
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
import { ChipModule } from 'primeng/chip';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { MODULE_INFOS } from '../../shared/modules-info';
import { RbacService } from '../../services/rbac.service';


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
    ChipModule,
    AccordionModule,
    CheckboxModule,
    ChipModule
  ],
  templateUrl: './assign-kra-kpi.component.html',
  styleUrl: './assign-kra-kpi.component.scss',
})
export class AssignKraKpiComponent implements OnInit {
  @ViewChild('dt') table!: Table;
    @ViewChild('assignKraKpiModal') assignKraKpiModal!: TemplateRef<any>;


  private fb = inject(FormBuilder);
  private http = inject(HttpService);
  private modalService = inject(NgbModal);
  private popup = inject(OpenModalService);
  private router = inject(Router);
  private offcanvasService = inject(NgbOffcanvas);
  public rbac = inject(RbacService);

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
  groupedKraList: any[] = [];

  // Static dropdown options
  reviewCycleOptions: { label: string; value: string }[] = [];
  ratingScaleOptions: { label: string; value: string }[] = [];

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  today: string = new Date().toISOString().split('T')[0];

  uomOptions = [
    { label: 'Percentage (%)', value: '%' },
    { label: 'Currency ($)', value: '$' },
    { label: 'Numbers (Nos)', value: 'Nos' },
    { label: 'Hours (Hrs)', value: 'Hrs' },
    { label: 'Days', value: 'Days' },
    { label: 'Rating', value: 'Rating' },
  ];

  filterForm = this.fb.group({
    jobRole: this.fb.control<number | null>(null),

    department: this.fb.control<any[]>([]),
    team: this.fb.control<any[]>({ value: [], disabled: true }),
    location: this.fb.control<any[]>([]),
    subLocation: this.fb.control<any[]>({ value: [], disabled: true }),
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

  selectedJobRole: any = null;
  selectedDepartments: any[] = [];
  selectedTeams: any[] = [];
  selectedLocations: any[] = [];
  selectedSubLocations: any[] = [];

  assignKpiList: any[] = [];
  selectedEmployeeId!: number;
  selectedEmployeeName: string = '';
   isEditMode: boolean = false;
    selectedKra: any;

voidKpis: any[] = [];               // Track KPIs marked for deletion (void)
originalKpis: any[] = [];           // Backup of original KPIs (optional, for safety)
selectedKraAssignment: any;



  assignForm = this.fb.group({
    kraId: [null, Validators.required],
    weightage: [
      null,
      [Validators.required, Validators.min(1), Validators.max(100)],
    ],
    effectiveDate: ['', [Validators.required, this.noPastDateValidator]],
    targetDate: ['', [Validators.required, this.noPastDateValidator]],
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

  canSubmitKpiWeightage(): boolean {
    return this.totalNewKpiWeightage <= 100;
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
    this.moduleinfo = url.includes('/pms/assign-kra-kpi') ? MODULE_INFOS.PMS_KRA_KPI_ASSIGN_MODULE_INFO : '';
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
     const teamControl = this.filterForm.get('team');

    if (departmentIds.length === 0) {
      teamControl?.disable();
    teamControl?.setValue([]);
      this.teamDropdownValues = [];
      this.JobroleDesignation = []; // Clear job roles if no department
      this.onTeamChange([]);
      return;
    }
    teamControl?.enable();

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

    // Clear previous employee filter
    this.filteredEmployees = [];
    this.selectedEmployeeIds = '';

    if (!deptIds) {
      // No department → no employee filter from dept/team
      this.page = 1;
      this.first = 0;
      this.applyFilters(); // refresh table with no employee filter
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

        // Only now refresh the table after getting employees
        this.page = 1;
        this.first = 0;
        this.applyFilters();
      },
      error: () => {
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
    const subLocationControl = this.filterForm.get('subLocation');
    if (!selectedLocations || selectedLocations.length === 0) {
      subLocationControl?.disable();
    subLocationControl?.setValue([]);
      this.subLocationsDropdown = [];
      this.joblocid = '';
      this.onSubLocationChange([]);
      // Clear location-based employee filter
      this.loadEmployeesByLocation();
      return;
    }
    subLocationControl?.enable();


    this.joblocid = selectedLocations.map((loc) => loc.id).join(',');

    this.http
      .get(`SubLocation/getsublocations?joblocid=${this.joblocid}`)
      .subscribe({
        next: (data: any) => {
          this.subLocationsDropdown = data || [];
          // After loading sub-locations, trigger employee fetch
          this.loadEmployeesByLocation();
        },
        error: () => {
          this.subLocationsDropdown = [];
          this.loadEmployeesByLocation(); // still try to fetch with only location
        },
      });
  }

  onSubLocationChange(selectedSubLocations: any[]): void {
    this.loadEmployeesByLocation();
  }

  private loadEmployeesByLocation(): void {
    const selectedLocations = this.filterForm.get('location')?.value || [];
    const selectedSubLocations =
      this.filterForm.get('subLocation')?.value || [];

    const locationIds = selectedLocations
      .map((loc: any) => loc.id)
      .filter(Boolean)
      .join(',');
    const subLocationIds = selectedSubLocations
      .map((sub: any) => sub.id || sub.sno)
      .filter(Boolean)
      .join(',');

    // Clear previous
    this.filteredEmployees = [];
    this.selectedEmployeeIds = '';

    if (!locationIds) {
      this.page = 1;
      this.first = 0;
      this.applyFilters();
      return;
    }

    let query = `locationId=${locationIds}`;
    if (subLocationIds) query += `&subLocationId=${subLocationIds}`;

    this.http.getData(`JobDetails/getlocationsublocation?${query}`).subscribe({
      next: (res: any) => {
        const employees = Array.isArray(res) ? res : res.data || [];

        this.filteredEmployees = employees;
        this.selectedEmployeeIds = employees
          .map((emp: any) => emp.employeeId)
          .filter(Boolean)
          .join(',');

        this.page = 1;
        this.first = 0;
        this.applyFilters(); // Only refresh after final employee list
      },
      error: () => {
        this.filteredEmployees = [];
        this.selectedEmployeeIds = '';
        this.page = 1;
        this.first = 0;
        this.applyFilters();
      },
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
        this.ratingScaleOptions = [];
      },
    });
  }

  loadKraList(): void {
    const params = {
      pageNumber: this.page,
      pageSize: 100,
      ...(this.searchText && { search: this.searchText }),
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
      params.search = this.searchText.trim();
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
      if (res.success && Array.isArray(res.data)) {
        const processedData = res.data.map((x: any) => ({
          ...x,
          employeeId: x.employeedata.employeeId,
          employeedata: {
            ...x.employeedata,
            fullName: [
              x.employeedata.firstName,
              x.employeedata.middleName,
              x.employeedata.lastName,
            ]
              .filter(Boolean)
              .join(' ')
              .trim(),
          },
          // ✅ NEW: Transform kras array to assignments format
          assignments: x.kras || []  // Each KRA becomes one row
        }));

        this.kraList = processedData;

        const groupedMap = processedData.reduce(
          (acc: Map<number, any>, curr: any) => {
            if (!acc.has(curr.employeeId)) {
              acc.set(curr.employeeId, {
                employeeId: curr.employeeId,
                fullName: curr.employeedata.fullName,
                fusionId: curr.employeedata.fusionEmpId,
                assignments: [],
                selected: false,  // ✅ Add selected property
              });
            }
            // ✅ Add each KRA as an assignment row
            curr.assignments.forEach((kraItem: any) => {
              acc.get(curr.employeeId)!.assignments.push({
                ...kraItem,
                employeeId: curr.employeeId,  // For action buttons
                fullName: curr.employeedata.fullName,
                kpisCount: kraItem.kpisCount || 0
              });
            });
            return acc;
          },
          new Map<number, any>()
        );

        this.groupedKraList = Array.from(groupedMap.values());
        this.collectionSize = res.pagination?.totalRecords || 0;
      } else {
        this.kraList = [];
        this.groupedKraList = [];
        this.collectionSize = 0;
      }
      this.dataload = false;
    },
    error: () => {
      this.kraList = [];
      this.groupedKraList = [];
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
      params.search = this.searchText.trim();
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
        targetDate: ['', [Validators.required, this.noPastDateValidator]],
        description: ['', [Validators.required, Validators.minLength(10)]],
      })
    );
  }

removeKpiRow(index: number): void {
  const row = this.kpiRows.at(index);
  const rowValue = row.value;

  if (
    this.isEditMode &&
    rowValue.kpiId && Number(rowValue.kpiId) > 0
  ) {
    this.voidKpis.push({
      kpiId: rowValue.kpiId,
      kraId: this.assignForm.get('kraId')?.value,
      kpiName: this.getKpiNameById(rowValue.kpiId),
      weightageValue: String(rowValue.weightage),
      targetValue: String(rowValue.targetValue),
      targetDate: String(rowValue.targetDate),
      targetType: String(rowValue.uom || ''),
      description: String(rowValue.description || ''),
      status: 'void',
    });

    this.popup.openSuccessModal('KPI removed Succesfully');
  }

  // ✅ Always remove from form
  this.kpiRows.removeAt(index);
}


  openAssignModal(content: any): void {
          this.isEditMode = false;

  this.assignForm.get('kraId')?.enable();
  this.assignForm.get('weightage')?.enable();
  this.assignForm.get('effectiveDate')?.enable();
  this.assignForm.get('targetDate')?.enable();
  this.assignForm.get('reviewCycle')?.enable();
  this.assignForm.get('ratingScale')?.enable();
    this.assignForm.reset();
    this.kpiRows.clear();
    this.selectedKraKpis = [];
    this.voidKpis = [];

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
      backdrop: 'static',
      size: 'xl',
    });
  }

onSubmitAssign(): void {
  let selectedEmployeeIds: string;

  if (this.isEditMode) {
    // Update mode: single employee from the clicked row
    if (!this.selectedKraAssignment?.employeeId) {
      this.popup.openErrorModal('No employee selected for update');
      return;
    }
    selectedEmployeeIds = this.selectedKraAssignment.employeeId.toString();
  } else {
    // Assign mode: multiple employees from checkboxes
    const selectedEmployees = this.groupedKraList
      .filter((emp) => emp.selected === true)
      .map((emp) => emp.employeeId);

    if (selectedEmployees.length === 0) {
      this.popup.openErrorModal('Please select at least one employee');
      return;
    }
    selectedEmployeeIds = selectedEmployees.join(',');
  }

  // 2. Basic validations
  if (
    this.assignForm.invalid ||
    this.kpiRows.length === 0 ||
    this.totalNewKpiWeightage > 100
  ) {
    return;
  }

  const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  const loggedInEmployeeId = user?.employeeId || 0;

  this.isSubmitting = true;

  const formValue = this.assignForm.getRawValue();

  const selectedKra = this.kraListForDropdown.find(
    (k) => k.kraId === formValue.kraId
  );

  if (!selectedKra) {
    this.popup.openErrorModal('Selected KRA not found');
    this.isSubmitting = false;
    return;
  }

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
    status: row.status || 'Active',
    createdBy: loggedInEmployeeId,
    updatedBy: loggedInEmployeeId,
    employeeIds: selectedEmployeeIds,
  }));

  // 4. Append void KPIs only in edit mode
  if (this.isEditMode && this.voidKpis.length > 0) {
    const voidPayload = this.voidKpis.map((voidKpi: any) => ({
      ...voidKpi,
      status: 'void',
      createdBy: loggedInEmployeeId,
      updatedBy: loggedInEmployeeId,
      employeeIds: selectedEmployeeIds,
    }));
    kpis.push(...voidPayload);
  }

  // 5. Final payload
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
    createdBy: loggedInEmployeeId,
    updatedBy: loggedInEmployeeId,
    kpis: kpis,
  };

  console.log('Submitting payload:', payload);

  this.http.postdata('Kpi/updatekrakpi', payload).subscribe({
    next: () => {
      this.modalService.dismissAll();
      this.popup.openSuccessModal('KRA & KPIs updated successfully!');
      this.clearAllFilters();
      this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters());

      this.groupedKraList.forEach((emp) => (emp.selected = false));
      this.voidKpis = [];           // Clear after success
    },
    error: (err: any) => {
      console.error('Assignment failed:', err);
      this.popup.openErrorModal(
        err.error?.message || 'Failed to assign/update KRA/KPIs'
      );
      this.isSubmitting = false;
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
  this.isEditMode = true;

    this.assignForm.get('kraId')?.disable();
  this.assignForm.get('weightage')?.disable();
  this.assignForm.get('effectiveDate')?.disable();
  this.assignForm.get('targetDate')?.disable();
  this.assignForm.get('reviewCycle')?.disable();
  this.assignForm.get('ratingScale')?.disable();

  this.selectedKraAssignment = kraAssignment;
  this.voidKpis = [];                          // Reset deleted list
  this.originalKpis = JSON.parse(JSON.stringify(kraAssignment.kpis || [])); // Backup

  const firstKpi = kraAssignment.kpis?.[0];

  if (!firstKpi || !kraAssignment.kra) {
    this.popup.openErrorModal('No KRA/KPI data found for update');
    return;
  }

  // Patch form with existing KRA data
  this.assignForm.patchValue({
    kraId: kraAssignment.kra.kraId,
    weightage: kraAssignment.kra.weightageValue,
    effectiveDate: kraAssignment.kra.effectiveDate?.split('T')[0] || '',
    targetDate: firstKpi.kraTargetDate?.split('T')[0] || '',
    reviewCycle: firstKpi.reviewCycleData?.id,
    ratingScale: firstKpi.optionsRating?.id,
  });

  this.kpiRows.clear();

  kraAssignment.kpis?.forEach((kpi: any) => {
    const targetDateValue = kpi.targetDate ? kpi.targetDate.split('T')[0] : '';
    this.kpiRows.push(
      this.fb.group({
        kpiId: [{ value: kpi.kpiId || null, disabled: true }],
        uom: [kpi.targetType || ''],
        weightage: [Number(kpi.weightageValue) || 0],
        targetValue: [kpi.targetValue || ''],
        targetDate: [targetDateValue, [Validators.required, this.noPastDateValidator]],
        description: [kpi.description || ''],
        status: [kpi.status || 'Created'],           // Preserve original status
      })
    );
  });

  this.modalService.open(this.assignKraKpiModal, {
    backdrop: 'static',
    size: 'xl'
  });
}


  private addKpiRowWithData(kpi: any) {
  this.kpiRows.push(
    this.fb.group({
      kpiId: [kpi.kpiId || null, Validators.required],
      uom: [kpi.targetType || null],
      weightage: [kpi.weightageValue || 0, [Validators.required, Validators.min(1), Validators.max(100)]],
      targetValue: [kpi.targetValue || '', Validators.required],
      targetDate: [kpi.targetDate ? kpi.targetDate.split('T')[0] : '', Validators.required],
      description: [kpi.description || ''],
    })
  );
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

  isFilterApplied(): boolean {
return this.getSelectedFilters().length > 0;
  }

getSelectedFilters(): any[] {
  const filters: any[] = [];
  const formValue = this.filterForm.getRawValue();

  // Department
  if (formValue.department?.length) {
    formValue.department.forEach((dept: any) => {
      filters.push({
        type: 'department',
        label: dept.departmentName,
        value: dept,
      });
    });
  }

  // Team
  if (formValue.team?.length) {
    formValue.team.forEach((team: any) => {
      filters.push({
        type: 'team',
        label: team.subdepartmentName || team.name,
        value: team,
      });
    });
  }

  // Location
  if (formValue.location?.length) {
    formValue.location.forEach((loc: any) => {
      filters.push({
        type: 'location',
        label: loc.jobLocationName,
        value: loc,
      });
    });
  }

  // Sub Location
  if (formValue.subLocation?.length) {
    formValue.subLocation.forEach((sub: any) => {
      filters.push({
        type: 'subLocation',
        label: sub.jobSubLocationName || sub.name,
        value: sub,
      });
    });
  }

  return filters;
}

removeFilter(filter: any) {
  const current = this.filterForm.getRawValue();

  if (filter.type === 'department') {
    const updated = (current.department ?? []).filter((d: any) => d.sno !== filter.value.sno);
    this.filterForm.patchValue({ department: updated });
    this.onDepartmentChange(updated);
  } else if (filter.type === 'team') {
    const updated = (current.team ?? []).filter((t: any) =>
      (t.sno || t.id || t.subdepartmentId) !== (filter.value.sno || filter.value.id || filter.value.subdepartmentId)
    );
    this.filterForm.patchValue({ team: updated });
    this.onTeamChange(updated);
  } else if (filter.type === 'location') {
    const updated = (current.location ?? []).filter((l: any) => l.id !== filter.value.id);
    this.filterForm.patchValue({ location: updated });
    this.getSubLocationByid(updated);
  } else if (filter.type === 'subLocation') {
    const updated = (current.subLocation ?? []).filter((s: any) =>
      (s.id || s.sno) !== (filter.value.id || filter.value.sno)
    );
    this.filterForm.patchValue({ subLocation: updated });
    this.onSubLocationChange(updated);
  }

  // Refresh table
  this.page = 1;
  this.first = 0;
  this.applyFilters();
}


  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  get canOpenAssignModal(): boolean {
    const hasFilter = this.isFilterApplied();

    const hasSelection = this.groupedKraList?.some(
      (emp) => emp.selected === true
    );

    return hasFilter || hasSelection;
  }

  openAssignedKpiCanvas(
    content: TemplateRef<any>,
    kra: any,
    employeeId: number,
    employeeName: string
  ) {
    this.selectedEmployeeId = employeeId;
    this.selectedEmployeeName = employeeName;
    this.selectedKra = kra;

    this.loadKpisForEmployee(employeeId);
    this.loadKpisForKra(kra);

    setTimeout(() => {
      this.offcanvasService.open(content, {
        position: 'end',
        backdrop: 'static',
        panelClass: 'custom-kpi-canvas',
      });
    }, 200);
  }

  closeAssignedKpiCanvas() {
    this.offcanvasService.dismiss();
  }



loadKpisForKra(kra: any) {
  this.assignKpiList = [];

  // ✅ SHOW ONLY THIS SPECIFIC KRA's KPIs
  if (kra?.kpis && kra.kpis.length > 0) {
    kra.kpis.forEach((kpi: any) => {
      this.assignKpiList.push({
        ...kpi,
        kpiName: kpi.kpiName,
        weightageValue: kpi.weightageValue,
        targetValue: kpi.targetValue,
        targetType: kpi.targetType,
        targetDate: kpi.targetDate,
        kraName: kpi.kraName || kra.kra?.kraName,
        description: kpi.description
      });
    });
  }

  console.log('🔥 KPIs for KRA:', kra.kra?.kraName, this.assignKpiList);
}


loadKpisForEmployee(employeeId: number) {
  const employeeData = this.kraList.filter(
    (k) => k.employeeId === employeeId
  );

  this.assignKpiList = [];

  employeeData.forEach((emp) => {
    // ✅ NEW: Extract from kras array
    if (emp.kras && emp.kras.length) {
      emp.kras.forEach((kraItem: any) => {
        if (kraItem.kpis && kraItem.kpis.length) {
          kraItem.kpis.forEach((kpi: any) => {
            this.assignKpiList.push({
              ...kpi,
              // ✅ Ensure all required fields are available
              kpiName: kpi.kpiName,
              weightageValue: kpi.weightageValue,
              targetValue: kpi.targetValue,
              targetType: kpi.targetType,
              targetDate: kpi.targetDate,
              kraName: kpi.kraName || kraItem.kra?.kraName,  // Fallback to KRA name
              description: kpi.description
            });
          });
        }
      });
    }
  });

  console.log('assignKpiList populated:', this.assignKpiList);
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

  getKraProgress(kra: any): number {
  if (!kra?.kpis || kra.kpis.length === 0) {
    return 0;
  }

  const total = kra.kpis.reduce(
    (sum: number, kpi: any) => sum + Number(kpi.weightageValue || 0),
    0
  );

  return Math.round(total / kra.kpis.length);
}

getProgressClass(value: number): string {
  if (value >= 80) return 'bg-success';
  if (value >= 50) return 'bg-warning';
  return 'bg-danger';
}

get isDepartmentSelected(): boolean {
  const dept = this.filterForm.get('department')?.value;
  return Array.isArray(dept) && dept.length > 0;
}

get isLocationSelected(): boolean {
  const loc = this.filterForm.get('location')?.value;
  return Array.isArray(loc) && loc.length > 0;
}

private noPastDateValidator(control: import('@angular/forms').AbstractControl) {
  if (!control.value) return null;

  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate < today ? { pastDate: true } : null;
}




}
