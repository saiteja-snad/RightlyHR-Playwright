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
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';

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
    ChartModule,
    NoDataFoundComponent
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


dummyStatusCounts = [
  { status: 'Present', value: 18, colour: '#2E7D32' },
  { status: 'Absent', value: 4, colour: '#C62828' },
  { status: 'Leave', value: 6, colour: '#F9A825' },
  { status: 'Holiday', value: 2, colour: '#1976D2' },
];

attendanceSummaryData: any;
attendanceSummaryOptions: any;

performanceData = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'Outstanding',
      backgroundColor: '#A2B5E2',
      data: [8, 6, 7, 5],
    },
    {
      label: 'Meets Expectations',
      backgroundColor: '#0F358A',
      data: [10, 12, 9, 11],
    },
  ],
};

dataload = false;




performanceChartData: any;
performanceChartOptions: any;

performanceLegends = [
  { label: 'Outstanding', color: '#0F358A' },
  { label: 'Meets Expectations', color: '#A2B5E2' },

];

performanceLoader = false;
hasPerformanceData = true;

teamKpiSubscription!: Subscription;
summaryCardSubscription!: Subscription;


  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initAttendanceSummaryChart();
  }

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
    this.initAttendanceSummaryChart();
    this.initPerformanceChart();
    this.loadTeamKpiData();
  }

  loadTeamKpiData(employeeId?: number) {
  this.dataload = true;

  const params: any = {
    pageNumber: this.page,
    pageSize: 1000,
    ...(this.searchText && { search: this.searchText })
  };

  if (employeeId) {
    params.employeeId = employeeId;
  }

if (this.teamKpiSubscription) {
  this.teamKpiSubscription.unsubscribe();
}

  this.teamKpiSubscription = this.http
    .getDataIncludeParams('Kpi/getTeamMembersAssignKpiKra', params)
    .subscribe({
      next: (response: any) => {
        this.teamKpiData = response?.data || [];
        this.collectionSize = response?.pagination?.totalRecords || 0;
        this.dataload = false;
      },
      error: (err) => {
        console.error('Error loading dashboard KRA/KPI data', err);
        this.teamKpiData = [];
        this.collectionSize = 0;
        this.dataload = false;
      }
    });
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

  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}

onSearchTextChange() {
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}

onPageChange(event: any) {
  this.page = event.page + 1;
  this.rows = event.rows;
  this.first = event.first;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}

onPageSizeChange(newSize: number) {
  this.rows = newSize;
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}



    getEmployeeSkillCount(): void {
       this.chartLoader = false;
    this.summaryCardSubscription  = this.http.getData('EmployeeSkills/getEmployeeDirectorySummaryCount').subscribe({
      next: (res: any) => {
        this.chartLoader = true;
        if (res?.data) {
          const summary = res?.data || {};
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
        this.chartLoader = true;
        console.error('Error fetching employee directory summary count:', err);
      }
    });
  }

  initAttendanceSummaryChart() {
  const data = this.dummyStatusCounts.map(item => item.value);
  const backgroundColors = this.dummyStatusCounts.map(item => item.colour);

  this.attendanceSummaryData = {
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  };

  this.attendanceSummaryOptions = {
    cutout: '70%',
  };
}

trackByIndex(index: number): number {
  return index;
}


getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Created':
      return 'status-created';
    case 'On Hold':
      return 'status-hold';
    case 'Inactive':
      return 'status-inactive';
    default:
      return '';
  }
}

initPerformanceChart(): void {
  this.performanceLoader = true;

  // Dummy categories (x-axis)
  const labels = ['Marketing', 'SDA', 'BA', 'Oracle'];

  const outstanding = [8, 6, 7, 5];
  const meets = [10, 12, 9, 11];
  const needsImprovement = [2, 3, 4, 3];

  this.performanceChartData = {
    labels,
    datasets: [
      {
        label: 'Outstanding',
        backgroundColor: '#0F358A',
        data: outstanding,
        stack: 'Performance',
      },
      {
        label: 'Meets Expectations',
        backgroundColor: '#A2B5E2',
        data: meets,
        stack: 'Performance',
      },
    ],
  };

  this.performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 30,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => labels[items[0].dataIndex],
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
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
          font: { size: 12 },
        },
        ticks: {
          color: '#72777B',
          font: { size: 11 },
        },
      },
    },
  };

  this.hasPerformanceData = true;
  this.performanceLoader = false;
}

ngOnDestroy() {
  this.teamKpiSubscription?.unsubscribe();
  this.summaryCardSubscription?.unsubscribe();
}


}
