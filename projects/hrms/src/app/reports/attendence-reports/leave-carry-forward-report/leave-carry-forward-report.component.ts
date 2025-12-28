import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { IemployeeDetails } from '../reports.modal';
import { ILocation, ISubLocation, IShiftHeader, ICategoryDetails } from '../../../settings/time-off/flexible-leave-allocation/leave-allocation.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-leave-carry-forward-report',
  imports: [CommonModule, FormsModule, DropdownModule, SelectModule, MultiSelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './leave-carry-forward-report.component.html',
  styleUrl: './leave-carry-forward-report.component.scss'
})
export class LeaveCarryForwardReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredleaveRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  LeaveReportForm!: FormGroup;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  categoryDetails = [] as ICategoryDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedDateRange: any;
  wfhReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  filteredleaveRecords = false;
  selectLeaveEmployeeIds: number[] = [];
  getEmployeeInfo = [] as any;
  localeOptions: any;
  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear', // could be rtl
    };
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
    this.getAllLocations();
  }

  initializeForm() {
    this.LeaveReportForm = this.fb.group({
      employee: [{ value: null, disabled: true }],
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }],
      subLocation: [{ value: '', disabled: true }],
      shift: [{ value: '', disabled: true }],
      categoryName: [{ value: null, disabled: true }]
    });
    this.LeaveReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.LeaveReportForm.reset();
    this.filteredleaveRecord = [];
    this.disableBtn = false;
    this.subLocationDetails = [];
    this.shiftDetails = [];
    this.categoryDetails = [];
    this.employeeiddetails = [{ fullName: 'All Employees', employeeId: 'all' }];
    this.LeaveReportForm.get('employee')?.disable();
    this.LeaveReportForm.get('location')?.disable();
    this.LeaveReportForm.get('subLocation')?.disable();
    this.LeaveReportForm.get('shift')?.disable();
    this.LeaveReportForm.get('categoryName')?.disable();
  }

getEmployeeId() {
  // Initialize with default "All Employees" option
  this.employeeiddetails = [{ fullName: 'All Employees', employeeId: 'all' }];
}


getTeam() {
  const statuses = 'Active';
  this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
    next: (data: any) => {
      this.teamdetails = data
        .map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';

          return {
            ...employee,
            firstName, //  trimmed
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        })
        .sort((a: any, b: any) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
        );
    },
    error: (reason: any) => console.log(reason),
  });
}




  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as 'YYYY-MM-DD'
  }

  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }

  get isLeaveGenerateDisabled(): boolean {
    const { employee,  year, location, subLocation, shift, categoryName } = this.LeaveReportForm.value;
    // Year is mandatory, at least one other filter must be selected
    return !year || !(employee ||  location || subLocation || shift || categoryName);
  }

  get isClearAllDisabled(): boolean {
    const { employee, year, location, subLocation, shift, categoryName } = this.LeaveReportForm.value;
    return !(employee || year || location || subLocation || shift || categoryName);
  }

  isFilterApplied(): boolean {
    const { employee, year, location, subLocation, shift, categoryName } = this.LeaveReportForm.value;
    return !!(employee || year || location || subLocation || shift || categoryName);
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

  enableLocation(): void {
    if (this.LeaveReportForm.get('year')?.value) {
      this.LeaveReportForm.get('employee')?.enable();
      this.LeaveReportForm.get('location')?.enable();
      this.LeaveReportForm.get('location')?.reset();
      this.LeaveReportForm.get('subLocation')?.reset();
      this.LeaveReportForm.get('shift')?.reset();
      this.LeaveReportForm.get('categoryName')?.reset();
      this.LeaveReportForm.get('subLocation')?.disable();
      this.LeaveReportForm.get('shift')?.disable();
      this.LeaveReportForm.get('categoryName')?.disable();
      this.shiftDetails = [];
      this.categoryDetails = [];
      this.subLocationDetails = [];
    } else {
      this.LeaveReportForm.get('employee')?.disable();
      this.LeaveReportForm.get('location')?.disable();
      this.LeaveReportForm.get('subLocation')?.disable();
      this.LeaveReportForm.get('shift')?.disable();
      this.LeaveReportForm.get('categoryName')?.disable();
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationDetails = res.jobLocations || [];
        },
        error: err => console.error('Error fetching locations:', err)
      });
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.LeaveReportForm.get('subLocation')?.enable();
      this.LeaveReportForm.get('subLocation')?.reset();
      this.LeaveReportForm.get('shift')?.reset();
      this.LeaveReportForm.get('categoryName')?.reset();
      this.LeaveReportForm.get('employee')?.reset();
      this.employeeiddetails = [];
    } else {
      this.subLocationDetails = [];
      this.LeaveReportForm.get('subLocation')?.enable();
      this.LeaveReportForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    this.shiftDetails = [];
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };
    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
        this.LeaveReportForm.get('shift')?.enable();
        this.LeaveReportForm.get('shift')?.reset();
        this.LeaveReportForm.get('categoryName')?.reset();
        this.categoryDetails = [];
        // Fetch employees based on location and sublocation
        this.getEmployeesByLocationAndSubLocation(subLocation.jobLocationId, subLocation.id);
      },
      error: err => {
        console.error('Error fetching shifts:', err);
        this.shiftDetails = [];
        this.LeaveReportForm.get('shift')?.reset();
        this.LeaveReportForm.get('shift')?.disable();
      }
    });
  }

  getEmployeesByLocationAndSubLocation(locationId: number, subLocationId: number): void {
    this.http.getData(`Employeedata/getbylocationandsublocation/${locationId}/${subLocationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const employeedata = data
            .map((employee: any) => {
              const firstName = employee.firstName ? employee.firstName.trim() : '';
              const middleName = employee.middleName ? employee.middleName.trim() : '';
              const lastName = employee.lastName ? employee.lastName.trim() : '';

              return {
                ...employee,
                firstName,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
              };
            })
            .sort((a: any, b: any) =>
              a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
            );

          this.employeeiddetails = [
            { fullName: 'All Employees', employeeId: 'all' },
            ...employeedata
          ];
        },
        error: (reason: any) => {
          console.error('Error fetching employees by location:', reason);
          this.employeeiddetails = [{ fullName: 'All Employees', employeeId: 'all' }];
        },
      });
  }

  getCategoryDetails(policy: any): void {
    this.LeaveReportForm.get('categoryName')?.reset();
    this.LeaveReportForm.get('categoryName')?.enable();

    let params = {
      locationId: this.LeaveReportForm.get('location')?.value?.id,
      subLocationId: this.LeaveReportForm.get('subLocation')?.value?.id,
      year: this.LeaveReportForm.get('year')?.value,
      status: 'Published',
      shiftId: policy.id
    };

    this.http.getDataWithQueryParams("OrgLeavesCategories", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.categoryDetails = res;
      },
      error: err => {
        console.error('Error fetching categories:', err);
        this.categoryDetails = [];
        this.LeaveReportForm.get('categoryName')?.reset();
      }
    });
  }

  generateleaveReport(): void {
    if (this.LeaveReportForm.invalid) {
      this.LeaveReportForm.markAllAsTouched();
      return;
    }

    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.LeaveReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    
    const request: IAttendanceDetails = {};

    if (this.selectLeaveEmployeeIds.length >= 0) {
      const ids = this.selectLeaveEmployeeIds?.join(',');
      request.employeeId = ids;
    }


    if (formValue.year) {
      request.year = formValue.year;
    }

    if (formValue.location) {
      request.locationIds = formValue.location.id;
    }

    if (formValue.subLocation) {
      request.subLocationIds = formValue.subLocation.id;
    }

    if (formValue.shift) {
      request.shiftIds = formValue.shift.id;
    }

    if (formValue.categoryName) {
      request.leaveCategoryIds = formValue.categoryName.id;
    }



    // Apply manager name if provided
    // if (formValue.manager) {
    //   request.teamManagerID = formValue.manager.employeeId;
    // }

       // Year
    if (formValue.year) {
      request.year = formValue.year;
    }

    // Only include employee filter if not "All Employees"
    if (!isAllEmployeesSelected && formValue.employee?.employeeId) {
      request.employeeId = formValue.employee.employeeId;
    }

    this.reportsService.getLeaveCarryForwardReport(request).subscribe({
      next: (response: any) => {
        this.filteredleaveRecord = response.data ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredleaveRecord = [];
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

 exportToExcelYearly(): void {
  this.spinnerLoader2 = true;

  const HEADER_MAPPINGS: { [key: string]: string } = {
    fusionEmpId: 'EMPLOYEE ID',
    employeeName: 'EMPLOYEE NAME',
    department: 'DEPARTMENT',
    subDepartment: 'TEAM',
    teamManagerName: 'TEAM MANAGER',
    year: 'YEAR',
    shift: 'SHIFT',
    location: 'LOCATION',
    subLocation: 'SUB LOCATION',
    leaveType: 'LEAVE TYPE',
    entitled: 'ENTITLED',
    availed: 'AVAILED',
    balance: 'BALANCE',
    maxCarryForward: 'MAX CARRY FORWARD',
    actualCarryForward: 'ACTUAL CARRY FORWARD',
    maxEncashment: 'MAX ENCASHMENT',
    leaveEncashed: 'LEAVES ENCASED',
    leaveLapsed: 'LEAVES LAPSED'
  };

  const NEW_SEQUENCE: string[] = [
    'EMPLOYEE ID',
    'EMPLOYEE NAME',
    'DEPARTMENT',
    'TEAM',
    'TEAM MANAGER',
    'YEAR',
    'SHIFT',
    'LOCATION',
    'SUB LOCATION',
    'LEAVE TYPE',
    'ENTITLED',
    'AVAILED',
    'BALANCE',
    'MAX CARRY FORWARD',
    'ACTUAL CARRY FORWARD',
    'MAX ENCASHMENT',
    'LEAVES ENCASED',
    'LEAVES LAPSED'
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '-');
  };

  const modifiedData = this.filteredleaveRecord.map(record => {
    const row: any = {};
    NEW_SEQUENCE.forEach(col => {
      const originalKey = Object.keys(HEADER_MAPPINGS)
        .find(k => HEADER_MAPPINGS[k] === col);

      row[col] =
        originalKey && record.hasOwnProperty(originalKey)
          ? ['startdate', 'enddate', 'appliedDate'].includes(originalKey)
            ? formatDate(record[originalKey])
            : record[originalKey]
          : '';
    });
    return row;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

  /* =========================
     TITLE
     ========================= */
  ws['!merges'] = [{
    s: { r: 0, c: 0 },
    e: { r: 0, c: NEW_SEQUENCE.length - 1 }
  }];

  XLSX.utils.sheet_add_aoa(ws, [['LEAVE CARRY FORWARD REPORT']], { origin: 'A1' });

  ws['A1'].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  /* =========================
     HEADERS
     ========================= */
  XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });

  NEW_SEQUENCE.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: index });
    ws[cellRef].s = {
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  });

  /* =========================
     DATA
     ========================= */
  XLSX.utils.sheet_add_json(ws, modifiedData, {
    origin: 'A3',
    skipHeader: true
  });

  /* =========================
     FILTERS (IMPORTANT)
     ========================= */
  ws['!autofilter'] = {
    ref: `A2:${XLSX.utils.encode_col(NEW_SEQUENCE.length - 1)}2`
  };

  /* =========================
     COLUMN WIDTH
     ========================= */
  ws['!cols'] = NEW_SEQUENCE.map(col => ({
    wch: Math.max(
      col.length,
      ...modifiedData.map(r => String(r[col] ?? '').length)
    ) + 2
  }));

  /* =========================
     WORKBOOK
     ========================= */
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leave Carry Forward Report');
  XLSX.writeFile(wb, 'Leave_Carry_Forward_Report.xlsx');

  this.spinnerLoader2 = false;
}

markYearTouched(): void {
  this.LeaveReportForm.get('year')?.markAsTouched();
}

onYearChange(): void {
  const control = this.LeaveReportForm.get('year');
  control?.markAsTouched();
  control?.updateValueAndValidity();
}


  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);
    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      this.filteredleaveRecords = true;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectLeaveEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }

 getMyTeam() {
  const EmployeeId = this.loggedInUser?.employeeId;
  this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
    next: (response: any) => {
      if (response) {
        const myTeam = response.filter((e: any) => e.isAccess);

        this.getEmployeeInfo = myTeam
          .map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';

            return {
              ...employee,
              firstName, //  trimmed
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          })
          .sort((a: any, b: any) =>
            a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
          );

        // Insert "All Employees" at the top
        this.getEmployeeInfo.unshift({
          fullName: 'All Employees',
          fusionEmpId: this.loggedInUser.fusionEmpId,
          employeeId: this.loggedInUser.employeeId,
        });
      }
    },
    error: (err) => console.log(err),
  });
}


  // isAnyFilterApplied(): boolean {
  //   const form = this.LeaveReportForm.value;
  //   return !!(form.dateRange || form.employee || form.manager || form.team || form.leaveCategory);
  // }

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