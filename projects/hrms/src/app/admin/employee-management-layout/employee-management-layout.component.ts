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
import { EmployeeStatusCount } from '../../Interfaces/dashboard.modal';
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
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;

  constructor(private http: HttpService, public rbac: RbacService, private modalService: NgbModal, public router: Router) { }

  ngOnInit(): void {
    this.cardItems = this.cardItems.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.getEmployeeStatusCount();
  }

  //function for to get the Employees count based on the status
  getEmployeeStatusCount() {
    this.subscription = this.http.getData(`Employeedata/get-employees-status-count`).subscribe({
      next: (data: any) => {
        this.employeesStatusCount = data.data as EmployeeStatusCount;
        this.Active = 0;
        this.Inactive = 0;
        this.ACTDATA = 0;
        this.PROBDATA = 0;
        this.traineeactive = 0;
        this.traineeInactive = 0;
        this.Trainee = 0;
        const statusList = this.employeesStatusCount?.statusWiseCount;
        if (Array.isArray(statusList)) {
          for (const statusItem of statusList) {
            switch (statusItem.status) {
              case 'Active Employees':
                this.Active = statusItem.count;
                break;
              case 'Inactive Employees':
                this.Inactive = statusItem.count;
                break;
              case 'Prospective Employees':
                this.ACTDATA = statusItem.count;
                break;
              case 'Probation Employees':
                this.PROBDATA = statusItem.count;
                break;
              case 'Active Trainees':
                this.traineeactive = statusItem.count;
                break;
              case 'Inactive Trainees':
                this.traineeInactive = statusItem.count;
                break;
              case 'Prospective Trainees':
                this.Trainee = statusItem.count;
                break;
            }
          }
        } else {
          console.warn('statusWiseCount is not an array:', statusList);
        }
        this.updateCardItems();

      },
      error: (reason) => console.log(reason),
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

  updateCardItems() {
    this.cardItems = [
      {
        label: 'Active Employees',
        link: '/employee-management/active-employees',
        count: this.Active,
        icon: '/employee-data/active-employees-icon.png',
        employeementTypeColor: '#F9D339',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Probation Employees',
        link: '/employee-management/probation-employees',
        count: this.PROBDATA,
        icon: '/employee-data/Probation-Employee-icon.png',
        employeementTypeColor: '#FF2E22',
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },
      {
        label: 'Prospective Employees',
        link: '/employee-management/prospective-employees',
        count: this.ACTDATA,
        icon: '/employee-data/prospective-employee-icon.png',
        employeementTypeColor: '#03A9F4',
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Inactive Employees',
        link: '/employee-management/inactive-employees',
        count: this.Inactive,
        icon: '/employee-data/inactive-employee-icon.png',
        employeementTypeColor: '#E54288',
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
      {
        label: 'Active Trainees',
        link: '/employee-management/active-interns',
        count: this.traineeactive,
        icon: '/employee-data/active-trainee-icon.png',
        employeementTypeColor: '#0B3A83',
        permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Prospective Trainees',
        link: '/employee-management/prospective-interns',
        count: this.Trainee,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#53D33A',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Inactive Trainees',
        link: '/employee-management/inactive-interns',
        count: this.traineeInactive,
        icon: '/employee-data/inactive-trainee-icon.png',
        employeementTypeColor: '#1064CA',
        permission: { feature: 'Dashboard Inactive Trainees Card', action: 'view' }
      },
    ];
    // this.filterTabsByRbac();
    this.initChart();
  }

  initChart() {
    const backgroundColors = this.cardItems.map(item => item.employeementTypeColor);
    this.totalEmployeesCount = this.employeesStatusCount?.totalCount;
    this.EmployeeInfoData = {
      datasets: [
        {
          data: [this.Active, this.PROBDATA, this.ACTDATA, this.Inactive, this.traineeactive, this.Trainee, this.traineeInactive,],
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