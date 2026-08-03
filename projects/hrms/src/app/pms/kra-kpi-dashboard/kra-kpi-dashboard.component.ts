import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { Table, TableModule } from 'primeng/table';

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
    PaginatorModule,
    TableModule,
  ],
  templateUrl: './kra-kpi-dashboard.component.html',
  styleUrl: './kra-kpi-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None

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
  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];

  searchText = '';
  reviewCycleOptions: { label: string; value: string }[] = [];
  currentSortField = '';
  currentSortOrder = 0;
  currentUIField = '';
  @ViewChild('dashboardTable') dashboardTable!: Table;



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

  // Popup data
  selectedEmployeeKras: any[] = [];
  selectedEmployeeName: string = '';
  kraPopupLoading = false;

  completionStatus = { above80: 0, between50And80: 0, below50: 0 };
  averageScoreDisplay = '0%';

  private dashboardSubscription?: Subscription;

  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // Load employee dropdowns based on permissions
    if (this.rbac.allowedToAccess('All Employees (KRA KPI Dashboard).view')) {
      this.loadAllActiveEmployees();
    }
    if (this.rbac.allowedToAccess('My Team (KRA KPI Dashboard).view')) {
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
      params.employeeId = employeeId.toString();
    }

    if (this.selectedReviewCycleId) {
      params.reviewCycleId = this.selectedReviewCycleId;
    }

    const sortBy = this.currentSortField && this.currentSortOrder !== 0 ? this.currentSortField : undefined;
    const sortOrder = this.currentSortOrder === 1 ? 'asc' : this.currentSortOrder === -1 ? 'desc' : undefined;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

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
              popover: 'This widget displays the total number of employees included in the current KRA/KPI cycle.It reflects only active employees mapped to the selected performance period.',
            },
            {
              title: 'Active KRAs',
              value: s.activeKras ?? 0,
              icons: './icons/Active KRAs.png',
              popover: 'This widget displays the total number of KRAs that are currently active in the system.These KRAs are used to evaluate employee performance for the ongoing cycle.',
            },
            {
              title: 'Avg Score',
              value: s.averageScore ?? 0,
              icons: './icons/Available Employees Count.png',
              popover: 'This widget displays the average performance score across all employees.The score is calculated based on completed and evaluated KRAs.',
            },
            {
              title: 'Over Due',
              value: s.offTrack ?? 0,
              icons: './icons/Not Updated.png',
              popover: 'This widget displays the number of employees with pending or overdue KRA submissions or reviews.It helps managers identify records that need immediate attention.',
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
                backgroundColor: ['#28a745', '#FF9500 ', '#dc3545'], // Green, Amber, Red
                borderWidth: 0,
              },
            ],
          };

          this.completionStatus = {
            above80: cs.above80 ?? 0,
            between50And80: cs.between50And80 ?? 0,
            below50: cs.below50 ?? 0,
          };

          const avgScore = data.summary.averageScore ?? 0;
          // Assuming API returns value between 0-100 (or 0-1 → convert)
          // const avgPercent =
          //   avgScore > 1 ? Math.round(avgScore) : Math.round(avgScore * 100);
          this.averageScoreDisplay = `${avgScore}%`;

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
                // label: 'Average Score',
                backgroundColor: '#0F358A',
                data: scores,
                borderRadius: 4,
                barThickness: 25,
              },
            ],
          };

          // Employee Table
          this.teamKpiData = data.employees?.items || [];
          this.collectionSize = data.employees?.totalCount || 0;

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
      cutout: '75%',
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
            label: (context: any) => `Avg Score: ${context.raw}%`,
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
          max: 100,
          title: {
            display: true,
            // text: 'Average Score (%)',
            color: '#505050',
          },
          ticks: {
            color: '#72777B',
            callback: function(value: any) {
              return value + '%';
            },
            stepSize: 25
          },
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

  clearAllFilters() {
    this.selectedEmployeeId = null;
    this.selectedReviewCycleId = null;
    this.searchText = '';
    this.page = 1;
    this.first = 0;
    this.loadDashboardData();
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

  onPageSizeChange(newSize: number) {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

  openKraPopup(employeeId: number, employeeName: string, content: any) {
    this.selectedEmployeeName = employeeName;
    this.loadEmployeeKras(employeeId);
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  loadEmployeeKras(employeeId: number) {
    this.kraPopupLoading = true;
    this.selectedEmployeeKras = [];

    const params = {
      employeeId,
      pageNumber: 1,
      pageSize: 100, // Load all KRAs for the employee
    };

    this.http
      .getDataIncludeParams('Kpi/getEmployeeAssignKpiKra', params)
      .subscribe({
        next: (res: any) => {
          if (res.success && Array.isArray(res.data)) {
            const allKras: any[] = [];

            // Process new response format with reviewCycles
            res.data.forEach((emp: any) => {
              if (emp.reviewCycles && emp.reviewCycles.length > 0) {
                emp.reviewCycles.forEach((reviewCycle: any) => {
                  if (reviewCycle.kras && reviewCycle.kras.length > 0) {
                    reviewCycle.kras.forEach((kraItem: any) => {
                      allKras.push({
                        kraId: kraItem.kra?.kraId,
                        kraName: kraItem.kra?.kraName,
                        reviewCycleName: reviewCycle.reviewCycle?.reviewCycleName,
                        effectiveDate: kraItem.kra?.effectiveDate,
                        targetDate: kraItem.kra?.targetDate,
                        weightageValue: kraItem.kra?.weightageValue,
                        status: kraItem.kra?.status,
                        kpisCount: kraItem.kpisCount || 0,
                        kpis: kraItem.kpis || []
                      });
                    });
                  }
                });
              }
            });

            this.selectedEmployeeKras = allKras;
          }
          this.kraPopupLoading = false;
        },
        error: () => {
          this.selectedEmployeeKras = [];
          this.kraPopupLoading = false;
        },
      });
  }

  getProgressClass(value: number): string {
    if (value >= 70) return 'bg-success';
    if (value >= 30) return 'bg-warning';
    return 'bg-danger';
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    if (
      this.currentUIField === field &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    if (this.currentUIField === field && this.currentSortOrder === -1) {
      this.currentSortField = '';
      this.currentUIField = '';
      this.currentSortOrder = 0;
      if (this.dashboardTable) {
        this.dashboardTable.sortField = '';
        this.dashboardTable.sortOrder = 0;
      }
      this.page = 1;
      this.first = 0;
      this.loadDashboardData(this.selectedEmployeeId || undefined);
      return;
    }

    this.currentUIField = field;
    this.currentSortField = field;
    this.currentSortOrder = order;
    this.page = 1;
    this.first = 0;
    this.loadDashboardData(this.selectedEmployeeId || undefined);
  }

    getStatusClass(status: string) {
    switch (status) {
      case 'Approved':
      case 'Active':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Waiting for Approval':
        return 'status-waiting-for-approval';
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.dashboardSubscription?.unsubscribe();
  }
}
