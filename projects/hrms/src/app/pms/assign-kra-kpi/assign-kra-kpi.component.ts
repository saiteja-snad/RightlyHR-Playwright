import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, inject, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
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
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
@Component({
  selector: 'app-assign-kra-kpi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, SelectModule,
    TableModule, DataLoaderContentComponent, NoDataFoundComponent, ModuleInformationComponent,
    ModuleInfoIconComponent, NgbPopoverModule, PaginatorModule, MultiSelectModule, ChipModule,
    AccordionModule, CheckboxModule, InfoIconComponent],
  templateUrl: './assign-kra-kpi.component.html',
  styleUrl: './assign-kra-kpi.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AssignKraKpiComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  @ViewChild('assignKraKpiModal') assignKraKpiModal!: TemplateRef<any>;
  @ViewChild('deleteKpiConfirmation') deleteKpiConfirmation!: TemplateRef<any>;
  @ViewChild('assignToEmployeeConfirmation')
  assignToEmployeeConfirmation!: TemplateRef<any>;
  kpiToDeleteIndex: number | null = null; // Index of the row to delete
  kpiToDeleteName: string = '';
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
  collectionSize!: number;
  searchText = ''; // Replace searchValue
  dataload = false; // Replace dataLoad
  kraListForDropdown: any[] = [];
  joblocid: string = '';
  groupedKraList: any[] = [];
  // Static dropdown options
  reviewCycleOptions: { label: string; value: string }[] = [];
  ratingScaleOptions: { label: string; value: string }[] = [];
  reviewCycleFilterOptions: { label: string; value: string }[] = [];
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
    { label: 'Hours (Hrs)', value: 'Hrs' },
    { label: 'Days', value: 'Days' },
  ];
  filterForm = this.fb.group({
    jobRole: this.fb.control<number | null>(null),
    department: this.fb.control<any[]>({ value: [], disabled: true }),
    team: this.fb.control<any[]>({ value: [], disabled: true }),
    location: this.fb.control<any[]>({ value: [], disabled: true }),
    subLocation: this.fb.control<any[]>({ value: [], disabled: true }),
    reviewCycle: this.fb.control<number | null>(null), // Changed to single select
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
  voidKpis: any[] = []; // Track KPIs marked for deletion (void)
  originalKpis: any[] = []; // Backup of original KPIs (optional, for safety)
  confirmAssignKraName: string = '';
  confirmAssignEmployeeCount: number = 0;
  private pendingAssignPayload: any = null; // To store payload until user confirms
  selectedKraAssignment: any;
  assignForm = this.fb.group(
    {
      kraId: [null, Validators.required],
      weightage: [null,[Validators.required, Validators.min(1), Validators.max(100)]],
      effectiveDate: ['', [Validators.required, this.noPastDateValidator]],
      targetDate: ['', [Validators.required, this.noPastDateValidator]],
      reviewCycle: ['', Validators.required],
      ratingScale: ['', Validators.required],
      kpiRows: this.fb.array([]),
    },
    { validators: this.kraDateRangeValidator }
  );

  get kpiRows(): FormArray {
    return this.assignForm.get('kpiRows') as FormArray;
  }

  get totalExistingWeightage(): number {
    return this.selectedKraKpis.reduce((sum, kpi) => sum + (Number(kpi.weightageValue) || 0),0);
  }

  get totalNewKpiWeightage(): number {
    return this.kpiRows.controls.reduce((sum, row) => sum + Number(row.get('weightage')?.value || 0),0);
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
    this.loadFilterReviewCycles();
    // this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters());
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
    this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}
            ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
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
    this.http.getData(`Subdepartments/Getnames/V2/${departmentIdStr}`).subscribe({
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
    const deptIds = selectedDepts.map((d: any) => d.sno).filter(Boolean).join(',');
    const teamIds = selectedTeams.map((t: any) => t.sno || t.id || t.subdepartmentId).filter(Boolean).join(',');
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
        this.selectedEmployeeIds = employees.map((emp: any) => emp.employeeId).filter(Boolean).join(',');
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
    this.http.get(`SubLocation/getsublocations?joblocid=${this.joblocid}`).subscribe({
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
    const selectedSubLocations = this.filterForm.get('subLocation')?.value || [];
    const locationIds = selectedLocations.map((loc: any) => loc.id).filter(Boolean).join(',');
    const subLocationIds = selectedSubLocations.map((sub: any) => sub.id || sub.sno).filter(Boolean).join(',');
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
        this.selectedEmployeeIds = employees.map((emp: any) => emp.employeeId).filter(Boolean).join(',');
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

  loadFilterReviewCycles(): void {
    this.http.getData('reviewCycleHeader/getallnames').subscribe({
      next: (res: any) => {
        // Response is direct array → no .data wrapper
        if (Array.isArray(res)) {
          this.reviewCycleFilterOptions = res.map((item: any) => ({
            label: item.reviewCycleName,
            value: item.id, // Use ID as value (best practice)
          }));
        } else {
          this.reviewCycleFilterOptions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load review cycles', err);
        this.reviewCycleFilterOptions = [];
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
        if (Array.isArray(res)) {
          this.ratingScaleOptions = res.filter((item: any) => item.ratingType?.toLowerCase() === 'krakpi').map((item: any) => ({
            label: `${item.minimumRatingScale} - ${item.maximumRatingScale}`,
            value: item.id,
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
// loadRatingScales(): void {
//   this.http.getData('Form/getallratings').subscribe({
//     next: (res: any) => {
//       if (Array.isArray(res)) {
//         this.ratingScaleOptions = res.map(item => ({
//           label: `${item.minimumRatingScale} - ${item.maximumRatingScale}`,
//           value: item.id,
//         }));
//       } else {
//         this.ratingScaleOptions = [];
//       }
//     },
//     error: () => {
//       this.ratingScaleOptions = [];
//     }
//   });
// }

  loadKraList(): void {
    const params = {
      pageNumber: this.page,
      pageSize: 100,
      ...(this.searchText && { search: this.searchText }),
    };
    this.dataload = true;
    this.http.getDataIncludeParams('Kra/getAll').subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          this.kraListForDropdown = res.data.filter((kra: any) => kra.status === 'Active');
        } else {
          this.kraListForDropdown = [];
        }
        this.dataload = false;
      },
      error: (err) => {
        console.error('Failed to load KRAs', err);
        this.kraListForDropdown = [];
        this.dataload = false;
      },
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
    };
    if (this.searchText?.trim()) {
      params.search = this.searchText.trim();
    }
    if (filters.reviewCycle) {
      params.reviewCycleId = filters.reviewCycle;
    }
    // Only load data if review cycle is selected
    if (filters.reviewCycle) {
      this.loadAssignedKraKpiListWithFilters(params);
    }
  }

  // New method — for showing assigned KRA/KPI records in the table
  loadAssignedKraKpiListWithFilters(params: any): void {
    this.dataload = true;
    this.http.getDataIncludeParams('Kpi/getAllAssignKpiKra', params).subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          const processedData: any[] = [];
          // Auto-populate filter options from API response
          this.autoPopulateFiltersFromResponse(res.data);
          res.data.forEach((item: any) => {
            const employeeData = item.employeedata || {};
            const reviewCycle = item.reviewCycle || null;
            const kras = item.kras || [];
            // Create one entry per API record, grouping all KRAs together
            const allKpisForThisRecord: any[] = [];
            let totalKpisCount = 0;
            let totalWeightage = 0;
            if (kras.length > 0) {
              kras.forEach((kraItem: any) => {
                const kpisData = kraItem.kpis || [];
                allKpisForThisRecord.push(...kpisData);
                totalKpisCount += kraItem.kpisCount || 0;
                // Calculate total weightage from first KPI of each KRA
                if (kpisData.length > 0) {
                  totalWeightage += Number(kpisData[0].assignedKraWeightage || 0);
                }
              });
            }
            processedData.push({
              employeeId: employeeData.employeeId,
              employeedata: {
                ...employeeData,
                fullName: [
                  employeeData.firstName,
                  employeeData.middleName,
                  employeeData.lastName,
                ].filter(Boolean).join(' ').trim(),
              },
              reviewCycle: reviewCycle,
              kras: kras,
              allKpis: allKpisForThisRecord,
              totalKpisCount: totalKpisCount,
              totalWeightage: totalWeightage
            });
          });
          this.kraList = processedData;
          // Create accordion items - one per API record
          this.groupedKraList = processedData.map((curr: any) => {
            return {
              employeeId: curr.employeeId,
              fullName: curr.employeedata.fullName,
              fusionId: curr.employeedata.fusionEmpId,
              reviewCycleName: curr.reviewCycle?.reviewCycleName || '-',
              selected: false,
              totalKraWeightage: curr.totalWeightage,
              assignments: curr.kras.map((kraItem: any) => ({
                ...kraItem.kra,
                employeeId: curr.employeeId,
                fullName: curr.employeedata.fullName,
                kpis: kraItem.kpis || [],
                kpisCount: kraItem.kpisCount || 0,
                individualWeightage: kraItem.kpis?.length > 0 ? Number(kraItem.kpis[0].assignedKraWeightage || 0) : 0,
              }))
            };
          })
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

  // Get EmpAssignedStatus from the first KPI of the first assignment (safe fallback)
  getEmpAssignedStatus(emp: any): string {
    if (emp.assignments && emp.assignments.length > 0) {
      const firstAssignment = emp.assignments[0];
      if (firstAssignment.kpis && firstAssignment.kpis.length > 0) {
        return firstAssignment.kpis[0].empAssignedStatus || '-';
      }
    }
    return '-'; // fallback if no data
  }

  // Get sum of all KRA ratings for employee (accordion header rating)
  getAverageAssignedRating(emp: any): string {
    if (!emp.assignments || emp.assignments.length === 0) {
      return '-';
    }
    let totalKraRatings = 0;
    emp.assignments.forEach((assignment: any) => {
      const kraRating = this.calculateKraRating(assignment);
      totalKraRatings += kraRating;
    });
    return totalKraRatings.toFixed(1);
  }

  getKraRating(kra: any): string {
    const rating = this.calculateKraRating(kra);
    return rating > 0 ? rating.toFixed(1) : '-';
  }

  private calculateKraRating(assignment: any): number {
    if (!assignment.kpis || assignment.kpis.length === 0) {
      return 0;
    }
    let weightedKpiSum = 0;
    assignment.kpis.forEach((kpi: any) => {
      const rating = Number(kpi.assignedApproverRating) || 0;
      const kpiWeight = Number(kpi.assignedKpiWeightage) || 0;
      weightedKpiSum += rating * (kpiWeight / 100);
    });
    // Multiply by KRA weightage to get final KRA rating
    const kraWeight = Number(assignment.individualWeightage) || 0;
    const kraRating = weightedKpiSum * (kraWeight / 100);
    return kraRating;
  }

  // Optional: Add color coding for status (like your existing getStatusClass)
  // getEmpAssignedStatusClass(emp: any): string {
  //   const status = this.getEmpAssignedStatus(emp);
  //   switch (status) {
  //     case 'Created':
  //       return 'text-info';
  //     case 'Active':
  //       return 'text-success';
  //     case 'On Hold':
  //       return 'text-warning';
  //     case 'Completed':
  //       return 'text-primary';
  //     default:
  //       return 'text-muted';
  //   }
  // }

  private getCurrentFilters(): any {
    const filters = this.filterForm.getRawValue();
    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
    };
    if (this.searchText?.trim()) {
      params.search = this.searchText.trim();
    }
    if (filters.reviewCycle) {
      params.reviewCycleId = filters.reviewCycle;
    }
    return params;
  }

  loadAllKpis(): void {
    this.http.getData('Kpi/getAll').subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          this.allKpiOptions = res.data.filter((kpi: any) => kpi.status === 'Active');
        } else {
          this.allKpiOptions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load KPIs', err);
        this.allKpiOptions = [];
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
    const row = this.fb.group({
      assigneeId: [null],
      kpiId: [null, Validators.required],
      uom: [{ value: null, disabled: true }, Validators.required],
      weightage: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      targetValue: [null],
      targetDate: ['', [Validators.required, this.noPastDateValidator]],
      description: [''],
    });
    // Existing KPI selection logic (unchanged)
    row.get('kpiId')?.valueChanges.subscribe((kpiId: number | null) => {
      if (!kpiId) {
        row.get('uom')?.reset();
        row.get('uom')?.disable();
        row.get('targetValue')?.reset();
        row.get('targetValue')?.setValidators(null);
        row.get('targetValue')?.updateValueAndValidity();
        row.get('kpiId')?.setErrors(null);
        return;
      }
      const currentIndex = this.kpiRows.controls.indexOf(row);
      const selectedKpis = this.getSelectedKpiIds(currentIndex);
      if (selectedKpis.includes(kpiId)) {
        row.get('kpiId')?.setErrors({ duplicateKpi: true });
        row.get('uom')?.reset();
        row.get('uom')?.disable();
        return;
      }
      const errors = row.get('kpiId')?.errors;
      if (errors?.['duplicateKpi']) {
        delete errors['duplicateKpi'];
        if (Object.keys(errors).length === 0) {
          row.get('kpiId')?.setErrors(null);
        }
      }
      const selectedKpi = this.allKpiOptions.find((k) => k.kpiId === kpiId);
      if (selectedKpi) {
        row.get('uom')?.setValue(selectedKpi.targetType);
        row.get('uom')?.disable();
        // if (selectedKpi.targetValue !== undefined && selectedKpi.targetValue !== null) {
        //   row.get('targetValue')?.setValue(selectedKpi.targetValue);
        // } else {
        //   row.get('targetValue')?.reset();
        // }
        this.applyTargetValueValidation(
          row.get('targetValue'),
          selectedKpi.targetType
        );
      }
    });
    // === NEW: Cross-validation between KRA targetDate and KPI targetDate ===
    const validateKpiAgainstKra = () => {
      const kraEffectiveDate = this.assignForm.get('effectiveDate')?.value;
      const kraTargetDate = this.assignForm.get('targetDate')?.value;
      const kpiTargetDate = row.get('targetDate')?.value;
      // If any date is missing, let required/noPastDate handle it
      if (!kraEffectiveDate || !kraTargetDate || !kpiTargetDate) {
        // Clear only custom range errors
        const currentErrors = row.get('targetDate')?.errors || {};
        delete currentErrors['kpiTargetBeforeKraEffective'];
        delete currentErrors['kpiTargetExceedsKra'];
        row.get('targetDate')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        return;
      }
      const effective = new Date(kraEffectiveDate);
      const target = new Date(kraTargetDate);
      const kpiDate = new Date(kpiTargetDate);
      let hasError = false;
      const errors: any = {};
      if (kpiDate < effective) {
        errors.kpiTargetBeforeKraEffective = true;
        hasError = true;
      }
      if (kpiDate > target) {
        errors.kpiTargetExceedsKra = true;
        hasError = true;
      }
      if (hasError) {
        row.get('targetDate')?.setErrors({ ...row.get('targetDate')?.errors, ...errors });
      } else {
        // Clear only our custom errors
        const currentErrors = row.get('targetDate')?.errors || {};
        delete currentErrors['kpiTargetBeforeKraEffective'];
        delete currentErrors['kpiTargetExceedsKra'];
        row.get('targetDate')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
    };
    // 1. When KRA target date changes → validate this KPI row
    this.assignForm.get('targetDate')?.valueChanges.subscribe(() => {
      validateKpiAgainstKra();
    });
    // 2. When THIS KPI's target date changes → validate against current KRA date
    row.get('targetDate')?.valueChanges.subscribe(() => {
      validateKpiAgainstKra();
    });
    // 3. Initial validation (in case KRA target is already set when row is added)
    validateKpiAgainstKra();
    this.kpiRows.push(row);
  }

  applyTargetValueValidation(control: any, uom: string) {
    if (!control) return;
    let validators = [Validators.required, Validators.min(1)];
    switch (uom) {
      case '%':
        validators.push(Validators.max(100));
        break;
      case '$': // Currency
        break;
      case 'Hrs':
      case 'Days':
        validators.push(Validators.max(999));
        break;
    }
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  removeKpiRow(index: number): void {
    // Always remove from form array without confirmation in assign mode
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
    // Get selected review cycle from filter
    const selectedReviewCycle = this.filterForm.get('reviewCycle')?.value;
    // Explicitly reset new fields
    this.assignForm.patchValue({
      kraId: null,
      weightage: null,
      effectiveDate: '',
      targetDate: '',
      reviewCycle: selectedReviewCycle || '', // Auto-populate from filter
      ratingScale: '',
    });
    // Disable review cycle if it's auto-populated
    if (selectedReviewCycle) {
      this.assignForm.get('reviewCycle')?.disable();
    }
    this.addKpiRow(); // Start with one row
    this.modalService.open(content, { backdrop: 'static', size: 'xl' });
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
      const selectedEmployees = this.groupedKraList.filter((emp) => emp.selected === true).map((emp) => emp.employeeId);
      if (selectedEmployees.length === 0) {
        this.popup.openErrorModal('Please select employee(s)');
        return;
      }
      selectedEmployeeIds = selectedEmployees.join(',');
    }
    // 2. Basic validations
    if (this.assignForm.invalid || this.kpiRows.length === 0 || this.totalNewKpiWeightage > 100) {
      return;
    }
    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const loggedInEmployeeId = user?.employeeId || 0;
    this.isSubmitting = true;
    const formValue = this.assignForm.getRawValue();
    const selectedKra = this.kraListForDropdown.find((k) => k.kraId === formValue.kraId);
    if (!selectedKra) {
      this.popup.openErrorModal('Selected KRA not found');
      this.isSubmitting = false;
      return;
    }
    const kpis = this.kpiRows.getRawValue().map((row: any) => {
      const kpiPayload: any = {
        kpiId: row.kpiId || 0,
        kraId: formValue.kraId || 0,
        kpiName: this.getKpiNameById(row.kpiId),
        weightageValue: String(row.weightage || 0),
        targetValue: String(row.targetValue || ''),
        targetDate: row.targetDate || null,
        targetType: row.uom || '',
        description: row.description?.trim() || '',
        reviewCycleId: Number(formValue.reviewCycle),
        ratingScaleId: Number(formValue.ratingScale),
        status: row.status || 'Active',
        empkrakpistatus: row.status || 'Active',
        // empAssignedStatus: 'Assigned',
        createdBy: loggedInEmployeeId,
        updatedBy: loggedInEmployeeId,
        employeeIds: selectedEmployeeIds,
      };
      // Only include assigneeId if in edit mode AND it exists (i.e., existing KPI)
      if (this.isEditMode && row.assigneeId != null) {
        kpiPayload.assigneeId = row.assigneeId;
      }
      return kpiPayload;
    });
    // 4. Append void KPIs only in edit mode
    if (this.isEditMode && this.voidKpis.length > 0) {
      const voidPayload = this.voidKpis.map((voidKpi: any) => ({
        assigneeId: voidKpi.assigneeId,
        kpiId: voidKpi.kpiId,
        kraId: Number(formValue.kraId) || 0,
        kpiName: voidKpi.kpiName,
        weightageValue: voidKpi.weightageValue,
        targetValue: voidKpi.targetValue,
        targetDate: voidKpi.targetDate,
        targetType: voidKpi.targetType,
        description: voidKpi.description,
        reviewCycleId: Number(formValue.reviewCycle) || 0,
        ratingScaleId: Number(formValue.ratingScale) || 0,
        status: 'void',
        empkrakpistatus: 'Void',
        // empAssignedStatus: 'Assigned',
        createdBy: loggedInEmployeeId,
        updatedBy: loggedInEmployeeId,
        employeeIds: selectedEmployeeIds,
      }));
      kpis.push(...voidPayload);
    }
    // 5. Final payload
    const payload = {
      employeeIds: selectedEmployeeIds,
      employeeName: this.isEditMode ? this.selectedKraAssignment?.fullName || '' : '',
      kraId: Number(formValue.kraId) || 0,
      kraName: selectedKra?.kraName || '',
      kraCategoryId: Number(selectedKra?.kraCategoryId || selectedKra?.categoryId) || 0,
      kraCategoryName: selectedKra?.kraCategoryName || '',
      effectiveDate: formValue.effectiveDate || '',
      targetDate: formValue.targetDate || '',
      weightageValue: String(formValue.weightage || 0),
      reviewCycleId: Number(formValue.reviewCycle) || 0,
      ratingScaleId: Number(formValue.ratingScale) || 0,
      status: 'Active',
      empkrakpistatus: 'Active',
      // empAssignedStatus: 'Assigned',
      createdBy: loggedInEmployeeId,
      updatedBy: loggedInEmployeeId,
      kpis: kpis,
    };
    this.http.postdata('Kpi/updatekrakpi', payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        const successMessage = this.isEditMode ? "KRAs/KPIs are Updated Successfully" : "KRAs/KPIs are Assigned Successfully";
        this.popup.openSuccessModal(successMessage);
        // Reload data with current filters to show updated assignments
        this.applyFilters();
        this.groupedKraList.forEach((emp) => (emp.selected = false));
        this.voidKpis = []; // Clear after success
      },
      error: (err: any) => {
        console.error('Assignment failed:', err);
        this.popup.openErrorModal(err.error?.message || 'Failed to assign/update KRA/KPIs');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  get combinedKpiOptions(): any[] {
    // Combine allKpiOptions with selectedKraKpis to ensure assigned KPIs are available for display
    const combined = [...this.allKpiOptions];
    // Add any KPIs from selectedKraKpis that aren't already in allKpiOptions
    this.selectedKraKpis.forEach(selectedKpi => {
      const exists = combined.find(kpi => kpi.kpiId === selectedKpi.kpiId);
      if (!exists) {
        combined.push({
          kpiId: selectedKpi.kpiId,
          kpiName: selectedKpi.kpiName,
          targetType: selectedKpi.targetType,
          status: 'Active' // Assume active for display
        });
      }
    });
    return combined;
  }

  getKpiNameById(id: number | null): string {
    if (!id) return 'Select KPI';
    // Check in combinedKpiOptions which includes both available and assigned KPIs
    const found = this.combinedKpiOptions.find((k) => k.kpiId === id);
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
    this.voidKpis = [];
    this.originalKpis = JSON.parse(JSON.stringify(kraAssignment.kpis || []));
    // Check if we have KPIs to work with
    if (!kraAssignment.kpis || kraAssignment.kpis.length === 0) {
      this.popup.openErrorModal('No KRA/KPI data found for update');
      return;
    }
    const firstKpi = kraAssignment.kpis[0];
    // Patch form with existing KRA data
    this.assignForm.patchValue({
      kraId: kraAssignment.kraId,
      weightage: kraAssignment.individualWeightage || kraAssignment.weightageValue || 0,
      effectiveDate: kraAssignment.effectiveDate?.split('T')[0] || '',
      targetDate: firstKpi.kraTargetDate?.split('T')[0] || kraAssignment.targetDate?.split('T')[0] || '',
      reviewCycle: firstKpi.reviewCycleData?.id,
      ratingScale: firstKpi.optionsRating?.id,
    });
    // Load existing KPIs for the selected KRA to populate selectedKraKpis
    this.selectedKraKpis = kraAssignment.kpis || [];
    this.kpiRows.clear();
    kraAssignment.kpis.forEach((kpi: any) => {
      const targetDateValue = kpi.targetDate ? kpi.targetDate.split('T')[0] : '';
      const rowGroup = this.fb.group({
        assigneeId: [kpi.assigneeId || null],
        kpiId: [{ value: kpi.kpiId || null, disabled: true }],
        uom: [{ value: kpi.targetType || '', disabled: true }],
        weightage: [Number(kpi.assignedKpiWeightage || kpi.weightageValue) || 0],
        targetValue: [kpi.targetValue || ''],
        targetDate: [targetDateValue, [Validators.required, this.noPastDateValidator]],
        description: [kpi.description || ''],
        status: [kpi.status || 'Created'],
      });
      this.applyTargetValueValidation(rowGroup.get('targetValue'), kpi.targetType);
      this.kpiRows.push(rowGroup);
    });
    this.modalService.open(this.assignKraKpiModal, {backdrop: 'static', size: 'xl',});
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
        updatedBy: JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')?.employeeId || 0,
      };
      this.http.postdata('KraAssignment/hold', payload).subscribe({
        next: () => {
          this.popup.openSuccessModal('KRA assignment put on hold');
          this.loadAssignedKraKpiListWithFilters(this.getCurrentFilters()); // Refresh table
        },
        error: (err) => {
          this.popup.openErrorModal(err.error?.message || 'Failed to hold assignment');
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
    this.jobLocationDropDownData = [];
    this.departmentDetails = [];
    this.page = 1;
    this.first = 0;
    // Disable filter controls when no review cycle is selected
    this.filterForm.get('location')?.disable();
    this.filterForm.get('subLocation')?.disable();
    this.filterForm.get('department')?.disable();
    this.filterForm.get('team')?.disable();
    // Clear data to show placeholder card
    this.kraList = [];
    this.groupedKraList = [];
    this.collectionSize = 0;
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
    if (formValue.reviewCycle) {
      const cycleName = this.reviewCycleFilterOptions.find((opt) => String(opt.value) ===
      String(formValue.reviewCycle))?.label || `Review Cycle ID: ${formValue.reviewCycle}`;
      filters.push({
        type: 'reviewCycle',
        label: cycleName,
        value: formValue.reviewCycle,
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
      const updated = (current.team ?? []).filter(
        (t: any) => (t.sno || t.id || t.subdepartmentId) !==
        (filter.value.sno || filter.value.id || filter.value.subdepartmentId)
      );
      this.filterForm.patchValue({ team: updated });
      this.onTeamChange(updated);
    } else if (filter.type === 'location') {
      const updated = (current.location ?? []).filter((l: any) => l.id !== filter.value.id);
      this.filterForm.patchValue({ location: updated });
      this.getSubLocationByid(updated);
    } else if (filter.type === 'subLocation') {
      const updated = (current.subLocation ?? []).filter(
        (s: any) => (s.id || s.sno) !== (filter.value.id || filter.value.sno)
      );
      this.filterForm.patchValue({ subLocation: updated });
      this.onSubLocationChange(updated);
    } else if (filter.type === 'reviewCycle') {
      this.filterForm.patchValue({ reviewCycle: null });
      this.applyFilters();
    }
    // Refresh table
    this.page = 1;
    this.first = 0;
    this.applyFilters();
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {position: 'end', backdrop: 'static', keyboard: false});
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  get canOpenAssignModal(): boolean {
    const hasFilter = this.isFilterApplied();
    const hasSelection = this.groupedKraList?.some((emp) => emp.selected === true);
    return hasFilter || hasSelection;
  }

  openAssignedKpiCanvas(content: TemplateRef<any>, kra: any, employeeId: number, employeeName: string) {
    this.selectedEmployeeId = employeeId;
    this.selectedEmployeeName = employeeName;
    this.selectedKra = kra;
    this.loadKpisForEmployee(employeeId);
    this.loadKpisForKra(kra);
    setTimeout(() => {
      this.offcanvasService.open(content, {position: 'end', backdrop: 'static', panelClass: 'custom-kpi-canvas'});
    }, 200);
  }

  closeAssignedKpiCanvas() {
    this.offcanvasService.dismiss();
  }

  loadKpisForKra(kra: any) {
    this.assignKpiList = [];
    // SHOW ONLY THIS SPECIFIC KRA's KPIs
    if (kra?.kpis && kra.kpis.length > 0) {
      kra.kpis.forEach((kpi: any) => {
        this.assignKpiList.push({
          ...kpi,
          kpiName: kpi.kpiName,
          weightageValue: kpi.assignedKpiWeightage,
          targetValue: kpi.targetValue,
          targetType: kpi.targetType,
          targetDate: kpi.targetDate,
          kraName: kpi.kraName || kra.kra?.kraName,
          description: kpi.description,
        });
      });
    }
  }

  loadKpisForEmployee(employeeId: number) {
    const employeeData = this.kraList.filter((k) => k.employeeId === employeeId);
    this.assignKpiList = [];
    employeeData.forEach((emp) => {
      // NEW: Extract from kras array
      if (emp.kras && emp.kras.length) {
        emp.kras.forEach((kraItem: any) => {
          if (kraItem.kpis && kraItem.kpis.length) {
            kraItem.kpis.forEach((kpi: any) => {
              this.assignKpiList.push({
                ...kpi,
                // Ensure all required fields are available
                kpiName: kpi.kpiName,
                weightageValue: kpi.weightageValue,
                targetValue: kpi.targetValue,
                targetType: kpi.targetType,
                targetDate: kpi.targetDate,
                kraName: kpi.kraName || kraItem.kra?.kraName, // Fallback to KRA name
                description: kpi.description,
              });
            });
          }
        });
      }
    });
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
    const totalKpisCount = kra.kpis.length; // Denominator: ALL KPIs in the KRA
    let committedTotal = 0;
    kra.kpis.forEach((kpi: any) => {
      let weightage: number = 0;
      if (kpi.assignedStatus === 'Approved') {
        weightage = Number(kpi.assignedApproverWeightage || kpi.assignedWeightage || 0);
      } else if (kpi.assignedStatus === 'Waiting for Approval') {
        weightage = Number(kpi.assignedWeightage || 0);
      }
      // Draft, Rejected, etc. → contribute 0 (intentionally)
      committedTotal += weightage;
    });
    if (totalKpisCount === 0) {
      return 0;
    }
    const averageProgress = committedTotal / totalKpisCount;
    const rounded = Math.round(averageProgress);
    return Math.min(100, Math.max(0, rounded));
  }

  getProgressClass(value: number): string {
    if (value >= 70) return 'bg-success';
    if (value >= 30) return 'bg-warning';
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

  private kraDateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const effectiveDate = group.get('effectiveDate')?.value;
    const targetDate = group.get('targetDate')?.value;
    if (!effectiveDate || !targetDate) {
      return null; // Let required validators handle missing values
    }
    const effDate = new Date(effectiveDate);
    const targDate = new Date(targetDate);
    return effDate >= targDate ? { effectiveGreaterThanTarget: true } : null;
  }

  private kpiTargetDateValidator(row: FormGroup, kraTargetDate: string | null): { [key: string]: any } | null {
    if (!kraTargetDate) return null;
    const kpiTargetDate = row.get('targetDate')?.value;
    if (!kpiTargetDate) return null; // Let required handle it
    const kpiDate = new Date(kpiTargetDate);
    const kraDate = new Date(kraTargetDate);
    return kpiDate > kraDate ? { kpiTargetExceedsKra: true } : null;
  }

  getApproverStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Approved':
      case 'Active':
        return 'status-active';
      case 'Rejected':
        return 'status-onhold';
      case 'Waiting for Approval':
        return 'status-waiting';
      case 'Created':
        return 'status-created';
      default:
        return 'bg-secondary';
    }
  }

  private getSelectedKpiIds(excludeIndex?: number): number[] {
    return this.kpiRows.controls.map((ctrl, index) =>
      index !== excludeIndex ? ctrl.get('kpiId')?.value : null
    ).filter((id) => id !== null);
  }

  hasDuplicateKpis(): boolean {
    const ids = this.kpiRows.controls.map((r) => r.get('kpiId')?.value).filter(Boolean);
    return new Set(ids).size !== ids.length;
  }

  trackByKpiId(index: number, row: any): any {
    return row.get('kpiId')?.value || index; // Stable ID when KPI selected, fallback to index
  }

  openDeleteKpiConfirmation(content: TemplateRef<any>, index: number): void {
    const row = this.kpiRows.at(index) as FormGroup;
    const kpiId = row.get('kpiId')?.value;
    this.kpiToDeleteIndex = index;
    this.kpiToDeleteName = this.getKpiNameById(kpiId) || 'this KPI';
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmKpiDelete(): void {
    if (this.kpiToDeleteIndex === null) {
      console.error('No KPI index to delete');
      return;
    }
    const index = this.kpiToDeleteIndex;
    const row = this.kpiRows.at(index) as FormGroup;
    const rowValue = row.getRawValue();
    // Only track void KPIs in edit mode
    if (this.isEditMode && rowValue.kpiId && Number(rowValue.kpiId) > 0) {
      const kpiName = this.getKpiNameById(rowValue.kpiId);
      const uomValue = row.get('uom')?.value || '';
      this.voidKpis.push({
        assigneeId: rowValue.assigneeId,
        kpiId: rowValue.kpiId,
        kraId: this.assignForm.get('kraId')?.value,
        kpiName: kpiName,
        weightageValue: String(rowValue.weightage || 0),
        targetValue: String(rowValue.targetValue || ''),
        targetDate: rowValue.targetDate || null,
        targetType: uomValue,
        description: rowValue.description?.trim() || '',
        status: 'void',
        empkrakpistatus: 'Void',
        reviewCycleId: Number(this.assignForm.get('reviewCycle')?.value) || 0,
        ratingScaleId: Number(this.assignForm.get('ratingScale')?.value) || 0,
      });
      this.popup.openSuccessModal('KPI removed successfully');
    }
    // Remove the row from the form array
    this.kpiRows.removeAt(index);
    // Reset
    this.kpiToDeleteIndex = null;
    this.kpiToDeleteName = '';
  }

  // Check if any employee is selected via checkbox
  hasSelectedEmployees(): boolean {
    return this.groupedKraList.some((emp) => emp.selected === true);
  }

  // Get list of selected employee IDs
  getSelectedEmployeeIds(): string {
    const selected = this.groupedKraList.filter((emp) => emp.selected === true).map((emp) => emp.employeeId);
    return selected.join(',');
  }

  // Error modal properties
  errorModalMessage: string = '';
  errorModalType: 'selection' | 'assigned' | 'weightage' | 'noAssignments' = 'selection';
  @ViewChild('errorModal') errorModal!: TemplateRef<any>;
  assignExistingToSelectedEmployees(): void {
    const selectedEmployees = this.groupedKraList.filter((emp) => emp.selected);
    if (selectedEmployees.length === 0) {
      this.errorModalType = 'selection';
      this.errorModalMessage = 'Please select employee(s) to assign the KRAs/KPIs.';
      this.modalService.open(this.errorModal, { centered: true, backdrop: 'static' });
      return;
    }
    // Check if any selected employee is already assigned
    const alreadyAssignedEmployees = selectedEmployees.filter(emp =>
      this.getEmpAssignedStatus(emp) === 'Assigned'
    );
    if (alreadyAssignedEmployees.length > 0) {
      this.errorModalType = 'assigned';
      this.errorModalMessage = 'One or more selected employees already have assigned KRAs/KPIs. Please unselect them before proceeding.';
      this.modalService.open(this.errorModal, { centered: true, backdrop: 'static' });
      return;
    }
    // Validate weightage = 100%
    const invalidWeightage = selectedEmployees.some(emp => emp.totalKraWeightage !== 100);
    if (invalidWeightage) {
      this.errorModalType = 'weightage';
      this.errorModalMessage = 'Total KRA weightage must not exceed 100% for all selected employees.';
      this.modalService.open(this.errorModal, { centered: true, backdrop: 'static' });
      return;
    }
    const loggedInEmployeeId = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')?.employeeId || 0;
    const targetEmployeeIds = selectedEmployees.map(emp => emp.employeeId).join(',');
    const uniqueAssignments = new Map<string, any>();
    selectedEmployees.forEach((emp) => {
      if (!emp.assignments || emp.assignments.length === 0) {
        console.warn(`Employee ${emp.fullName} has no assignments`);
        return;
      }
      emp.assignments.forEach((assignment: any, idx: number) => {
        const kra = assignment.kra || assignment;
        const kpis = assignment.kpis || [];
        if (!kra) {
          console.warn('Assignment missing kra object');
          return;
        }
        // Safely get reviewCycleId from first KPI
        const firstKpi = kpis[0];
        const reviewCycleId = firstKpi?.reviewCycleData?.id || 0;
        const kraId = Number(kra.kraId || kra.id || 0);
        if (kraId === 0) {
          console.warn('Invalid kraId:', kra);
          return;
        }
        const uniqueKey = `${kraId}_${reviewCycleId}`;
        if (!uniqueAssignments.has(uniqueKey)) {
          uniqueAssignments.set(uniqueKey, assignment);
        } else {
          console.log(`Skipping duplicate: KRA ${kraId}, Cycle ${reviewCycleId}`);
        }
      });
    });
    if (uniqueAssignments.size === 0) {
      this.errorModalType = 'noAssignments';
      this.errorModalMessage = 'No valid KRA/KPI assignments found to copy.';
      this.modalService.open(this.errorModal, { centered: true, backdrop: 'static' });
      return;
    }
    const payloadArray: any[] = [];
    uniqueAssignments.forEach((sourceAssignment, key) => {
      const sourceKra = sourceAssignment.kra || sourceAssignment;
      const sourceKpis = sourceAssignment.kpis || [];
      const kpisPayload = sourceKpis.map((kpi: any) => ({
        assigneeId: kpi.assigneeId || null,
        kpiId: Number(kpi.kpiId || 0),
        kpiName: kpi.kpiName || '',
        weightageValue: String(kpi.assignedKpiWeightage || kpi.weightageValue || 0),
        targetValue: String(kpi.targetValue || ''),
        targetDate: kpi.targetDate ? kpi.targetDate.split('T')[0] : null,
        targetType: kpi.targetType || '',
        description: kpi.description?.trim() || '',
        reviewCycleId: Number(kpi.reviewCycleData?.id || 0),
        ratingScaleId: Number(kpi.optionsRating?.id || 0),
        status: 'Active',
        empkrakpistatus: 'Active',
        empAssignedStatus: 'Assigned',
        createdBy: loggedInEmployeeId,
        updatedBy: loggedInEmployeeId,
        employeeIds: targetEmployeeIds,
      }));
      payloadArray.push({
        employeeIds: targetEmployeeIds,
        employeeName: selectedEmployees.map(e => e.fullName).join(', '),
        kraId: Number(sourceKra.kraId || 0),
        kraName: sourceKra.kraName || '',
        kraCategoryId: Number(sourceKra.kraCategoryId || 0),
        kraCategoryName: sourceKra.kraCategoryName || '',
        effectiveDate: sourceKra.effectiveDate ? sourceKra.effectiveDate.split('T')[0] : '',
        targetDate: sourceKra.targetDate ? sourceKra.targetDate.split('T')[0] : '',
        weightageValue: String(sourceAssignment.individualWeightage || 0),
        reviewCycleId: Number(sourceKpis[0]?.reviewCycleData?.id || 0),
        ratingScaleId: Number(sourceKpis[0]?.optionsRating?.id || 0),
        status: 'Active',
        empkrakpistatus: 'Active',
        empAssignedStatus: 'Assigned',
        createdBy: loggedInEmployeeId,
        updatedBy: loggedInEmployeeId,
        kpis: kpisPayload,
      });
    });
    this.pendingAssignPayload = payloadArray;
    this.confirmAssignKraName = `${uniqueAssignments.size} KRA assignment(s)`;
    this.confirmAssignEmployeeCount = selectedEmployees.length;
    this.modalService.open(this.assignToEmployeeConfirmation, { centered: true, backdrop: 'static' });
  }

  // Updated: Send direct array (no { assignments: ... } wrapper)
  confirmAssignToEmployees(): void {
    if (!this.pendingAssignPayload || this.pendingAssignPayload.length === 0) {
      return;
    }
    this.isSubmitting = true;
    this.http.postdata('Kpi/updatekrakpiv2', this.pendingAssignPayload).subscribe({
      next: () => {
        this.popup.openSuccessModal(`KRA/KPIs assigned successfully to ${this.confirmAssignEmployeeCount} employee(s)`);
        // Reload data with current filters to show updated assignments
        this.applyFilters();
        this.groupedKraList.forEach((emp) => (emp.selected = false));
        this.pendingAssignPayload = null;
      },
      error: (err: any) => {
        console.error('Bulk assignment failed:', err);
        this.popup.openErrorModal(err.error?.message || 'Failed to assign KRA/KPIs');
        this.isSubmitting = false;
        this.pendingAssignPayload = null;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  // Check if review cycle is selected
  hasReviewCycleSelected(): boolean {
    const reviewCycle = this.filterForm.get('reviewCycle')?.value;
    return reviewCycle !== null && reviewCycle !== undefined;
  }

  // Auto-populate filters from API response
  autoPopulateFiltersFromResponse(data: any[]): void {
    const uniqueLocations = new Map();
    const uniqueSubLocations = new Map();
    const uniqueDepartments = new Map();
    const uniqueSubDepartments = new Map();
    data.forEach((item: any) => {
      // Collect unique locations
      if (item.locations && item.locations.length > 0) {
        item.locations.forEach((loc: any) => {
          uniqueLocations.set(loc.id, {
            id: loc.id,
            jobLocationName: loc.jobLocationName
          });
        });
      }
      // Collect unique sub-locations
      if (item.subLocations && item.subLocations.length > 0) {
        item.subLocations.forEach((subLoc: any) => {
          uniqueSubLocations.set(subLoc.id, {
            id: subLoc.id,
            jobSubLocationName: subLoc.jobSubLocationName
          });
        });
      }
      // Collect unique departments
      if (item.departments && item.departments.length > 0) {
        item.departments.forEach((dept: any) => {
          uniqueDepartments.set(dept.sno, {
            sno: dept.sno,
            departmentName: dept.departmentName
          });
        });
      }
      // Collect unique sub-departments
      if (item.subDepartments && item.subDepartments.length > 0) {
        item.subDepartments.forEach((subDept: any) => {
          uniqueSubDepartments.set(subDept.subdepartmentId, {
            subdepartmentId: subDept.subdepartmentId,
            subdepartmentName: subDept.subdepartmentName
          });
        });
      }
    });
    // Update dropdown options ONLY - don't auto-select
    this.jobLocationDropDownData = Array.from(uniqueLocations.values());
    this.subLocationsDropdown = Array.from(uniqueSubLocations.values());
    this.departmentDetails = Array.from(uniqueDepartments.values());
    this.teamDropdownValues = Array.from(uniqueSubDepartments.values());
  }
}
