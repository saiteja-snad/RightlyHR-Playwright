import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { combineLatest, distinctUntilChanged, filter, map, startWith, Subject, takeUntil, finalize } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { IJob } from '../../../Interfaces/letters-model';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbPopoverModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { EmployeeLeaveLedger } from '../leaves.model';
import { Select } from 'primeng/select';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { ICategoryDetails } from '../../../Interfaces/timoff-model';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { MultiSelectModule } from 'primeng/multiselect';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpResponse } from '@angular/common/http';
import { SkeletonModule } from 'primeng/skeleton';
import { Chip } from 'primeng/chip';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { TimeoffSelectionService } from '../../../services/timeoff-selection.service';


@Component({
  selector: 'app-leave-summary',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ModuleInfoIconComponent,
    TranslateModule,
    DropdownModule,
    Select,
    ReactiveFormsModule,
    ModuleInformationComponent,
    MultiSelectModule,
    SkeletonModule,
    InfoIconComponent
],
  templateUrl: './leave-summary.component.html',
  styleUrl: './leave-summary.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class LeaveSummaryComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  leaveSummary: EmployeeLeaveLedger[] = [];
  moduleinfo = MODULE_INFOS.TIME_OFF_LEAVE_SUMMARY_MODULE_INFO;
  filterForm!: FormGroup;
  activeEmplist = [] as any;
  years = [
    { label: (new Date().getFullYear() - 2).toString(), value: new Date().getFullYear() - 2 },
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  transactionTypes = [
    { label: 'Carry Forward', value: 'Carry Forward' },
    { label: 'Leave Debit', value: 'Leave Debit' },
    { label: 'On Demand Allocation', value: 'On Demand Allocation' },
    { label: 'Yearly Allocation', value:'Yearly Allocation' },
  ];
  selectedYear: any;
  currentYear: number = new Date().getFullYear();
  categoryDetails = [] as ICategoryDetails[];
  yearOpeningBalance: number = 0;
  yearClosingBalance: number = 0;
  totalCredited: number = 0;
  totalDebited: number = 0;
  // yearOpeningBalance: number = 0;
  // yearClosingBalance: number = 0;
  spinnerLoader = false;
  disableBtn = false;
  empName: string = '';
  activeMessage: string = '';
  selectedEmployeeId: number | null = null;
  constructor(
    private http: HttpService,
    public rbac: RbacService,
    public router: Router,
    private route: ActivatedRoute,
    private accessNav: AccessNavigationService,
    private fb: FormBuilder,
    private offcanvasService: NgbOffcanvas,
    private conformationPopup: OpenModalService,
    private timeoffYearFilterService: TimeoffYearFilterService,
    private timeoffSelectionService: TimeoffSelectionService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const initialYear =
      this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    this.selectedYear = initialYear;
    if (this.timeoffYearFilterService.getSelectedYear() === null) {
      this.timeoffYearFilterService.setSelectedYear(initialYear);
    }
    this.empName = `${
                  this.empinfo.fusionEmpId ? this.empinfo.fusionEmpId + ' - ' : ''
                }${this.empinfo.firstName ?? ''} ${
                  this.empinfo.middleName ? this.empinfo.middleName + ' ' : ''
                }${this.empinfo.lastName ?? ''}`.trim();
    this.initializeForm();
    this.getAllEmployeeDetails();
    this.applyQueryParamsToSelectionState();
    this.syncSelectionsAndLoadData();
    this.getTeamManagersDetails();
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      employee: [null],
      year: [this.selectedYear, Validators.required],
      category: [null],
      transactionType: [null],
    });
    
    this.filterForm
      .get('employee')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onEmployeeOrYearChange();
      });
    
    this.filterForm
      .get('year')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((year) => {
        if (year) {
          this.onYearChange(year);
        }
      });
  }

  onRowsChange() {
    this.first = 0;
  }

   setActiveMessage(ledger: EmployeeLeaveLedger) {
    if (ledger.transactionType === 'Leave Availed') {
      const isWaitingForApproval = ledger.status?.toLowerCase() === 'waiting for approval';
      const processedByRow = !isWaitingForApproval ? `<div class="detail-item"><strong>Processed by:</strong> <span>${ledger.processedByName || '-'}</span></div>` : '';
      const formattedDate = new Date(ledger.txnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      this.activeMessage = `
        <div class="leave-details">
          <div class="detail-item"><strong>Applied Date:</strong> <span>${formattedDate}</span></div>
          <div class="detail-item"><strong>Status:</strong> <span>${ledger.status || '-'}</span></div>
          <div class="detail-item"><strong>Requested by:</strong> <span>${ledger.creditedByName || '-'}</span></div>
          ${processedByRow}
        </div>
      `;
    } else {
      this.activeMessage = '';
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  onEmployeeOrYearChange() {
    const formValue = this.filterForm.value;
    const empId = formValue.employee || this.empinfo.employeeId;
    const year = formValue.year;
    
    // Reset category selection
    this.filterForm.get('category')?.setValue(null);
    
    // Fetch categories for selected employee and year
    if (year) {
      this.getCategoryDetails(empId, year);
    }
  }

  onYearChange(year: number) {
    const formValue = this.filterForm.value;
    const empId = formValue.employee || this.empinfo.employeeId;
    
    // Reset category selection
    this.filterForm.get('category')?.setValue(null);
    
    // Fetch categories for selected employee and year
    if (year) {
      this.getCategoryDetails(empId, year);
    }
  }

  getCategoryDetails(empId: number, year: number) {
    this.http
      .getData(
        `LeaveEntitlements/v2/employee/${empId}?year=${year}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.categoryDetails = response.data as ICategoryDetails[];
            // this.calculateProbationLeavs(this.categoryDetails);
          }else {
            this.categoryDetails = [];
          }
        },
        error: (reason: any) => {
          console.error('Error fetching category details:', reason);
          this.categoryDetails = [];
        },
        complete: () => {},
      });
  }

  private syncSelectionsAndLoadData(): void {
    const initialYear =
      this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    const initialEmployeeId =
      this.http.getCurrentEmployeeIdTimeoff() ?? this.empinfo.employeeId;

    const employeeId$ = this.http.selectedEmployeeIdTimeoff$.pipe(
      startWith(initialEmployeeId),
      map((id) => (id ?? this.empinfo.employeeId) as number),
      distinctUntilChanged()
    );

    const year$ = this.timeoffYearFilterService.selectedYear$.pipe(
      startWith(initialYear),
      filter((year): year is number => year !== null),
      distinctUntilChanged()
    );

    combineLatest([employeeId$, year$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([employeeId, year]) => {
        this.selectedEmployeeId = employeeId;
        this.selectedYear = year;

        this.filterForm.patchValue(
          { employee: employeeId, year },
          { emitEvent: false }
        );

        this.getLeaveSummaryByEmployee(employeeId, year);
        this.getCategoryDetails(employeeId, year);
        this.updateEmpName(employeeId);
      });
  }

  private applyQueryParamsToSelectionState(): void {
    this.applySelectionFromParamMap(this.route.snapshot.queryParamMap);
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => this.applySelectionFromParamMap(params));
  }

  private applySelectionFromParamMap(params: ParamMap): void {
    const employeeIdParam = params.get('employeeId');
    const yearParam = params.get('year');

    const employeeId = employeeIdParam ? Number(employeeIdParam) : null;
    const year = yearParam ? Number(yearParam) : null;

    if (employeeId !== null && !Number.isNaN(employeeId)) {
      this.http.setEmployeeIdTimeoff(employeeId);
    }

    if (year !== null && !Number.isNaN(year)) {
      this.timeoffYearFilterService.setSelectedYear(year);
    }

    // Update the new service as well
    if ((employeeId !== null && !Number.isNaN(employeeId)) || (year !== null && !Number.isNaN(year))) {
        const currentSelection = this.timeoffSelectionService.getSelection();
        this.timeoffSelectionService.updateSelection(
            employeeId !== null && !Number.isNaN(employeeId) ? employeeId : currentSelection.employeeId,
            year !== null && !Number.isNaN(year) ? year : currentSelection.year
        );
    }
  }

  private updateEmpName(employeeId: number): void {
    if (employeeId === this.empinfo.employeeId) {
      this.empName = `${
        this.empinfo.fusionEmpId ? this.empinfo.fusionEmpId + ' - ' : ''
      }${this.empinfo.firstName ?? ''} ${
        this.empinfo.middleName ? this.empinfo.middleName + ' ' : ''
      }${this.empinfo.lastName ?? ''}`.trim();
      return;
    }

    const selectedEmp = this.activeEmplist.find((emp: any) => emp.value === employeeId);
    if (selectedEmp?.label) {
      this.empName = selectedEmp.label;
    }
  }

  navigateToAccessedRoute(route: string = '/time-off/leaves') {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  getLeaveSummaryByEmployee(empId: number, year: number, categoryId?: number, transactionTypes?: any[]) {
    this.dataload = true;
    let url = `EmployeeLeaveLedger/${empId}?year=${year}`;
    if (categoryId) {
      url += `&categoryIds=${categoryId}`;
    }
    if (transactionTypes && transactionTypes.length > 0) {
      url += `&transactionTypes=${transactionTypes.join(',')}`;
    }
    
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaveSummary = response?.data?.leaveLedger as EmployeeLeaveLedger[];
          this.yearOpeningBalance = response?.data?.yearOpeningBalance || 0;
          this.yearClosingBalance = response?.data?.yearEndClosingBalance || 0;
          this.totalCredited = response?.data?.totalCredited || 0;
          this.totalDebited = response?.data?.totalDebited || 0;
        },
        error: (error) => {
          this.dataload = false;
          console.error('Error fetching data:', error);
          this.leaveSummary = [];
          this.yearOpeningBalance =  0;
          this.yearClosingBalance = 0;
          this.totalCredited = 0;
          this.totalDebited =  0;
        },
        complete: () => {
          this.dataload = false;
        },
      });
  }

  onCheckemployee(employeedId: any) {
    this.http.setEmployeeIdTimeoff(employeedId);
    if (employeedId) {
      this.getLeaveSummaryByEmployee(employeedId, this.selectedYear);
    } else {
      this.getLeaveSummaryByEmployee(
        this.empinfo.employeeId,
        this.selectedYear
      );
    }
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

  isFilterApplied(): boolean {
    const { employee, year, category,transactionType } = this.filterForm.value;
    return !!(employee || category || (year && year !== this.currentYear) || (transactionType && transactionType.length > 0));
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      year: this.currentYear,
      employee:this.empinfo.employeeId
    });
    this.selectedYear = this.currentYear;
    this.empName = `${
                  this.empinfo.fusionEmpId ? this.empinfo.fusionEmpId + ' - ' : ''
                }${this.empinfo.firstName ?? ''} ${
                  this.empinfo.middleName ? this.empinfo.middleName + ' ' : ''
                }${this.empinfo.lastName ?? ''}`.trim();
    this.getLeaveSummaryByEmployee(this.empinfo.employeeId, this.selectedYear);
  }

  applyFilters(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const formValue = this.filterForm.value;
    this.selectedYear = formValue.year;
    const empId = formValue.employee || this.empinfo.employeeId;
    const categoryId = formValue.category;
    const transactionTypes = formValue.transactionType;
    
    // Update empName based on selected employee
    if (formValue.employee) {
      const selectedEmp = this.activeEmplist.find((emp: any) => emp.value === formValue.employee);
      this.empName = selectedEmp ? selectedEmp.label: '';
    } else {
      this.empName = `${
                  this.empinfo.fusionEmpId ? this.empinfo.fusionEmpId + ' - ' : ''
                }${this.empinfo.firstName ?? ''} ${
                  this.empinfo.middleName ? this.empinfo.middleName + ' ' : ''
                }${this.empinfo.lastName ?? ''}`.trim();
    }
    
    this.getLeaveSummaryByEmployee(empId, this.selectedYear, categoryId, transactionTypes);
    this.closeCanvas();
  }

  exportLeaveSummary(): void {
    this.spinnerLoader = true;
    const formValue = this.filterForm.value;
    const empId = formValue.employee || this.empinfo.employeeId;
    const year = formValue.year || this.selectedYear;
    
    let url = `EmployeeLeaveLedger/${empId}/export?year=${year}`;
    
    if (formValue.category && formValue.category.length > 0) {
      url += `&categoryIds=${formValue.category.join(',')}`;
    }
    
    if (formValue.transactionType && formValue.transactionType.length > 0) {
      const encodedTypes = formValue.transactionType.map((t: string) => encodeURIComponent(t)).join(',');
      url += `&transactionTypes=${encodedTypes}`;
    }
    this.http.downloadTimesheetReport(url)
    .pipe(finalize(() => this.spinnerLoader = false))
    .subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (!response.body) {
          this.conformationPopup.openErrorModal('No data received for export.');
          return;
        }
        // Extract filename from Content-Disposition
        let filename = 'Leave_Summary.xlsx';
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
        //  Download the blob as before
        const blob = new Blob([response.body], {
          type: response.body.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.conformationPopup.openSuccessModal("Leave Summary Exported Successfully");
      },
      error: (err: any) => {
        console.error('Export error:', err);
        this.conformationPopup.openErrorModal('Failed to export leave summary.');
      },
      complete: () => { }
    });
  }

  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.length) {
            const myTeam = response.filter((e: any) => e.isAccess && e.employeeId !== this.empinfo?.employeeId);

            this.getEmployeeInfo = myTeam.map((emp: any) => {
              const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
              const fullName = `${fusionPart}${emp.firstName ?? ''} ${
                emp.middleName ? emp.middleName + ' ' : ''
              }${emp.lastName ?? ''}`.trim();

              return {
                ...emp,
                fullName,
              };
            });

            //  Alphabetical sorting by firstName
            this.getEmployeeInfo.sort((a: any, b: any) =>
              a.firstName.localeCompare(b.firstName, 'en', {
                sensitivity: 'base',
              })
            );
          }
        },
        error: (err) => console.error(err),
      });
  }

  getAllEmployeeDetails() {
    const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${status}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.filter((e: any) => e.employeeId !== this.empinfo?.employeeId).map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            }  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
            value: employee.employeeId,
          }));
          if (this.selectedEmployeeId !== null) {
            this.updateEmpName(this.selectedEmployeeId);
          }
        },
      });
  }

  getLighterColor(color: any, amount: number = 0.9): string {
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
    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  getStatusColor(status: string): string {
    console.log(status);
    
    if (!status) return '#000';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('waiting') || lowerStatus.includes('pending')) {
      return '#ffc107'; // Yellow for waiting/pending
    }
    if (lowerStatus.includes('approved') || lowerStatus.includes('processed')) {
      return '#4caf50'; // Green for approved/processed
    }
    return '#000'; // Default black
  }



  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdTimeoff(null);
  }
}
