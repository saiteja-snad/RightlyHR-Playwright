import { Component, TemplateRef } from '@angular/core';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { Subscription } from 'rxjs/internal/Subscription';
import { IResourceDetail } from '../../../timesheetmodel';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import { PaginatorModule } from 'primeng/paginator';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { Router, ActivatedRoute } from '@angular/router';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TimesheetEntry } from '../../../Interfaces/timesheetsummary';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { MultiSelectModule } from 'primeng/multiselect';
import { EncriptdecriptService } from '../../../services/encriptdecript.service';
import { TimesheetFilterService } from '../../../services/timesheet-filter.service';
import { TimesheetSharedDataService } from '../../../services/timesheet-shared-data.service';
import { Chip } from 'primeng/chip';
@Component({
  selector: 'app-team-timesheets',
  imports: [TimesheetsTabsComponent, NgbPopoverModule, FormsModule, ReactiveFormsModule, PaginatorModule, DatePicker, TranslateModule,
    CommonModule, ProjectManagementModuleInfoComponent, DataLoaderContentComponent, NoDataFoundComponent, InfoIconComponent,
    DateformatPipe, MultiSelectModule, Chip],
  templateUrl: './team-timesheets.component.html',
  styleUrl: './team-timesheets.component.scss',
})

export class TeamTimesheetsComponent {
  empdata = {} as any;
  loading = false;
  totalhrs: any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  routeResourceId: any;
  ranges: any;
  datepickerForm!: FormGroup;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  resourcesList: IResourceDetail[] = [];
  selectedEntries: TimesheetEntry[] = [];
  projectDetails = [] as any;
  clientDetails = [] as any;
  departmentDetails = [] as any;
  tmandRmDetails = [] as any;
  previousEmployeeSelection: string[] = [];

  constructor(private fb: FormBuilder, private http: HttpService, public rbac: RbacService, private router: Router,
    private modalService: NgbModal, private encryptionService: EncriptdecriptService, private offcanvasService: NgbOffcanvas,
    private filterService: TimesheetFilterService, private sharedDataService: TimesheetSharedDataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDatepickerForm();
    this.route.queryParams.subscribe(params => {
      if (!params['data']) {
        this.filterService.clearFilters();
      }
    });
    this.loadSavedFilters();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.getteamsummary(); // always call once
    this.getprojectData();
    this.getclientData();
    this.getdepartmentData();
    this.getTmandRMData();
  }

  //get all projects list
  getprojectData(): void {
    this.subscription = this.sharedDataService.getProjectData().subscribe({
      next: (res: any) => {
        this.projectDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
      },
    });
  }

  //get all clients list
  getclientData(): void {
    this.subscription = this.sharedDataService.getClientData().subscribe({
      next: (res: any) => {
        this.clientDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      },
    });
  }

  //get all departments list
  getdepartmentData(): void {
    this.subscription = this.sharedDataService.getDepartmentData().subscribe({
      next: (res: any) => {
        this.departmentDetails = res;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      },
    });
  }

  //get all TM and RM list
  getTmandRMData(): void {
    this.subscription = this.sharedDataService.getTmandRMData().subscribe({
      next: (res: any) => {
        this.tmandRmDetails = this.sharedDataService.formatTmRmList(res);
      },
      error: (err) => {
        console.error('Error fetching TM/RM:', err);
      },
    });
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any filter (except date & employee) has value
    return (
      (formValue?.projectId && formValue?.projectId?.length > 0) ||
      (formValue?.clientId && formValue?.clientId?.length > 0) ||
      (formValue?.departmentId && formValue?.departmentId?.length > 0) ||
      (formValue?.tmorrmId && formValue?.tmorrmId?.length > 0)
    );
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  resetForm() {
    // Reset to current month
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    // Clear all form fields including date range and employee selection
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth],
      resourceId: [],
      projectId: null,
      clientId: null,
      departmentId: null,
      tmorrmId: null
    });
    // Clear filter service
    this.filterService.clearFilters();
    // Reload employee lists
    if (this.rbac.allowedToAccess('All Employees (Timesheet).view')) {
      this.getAllEmployeeDetails();
    } else if (this.rbac.allowedToAccess('My Team (Timesheet).view')) {
      this.getResourceDetailsByManagerId();
    }
    // Reload table data with cleared filters
    this.page = 1;
    this.first = 0;
    this.getteamsummary();
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [[]],
      projectId: [null],
      clientId: [null],
      departmentId: [null],
      tmorrmId: [null],
    });
  }

  setDefaultmounth() {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });
  }

  selectedEmployeeName!: string;
  openModal(entries: any, content?: any, empName?: string) {
    this.selectedEmployeeName = empName || '';
    this.selectedEntries = entries?.filter((ele: any) => ele?.status !== 'Not Entered');;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const employeeList = res.data.filter((emp: IResourceDetail) =>
            emp.id !== EmployeeId && emp.isReportee == true).map((emp: IResourceDetail) => ({
              ...emp,
              fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
              key: 'team',
            }));
          if (employeeList.length > 0) {
            const allEmployeesOption = { id: 'ALL_EMPLOYEES', fullName: 'All Employees', key: 'team' };
            this.resourcesList = [allEmployeesOption, ...employeeList];
            this.datepickerForm.patchValue({ resourceId: ['ALL_EMPLOYEES'] });
          } else {
            this.resourcesList = [];
            this.datepickerForm.patchValue({ resourceId: [] });
          }
        }
      },
      error: (err: any) => console.error(err),
    });
  }

  // getAllEmployeeDetails() {
  //   const EmployeeId = this.empdata?.employeeId;
  //   const satus = ['Active', 'Trainee Active', 'Active Contract'];
  //   this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
  //     next: (res: any) => {
  //       this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
  //         label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
  //         value: employee.employeeId
  //       }));
  //     },
  //   });
  // }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const formdata = this.datepickerForm.value;
    const filters = {
      clientId: formdata.clientId,
      projectId: formdata.projectId,
      departmentId: formdata.departmentId,
      reportingId: formdata.tmorrmId
    };
    this.subscription = this.sharedDataService.getAllEmployeeDetails(this.http, EmployeeId, filters).subscribe({
      next: (res: any) => {
        if (Array.isArray(res.data)) {
          const employeeList = this.sharedDataService.formatEmployeeList(res.data, EmployeeId).map((emp: any) => ({
            ...emp,
            key: 'all',
          }));
          if (employeeList.length > 0) {
            const allEmployeesOption = { label: 'All Employees', value: 'ALL_EMPLOYEES', key: 'all' };
            this.activeEmplist = [allEmployeesOption, ...employeeList];
            const savedFilters = this.filterService.getCurrentFilters();
            if (!savedFilters || !savedFilters.resourceId) {
              this.datepickerForm.patchValue({ resourceId: ['ALL_EMPLOYEES'] });
            }
          } else {
            this.activeEmplist = [];
            this.datepickerForm.patchValue({ resourceId: [] });
          }
        } else {
          this.activeEmplist = [];
          this.datepickerForm.patchValue({ resourceId: [] });
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.activeEmplist = [];
        this.datepickerForm.patchValue({ resourceId: [] });
      },
    });
  }

  onSubmit() {
    if (this.datepickerForm.invalid) {
      return;
    }
    const formValue = this.datepickerForm.value;
    this.filterService.setFilters(formValue);
    const selectedIds = formValue.resourceId || [];
    let employeeIds: string | null = null;
    if (selectedIds.includes('ALL_EMPLOYEES')) {
      const currentList = this.rbac.allowedToAccess('All Employees (Timesheet).view') ? this.activeEmplist : this.resourcesList;
      const allIds = currentList.filter((emp: any) => (emp.value || emp.id) !== 'ALL_EMPLOYEES').map((emp: any) => emp.value || emp.id);
      employeeIds = allIds.length > 0 ? allIds.join(',') : null;
    } else if (selectedIds.length > 0) {
      employeeIds = selectedIds.join(',');
    }
    this.page = 1;
    this.first = 0;
    this.getteamsummary(employeeIds);
    this.closeCanvas();
  }

  getteamsummary(employeeIds?: string | null) {
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    let url = `Timesheet/teamsummary?startDate=${start}&endDate=${end}&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    const hasMyTeam = this.rbac.allowedToAccess('My Team (Timesheet).view');
    const hasAllEmployees = this.rbac.allowedToAccess('All Employees (Timesheet).view');
    // OLD LOGIC
    // Case 1: Only "My Team" — include manager resourceId
    if (hasMyTeam && !hasAllEmployees) {
      url += `&resourceId=${this.empdata?.employeeId}`;
    }
    // NEW LOGIC: employeeIds (single or comma separated)
    if (employeeIds) {
      url += `&employeeIds=${employeeIds}`;
    }
    this.loading = true;
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.teamSummaryData = res.data;
          this.totalhrs = res?.pagination?.meta?.totalLoggedHHMMAllEmployees || '00:00';
          this.collectionSize = res.pagination.totalRecords;
          if (this.teamSummaryData.length > 0) {
            this.dateHeaders = this.teamSummaryData[0].dailyData.map((d) =>
              dayjs(d.date).format('D MMM<br>ddd')
            );
          }
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getteamsummary();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getteamsummary();
  }

  navigateView(employeeId: any) {
    const formData = {
      ...this.datepickerForm.value,
      resourceId: employeeId // Pass selected employee as single value
    };
    const encryptedData = this.encryptionService.encrypt(formData);
    this.filterService.clearFilters();
    if (this.rbac.allowedToAccess('Team Time Sheet Summary Tab.view')) {
      this.router.navigate(['project-management/timesheet/resourcesummary'], {
        queryParams: { data: encryptedData },
      });
    } else if (this.rbac.allowedToAccess('Team Time Sheet Detailed Tab.view')) {
      this.router.navigate(['project-management/timesheet/summary'], {
        queryParams: { data: encryptedData },
      });
    }
  }

  onEmployeeChange(event: any) {
    const selectedIds = event.value || [];
    // If both "All Employees" and individual employees are selected
    if (selectedIds.includes('ALL_EMPLOYEES') && selectedIds.length > 1) {
      const wasAllEmployeesSelected = this.previousEmployeeSelection.includes('ALL_EMPLOYEES');
      if (wasAllEmployeesSelected) {
        // User added individual employee(s) while "All Employees" was selected
        // Remove "All Employees", keep individual selections
        const filteredIds = selectedIds.filter((id: string) => id !== 'ALL_EMPLOYEES');
        this.datepickerForm.patchValue({ resourceId: filteredIds }, { emitEvent: false });
        this.previousEmployeeSelection = filteredIds;
      } else {
        // User selected "All Employees" while individual employees were selected
        // Keep only "All Employees"
        this.datepickerForm.patchValue({ resourceId: ['ALL_EMPLOYEES'] }, { emitEvent: false });
        this.previousEmployeeSelection = ['ALL_EMPLOYEES'];
      }
    } else {
      this.previousEmployeeSelection = selectedIds;
    }
  }

  getSelectedFilters(): any[] {
    const filters: any[] = [];
    const formValue = this.datepickerForm.value;
    if (formValue.projectId && formValue.projectId.length > 0) {
      formValue.projectId.forEach((id: any) => {
        const project = this.projectDetails.find((p: any) => p.projectId === id);
        if (project) {
          filters.push({ type: 'projectId', label: project.projectName, value: id });
        }
      });
    }
    if (formValue.clientId && formValue.clientId.length > 0) {
      formValue.clientId.forEach((id: any) => {
        const client = this.clientDetails.find((c: any) => c.clientId === id);
        if (client) {
          filters.push({ type: 'clientId', label: client.clientName, value: id });
        }
      });
    }
    if (formValue.departmentId && formValue.departmentId.length > 0) {
      formValue.departmentId.forEach((id: any) => {
        const dept = this.departmentDetails.find((d: any) => d.sno === id);
        if (dept) {
          filters.push({ type: 'departmentId', label: dept.departmentName, value: id });
        }
      });
    }
    if (formValue.tmorrmId && formValue.tmorrmId.length > 0) {
      formValue.tmorrmId.forEach((id: any) => {
        const tm = this.tmandRmDetails.find((t: any) => t.employeeId === id);
        if (tm) {
          filters.push({ type: 'tmorrmId', label: tm.fullName, value: id });
        }
      });
    }
    return filters;
  }

  removeFilter(filter: any) {
    const formValue = this.datepickerForm.value;
    const currentValues = formValue[filter.type] || [];
    const updatedValues = currentValues.filter((v: any) => v !== filter.value);
    this.datepickerForm.patchValue({ [filter.type]: updatedValues });
    this.getAllEmployeeDetails();
  }

  getLighterColor(color: string, amount: number = 0.9): string {
    if (!color) return color || '#d8d8daff'; // Default color if none provided;
    // Remove # if present
    const hex = color.replace('#', '');
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate lighter values
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  loadSavedFilters() {
    const savedFilters = this.filterService.getCurrentFilters();
    if (savedFilters) {
      this.datepickerForm.patchValue(savedFilters);
    } else {
      this.setDefaultmounth();
    }
  }

  openMoreFiltersModal(content?: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
}