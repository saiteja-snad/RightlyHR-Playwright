import { Component } from '@angular/core';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { Subscription } from 'rxjs/internal/Subscription';
import { IResourceDetail } from '../../../timesheetmodel';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import { PaginatorModule } from 'primeng/paginator';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { Router } from '@angular/router';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TimesheetEntry } from '../../../Interfaces/timesheetsummary';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-team-timesheets',
  imports: [TimesheetsTabsComponent, FormsModule, ReactiveFormsModule, PaginatorModule, DatePicker, TranslateModule,
    CommonModule, ProjectManagementModuleInfoComponent, Select, DataLoaderContentComponent, NoDataFoundComponent,
    NgbPopoverModule, InfoIconComponent, DateformatPipe, MultiSelectModule,],
  templateUrl: './team-timesheets.component.html',
  styleUrl: './team-timesheets.component.scss'
})

export class TeamTimesheetsComponent {
  empdata = {} as any;
  loading = false;
  totalhrs: any
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  routeResourceId: any
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
    { label: 25, value: 25 }
  ];
  resourcesList: IResourceDetail[] = [];
  selectedEntries: TimesheetEntry[] = [];
  projectDetails = [] as any;
  clientDetails = [] as any;
  departmentDetails = [] as any;
  tmandRmDetails = [] as any;

  constructor(private fb: FormBuilder, private http: HttpService, public rbac: RbacService, private router: Router, private modalService: NgbModal) { }
  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDatepickerForm();
    this.setDefaultmounth();
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
    this.subscription = this.http.getData(`Project`).subscribe({
      next: (res: any) => {
        this.projectDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all clients list
  getclientData(): void {
    this.subscription = this.http.getData(`Client/GetAll`).subscribe({
      next: (res: any) => {
        this.clientDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all departments list
  getdepartmentData(): void {
    this.subscription = this.http.getData(`Department`).subscribe({
      next: (res: any) => {
        this.departmentDetails = res;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all TM and RM list
  getTmandRMData(): void {
    this.subscription = this.http.getData(`JobDetails/getAllReportingnTeamManagers`).subscribe({
      next: (res: any) => {
        this.tmandRmDetails = [
          ...res.map((emp: any) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`
              : `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
          })),
        ];
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any field has value
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0)
    );
  }
  showFilters: boolean = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  resetForm() {
    // Reset other form fields
    this.datepickerForm.reset({
      resourceId: null,
      dateRange: null
    });
    // Now manually set the default month range
    // const defaultRange = this.setDefaultmounth();
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth]
    });
    this.getteamsummary();
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [null],
      projectId: [null],
      clientId: [null],
      departmentId: [null],
      tmorrmId: [null]
    });
  }

  setDefaultmounth() {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth]
    });
    // return [startOfMonth, endOfMonth];
  }

  openModal(entries: any, content?: any) {
    this.selectedEntries = entries?.filter((ele: any) => ele?.status !== 'Not Entered');;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data
            // Remove employee by ID
            .filter((emp: IResourceDetail) => emp.id !== EmployeeId && emp.isReportee == true)
            // Add fullName for dropdown
            .map((emp: IResourceDetail) => ({
              ...emp,
              fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
              key: 'team'
            }));
          // Add "All Employees" option at the beginning
          const allEmployeesOption = {
            id: null,
            name: 'All Employees',
            fullName: 'All Employees',
            key: 'team'
          };

          this.resourcesList = [
            allEmployeesOption,
            ...res.data
              .filter((emp: IResourceDetail) => emp.id !== EmployeeId && emp.isReportee == true)
              .map((emp: IResourceDetail) => ({
                ...emp,
                fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
                key: 'team'
              }))
          ];

          // Set default selection to "All Employees"
          this.datepickerForm.patchValue({
            resourceId: null
          });
        }
      },
      error: (err: any) => console.error(err)
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
    const clientId = formdata.clientId;
    const projectId = formdata.projectId;
    const departmentId = formdata.departmentId;
    const reportingId = formdata.tmorrmId
    this.subscription = this.http
      .getProjectResources(`ProjectResource/employees`, clientId, projectId, departmentId, reportingId)
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res.data)) {
            // ✅ Add "All Employees" option first
            const allEmployeesOption = {
              value: null,
              label: 'All Employees',
              key: 'all'
            };

            // ✅ Filter out logged-in user and map employee details
            const employeeList = res.data
              .filter((emp: any) => emp.employeeId !== EmployeeId)
              .map((emp: any) => ({
                value: emp.employeeId,
                label: emp.fusionEmpId
                  ? `${emp.fusionEmpId} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`
                  : `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
                key: 'all'
              }));

            // ✅ Merge lists (All Employees first)
            this.activeEmplist = [allEmployeesOption, ...employeeList];

            // ✅ Default selection — "All Employees"
            this.datepickerForm.patchValue({
              resourceId: null
            });
          } else {
            // fallback
            this.activeEmplist = [{ label: 'All Employees', value: null, key: 'all' }];
            this.datepickerForm.patchValue({
              resourceId: null
            });
          }
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.activeEmplist = [{ label: 'All Employees', value: null, key: 'all' }];
          this.datepickerForm.patchValue({
            resourceId: null
          });
        }
      });
  }

  onCheckemployee(employeed: any) {
    if (employeed === null) {
      this.page = 1;
      this.datepickerForm.get('resourceId')?.setValue(null);
      this.getteamsummary();
    }
  }

  onSubmit() {
    // Check if form is valid (optional)
    if (this.datepickerForm.invalid) {
      return;
    }
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null;
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : null;
    const empId = formValue.resourceId ?? null;
    const selectedEmployee = this.activeEmplist.find((emp: any) => emp.value === empId);
    const empName = selectedEmployee ? selectedEmployee.label : 'All Employees';
    //  Store it in BehaviorSubject (inside HttpService)
    this.http.setteamDateRange(start, end, empId, empName);
    // Trigger your existing API call
    this.page = 1;
    this.first = 0;
    this.getteamsummary();
  }



  getteamsummary() {
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const start = startDate
      ? dayjs(startDate).format('YYYY-MM-DD')
      : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate
      ? dayjs(endDate).format('YYYY-MM-DD')
      : dayjs().endOf('month').format('YYYY-MM-DD');
    let url = `Timesheet/teamsummary?startDate=${start}&endDate=${end}&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    const hasMyTeam = this.rbac.allowedToAccess('My Team (Timesheet).view');
    const hasAllEmployees = this.rbac.allowedToAccess('All Employees (Timesheet).view');
    // Case 1: Only "My Team (Timesheet).view" — include resourceId
    if (hasMyTeam && !hasAllEmployees) {
      url += `&resourceId=${this.empdata?.employeeId}`;
      // Include selected subordinate if chosen
      if (formValue.resourceId) {
        url += `&employeeId=${formValue.resourceId}`;
      }
    }
    // Case 2: "All Employees" or both claims — only send employeeId if present
    else if (formValue.resourceId) {
      url += `&employeeId=${formValue.resourceId}`;
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
            this.dateHeaders = this.teamSummaryData[0].dailyData.map(d =>
              dayjs(d.date).format('D MMM<br>ddd')
            );
          }
        }
      },
      error: () => {
        this.loading = false;
      }
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
    if (this.rbac.allowedToAccess('Team Time Sheet Summary Tab.view')) {
      this.router.navigate(['project-management/timesheet/resourcesummary'], { queryParams: { id: employeeId } });
    }
    else if (this.rbac.allowedToAccess('Team Time Sheet Detailed Tab.view')) {
      this.router.navigate(['project-management/timesheet/summary'], { queryParams: { id: employeeId } });
    }
  }
}