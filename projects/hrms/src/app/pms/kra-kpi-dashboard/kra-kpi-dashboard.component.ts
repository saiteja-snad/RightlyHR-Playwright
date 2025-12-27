import { Component, OnDestroy, OnInit } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';

interface DashboardResponse {
  summary: {
    totalEmployees: number;
    activeKras: number;
    averageScore: number;
    offTrack: number;
  };
  completionStatus: {
    above80: number;
    between50And80: number;
    below50: number;
  };
  performanceDistribution: Array<{ department?: string; avgScore: number }>;
  employees: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: Array<{
      employeeId: number;
      employeeName: string;
      department?: string;
      role?: string;
      kraCount: number;
      overallScore: number;
    }>;
  };
}

@Component({
  selector: 'app-kra-kpi-dashboard',
  standalone: true,
  imports: [
    KraKpiManagementLayoutComponent,
    TranslateModule,
    NgbPopoverModule,
    CommonModule,
    ModuleInfoIconComponent,
    ModuleInformationComponent,
    Select,
    FormsModule,
    SkeletonModule,
    ChartModule,
    NoDataFoundComponent,
  ],
  templateUrl: './kra-kpi-dashboard.component.html',
  styleUrl: './kra-kpi-dashboard.component.scss',
})
export class KraKpiDashboardComponent implements OnInit, OnDestroy {
  moduleinfo = MODULE_INFOS.PMS_TEAM_KRA_KPI_LIST_MODULE_INFO;

  empdata: any = {};
  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  selectedEmployeeId: number | null = null;

  // Data from API
  summaryCards: any[] = [];
  teamKpiData: any[] = [];
  collectionSize = 0;
  page = 1;
  rows = 10;
  first = 0;

  searchText = '';
  reviewCycleOptions: { label: string; value: string }[] = [];

  // Charts
  attendanceSummaryData: any;
  attendanceSummaryOptions: any;
  performanceChartData: any;
  performanceChartOptions: any;

  // Loaders & Flags
  chartLoader = false;
  performanceLoader = false;
  dataload = false;
  hasPerformanceData = false;
  hasCompletionData = false;
  selectedReviewCycleId: string | null = null;

  private dashboardSubscription?: Subscription;

  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // Load employee dropdowns based on permissions
    if (this.rbac.allowedToAccess('All Employees (KRA).view')) {
      this.loadAllActiveEmployees();
    }
    if (this.rbac.allowedToAccess('My Team (KRA).view')) {
      this.loadMyTeamEmployees();
    }

    this.loadReviewCycles();
    this.loadDashboardData(); // Initial dashboard load
  }

  loadDashboardData(employeeId?: number) {
    this.chartLoader = false;
    this.performanceLoader = true;
    this.dataload = true;

    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
    };

    if (this.searchText.trim()) {
      params.search = this.searchText.trim();
    }

    if (employeeId !== undefined && employeeId !== null) {
      params.employeeId = employeeId.toString(); // ← THIS IS THE KEY FIX
    }

    if (this.selectedReviewCycleId) {
      params.reviewCycleId = this.selectedReviewCycleId; // already a string
    }

    if (this.dashboardSubscription) {
      this.dashboardSubscription.unsubscribe();
    }

    this.dashboardSubscription = this.http
      .getDataIncludeParams('Kpi/getDashboardDetails', params)
      .subscribe({
        next: (res: any) => {
          const data = res as DashboardResponse;

          // Summary Cards
          const s = data.summary;
          this.summaryCards = [
            {
              title: 'Total Employees Count',
              value: s.totalEmployees ?? 0,
              icons: './icons/Total Employee Count.png',
              popover: 'The total number of employees in the organization.',
            },
            {
              title: 'Active KRAs',
              value: s.activeKras ?? 0,
              icons: './icons/Available Employees Count.png',
              popover: 'Number of active KRA assignments.',
            },
            {
              title: 'Avg Score',
              value: s.averageScore ?? 0,
              icons: './icons/Not Updated.png',
              popover: 'Average performance score across employees.',
            },
            {
              title: 'Over Due',
              value: s.offTrack ?? 0,
              icons: './icons/Not Updated.png',
              popover: 'Employees/KRAs currently off track or overdue.',
            },
          ];

          // Completion Status (Doughnut Chart)
          const cs = data.completionStatus;
          const total = cs.above80 + cs.between50And80 + cs.below50;
          this.hasCompletionData = total > 0;

          this.attendanceSummaryData = {
            datasets: [
              {
                data: [cs.above80, cs.between50And80, cs.below50],
                backgroundColor: ['#2E7D32', '#F9A825', '#C62828'], // Green, Amber, Red
                borderWidth: 0,
              },
            ],
          };

          // Performance Distribution (Bar Chart by Department)
          const rawPerfData = data.performanceDistribution || [];

          // Filter out entries that have no department (some malformed entries like { "avgScore": 0 })
          const perfData = rawPerfData
            .filter((d: any) => d.department && d.department.trim() !== '')
            .sort((a: any, b: any) => b.avgScore - a.avgScore); // Optional: sort descending

          // Show chart if there is at least one valid department
          this.hasPerformanceData = perfData.length > 0;

          // Build labels and scores
          const labels = perfData.map((d: any) => d.department);
          const scores = perfData.map((d: any) => d.avgScore ?? 0);

          this.performanceChartData = {
            labels,
            datasets: [
              {
                label: 'Average Score',
                backgroundColor: '#0F358A',
                data: scores,
                borderRadius: 4,
                barThickness: 15,
              },
            ],
          };

          // Employee Table
          this.teamKpiData = data.employees.items || [];
          this.collectionSize = data.employees.totalCount || 0;

          // Loaders off
          this.chartLoader = true;
          this.performanceLoader = false;
          this.dataload = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
          this.summaryCards = [];
          this.teamKpiData = [];
          this.collectionSize = 0;
          this.chartLoader = true;
          this.performanceLoader = false;
          this.dataload = false;
        },
      });
  }

  initChartOptions() {
    this.attendanceSummaryOptions = {
      cutout: '70%',
      plugins: {
        legend: { display: false },
      },
    };

    this.performanceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Avg Score: ${context.raw}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#141414', font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Average Score',
            color: '#505050',
          },
          ticks: { color: '#72777B' },
        },
      },
    };
  }

  // Employee Dropdown: All Active Employees
  loadAllActiveEmployees() {
    const currentEmployeeId = this.empdata?.employeeId;
    const statuses = ['Active', 'Trainee Active'];

    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses.join(',')}`)
      .subscribe((res: any) => {
        const employees = Array.isArray(res) ? res : [];
        this.activeEmplist = employees
          .filter((emp: any) => emp.employeeId !== currentEmployeeId)
          .map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            } ${employee.middleName ?? ''} ${employee.lastName ?? ''}`.trim(),
            value: employee.employeeId,
          }));
      });
  }

  // Employee Dropdown: My Team
  loadMyTeamEmployees() {
    const employeeId = this.empdata?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((response: any) => {
        const myTeam = (Array.isArray(response) ? response : []).filter(
          (e: any) => e.isAccess
        );
        this.myTeamEmployees = myTeam
          .map((emp: any) => {
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

  // Review Cycle Dropdown
  loadReviewCycles(): void {
    this.http.getData('reviewCycleHeader/getallnames').subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.reviewCycleOptions = res.map((item: any) => ({
            label: item.reviewCycleName,
            value: item.id,
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

  onReviewCycleChange(reviewCycleId: string | null) {
    this.selectedReviewCycleId = reviewCycleId;
    this.page = 1;
    this.first = 0;
    // Optional: clear search when changing cycle
    // this.searchText = '';
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

  onEmployeeChange(employeeId: any) {
    this.selectedEmployeeId = employeeId || null;
    this.page = 1;
    this.first = 0;
    this.searchText = '';
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

  onSearchTextChange() {
    this.page = 1;
    this.first = 0;
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

  ngOnDestroy() {
    this.dashboardSubscription?.unsubscribe();
  }
}
