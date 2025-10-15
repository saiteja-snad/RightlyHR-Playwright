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
import { Skeleton } from 'primeng/skeleton';
import { AddContractEmployeeComponent } from '../contract-employee/add-contract-employee/add-contract-employee.component';
@Component({
  selector: 'app-employee-management-layout',
  imports: [CommonModule, RouterModule, TranslateModule, TabsModule, ChartModule, AllEmployeesHeaderComponent, Skeleton],
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
  inactivecontract!: number;

  traineeInactive!: number;
  PROBDATA!: number;
  active = 'Active';
  activeCount: number = 0;
  jobdata = {} as any;
  filtredActivedata = {} as any;
  contract: number = 0;
  activeContract: number = 0;
  trackByFn(index: number): number {
    return index;
  }
  cardItems: any[] = [];
  EmployeeInfoData: any;
  EmployeeInfoDataOptions: any;
  totalEmployeesCount: any;
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;
  loading: boolean = false;
  filteredCardItems: any;
  navTabsActive: any[] = [];
  navTabsProspective: any[] = [];
  navTabsInactive: any[] = [];
  navTabsProbation: any[] = [];

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
    this.loading = true;
    this.subscription = this.http.getData(`Employeedata/get-employees-status-count`).subscribe({
      next: (data: any) => {
        this.employeesStatusCount = data.data as EmployeeStatusCount;
        this.Active = 0;
        this.Inactive = 0;
        this.ACTDATA = 0;
        this.PROBDATA = 0;
        this.traineeactive = 0;
        this.inactivecontract = 0;
        this.traineeInactive = 0;
        this.Trainee = 0;
        this.contract = 0;
        this.activeContract = 0;
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
              case 'Prospective Contract Employees':
                this.contract = statusItem.count;
                break;
              case 'Active Contract Employees':
                this.activeContract = statusItem.count;
                break;
             case 'Inactive Contract Employees':
                this.inactivecontract = statusItem.count;
                break;
            }
          }
        } else {
          console.warn('statusWiseCount is not an array:', statusList);
        }
        this.updateCardItems();
        this.activeEmployeeTabItems();
        this.prospectiveEmployeeTabItems();
        this.inactiveEmployeeTabItems();
        this.probationEmployeeTabItems();
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error fetching employee status count:', error);
      },
      complete: () => {
        this.loading = false;
      }
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
    this.loading = false;
    this.cardItems = [
      {
        label: 'Active',
        link: '/employee-management/active',
        count: this.Active + this.traineeactive + this.activeContract,
        icon: '/employee-data/active-employees-icon.png',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Prospective',
        link: '/employee-management/prospective',
        count: this.ACTDATA + this.contract + this.Trainee,
        icon: '/employee-data/prospective-employee-icon.png',
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Probation',
        link: '/employee-management/probation',
        count: this.PROBDATA,
        icon: '/employee-data/prospective-trainee-icon.png',
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },
      {
        label: 'Inactive',
        link: '/employee-management/inactive',
        count: this.Inactive + this.traineeInactive + this.inactivecontract,
        icon: '/employee-data/inactive-employee-icon.png',
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
    ];
  }

  initChart() {
    this.loading = false;
    const backgroundColors = this.filteredCardItems.map((item: { employeementTypeColor: any; }) => item.employeementTypeColor);
    this.totalEmployeesCount = this.employeesStatusCount?.totalCount;
    this.EmployeeInfoData = {
      datasets: [
        {
          data: [this.Active, this.PROBDATA, this.ACTDATA, this.Inactive, this.traineeactive, this.Trainee, this.traineeInactive, this.activeContract],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        }
      ]
    };
    this.EmployeeInfoDataOptions = {
      cutout: '70%',
    };
  }

  activeEmployeeTabItems() {
    this.navTabsActive = [
      {
        label: 'Employees',
        link: '/employee-management/active/employees',
        count: this.Active,
        icon: '/employee-data/active-employees-icon.png',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Trainees',
        link: '/employee-management/active/interns',
        count: this.traineeactive,
        icon: '/employee-data/active-trainee-icon.png',
        permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Contractors',
        link: '/employee-management/active/contract',
        count: this.activeContract,
        icon: '/employee-data/active-trainee-icon.png',
        permission: { feature: 'Dashboard Active Contract employees Card', action: 'view' }
      },
    ];
  }

  prospectiveEmployeeTabItems() {
    this.navTabsProspective = [
      {
        label: 'Employees',
        link: '/employee-management/prospective/employees',
        count: this.ACTDATA,
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Trainees',
        link: '/employee-management/prospective/interns',
        count: this.Trainee,
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Contractors',
        link: '/employee-management/prospective/contract',
        count: this.contract,
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
    ];
  }

  probationEmployeeTabItems() {
    this.navTabsProbation = [
      {
        label: 'Employees',
        link: '/employee-management/probation/employees',
        count: this.PROBDATA,
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },
    ];
  }

  inactiveEmployeeTabItems() {
    this.navTabsInactive = [
      {
        label: 'Employees',
        link: '/employee-management/inactive/employees',
        count: this.Inactive,
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
      {
        label: 'Trainees',
        link: '/employee-management/inactive/interns',
        count: this.traineeInactive,
        permission: { feature: 'Dashboard Inactive Trainees Card', action: 'view' }
      },
      {
        label: 'Contractors',
        link: '/employee-management/inactive/contract',
        count: this.inactivecontract,
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
    ];
  }

  filterTabsByRbac(): void {
    this.cardItems = this.cardItems.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  openAddProspective() {
    this.modalService.open(AddProspectiveEmployeeComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openAddContract() {
    this.modalService.open(AddContractEmployeeComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openAddProspectiveIntern() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  // route conditions
  get isActiveEmployeeManagement(): boolean {
    return this.router.url.startsWith('/employee-management/active');
  }

  get isProspectiveEmployeeManagement(): boolean {
    return this.router.url.startsWith('/employee-management/prospective');
  }

  get isProbationEmployeeManagement(): boolean {
    return this.router.url.startsWith('/employee-management/probation');
  }

  get isInActiveEmployeeManagement(): boolean {
    return this.router.url.startsWith('/employee-management/inactive');
  }
}