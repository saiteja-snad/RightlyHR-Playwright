import { Component, OnInit , ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-claimsandexpenses',
  imports: [ExpenesHeaderTabsComponent, RouterModule, ModuleInformationComponent,NgbPopoverModule, TranslateModule, ReactiveFormsModule, Select],
  templateUrl: './claimsandexpenses.component.html',
  styleUrl: './claimsandexpenses.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClaimsandexpensesComponent implements OnInit {
   moduleinfo: string = '';
   activeEmplist = [] as any;
  yearSelectionForm!: FormGroup;
  subscription!: Subscription;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: number[] = [];
  empdata = {} as any;
  loggedinuser = {} as any;
  constructor(public router: Router,private authService: AuthService, public rbac: RbacService, private http: HttpService, private SelectedyeartimeOffService: TimeoffYearFilterService) { }

  ngOnInit(): void {
     this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.updateModuleInfo();
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
  
   
    if (employeedId) {
     this.http.setEmployeeIdExpenses(employeedId);
    } else {
     this.http.setEmployeeIdExpenses(null);
    }
  }

   getAllEmployeeDetails() {
    const satus = ['Active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }
  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          // No filter
          this.getEmployeeInfo = response.map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          }));
        }
      },
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
}
