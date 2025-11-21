import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { OnBehalfOfExpensesTabsComponent } from '../../../shared/time-off-module-tabs/on-behalf-of-expenses-tabs/on-behalf-of-expenses-tabs.component';
import { BehaviorSubject, Subject, Subscription, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { IJob } from '../../../Interfaces/letters-model';
import { IExpense, ISummary } from '../../../Interfaces/claimsandexpenses.model';
@Component({
  selector: 'app-on-behalf-of-expenses',
  imports: [OnBehalfOfExpensesTabsComponent, FormsModule, RouterModule, Select, ModuleInformationComponent, Skeleton,
    NgbPopoverModule, ModuleInfoIconComponent, TranslateModule, DatePicker, ReactiveFormsModule, TabsModule, CommonModule, ChartModule, InfoIconComponent], templateUrl: './on-behalf-of-expenses.component.html',
  styleUrl: './on-behalf-of-expenses.component.scss'
})
export class OnBehalfOfExpensesComponent {
  empinfo = {} as IJob;
  expenses = [] as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader = false;
  employeeiddetails = [] as any;
  myTeamData = [] as any;
  selectedOtherEmployee: any = null;
  selectedEmpName!: string;
  selectedEmpFusionId!: string;
  today: string = new Date().toISOString().split('T')[0];
  expenesEmplyeedatastatusfliter = new BehaviorSubject<IExpense[]>([]);
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([]);
  getExpenseSummaryDetails = {} as ISummary;
  subscription!: Subscription;

  constructor(public router: Router, private authService: AuthService, public rbac: RbacService, private http: HttpService, private SelectedyeartimeOffService: TimeoffYearFilterService) { }

  ngOnInit(): void {

    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getEmployeeId();
    this.getMyTeam();
  }

  navigatetoAddExpenses() {
    this.router.navigate(['/on-behalf-of/on-behalf-of-expenses/add'])
  }
  moduleinfo: string = '';
  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }
onClearEmployee(): void {
  this.selectedOtherEmployee = null;
  this.selectedEmpName = '';
  this.selectedEmpFusionId = '';
  this.http.setOnBehalfOfExpensesSelectedEmp(null);
  this.http.onBehlafOfExpensesSignal.set(false);
  this.http.setEmployeeIdExpensesforonbehalf(null)
  const loggedInEmpId = this.empinfo?.employeeId || this.empinfo?.employeeId;
  if (loggedInEmpId) {
    console.log('Reset to logged-in employee:', loggedInEmpId);
    this.getExpensesHeaderByEmployeeId(loggedInEmpId);
  }
  
}
  onEmployeeChange(event: any): void {
    const selectedEmp = event.employeeId || 0;
    this.selectedEmpName = `${this.selectedOtherEmployee?.firstName ?? ''} ${this.selectedOtherEmployee?.middleName ? this.selectedOtherEmployee?.middleName + ' ' : ''}${this.selectedOtherEmployee?.lastName ?? ''}`;
    this.selectedEmpFusionId = this.selectedOtherEmployee?.fusionEmpId ?? '';
    this.http.onBehlafOfExpensesSignal.set(!!selectedEmp);
    if (selectedEmp) {
      // Set Employee ID
      this.http.setEmployeeIdExpensesforonbehalf(selectedEmp);
      this.http.setnewcountDetailsforonBehalfof()
      this.http.setOnBehalfOfExpensesSelectedEmp({
        employeeId: selectedEmp,
        employeeName: this.selectedEmpName,
        fusionEmpId: this.selectedEmpFusionId,
      });

      this.getExpensesHeaderByEmployeeId(selectedEmp);
    } else {
      this.http.setEmployeeIdExpensesforonbehalf(null);
      this.http.setOnBehalfOfExpensesSelectedEmp(null);
    }
  }

  getExpensesHeaderByEmployeeId(empId: any): void {
    const year = new Date().getFullYear();
    console.log('Employee ID passed:', empId);

    this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&year=${year}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Expenses Header Response:', response);
          this.expenesEmplyeedata = response;
        },
        error: (error: any) => {
          console.error('Error fetching expense header by employee ID:', error);
        },
      });
  }
  getEmployeeId() {
    let loggedInUser = this.authService.getToken();
    this.http
      .getData('Employeedata/ActiveEmployees')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.employeeiddetails = data
            .filter((emp: any) => emp.employeeId != loggedInUser.employeeId)
            .map((emp: any) => {
              const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
              const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''}`.trim();
              const leaveRequestName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''} ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''
                }`.trim();
              return {
                ...emp,
                fullName,
                leaveRequestName,
              };
            })

            // Alphabetical sorting by firstName
            .sort((a: any, b: any) =>
              a.firstName.localeCompare(b.firstName, 'en', {
                sensitivity: 'base',
              })
            );
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }

  getEmployeeInfo = [] as any;
  getMyTeam() {
    let loggedInUser = this.authService.getToken();
    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${loggedInUser.employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);

          this.myTeamData = data
            .filter((emp: any) => emp.employeeId != loggedInUser.employeeId)
            .map((emp: any) => {
              const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
              const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''}`.trim();
              const leaveRequestName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''} ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''
                }`.trim();
              return {
                ...emp,
                fullName,
                leaveRequestName,
              };
            })

            // Alphabetical sorting by firstName
            .sort((a: any, b: any) =>
              a.firstName.localeCompare(b.firstName, 'en', {
                sensitivity: 'base',
              })
            );
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }
  get isOnBehalfAddPage(): boolean {
    return this.router.url.includes('/on-behalf-of/on-behalf-of-expenses/add');
  }


  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/on-behalf-of/on-behalf-of-expenses':
        MODULE_INFOS.ON_BEHALF_OF_EXPENSES_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdExpenses(null);
  }
}
