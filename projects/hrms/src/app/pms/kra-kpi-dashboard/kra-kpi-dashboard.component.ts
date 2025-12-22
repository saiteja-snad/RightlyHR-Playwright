import { Component } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import {
  NgbModal,
  NgbModalRef,
  NgbOffcanvas,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { SummaryCard } from '../../Interfaces/skill-dashboard.model';
import { Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-kra-kpi-dashboard',
  imports: [
    KraKpiManagementLayoutComponent,
    TranslateModule,
    NgbPopoverModule,
    CommonModule,
    InfoIconComponent,
    ModuleInfoIconComponent,
    NgbPopoverModule,
    ModuleInformationComponent,
    Select,
    FormsModule,
    PaginatorModule,
    ReactiveFormsModule,
    SkeletonModule,
    ChartModule
  ],
  templateUrl: './kra-kpi-dashboard.component.html',
  styleUrl: './kra-kpi-dashboard.component.scss',
})
export class KraKpiDashboardComponent {
  moduleinfo = '';
  empdata: any = {};
  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  selectedEmployeeId: number | null = null;
  teamKpiData: any[] = [];
  loading = true;
  searchText = '';
  reviewCycleOptions: { label: string; value: string }[] = [];
  summaryCards: SummaryCard[] = [];
  subscription!: Subscription;
  isloading: boolean = false;
  chartLoader = false

  page = 1;
  rows = 10; // default page size
  first = 0; // for PrimeNG paginator
  collectionSize = 0; // total records from API

  performanceLegends = [
  { label: 'Outstanding', color: '#2E7D32' },
  { label: 'Meets Expectations', color: '#1976D2' },
  { label: 'Needs Improvement', color: '#F9A825' },
];

performanceData = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'Outstanding',
      backgroundColor: '#2E7D32',
      data: [8, 6, 7, 5],
    },
    {
      label: 'Meets Expectations',
      backgroundColor: '#1976D2',
      data: [10, 12, 9, 11],
    },
    {
      label: 'Needs Improvement',
      backgroundColor: '#F9A825',
      data: [2, 3, 4, 3],
    },
  ],
};

performanceOptions = {
  responsive: true,
  maintainAspectRatio: false,
  barThickness: 28,
  scales: {
    x: {
      stacked: true,
      ticks: {
        color: '#141414',
        font: { size: 11 },
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: 'Employees',
        color: '#505050',
        font: { size: 10 },
      },
      ticks: {
        color: '#72777B',
        font: { size: 11 },
      },
    },
  },
  plugins: {
    legend: {
      display: false, // custom legend used
    },
    tooltip: {
      callbacks: {
        title: (tooltip: any) => {
          return `Category: ${tooltip[0].label}`;
        },
        label: (context: any) => {
          return `${context.dataset.label}: ${context.raw}`;
        },
      },
    },
  },
};


  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    if (this.rbac.allowedToAccess('All Employees (KRA).view')) {
      this.loadAllActiveEmployees();
    }
    if (this.rbac.allowedToAccess('My Team (KRA).view')) {
      this.loadMyTeamEmployees();
    }

    this.updateModuleInfo();
    this.loadReviewCycles()
    this.getEmployeeSkillCount()
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.moduleinfo = url.includes('/pms/kpi-kra/dashboard')
      ? MODULE_INFOS.PMS_TEAM_KRA_KPI_LIST_MODULE_INFO
      : '';
  }

  loadAllActiveEmployees() {
    const currentEmployeeId = this.empdata?.employeeId;
    const statuses = ['Active', 'Trainee Active'];

    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe((res: any) => {
        const employees = res as any[];
        this.activeEmplist = employees
          .filter((emp) => emp.employeeId !== currentEmployeeId)
          .map((employee) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            } ${employee.middleName ?? ''} ${employee.lastName ?? ''}`.trim(),
            value: employee.employeeId,
          }));
      });
  }

  loadMyTeamEmployees() {
    const employeeId = this.empdata?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((response: any) => {
        const myTeam = (response as any[]).filter((e: any) => e.isAccess);
        this.myTeamEmployees = myTeam
          .map((emp) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusionPart}${emp.firstName ?? ''} ${
              emp.middleName ? emp.middleName + ' ' : ''
            }${emp.lastName ?? ''}`.trim();
            return { ...emp, fullName };
          })
          .sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', {
              sensitivity: 'base',
            })
          );
      });
  }

    loadReviewCycles(): void {
    this.http.getData('reviewCycleHeader/getallnames').subscribe({
      next: (res: any) => {
        // Response is direct array → no .data wrapper
        if (Array.isArray(res)) {
          this.reviewCycleOptions = res.map((item: any) => ({
            label: item.reviewCycleName,
            value: item.id, // Use ID as value (best practice)
          }));
        } else {
          this.reviewCycleOptions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load review cycles', err);
        this.reviewCycleOptions = [];
      },
    });
  }

  onEmployeeChange(employeeId: any) {
    this.selectedEmployeeId = employeeId || null;

    this.page = 1;
    this.first = 0;
    this.searchText = '';

    // If cleared → load ALL employees
    // if (!this.selectedEmployeeId) {
    //   this.loadTeamKpiData();
    // } else {
    //   this.loadTeamKpiData(this.selectedEmployeeId);
    // }
  }

    getEmployeeSkillCount(): void {
    this.subscription = this.http.getData('EmployeeSkills/getEmployeeDirectorySummaryCount').subscribe({
      next: (res: any) => {
        this.chartLoader = true;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            {
              key: 'totalEmployees',
              title: 'Total Employees Count',
              value: summary.totalEmployees ?? 0,
              icons: './icons/Total Employee Count.png',
              popover: 'The tab displays the total number of employees available in the organization. Helps understand the overall workforce strength. Used as the base count to analyse skills and proficiency distribution.'
            },
            {
              key: 'skilledEmployees',
              title: "Active KRA's",
              value: summary.skilledEmployees ?? 0,
              icons: './icons/Available Employees Count.png',
              popover: 'The tab displays how many employees have recently updated their skill details. Helps track how many profiles hold the latest, accurate skill information. Useful for managers to identify employees ready for allocation based on updated skills.'
            },
            {
              key: 'unSkilledEmployees',
              title: 'Avg Score',
              value: summary.unSkilledEmployees ?? 0,
              icons: './icons/Not Updated.png',
              popover: 'The tab displays the number of employees who still need to update their skills. Helps identify pending updates required to maintain a complete skill database. Useful for HR/managers to follow up and ensure accurate skill mapping.'
            },
            {
              key: 'unSkilledEmployees',
              title: 'Off Track',
              value: summary.unSkilledEmployees ?? 0,
              icons: './icons/Not Updated.png',
              popover: 'The tab displays the number of employees who still need to update their skills. Helps identify pending updates required to maintain a complete skill database. Useful for HR/managers to follow up and ensure accurate skill mapping.'
            }
          ];
        }
      },
      error: (err) => {
        this.isloading = false;
        this.chartLoader = false;
        console.error('Error fetching employee directory summary count:', err);
      }
    });
  }
}
