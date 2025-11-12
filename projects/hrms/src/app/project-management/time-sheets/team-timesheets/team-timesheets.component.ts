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
@Component({
  selector: 'app-team-timesheets',
  imports: [TimesheetsTabsComponent, FormsModule, ReactiveFormsModule, PaginatorModule, DatePicker, TranslateModule,
    CommonModule, ProjectManagementModuleInfoComponent, Select, DataLoaderContentComponent, NoDataFoundComponent, NgbPopoverModule, InfoIconComponent, DateformatPipe],
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

  constructor(private fb: FormBuilder, private http: HttpService, public rbac: RbacService, private router: Router, private modalService: NgbModal) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDatepickerForm();
    this.setDefaultmounth();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.getteamsummary(); // always call once
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any field has value
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0)
    );
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
      resourceId: [null]
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
    this.selectedEntries = entries;
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
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const satus = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
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
    // Trigger your existing API call
    this.page = 1; // Reset to first page on new filter apply
    this.getteamsummary();
  }

  getteamsummary() {
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const resourceId = formValue.resourceId ? `&employeeId=${formValue.resourceId}` : '';
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const url = `Timesheet/teamsummary?resourceId=${this.empdata?.employeeId}${resourceId}&startDate=${start}&endDate=${end}&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    this.loading = true
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.teamSummaryData = res.data;
          this.totalhrs = res?.pagination?.meta?.totalLoggedHHMMAllEmployees || '00:00';
          this.collectionSize = res.pagination.totalRecords;
          // Extract dates for header dynamically (use first record)
          if (this.teamSummaryData.length > 0) {
            this.dateHeaders = this.teamSummaryData[0].dailyData.map(d =>
              dayjs(d.date).format('ddd<br>MMM D')
            );
          }
        }
      },
      error: (err) => {
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
    this.router.navigate(['project-management/timesheet/summary'], { queryParams: { id: employeeId } });
  }
}