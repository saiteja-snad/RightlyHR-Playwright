import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ExpenesHeaderTabsComponent } from "../../shared/claimsandexpenses-tabs/expenes-header-tabs/expenes-header-tabs.component";
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Skeleton } from 'primeng/skeleton';
import { ISummary, IExpense } from '../../Interfaces/claimsandexpenses.model';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import moment from 'moment';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-claimsandexpenses',
  imports: [ExpenesHeaderTabsComponent, FormsModule, RouterModule, Select,ModuleInformationComponent, Skeleton,
    NgbPopoverModule, ModuleInfoIconComponent, TranslateModule, DatePicker, ReactiveFormsModule, TabsModule, CommonModule, ChartModule, InfoIconComponent],
  templateUrl: './claimsandexpenses.component.html',
  styleUrl: './claimsandexpenses.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClaimsandexpensesComponent implements OnInit {
  moduleinfo: string = '';
  employeeSelected = false
    expenesEmplyeedatastatusfliter = new BehaviorSubject<IExpense[]>([]);
  expenesEmplyeedata: IExpense[] = [];
  activeEmplist = [] as any;
  yearSelectionForm!: FormGroup;
  selectedDate: Date = new Date();
  subscription!: Subscription;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  loadingGraph: boolean = false;
  years: number[] = [];
  getEmployeeInfo = [] as any;
  selectedEmployeeId: any;
  empdata = {} as any;
  loggedinuser = {} as any;
  getExpenseSummaryDetails = {} as ISummary;
  expenseChartData: any;
  expenseChartDataOptions: any;
  selectedmonthlyDate: Date = new Date();
  selectedMonth: number | null = null;
  selectedMouthly: number | null = null;
  maxMonth: Date = new Date();
  totalExpense: any;
  expenseChartLegend: any;
  flitredapproved = new BehaviorSubject<any[]>([]);
  flitredpending = new BehaviorSubject<any[]>([]);
  flitredrejected = new BehaviorSubject<any[]>([]);
  flitredDrafts = new BehaviorSubject<any[]>([]);
  processedExpenses = new BehaviorSubject<any[]>([]);
  ApprovedCount = 0;
  processedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  draftsCount = 0;
  constructor(public router: Router, private authService: AuthService, public rbac: RbacService, private http: HttpService,
    private SelectedyeartimeOffService: TimeoffYearFilterService) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedMouthly = today.getFullYear();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensesheaderbyemployeeid(this.empdata?.employeeId)
    this.updateModuleInfo();
    this.getTeamManagersDetails();
    this.getAllEmployeeDetails();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    // Now initialize the form with the selectedYear
    this.yearSelectionForm = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    // Send initial year to the service so other component can pick it up
    this.SelectedyeartimeOffService.setSelectedYear(this.selectedYear);
    this.SelectedyeartimeOffService.setSelectedMounthly(this.selectedMonth);
    
    this.http.expensesprocesscount$.subscribe(() => {
       this.getexpensesheaderbyemployeeid(this.empdata?.employeeId)
    });
  }

  navigatetoAddExpenses() {
    this.router.navigate(['/claimsandexpenses/addexpense'])
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const satus = ['Active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear;  // Update the local variable so template sees the change

    this.http.setSelectedYear(selectedYear);
  }

  onMonthChange(value: any) {
    const selected = moment(value);
    this.selectedMonth = selected.month() + 1;
    this.selectedMouthly = selected.year();
    this.SelectedyeartimeOffService.setSelectedMounthly(this.selectedMonth);
    this.SelectedyeartimeOffService.setSelectedYear(this.selectedMouthly);
    this.getexpensesheaderbyemployeeid(this.empdata?.employeeId)

  }

  onCheckemployee(employeedId: any) {
    this.employeeSelected = !!employeedId;
    if (employeedId) {
      this.http.setEmployeeIdExpenses(employeedId);
      this.getexpensesheaderbyemployeeid(employeedId);
    } else {
      this.http.setEmployeeIdExpenses(null);

      this.getexpensesheaderbyemployeeid(this.empdata?.employeeId)
    }
  }

  getexpensesheaderbyemployeeid(empId: any): void {
    this.subscription = this.http.getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&month=${this.selectedMonth}&year=${this.selectedMouthly}`).subscribe({
      next: (data: any) => {
        this.expenesEmplyeedatastatusfliter.next(data)
          this.updateAllFilteredExpenses();
        // Extract expense items (filter out expenseSummary object)
        this.expenesEmplyeedata = data.filter((item: any) => !item.expenseSummary);
        // Extract and update expense summary
        const summaryItem = data.find((item: any) => item.expenseSummary);
        if (summaryItem?.expenseSummary) {
          this.getExpenseSummaryDetails = summaryItem.expenseSummary as ISummary;
          this.expenseSummaryTabs.forEach(tab => {
            tab.value = this.getExpenseSummaryDetails[tab.key as keyof ISummary] ?? 0;
          });
          this.totalExpense = this.getExpenseSummaryDetails.totalReimbursementLimitFormatted;
          this.initChart();
        }
      },
      error: (err) => {
        console.log("expensesheadererror", err);
      }
    });
  }

  
  updateAllFilteredExpenses() {
    const data = this.expenesEmplyeedatastatusfliter.value;
    const drafts = data.filter(x => x.status === 'Draft').reverse();
    const approved = data.filter(x => x.status === 'Approved').reverse();
    const pending = data.filter(x => x.status === 'Waiting for Approval').reverse();
    const processed = data.filter(x => x.status === 'Processed').reverse();
    const rejected = data.filter(x => x.status === 'Rejected').reverse();
    this.flitredDrafts.next(drafts);
    this.flitredapproved.next(approved);
    this.flitredpending.next(pending);
    this.processedExpenses.next(processed);
    this.flitredrejected.next(rejected);
    this.draftsCount = drafts.length;
    this.ApprovedCount = approved.length;
    this.pendingCount = pending.length;
    this.processedCount = processed.length;
    this.rejectedCount = rejected.length;

    // Update count tabs
    this.expenseSummaryTabs.forEach(tab => {
      if (tab.key === 'approvedAmountFormatted') tab.count = this.ApprovedCount;
      if (tab.key === 'processedAmountFormatted') tab.count = this.processedCount;
      if (tab.key === 'requestedAmountFormatted') tab.count = this.pendingCount;
       if (tab.key === 'rejectAmountFormatted') tab.count = this.rejectedCount;
    });

  }


  getTeamManagersDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((emp: any) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
            return {
              ...emp,
              fullName
            };
          });
          //  Alphabetical sorting by firstName
          this.getEmployeeInfo.sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
          );
        }
      },
      error: (err) => console.error(err)
    });
  }

  expenseSummaryTabs: any[] = [
       { label: 'Total Expenses', icon: 'expenses-icons/total-expenes-icon.png', key: 'totalReimbursementLimitFormatted', value: 0,showFrequency: true },
    { label: 'Available Limit', icon: 'expenses-icons/avaliable-icon.png', key: 'remainingReimbursementFormatted', value: 0 },
    // { label: 'Frequency', icon: 'expenses-icons/frequency-icon.png', key: 'frequency', },
    { label: 'Requested', icon: 'expenses-icons/requested-icon.png', key: 'requestedAmountFormatted', value: 0 ,count:0},
    { label: 'Approved', icon: 'expenses-icons/approved-icon.png', key: 'approvedAmountFormatted', value: 0 ,count:0},
    { label: 'Processed', icon: 'expenses-icons/processed-icon.png', key: 'rejectAmountFormatted', value: 0,count:0 },
       { label: 'Rejected', icon: 'expenses-icons/reject-icon.png', key: 'rejectAmountFormatted', value: 0,count:0 },

  ];

  initChart(): void {
    if (!this.getExpenseSummaryDetails) return;
    // Prepare chart values
    const chartValues = [
      Number(this.getExpenseSummaryDetails.remainingReimbursement) || 0,
      Number(this.getExpenseSummaryDetails.requestedAmount) || 0,
      Number(this.getExpenseSummaryDetails.approvedAmount) || 0,
      Number(this.getExpenseSummaryDetails.processedAmount) || 0,
    ];
    // Define colors and labels in the same order
    const chartLabels = ['Available Limit', 'Requested', 'Approved', 'Processed'];
    const chartColors = ['#25BBFF', '#FF6A00', '#00A912', '#5D33DB'];
    // Build chart data
    this.expenseChartData = {
      datasets: [
        {
          data: chartValues,
          backgroundColor: chartColors,
          borderWidth: 2,
        },
      ],
    };
    // Build legend data (for custom display beside chart)
    this.expenseChartLegend = chartLabels.map((label, i) => ({
      label,
      color: chartColors[i],
      value: chartValues[i],
    }));
    // Chart options
    this.expenseChartDataOptions = {
      cutout: '70%',
      plugins: {
        legend: { display: false },
      },
    };
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/claimsandexpenses/expenses': MODULE_INFOS.EXPENSES_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}