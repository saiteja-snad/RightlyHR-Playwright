import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation, ViewChild } from '@angular/core';
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
import dayjs, { Dayjs } from 'dayjs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-leave-carry-forward-report',
  imports: [CommonModule, FormsModule, DropdownModule, SelectModule, MultiSelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent, TableModule],
  templateUrl: './leave-carry-forward-report.component.html',
  styleUrl: './leave-carry-forward-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LeaveCarryForwardReportComponent implements OnInit, OnDestroy {
  @ViewChild('carryForwardTable') carryForwardTable!: Table;
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
  isFilterIndicatorActive = false;
  disableBtn = false;
  filteredleaveRecords = false;
  selectLeaveEmployeeIds: number[] = [];
  getEmployeeInfo = [] as any;
  localeOptions: any;
  isYearDropdownTouched = false;
  originalFilteredleaveRecord: any[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
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
    this.getEmployees();
  }

  initializeForm() {
    this.LeaveReportForm = this.fb.group({
      employee: [[]],
      year: [null, Validators.required],
      location: [[]],
      subLocation: [[]],
      shift: [[]],
      categoryName: [[]]
    });
    this.LeaveReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.LeaveReportForm.reset({
      employee: [],
      year: null,
      location: [],
      subLocation: [],
      shift: [],
      categoryName: []
    }, { emitEvent: false });
    this.filteredleaveRecord = [];
    this.isFilterIndicatorActive = false;
    this.disableBtn = false;
    this.subLocationDetails = [];
    this.shiftDetails = [];
    this.categoryDetails = [];
    this.employeeiddetails = [];
    this.getEmployees();
    this.isYearDropdownTouched = false;
  }

getEmployeeId() {
  // Initialize with default "All Employees" option
  this.employeeiddetails = [];
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
    const { year } = this.LeaveReportForm.value;
    return !year || this.spinnerLoader1;
  }

  get isClearAllDisabled(): boolean {
    const { employee, year, location, subLocation, shift, categoryName } = this.LeaveReportForm.value;
    return !(
      (employee && employee.length > 0) ||
      year ||
      (location && location.length > 0) ||
      (subLocation && subLocation.length > 0) ||
      (shift && shift.length > 0) ||
      (categoryName && categoryName.length > 0)
    );
  }

  isFilterApplied(): boolean {
    const { employee, year, location, subLocation, shift, categoryName } = this.LeaveReportForm.value;
    return !!(
      (employee && employee.length > 0) ||
      year ||
      (location && location.length > 0) ||
      (subLocation && subLocation.length > 0) ||
      (shift && shift.length > 0) ||
      (categoryName && categoryName.length > 0)
    );
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
    this.LeaveReportForm.markAsUntouched();
    this.isYearDropdownTouched = false;
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateleaveReport();
  }

  enableLocation(): void {
    this.LeaveReportForm.patchValue({
      // employee: [],
      location: [],
      subLocation: [],
      shift: [],
      categoryName: []
    }, { emitEvent: false });
    this.shiftDetails = [];
    this.categoryDetails = [];
    this.subLocationDetails = [];
    // this.getEmployees();
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

  onLocationChange(event: any): void {
    const selectedLocations = event.value;
    if (selectedLocations && selectedLocations.length > 0) {
      // Collect all sub-locations from selected locations
      let allSubLocations: ISubLocation[] = [];
      selectedLocations.forEach((location: ILocation) => {
        if (location.jobSubLocations && location.jobSubLocations.length > 0) {
          allSubLocations = allSubLocations.concat(location.jobSubLocations);
        }
      });
      this.subLocationDetails = allSubLocations;
      const locationIds = selectedLocations.map((loc: any) => loc.id).join(',');
      this.getEmployees(locationIds);
    } else {
      this.subLocationDetails = [];
      this.getEmployees();
    }
    this.LeaveReportForm.get('subLocation')?.reset();
    this.LeaveReportForm.get('shift')?.reset();
    this.LeaveReportForm.get('categoryName')?.reset();
    this.shiftDetails = [];
    this.categoryDetails = [];

  }

  getAllShifts(event: any): void {
    const selectedSubLocations = event.value;
    const selectedLocations = this.LeaveReportForm.get('location')?.value;
    const selectedYear = this.LeaveReportForm.get('year')?.value;

    if (selectedSubLocations && selectedSubLocations.length > 0 && selectedLocations && selectedLocations.length > 0 && selectedYear) {
      this.shiftDetails = [];
      const locationIds = selectedLocations.map((loc: any) => loc.id).join(',');
      const subLocationIds = selectedSubLocations.map((sub: any) => sub.id).join(',');

      const params = {
        locationIds: locationIds,
        subLocationIds: subLocationIds,
        year: selectedYear
      };

      this.http.getDataWithQueryParams(`orgShifts/get-shifts`, params).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.shiftDetails = res?.data.flatMap((item: any) => item.orgShiftsItems || []);
          this.LeaveReportForm.get('shift')?.reset();
          this.LeaveReportForm.get('categoryName')?.reset();
          this.categoryDetails = [];
          this.getEmployees(locationIds, subLocationIds);
        },
        error: err => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.LeaveReportForm.get('shift')?.reset();
          this.categoryDetails = [];
        }
      });
    } else {
      this.shiftDetails = [];
      this.LeaveReportForm.get('shift')?.reset();
      this.categoryDetails = [];
      this.LeaveReportForm.get('categoryName')?.reset();
    }
  }

  getEmployees(locationIds?: string, subLocationIds?: string): void {
    let params: any = {};
    if (locationIds) {
      params.locationIds = locationIds;
    }
    if (subLocationIds) {
      params.subLocationIds = subLocationIds;
    }
    this.http.getDataWithQueryParams(`Employeedata/getbylocationandsublocation`, params)
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
          this.employeeiddetails = [
            // { fullName: 'All Employees', employeeId: 'all' },
            ...employeedata
          ];
        },
        error: (reason: any) => {
          console.error('Error fetching employees by location:', reason);
          this.employeeiddetails = [];
        },
      });
  }

  getCategoryDetails(event: any): void {
    const selectedShifts = event.value;
    const selectedLocations = this.LeaveReportForm.get('location')?.value;
    const selectedSubLocations = this.LeaveReportForm.get('subLocation')?.value;
    const selectedYear = this.LeaveReportForm.get('year')?.value;

    if (selectedShifts && selectedShifts.length > 0 && selectedLocations && selectedLocations.length > 0 && selectedSubLocations && selectedSubLocations.length > 0 && selectedYear) {
      this.LeaveReportForm.get('categoryName')?.reset();

      const locationIds = selectedLocations.map((loc: any) => loc.id).join(',');
      const subLocationIds = selectedSubLocations.map((sub: any) => sub.id).join(',');
      const shiftIds = selectedShifts.map((shift: any) => shift.id).join(',');

      let params = {
        locationIds: locationIds,
        subLocationIds: subLocationIds,
        year: selectedYear,
        status: 'Published',
        shiftIds: shiftIds
      };

      this.http.getDataWithQueryParams("OrgLeavesCategories/get-categories", params).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.categoryDetails = res?.data || [];
        },
        error: err => {
          console.error('Error fetching categories:', err);
          this.categoryDetails = [];
          this.LeaveReportForm.get('categoryName')?.reset();
        }
      });
    } else {
      this.categoryDetails = [];
      this.LeaveReportForm.get('categoryName')?.reset();
    }
  }

  generateleaveReport(): void {
    if (this.LeaveReportForm.invalid) {
      this.LeaveReportForm.markAllAsTouched();
      this.isYearDropdownTouched = true;
      return;
    }
    this.offcanvasService.dismiss();
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.LeaveReportForm.value;
    this.offcanvasService.dismiss();
    
    const request: any = {};

    if (formValue.year) {
      request.year = formValue.year;
    }

    if (formValue.location && formValue.location.length > 0) {
      request.locationIds = formValue.location.map((loc: any) => loc.id).join(',');
    }

    if (formValue.subLocation && formValue.subLocation.length > 0) {
      request.subLocationIds = formValue.subLocation.map((sub: any) => sub.id).join(',');
    }

    if (formValue.shift && formValue.shift.length > 0) {
      request.shiftIds = formValue.shift.map((shift: any) => shift.id).join(',');
    }

    if (formValue.categoryName && formValue.categoryName.length > 0) {
      request.leaveCategoryIds = formValue.categoryName.map((cat: any) => cat.id).join(',');
    }

    // Only include employee filter if not "All Employees"
    if (formValue.employee && formValue.employee.length > 0) {
      request.employeeId = formValue.employee.map((emp: any) => emp.employeeId).join(',');
    }

    this.reportsService.getLeaveCarryForwardReport(request).subscribe({
      next: (response: any) => {
        this.filteredleaveRecord = response.data ?? [];
        this.originalFilteredleaveRecord = [...this.filteredleaveRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
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

  // Get sorted data from PrimeNG table
  const dataToExport = this.carryForwardTable?.filteredValue || this.carryForwardTable?.value || this.filteredleaveRecord;

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
    leaveType: 'LEAVE CATEGORY',
    entitled: 'ENTITLED',
    availed: 'AVAILED',
    balance: 'BALANCE',
    maxCarryForward: 'MAX CARRY FORWARD',
    actualCarryForward: 'ACTUAL CARRY FORWARD',
    maxEncashment: 'MAX ENCASHMENT',
    leaveEncashed: 'LEAVES ENCASHED',
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
    'LEAVE CATEGORY',
    'ENTITLED',
    'AVAILED',
    'BALANCE',
    'MAX CARRY FORWARD',
    'ACTUAL CARRY FORWARD',
    'MAX ENCASHMENT',
    'LEAVES ENCASHED',
    'LEAVES LAPSED'
  ];

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '-');
  };

  const normalizeCell = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : '-';
    }
    return value;
  };

  const modifiedData = dataToExport.map(record => {
    const row: any = {};
    NEW_SEQUENCE.forEach(col => {
      const originalKey = Object.keys(HEADER_MAPPINGS)
        .find(k => HEADER_MAPPINGS[k] === col);

      row[col] =
        originalKey && record.hasOwnProperty(originalKey)
          ? ['startdate', 'enddate', 'appliedDate'].includes(originalKey)
            ? formatDate(record[originalKey])
            : normalizeCell(record[originalKey])
          : '-';
    });
    return row;
  });

  if (modifiedData.length === 0) {
    const emptyRow: any = {};
    NEW_SEQUENCE.forEach(col => {
      emptyRow[col] = '-';
    });
    modifiedData.push(emptyRow);
  }
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

  /* =========================
     TITLE
     ========================= */
  ws['!merges'] = [{
    s: { r: 0, c: 0 },
    e: { r: 0, c: NEW_SEQUENCE.length - 1 }
  }];

  XLSX.utils.sheet_add_aoa(ws, [['LEAVE CARRY FORWARD & ENCASHMENT REPORT']], { origin: 'A1' });

  ws['A1'].s = {
    font: { bold: true, sz: 16 },
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

  // Apply middle alignment to all data cells
  modifiedData.forEach((_, rowIndex) => {
    NEW_SEQUENCE.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    });
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
  XLSX.utils.book_append_sheet(wb, ws, 'Leave Carry & Encash Report');
  const today = new Date();
  const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
  XLSX.writeFile(wb, `Leave Carry & Encash Report - ${formattedDate}.xlsx`);

  this.spinnerLoader2 = false;
}

markYearTouched(): void {
    this.LeaveReportForm.get('year')?.markAsTouched();
    this.isYearDropdownTouched = true;
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
        // this.getEmployeeInfo.unshift({
        //   fullName: 'All Employees',
        //   fusionEmpId: this.loggedInUser.fusionEmpId,
        //   employeeId: this.loggedInUser.employeeId,
        // });
      }
    },
    error: (err) => console.log(err),
  });
}


  // isAnyFilterApplied(): boolean {
  //   const form = this.LeaveReportForm.value;
  //   return !!(form.dateRange || form.employee || form.manager || form.team || form.leaveCategory);
  // }

  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filteredleaveRecord = [...this.originalFilteredleaveRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.carryForwardTable) this.carryForwardTable.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
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
