import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { IemployeeDetails } from '../../attendence-reports/reports.modal';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-consolidated-timesheet-summary',
  imports: [DatePicker, CommonModule, MultiSelectModule, TableModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './consolidated-timesheet-summary.component.html',
  styleUrl: './consolidated-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ConsolidatedTimesheetSummaryComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  filteredWeeklyTimesheetRecord: any[] = [];
  WeeklyTimesheetReportForm!: FormGroup;
  appliedFilters: any = null;
  spinnerLoader1 = false;
  downloadLoader = false;
  disableBtn = false;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  employeeData: any[] = [];
  employeeiddetails: any[] = [];

  BillableOptions = [
    { key: 'Billable', value: 'Billable' },
    { key: 'Non-Billable', value: 'Non-Billable' }
  ];

  TimesheetStatus = [
    { key: 'Waiting for Approval', value: 'Waiting for Approval' },
    { key: 'Approved', value: 'Processed' }
  ];

  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  
  today: Date = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string = ''; // Track the UI field name for visual state
  suppressNextPageChange = false;
  
  // Sort field mapping for server-side sorting
  readonly sortFieldMap: Record<string, string> = {
    date: 'date',
    fusionEmpId: 'fusionEmpId',
    employee: 'employee',
    hoursWorked: 'hoursWorked',
    billableStatus: 'billableStatus',
    submittedDate: 'submittedDate',
    approvedBy: 'approvedBy',
    processedOn: 'processedOn'
  };

  getDefaultDateRange(): [Date, Date] {
    const today = new Date(this.today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return [startOfMonth, today];
  }

  constructor(
    public authService: AuthService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private conformationPopup: OpenModalService,
    private offcanvasService: NgbOffcanvas
  ) { }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      date: 'date',
      fusionEmpId: 'fusionEmpId',
      employee: 'employee',
      hoursWorked: 'hoursWorked',
      billableStatus: 'billableStatus',
      submittedDate: 'submittedDate',
      approvedBy: 'approvedBy',
      processedOn: 'processedOn'
    };

    const nextSortField = backendFieldMap[field] || field;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    // Prevent duplicate API calls
    if (
      this.currentSortField === nextSortField &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    // Handle the three-state sorting: none → asc → desc → none
    if (this.currentUIField === field) {
      // Same field clicked - cycle through states
      if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentUIField = '';
        this.currentSortOrder = 0;
        // Reset to first page and reload data without sorting
        this.page = 1;
        this.first = 0;
        this.generateWeeklyTimesheetReport(this.page, this.pageSize, true, true);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    // Reset to first page when sorting changes
    this.page = 1;
    this.first = 0;
    
    // Call generate to refresh data with new sorting
    this.generateWeeklyTimesheetReport(this.page, this.pageSize, true, true);
  }





  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeData();
  }

  initializeForm() {
    this.WeeklyTimesheetReportForm = this.fb.group({
      employeid: [[]],
      dateRange: [this.getDefaultDateRange()],
      billable: [[]],
      status: [[]]
    });
  }

  captureAppliedFilters(): any {
    const v = this.WeeklyTimesheetReportForm.value;
    return {
      employeid: Array.isArray(v.employeid) ? [...v.employeid] : [],
      dateRange: Array.isArray(v.dateRange) ? [v.dateRange[0] ?? null, v.dateRange[1] ?? null] : null,
      billable: Array.isArray(v.billable) ? [...v.billable] : [],
      status: Array.isArray(v.status) ? [...v.status] : []
    };
  }

  isAppliedFilterIndicatorVisible(): boolean {
    if (!this.appliedFilters) return false;
    const formValue = this.appliedFilters;
    const isEmployeeSelected = Array.isArray(formValue.employeid) ? formValue.employeid.length > 0 : !!formValue.employeid;
    const statusSelectedValues = Array.isArray(formValue.status)
      ? formValue.status.filter((v: string) => this.TimesheetStatus.some(s => s.value === v))
      : [];
    const billableSelectedValues = Array.isArray(formValue.billable)
      ? formValue.billable.filter((v: string) => this.BillableOptions.some(b => b.value === v))
      : [];
    const isStatusSelected = statusSelectedValues.length > 0;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? !!formValue.dateRange[0] : !!formValue.dateRange;
    const isBillableSelected = billableSelectedValues.length > 0;
    return (isEmployeeSelected || isStatusSelected || isDateRangeSelected || isBillableSelected);
  }

  isFilterApplied(): boolean {
    const formValue = this.WeeklyTimesheetReportForm.value;
    const isEmployeeSelected = Array.isArray(formValue.employeid) ? formValue.employeid.length > 0 : !!formValue.employeid;
    const statusSelectedValues = Array.isArray(formValue.status)
      ? formValue.status.filter((v: string) => this.TimesheetStatus.some(s => s.value === v))
      : [];
    const billableSelectedValues = Array.isArray(formValue.billable)
      ? formValue.billable.filter((v: string) => this.BillableOptions.some(b => b.value === v))
      : [];
    const isStatusSelected = statusSelectedValues.length > 0;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? !!formValue.dateRange[0] : !!formValue.dateRange;
    const isBillableSelected = billableSelectedValues.length > 0;
    return (isEmployeeSelected || isStatusSelected || isDateRangeSelected || isBillableSelected);
  }

  clearAllFilters(): void {
    this.WeeklyTimesheetReportForm.reset({
      employeid: [],
      dateRange: this.getDefaultDateRange(),
      billable: [],
      status: []
    });
    this.appliedFilters = null;
    this.filteredWeeklyTimesheetRecord = [];
    this.collectionSize = 0;
    this.disableBtn = false;
    
    // Reset sorting arrows and pagination - use null and 0 for proper reset
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    
    // Reset pagination to first page
    this.page = 1;
    this.first = 0;
    
    // Prevent suppression of next page change to ensure proper reset
    this.suppressNextPageChange = false;
    
    // Close the offcanvas after clearing
    this.closeCanvas();
  }

  onGenerate() {
    this.appliedFilters = this.captureAppliedFilters();
    this.generateWeeklyTimesheetReport(this.page, this.pageSize, true, true, true);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generateWeeklyTimesheetReport(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    if (this.suppressNextPageChange && event?.page === 0 && event?.first === 0) {
      this.suppressNextPageChange = false;
      return;
    }
    this.suppressNextPageChange = false;
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generateWeeklyTimesheetReport(this.page, this.pageSize, true, false);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generateWeeklyTimesheetReport(this.page, this.pageSize, true, true);
  }

  getEmployeeData() {
    const status = 'Active,Trainee Active,Active Contract';
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
      next: (data: any) => {
        const employeedata = (data || []).map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';
          return {
            ...employee,
            firstName,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
          };
        });
        this.employeeiddetails = [...employeedata];
        this.employeeData = this.employeeiddetails.map((e: any) => ({
          id: e.employeeId,
          name: e.fullName
        }));
      },
      error: (reason: any) => {
        console.error('Error fetching employees:', reason);
        this.employeeData = [];
      }
    });
  }

  get isLeaveGenerateDisabled(): boolean {
    const { employeid, dateRange, billable, status } = this.WeeklyTimesheetReportForm.value;
    const hasEmployee = Array.isArray(employeid) && employeid.length > 0;
    const hasDateRange = Array.isArray(dateRange) && !!dateRange[0];
    const hasBillable = Array.isArray(billable) && billable.some((v: string) => this.BillableOptions.some(b => b.value === v));
    const hasStatus = Array.isArray(status) && status.some((v: string) => this.TimesheetStatus.some(s => s.value === v));
    return !(hasEmployee || hasDateRange || hasBillable || hasStatus);
  }

  buildTimesheetReportParams(formValue: any = this.WeeklyTimesheetReportForm.value) {
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const startDateRaw = formValue.dateRange?.[0] ?? null;
    const endDateRaw = formValue.dateRange?.[1] ?? null;
    const startDate = startDateRaw ? formatDate(startDateRaw) : null;
    const endDate = (endDateRaw || startDateRaw) ? formatDate((endDateRaw || startDateRaw) as Date) : null;

    const statusSelections = Array.isArray(formValue.status)
      ? formValue.status.filter((v: string) => this.TimesheetStatus.some(s => s.value === v))
      : [];
    const billableSelections = Array.isArray(formValue.billable)
      ? formValue.billable.filter((v: string) => this.BillableOptions.some(b => b.value === v))
      : [];

    const params: any = {
      ReportType: 'ConsolidatedTimesheetSummary'
    };

    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.employeid && formValue.employeid.length > 0) {
      params.EmployeeIds = formValue.employeid;
    }
    if (billableSelections.length > 0) {
      params.BillableTypes = billableSelections.join(',');
    }
    if (statusSelections.length > 0) {
      params.Statuses = statusSelections.join(',');
    }
    return params;
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

  generateWeeklyTimesheetReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false, closeAfterGenerate: boolean = false) {
    if (this.WeeklyTimesheetReportForm.invalid) return;
    if (resetPagination) {
      this.page = 1;
      this.first = 0;
    }
    if (showLoader) this.spinnerLoader1 = true;
    const params = this.buildTimesheetReportParams(this.appliedFilters ?? this.WeeklyTimesheetReportForm.value);
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to the query string
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader1 = false;
        if (res.success && res.data?.items) {
          this.filteredWeeklyTimesheetRecord = res.data.items;
          this.collectionSize = res.data.totalCount || 0;
          if (this.first >= this.collectionSize) {
            this.first = 0;
            this.page = 1;
          }
          this.disableBtn = false;
          if (closeAfterGenerate) this.closeCanvas();
        } else {
          this.filteredWeeklyTimesheetRecord = [];
          this.collectionSize = 0;
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        console.error('Error fetching report:', err);
        this.appliedFilters = null;
        this.filteredWeeklyTimesheetRecord = [];
        this.collectionSize = 0;
        this.disableBtn = true;
      }
    });
  }

  exportWeeklyTimesheetReport() {
    this.downloadLoader = true;
    const params = this.buildTimesheetReportParams(this.appliedFilters ?? this.WeeklyTimesheetReportForm.value);
    const queryString = new URLSearchParams(params).toString();

    // Add sorting to export as well
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';

    // Ensure your service method returns Observable<HttpResponse<Blob>> 
    // by using { observe: 'response', responseType: 'blob' } in the HttpClient call.
    this.http.downloadTimesheetReport(`TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.downloadLoader = false;

        // 1. Start with the clean fallback name (no V1)
        let filename = this.generateFileName();

        // 2. Try to extract the backend filename (which includes the correct version)
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
          const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

          if (utf8FilenameMatch && utf8FilenameMatch[1]) {
            filename = decodeURIComponent(utf8FilenameMatch[1]);
          } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
            filename = asciiFilenameMatch[1];
          }
        }

        const blob = new Blob([response.body!], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.conformationPopup.openSuccessModal("Consolidated Timesheet Summary Report Exported Successfully");
      },
      error: (err: any) => {
        this.downloadLoader = false;
        this.conformationPopup.openErrorModal('No records found');
      }
    });
  }

  generateFileName(): string {
    const formValue = this.WeeklyTimesheetReportForm.value;
    let employeeName = 'AllEmployees';
    if (formValue.employeid && formValue.employeid.length === 1) {
      const emp = this.employeeiddetails.find((e: any) => e.employeeId === formValue.employeid[0]);
      if (emp) {
        employeeName = `${emp.firstName}${emp.middleName ? ' ' + emp.middleName : ''}${emp.lastName ? ' ' + emp.lastName : ''}`.trim();
      }
    } else if (formValue.employeid && formValue.employeid.length > 1) {
      employeeName = 'MultipleEmployees';
    }

    const formatDateForFilename = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    };

    let dateRange = '';
    if (formValue.dateRange && formValue.dateRange[0] && formValue.dateRange[1]) {
      const startDate = formatDateForFilename(new Date(formValue.dateRange[0]));
      const endDate = formatDateForFilename(new Date(formValue.dateRange[1]));
      dateRange = `${startDate} - ${endDate}`;
    }

    // CHANGE: Removed hardcoded "V1" so it's a clean fallback
    // If backend header works, this won't be used.
    // If backend header fails, you get "Name DateRange.xlsx" instead of "Name V1..."
    return `${employeeName} ${dateRange}.xlsx`.trim();
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}