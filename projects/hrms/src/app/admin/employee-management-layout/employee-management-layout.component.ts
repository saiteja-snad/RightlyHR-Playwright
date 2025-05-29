import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { AllEmployeesHeaderComponent } from "../../shared/Employee-management-content/all-employees-header/all-employees-header.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveEmployeeComponent } from '../prospective-employees/add-prospective-employee/add-prospective-employee.component';
import { AddProspectiveInternComponent } from '../prospective-interns/add-prospective-intern/add-prospective-intern.component';
@Component({
  selector: 'app-employee-management-layout',
  imports: [CommonModule, RouterModule, TranslateModule, TabsModule, ChartModule, AllEmployeesHeaderComponent],
  templateUrl: './employee-management-layout.component.html',
  styleUrl: './employee-management-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class EmployeeManagementLayoutComponent {
  moduleinfo: string = '';
  subscription!: Subscription;
  Inactive!: number;
  ACTDATA!: number;
  Active!: number;
  Trainee!: number;
  traineeactive!: number;
  traineeInactive!: number;
  PROBDATA!: number;
  active = 'Active';
  activeCount: number = 0;
  jobdata = {} as any;
  filtredActivedata = {} as any;
  trackByFn(index: number): number {
    return index;
  }
  cardItems: any[] = [];
  EmployeeInfoData: any;
  EmployeeInfoDataOptions: any;
  totalEmployeesCount: any;

  constructor(private http: HttpService, public rbac: RbacService, private modalService: NgbModal, public router: Router) { }

  ngOnInit(): void {
    this.fetchData();
    this.cardItems = this.cardItems.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  fetchData() {
    this.empdata();
    this.activeEmpData();
    this.InActiveEmpData();
    this.empdataTrainee();
    this.empdataTraineeActive('Trainee Active');
    this.empdataTraineeInActive('Trainee Inactive');
    this.getjobList();
    this.probationemployees();
  }

  // function for prospective employee
  empdata() {
    this.subscription = this.http.getData(`Employeedata/ProspectiveEmployees`).subscribe({
      next: (data: any) => {
        this.ACTDATA = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  // function for active Employees
  activeEmpData() {
    this.subscription = this.http.getData(`Employeedata/ActiveEmployees`).subscribe({
      next: (data: any) => {
        this.Active = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  // function for Inactive Employees
  InActiveEmpData() {
    this.subscription = this.http.getData(`Employeedata/InactiveEmployees`).subscribe({
      next: (data: any) => {
        this.Inactive = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  // function for prospective employee
  empdataTrainee() {
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        let actdat = data.filter((ele: any) => {
          if (ele.empstatus === 'Trainee Prospective') {
            return ele;
          }
        });
        this.Trainee = actdat.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  // function for Active Trainee employee
  empdataTraineeActive(status: string) {
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.traineeactive = data.length;
        this.updateCardItems();
      },
      error: (reason: any) => console.log(reason),
    });
  }

  // function for InActive Trainee employee
  empdataTraineeInActive(status: string) {
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.traineeInactive = data.length;
        this.updateCardItems();
      },
      error: (reason: any) => console.log(reason),
    });
  }

  // function to get getjobList Current Openings
  getjobList() {
    this.subscription = this.http.getData(`JobPosting`).subscribe({
      next: (data: any) => {
        this.jobdata = data;
        this.filtredActivedata = this.filterJobsByStatus(this.active).reverse();
        this.activeCount = this.getStatusCount(this.active);
        this.updateCardItems();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  filterJobsByStatus(status: string): any[] {
    return this.jobdata.filter(
      (job: { status: string }) => job.status === status
    );
  }

  getStatusCount(status: string): number {
    return this.jobdata.reduce((count: number, job: { status: string }) => {
      if (job.status === status) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  probationemployees() {
    this.subscription = this.http.getData(`ProbationFlow/getProbationEmployeesStatus`).subscribe({
      next: (data: any) => {
        this.PROBDATA = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  updateCardItems() {
    this.cardItems = [
      {
        label: 'Active',
        sublabel: 'Employees',
        link: '/employee-management/active-employees',
        count: this.Active,
        icon: '/employee-data/active-employees-icon.png',
        employeementTypeColor: '#F9D339',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Inactive',
        sublabel: 'Employees',
        link: '/employee-management/inactive-employees',
        count: this.Inactive,
        icon: '/employee-data/inactive-employee-icon.png',
        employeementTypeColor: '#E54288',
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
      {
        label: 'Prospective',
        sublabel: 'Employees',
        link: '/employee-management/prospective-employees',
        count: this.ACTDATA,
        icon: '/employee-data/prospective-employee-icon.png',
        employeementTypeColor: '#03A9F4',
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Probation',
        sublabel: 'Employees',
        link: '/employee-management/probation-employees',
        count: this.PROBDATA,
        icon: '/employee-data/Probation-Employee-icon.png',
        employeementTypeColor: '#FF2E22',
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },

      {
        label: 'Active',
        sublabel: 'Trainees',
        link: '/employee-management/active-interns',
        count: this.traineeactive,
        icon: '/employee-data/active-trainee-icon.png',
        employeementTypeColor: '#0B3A83',
        permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Inactive',
        sublabel: 'Trainees',
        link: '/employee-management/inactive-interns',
        count: this.traineeInactive,
        icon: '/employee-data/inactive-trainee-icon.png',
        employeementTypeColor: '#1064CA',
        permission: { feature: 'Dashboard Inactive Trainees Card', action: 'view' }
      },
      {
        label: 'Prospective',
        sublabel: 'Trainees',
        link: '/employee-management/prospective-interns',
        count: this.Trainee,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#53D33A',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
    ];
    // this.filterTabsByRbac();
    this.initChart();
  }

  initChart() {
    const backgroundColors = this.cardItems.map(item => item.employeementTypeColor);
    this.totalEmployeesCount = this.ACTDATA + this.Active + this.Inactive + this.Trainee + this.traineeactive + this.traineeInactive;
    this.EmployeeInfoData = {
      datasets: [
        {
          data: [this.ACTDATA, this.Active, this.Inactive, this.Trainee, this.traineeactive, this.traineeInactive, this.PROBDATA],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        }
      ]
    };
    this.EmployeeInfoDataOptions = {
      cutout: '70%',
    };
  }

  filterTabsByRbac(): void {
    this.cardItems = this.cardItems.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  openAddProspective() {
    this.modalService.open(AddProspectiveEmployeeComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openAddProspectiveIntern() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }
}