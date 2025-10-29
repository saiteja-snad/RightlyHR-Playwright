import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ExpenesHeaderTabsComponent } from "../../shared/claimsandexpenses-tabs/expenes-header-tabs/expenes-header-tabs.component";
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter, Subscription } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { TimeoffYearFilterService } from '../../services/timeoff-year-filter.service';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ISummary } from '../../Interfaces/claimsandexpenses.model';

@Component({
  selector: 'app-claimsandexpenses',
  imports: [ExpenesHeaderTabsComponent, RouterModule, ModuleInformationComponent, NgbPopoverModule, TranslateModule, ReactiveFormsModule, Select, CommonModule],
  templateUrl: './claimsandexpenses.component.html',
  styleUrl: './claimsandexpenses.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClaimsandexpensesComponent implements OnInit {
  moduleinfo: string = '';
  activeEmplist = [] as any;
   loadingGraph: boolean = false;
    getExpenseSummaryDetails = {} as ISummary;
  yearSelectionForm!: FormGroup;
  subscription!: Subscription;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: number[] = [];
  empdata = {} as any;
  loggedinuser = {} as any;
  employeeSelected = false
  constructor(public router: Router, private authService: AuthService, public rbac: RbacService, private http: HttpService, private SelectedyeartimeOffService: TimeoffYearFilterService) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.updateModuleInfo();
        this.getExpenseSummarybyEmpId(this.empdata?.employeeId);
    this.getTeamManagersDetails();
    this.getAllEmployeeDetails();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
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
  }

  navigatetoAddExpenses() {
    this.router.navigate(['/claimsandexpenses/addexpense'])
  }

  onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear;  // Update the local variable so template sees the change
    this.SelectedyeartimeOffService.setSelectedYear(selectedYear);
    this.http.setSelectedYear(selectedYear);
    console.log("Selected Year:", selectedYear);
  }


  onCheckemployee(employeedId: any) {
    this.employeeSelected = !!employeedId;
    if (employeedId) {
      this.http.setEmployeeIdExpenses(employeedId);
       this.getExpenseSummarybyEmpId(employeedId);
    } else {
      this.http.setEmployeeIdExpenses(null);
       this.getExpenseSummarybyEmpId(employeedId);
    }
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

  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empdata.employeeId;

    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
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



  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/claimsandexpenses/expenses': MODULE_INFOS.EXPENSES_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getExpenseSummarybyEmpId(employeeId: number) {
    this.subscription = this.http.getData(`v2/Expenses_Header/summary/${employeeId}`).subscribe({
      next: (response: any) => {
        this.getExpenseSummaryDetails = response as ISummary;
        this.loadingGraph = false;
      },error: () => {
        this.loadingGraph = false;
        this.getExpenseSummaryDetails = {} as ISummary;
      }
      
    })
  }
    // For circular progress calculation
  getExpenseProgress(): number {
    if (!this.getExpenseSummaryDetails) return 0;
    const total = this.getExpenseSummaryDetails.totalReimbursementLimit || 0;
    const remaining = this.getExpenseSummaryDetails.remainingReimbursement || 0;
    if (total === 0) return 0;
    const usedPercentage = ((total - remaining) / total) * 360;
    return usedPercentage;
  }
    getTransparentColor(hex: string, opacity: number): string {
    // Remove leading # if present
    hex = hex.replace('#', '');
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  getProgress(item: any): number {
    const available = item?.remainingReimbursement;
    const total = item?.totalReimbursementLimit || 1; // Avoid division by zero
    const percentage = Math.max(0, Math.min(available / total, 1)); // Clamp between 0 and 1
    return percentage * 360;
  }
}
