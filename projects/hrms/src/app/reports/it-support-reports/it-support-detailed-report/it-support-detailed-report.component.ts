import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPopoverModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { IemployeeDetails } from '../../attendence-reports/reports.modal';

@Component({
  selector: 'app-it-support-detailed-report',
  imports: [ DatePicker, NgbPopoverModule, MultiSelectModule, CommonModule, FormsModule,
    DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent,
    ReportsHeaderComponent, InfoIconComponent],
  templateUrl: './it-support-detailed-report.component.html',
  styleUrl: './it-support-detailed-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ItSupportDetailedReportComponent implements OnInit, OnDestroy {
 // Subscription management
  subscription!: Subscription;
  destroy$ = new Subject<boolean>();

  // User and authentication data
  loggedInUser = {} as IemployeeDetails;
  empinfo: any;

  // Loading states
  isLoading: boolean = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;

  // Form and filter management
  itsupportdetailedReportForm!: FormGroup;
  isFilterIndicatorActive = false;
  disableBtn = false;

  // Data arrays
  filtereditsupportdetailedRecord: any[] = [];
  projectsData: any[] = [];
  filteredProjects: any[] = [];
  departmentDetails = [];
  getAllEmployeeInfo = [] as any;
  teamdetails = [] as any[];
  categoryList = [] as any[];
  subcategoryList = [] as any[];
  getEmployeeInfo = [] as any;
  employeeData: any;
  phasesList: any[] = [];

  // Pagination configuration
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

  // Date and utility properties
  today: Date = new Date();
  isDistinct = true;

  // Help desk status options
  helpDeskStatus = [
    { key: 'Open', value: 'Open' },
    { key: 'Closed', value: 'Closed' },
    { key: 'Await on User', value: 'Await on User' },
    { key: 'Rejected', value: 'Rejected' },
  ];
  /**
   * Constructor - Inject required services
   */
  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private conformationPopup: OpenModalService,
    private offcanvasService: NgbOffcanvas,
  ) { }

  // Component initialization Sets up user data, form, and loads initial dropdown data
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getDepartment();
    this.getAllEmployeeDetails();
    this.getTeam();
    this.getCategory();
  }
  // Fetch department/category data for dropdown
  getDepartment() {
    this.subscription = this.http.getData('HelpDeskCategory/getAll').subscribe({
      next: (data: any) => {
        this.departmentDetails = data;
      },
      error: (reason: any) => console.log(reason),
    });
  }
  //Initialize the report filter form with default valuesSets up form change detection to enable/disable generate button
  initializeForm() {
    this.itsupportdetailedReportForm = this.fb.group({
      category: [null],
      subcategory: [null],
      department: [null],
      dateRange: [null],
      status: [null],
      assignedto: [null],
      employeeId: [null],
    });

    // Enable generate button when form values change
    this.itsupportdetailedReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    });
  }
  /**
   * Check if any filters are currently applied
   * @returns boolean indicating if filters are active
   */
  isFilterApplied(): boolean {
    const formValue = this.itsupportdetailedReportForm.value;

    // Check each filter field for values
    const isCategorySelected = Array.isArray(formValue.category)? formValue.category.length > 0 : !!formValue.category;
    const isSubcategorySelected = Array.isArray(formValue.subcategory)? formValue.subcategory.length > 0 : !!formValue.subcategory;
    const isEmployeeSelected = Array.isArray(formValue.employeeId)? formValue.employeeId.length > 0: !!formValue.employeeId;
    const isAssignedToSelected = Array.isArray(formValue.assignedto)? formValue.assignedto.length > 0: !!formValue.assignedto;
    const isStatusSelected = Array.isArray(formValue.status) ? formValue.status.length > 0 : !!formValue.status;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length === 2 && formValue.dateRange[0] && formValue.dateRange[1] : false;
  return (isCategorySelected || isSubcategorySelected || isEmployeeSelected || isAssignedToSelected || isStatusSelected || isDateRangeSelected);
  }
  /**
   * Clear all applied filters and reset form to initial state
   */
  clearAllFilters(): void {
    // Reset all data arrays
    this.filteredProjects = [];
    this.filtereditsupportdetailedRecord = [];
    this.subcategoryList = [];

    // Reset form and individual form controls
    this.itsupportdetailedReportForm.reset();
    this.itsupportdetailedReportForm.get('category')?.setValue(null);
    this.itsupportdetailedReportForm.get('subcategory')?.setValue(null);
    this.itsupportdetailedReportForm.get('employeeId')?.setValue(null);
    this.itsupportdetailedReportForm.get('assignedto')?.setValue(null);
    this.itsupportdetailedReportForm.get('status')?.setValue(null);
    this.itsupportdetailedReportForm.get('dateRange')?.setValue(null);

    // Reset UI indicators
    this.isFilterIndicatorActive = false;
    this.collectionSize = 0;
  }

  /**
   * Open the filter panel as an offcanvas sidebar
   * @param content Template reference for the filter content
   */
  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  // Close the filter offcanvas panel
  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  // Generate the help desk detailed report with current filters

  onGenerate() {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateitsupportdetailedReport(this.page, this.pageSize, true, true);
  }
  // Handle rows per page change - reset to first page
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generateitsupportdetailedReport(this.page, this.pageSize);
  }

  /**
   * Handle page navigation in paginator
   * @param event Pagination event containing page and row information
   */
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generateitsupportdetailedReport(this.page, this.pageSize, false, false);
  }

  /**
   * Handle page size change from dropdown
   * @param newPageSize New number of rows per page
   */
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generateitsupportdetailedReport(this.page, this.pageSize, true, true);
  }
  /**
   * Determine if the generate button should be disabled
   * @returns true if no filters are selected, false otherwise
   */
  get isLeaveGenerateDisabled(): boolean {
    const { category, subcategory, dateRange, employeeId, status, assignedto } = this.itsupportdetailedReportForm.value;

    // Check if each filter has a valid value
    const hascategory = category !== null && category !== undefined;
    const hassubcategory = subcategory !== null && subcategory !== undefined;
    const hasDateRange = Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1];
    const hasemployeeId = employeeId !== null && employeeId !== undefined;
    const hasStatus = status !== null && status !== undefined;
    const hasassignedto = assignedto !== null && assignedto !== undefined;

    // Disable if no filters are selected
    return !(hascategory || hassubcategory || hasDateRange || hasemployeeId || hasStatus || hasassignedto);
  }
  /**
   * Build parameters object for help desk report API call
   * @returns Object containing formatted filter parameters
   */
  buildHelpdeskReportParams() {
    const formValue = this.itsupportdetailedReportForm.value;
    console.log(formValue);
    const employeeId = this.empinfo?.employeeId || 0;

    /**
     * Format date to MM/dd/yyyy string format
     * @param date Date object to format
     * @returns Formatted date string or null
     */
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const startDate = formValue.dateRange?.[0] ? formatDate(formValue.dateRange[0]) : null;
    const endDate = formValue.dateRange?.[1] ? formatDate(formValue.dateRange[1]) : null;
    const params: any = {};
    if(formValue.employeeId !== null && formValue.employeeId !== undefined) {
      params.EmpId = formValue.employeeId ? formValue.employeeId : 0;
    }
    if (formValue.category !== null && formValue.category !== undefined) {
      params.CategoryId = formValue.category ? formValue.category : 0;
    }
    if (formValue.subcategory !== null && formValue.subcategory !== undefined) {
      params.SubCategoryId = formValue.subcategory ? formValue.subcategory : 0;
    }
    if (startDate) params.FromDate = startDate;
    if (endDate) params.ToDate = endDate;
    if (formValue.status) {
      params.Status = formValue.status?.map((x: any) => x.value)?.join(',');
    }
    if (formValue.assignedto !== null && formValue.assignedto !== undefined) {
      params.AssignedTo = formValue.assignedto;
    }
    return params;
  }
// generate api
  generateitsupportdetailedReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.itsupportdetailedReportForm.invalid) return;
    // Only reset pagination when explicitly requested
    if (resetPagination) {
      this.page = 1;
      this.first = 0;
    }
    if (showLoader) this.spinnerLoader1 = true;
    const params = this.buildHelpdeskReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.getDataIncludeParams(`v2/Reports/ItSupportDetailedReports?${queryString}&page=${this.page}&pageSize=${this.pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader1 = false;
        this.offcanvasService.dismiss();
        console.log('API Response:', res.items);
        if (res?.items?.length > 0) {
          this.filtereditsupportdetailedRecord = res?.items;
          this.collectionSize = res.totalCount || 0;
          // If total count smaller than current offset, go back to first
          if (this.first >= this.collectionSize) {
            this.first = 0;
            this.page = 1;
          }
          this.disableBtn = false;
        } else {
          this.filtereditsupportdetailedRecord = [];
          this.collectionSize = 0;
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        console.error('Error fetching report:', err);
        this.filtereditsupportdetailedRecord = [];
        this.collectionSize = 0;
        this.disableBtn = true;
        this.offcanvasService.dismiss();
      },
    });
  }
// export api
  exportitsupportdetailedreport() {
    if (this.itsupportdetailedReportForm.invalid) return;
    this.spinnerLoader2 = true;
    const params = this.buildHelpdeskReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.downloadTimesheetReport(`v2/Reports/itsupportdetailedexportreport?${queryString}&page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.spinnerLoader2 = false;
        // Extract filename from Content-Disposition
        let filename = `Detailed Queries Report - ${this.http.formattedDate}.xlsx`;

        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          // Handle both regular and UTF-8 encoded filenames
          const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
          const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

          if (utf8FilenameMatch && utf8FilenameMatch[1]) {
            filename = decodeURIComponent(utf8FilenameMatch[1]);
          } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
            filename = asciiFilenameMatch[1];
          }
        }
        // Download the blob as before
        const blob = new Blob([response.body!], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Downloaded file:', filename);
        this.conformationPopup.openSuccessModal("IT Support detailed report exported successfully");
      },
      error: (err: any) => {
        this.spinnerLoader2 = false;
        this.conformationPopup.openErrorModal('No records found');
      },
      complete: () => { }
    });
  }
 getAllEmployeeDetails() {
    const statuses = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.getAllEmployeeInfo = response
              // .filter(
              //   (employee: any) =>
              //     employee.employeeId !== this.empinfo.employeeId
              // )
              .map((employee: any) => ({
                ...employee,
                fullName: `${
                  employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName ?? ''} ${
                  employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName ?? ''}`.trim(),
              }))
              .sort((a: any, b: any) =>
                (a.firstName ?? '').localeCompare(b.firstName ?? '')
              ); //  Sort by first name
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  getTeam() {
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
      next: (data: any) => {
        this.teamdetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => console.log(reason),
    });
  }
    getCategory() {
    this.subscription = this.http.getData(`entityAttributeValues/getv1?entity=ItSupport&attribute=Category`).subscribe({
      next: (data: any) => {
        this.categoryList = data;
      },
      error: (reason: any) => console.log(reason),
    });
  }
  getSubcategory(value: any) {
    this.itsupportdetailedReportForm.get('subcategory')?.setValue(null);

    // If no categories selected, clear subcategory list
    if (!value || (Array.isArray(value) && value.length === 0)) {
      this.subcategoryList = [];
      return;
    }

    this.subscription = this.http.getData(`entityAttributeValues/getv1?entity=ItSupport&attribute=SubCategory`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          // Parse meta if it's a string
          const parsedData = data.map((item: any) => ({
            ...item,
            meta: typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta
          }));
          // Support multiple selected category IDs
          const selectedIds: number[] = Array.isArray(value) ? value : [value];
          this.subcategoryList = parsedData.filter(
            (item: any) => selectedIds.includes(item.meta?.id)
          );
        } else {
          this.subcategoryList = [];
        }
      },
      error: (reason: any) => {
        this.itsupportdetailedReportForm.get('subcategory')?.setValue(null);
        this.subcategoryList = [];
        console.log(reason);
      }
    });
  }
  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
