import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-project-timesheet-summary',
  imports: [CommonModule, SelectModule, TranslateModule, ChartModule, NgbPopover, NoDataFoundComponent, SkeletonModule],
  templateUrl: './project-timesheet-summary.component.html',
  styleUrl: './project-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetSummaryComponent implements OnInit, OnDestroy {
  // Project Resource Data variable
  projectResourceSummaryData: any;
  // Department wise Contribution variables
  roleWiseData: any;
  roleWiseHoursData: any;
  roleWiseHoursOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualOptions: any;
  // Billable Data variables
  billableData: any;
  billableOptions: any;
  // Burn Down Data variables
  burndownData: any;
  burndownOptions: any;
  //Gauge Data
  gaugeData: any;
  gaugeOptions: any;
  completionRate = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  estimatedlabels = [
    { label: 'Allocated Hours', color: '#0F358A' },
    { label: 'Actual Hours', color: '#A2B5E2' },
    { label: 'Over Due', color: '#FF4848' }
  ];
  billablelabels = [
    { label: 'Billable', color: '#0F358A' },
    { label: 'Non-Billable', color: '#A2B5E2' },
  ];
  // project name
  projectName: any;
  //Graph Infos
  resourceSummaryInfo = "The Resource Summary widget displays the list of resources assigned to the project along with their roles, total hours utilized, and utilization percentage. It helps track team effort and workload distribution within the project.";
  projectCompletionRateInfo = "The Project Completion Rate widget visually represents the overall progress of the project. It indicates the percentage of work completed based on logged hours versus planned hours.";
  roleWiseHoursInfo = "The Role-wise Hours widget provides a graphical representation of total hours logged by each role. It helps analyse time distribution across different functions such as development, testing, or design.";
  estimatedvsActualHoursInfo = "The Estimated vs Actual Hours widget compares planned project hours with the actual hours logged. This helps evaluate project efficiency and identify deviations from the original estimates.";
  billablevsNonBillableHoursInfo = "The Billable vs Non-Billable Hours widget displays the ratio of billable work hours to non-billable activities. It helps assess project profitability and resource utilization.";
  projectBurndownInfo = "The Project Burndown Chart visually tracks project progress over time. It shows the remaining work against the planned schedule, helping managers monitor task completion and stay on track with deadlines.";
  // data loader
  resourceSummaryLoader = false;
  projectCompletionRateLoader = false;
  roleWiseHoursLoader = false;
  estimatedvsActualHoursLoader = false;
  billablevsNonBillableHoursLoader = false;
  projectBurndownLoader = false;
  overrunValue: any;

  constructor(private router: Router, public formValidation: FormValidationsService, private http: HttpService, private route: ActivatedRoute) { }

  // ngOnInit() {
  //   this.http.getDateRangeObservable().pipe(takeUntil(this.destroy$)).subscribe(dateRange => {
  //     if (dateRange && dateRange.startDate && dateRange.endDate) {
  //       // Call APIs with date range
  //       this.projectResourceSummary(dateRange.startDate, dateRange.endDate);
  //       this.roleWiseHoursGraph(dateRange.startDate, dateRange.endDate);
  //       this.createGaugeChart();
  //       this.estimatedActualChart(dateRange.startDate, dateRange.endDate);
  //       this.billableChart(dateRange.startDate, dateRange.endDate);
  //       this.burnDownChart(dateRange.startDate, dateRange.endDate);
  //     } else {
  //       this.projectResourceSummary();
  //       this.roleWiseHoursGraph();
  //       this.createGaugeChart();
  //       this.estimatedActualChart();
  //       this.billableChart();
  //       this.burnDownChart();
  //     }
  //   });
  // }

ngOnInit(): void {
  // 1. Main "Apply" button filter (from form submit)
  this.http.projectTimesheetFilterData$
    .pipe(takeUntil(this.destroy$))
    .subscribe((request: any) => {
      if (request !== null) {
        this.refreshAllCharts(request);
      } else {
        this.refreshAllCharts({}); // Reset
      }
    });

  // 2. Live Department Filter
  this.http.projectTimesheetDepartmentIds$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.triggerLiveFilterRefresh();
    });

  // 3. Live Role Filter
  this.http.projectTimesheetRoleFilter$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.triggerLiveFilterRefresh();
    });

  // 4. Live Phase Filter
  this.http.projectTimesheetPhaseFilter$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.triggerLiveFilterRefresh();
    });

  // 5. Live Date Range Filter
  this.http.getDateRangeObservable()
    .pipe(takeUntil(this.destroy$))
    .subscribe((dateRange: any) => {
      if (dateRange?.startDate && dateRange?.endDate) {
        this.triggerLiveFilterRefresh();
      }
    });

  // Initial load (on component init)
  this.triggerLiveFilterRefresh();
}


private triggerLiveFilterRefresh(): void {
  const deptIds = this.http.getCurrentProjectTimesheetDepartmentIds();
  const roleIds = this.http.getCurrentProjectTimesheetRoleIds();
  const phaseIds = this.http.getCurrentProjectTimesheetPhaseIds();
  const dateRange = this.http.getCurrentDateRange(); // your existing method

  console.log(deptIds)
  console.log(roleIds)
  console.log(phaseIds)
  console.log(dateRange)

  const request: any = {
    dateRange: dateRange?.startDate && dateRange?.endDate
      ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
      : undefined,
    departmentIds: deptIds.length > 0 ? deptIds : undefined,
    roleIds: roleIds.length > 0 ? roleIds : undefined,
    phaseIds: phaseIds.length > 0 ? phaseIds : undefined,
  };

  // Remove undefined keys
  Object.keys(request).forEach(key => {
    if (request[key] === undefined) delete request[key];
  });

  this.refreshAllCharts(request);
}

  private refreshAllCharts(request: any = {}): void {
    const startDate = request.dateRange?.startDate;
    const endDate = request.dateRange?.endDate;

    this.projectResourceSummary(startDate, endDate, request.departmentIds, request.roleIds, request.phaseIds);
    this.roleWiseHoursGraph(startDate, endDate, request.departmentIds, request.roleIds, request.phaseIds);
    this.estimatedActualChart(startDate, endDate, request.departmentIds, request.roleIds, request.phaseIds);
    this.billableChart(startDate, endDate, request.departmentIds, request.roleIds, request.phaseIds);
    this.burnDownChart(startDate, endDate, request.departmentIds, request.roleIds, request.phaseIds);
    this.createGaugeChart(); // no filters
  }

  getProgressColor(utilization: number): string {
    if (utilization >= 75) return '#22c55e'; // green
    if (utilization >= 40) return '#facc15'; // yellow
    if (utilization > 0) return '#ef4444';   // red
    return '#e5e7eb'; // gray for 0%
  }

 projectResourceSummary(
  startDate?: string,
  endDate?: string,
  departmentIds?: number[],
  roleIds?: number[],
  phaseIds?: number[]
): void {
  this.resourceSummaryLoader = true;

  // Get project ID once (no need to subscribe multiple times)
  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const projectId = params['id'];
    if (!projectId) {
      this.projectResourceSummaryData = [];
      this.resourceSummaryLoader = false;
      return;
    }

    let url = `ProjectManagementGraph/project/resource-summary/${projectId}`;
    const queryParams: string[] = [];

    // Use the parameters passed in (from refreshAllCharts) — NOT the old stored ones!
    if (startDate && endDate) {
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (departmentIds?.length) {
      queryParams.push(`departmentIds=${departmentIds.join(',')}`);
    }
    if (roleIds?.length) {
      queryParams.push(`roleIds=${roleIds.join(',')}`);
    }
    if (phaseIds?.length) {
      queryParams.push(`phaseIds=${phaseIds.join(',')}`);
    }

    // Append query string only if we have params
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.resourceSummaryLoader = false;
        this.projectResourceSummaryData = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        this.resourceSummaryLoader = false;
        console.error('Error fetching project resource summary:', err);
        this.projectResourceSummaryData = [];
      }
    });
  });
}
  // Department wise Contribution
roleWiseHoursGraph(
  startDate?: string,
  endDate?: string,
  departmentIds?: number[],
  roleIds?: number[],
  phaseIds?: number[]
): void {
  this.roleWiseHoursLoader = true;

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const projectId = params['id'];
    if (!projectId) {
      this.roleWiseHoursData = [];
      this.roleWiseHoursLoader = false;
      return;
    }

    let url = `ProjectManagementGraph/project/rolewisehours/${projectId}`;
    const queryParams: string[] = [];

    // Use the actual parameters passed in — NOT the old stored ones!
    if (startDate && endDate) {
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (departmentIds?.length) {
      queryParams.push(`departmentIds=${departmentIds.join(',')}`);
    }
    if (roleIds?.length) {
      queryParams.push(`roleIds=${roleIds.join(',')}`);
    }
    if (phaseIds?.length) {
      queryParams.push(`phaseIds=${phaseIds.join(',')}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.roleWiseHoursLoader = false;

        const apiData = res?.data?.data || [];
        if (!Array.isArray(apiData) || apiData.length === 0) {
          this.roleWiseHoursData = [];
          this.roleWiseData = [];
          return;
        }

        this.roleWiseData = apiData;

        const labels = apiData.map((item: any) => item.name || 'Unknown');
        const dataValues = apiData.map((item: any) => item.percentage || 0);
        const backgroundColors = apiData.map((item: any) => item.meta?.graphData?.color || '#CCCCCC');

        this.roleWiseHoursData = {
          labels,
          datasets: [{
            data: dataValues,
            backgroundColor: backgroundColors,
            hoverBackgroundColor: backgroundColors,
          }]
        };

        this.roleWiseHoursOptions = {
          cutout: '60%',
          plugins: {legend: { display: false, position: 'right' } },
          responsive: true,
          maintainAspectRatio: false
        };
      },
      error: (err) => {
        this.roleWiseHoursLoader = false;
        console.error('Error fetching Role-wise hours:', err);
        this.roleWiseHoursData = [];
        this.roleWiseData = [];
      }
    });
  });
}

  // Estimated vs Actual Hours (Grouped Bar)
estimatedActualChart(
  startDate?: string,
  endDate?: string,
  departmentIds?: number[],
  roleIds?: number[],
  phaseIds?: number[]
): void {
  this.estimatedvsActualHoursLoader = true;

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const projectId = params['id'];
    if (!projectId) {
      this.estimatedVsActualData = [];
      this.estimatedvsActualHoursLoader = false;
      return;
    }

    // Start with base URL + required query param
    let url = `ProjectManagementGraph/project/allocated-vs-actual/${projectId}?groupBy=role`;
    const queryParams: string[] = [];

    // Use the actual parameters passed from refreshAllCharts()
    if (startDate && endDate) {
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (departmentIds?.length) {
      queryParams.push(`departmentIds=${departmentIds.join(',')}`);
    }
    if (roleIds?.length) {
      queryParams.push(`roleIds=${roleIds.join(',')}`);
    }
    if (phaseIds?.length) {
      queryParams.push(`phaseIds=${phaseIds.join(',')}`);
    }

    // Append additional params with & (since ?groupBy=role already exists)
    if (queryParams.length > 0) {
      url += `&${queryParams.join('&')}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.estimatedvsActualHoursLoader = false;

        if (!res?.success || !Array.isArray(res?.data?.data) || res.data.data.length === 0) {
          this.estimatedVsActualData = [];
          return;
        }

        const chartData = res.data.data;

        const labels = chartData.map((item: any) => item.name || 'Unknown');
        const estimatedHours = chartData.map((item: any) => item.allocateHours ?? 0);
        const actualHours = chartData.map((item: any) => (item.actualHours ?? 0) - (item.overDueHours ?? 0));
        const overdueHours = chartData.map((item: any) => (item.overDue ? item.overDueHours : 0) ?? 0);

        this.estimatedVsActualData = {
          labels,
          datasets: [
            {
              label: 'Estimated Hours',
              backgroundColor: '#1A237E',
              data: estimatedHours,
              stack: 'Estimated'
            },
            {
              label: 'Actual Hours',
              backgroundColor: '#90CAF9',
              data: actualHours,
              stack: 'ActualOverdue'
            },
            {
              label: 'Over Due',
              backgroundColor: '#FF5252',
              data: overdueHours,
              stack: 'ActualOverdue'
            }
          ]
        };

        this.estimatedVsActualOptions = {
          responsive: true,
          maintainAspectRatio: false,
          barThickness: 30,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              stacked: false,
              grid: { display: false },
              ticks: { color: '#141414', font: { size: 11 } }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: 'Hours', color: '#505050', font: { size: 12 } },
              ticks: { color: '#72777B', font: { size: 11 } }
            }
          }
        };
      },
      error: (err) => {
        this.estimatedvsActualHoursLoader = false;
        console.error('Error fetching estimated vs actual chart:', err);
        this.estimatedVsActualData = [];
      }
    });
  });
}
  // Billable vs Non-Billable Hours (Stacked Bar)
billableChart(
  startDate?: string,
  endDate?: string,
  departmentIds?: number[],
  roleIds?: number[],
  phaseIds?: number[]
): void {
  this.billablevsNonBillableHoursLoader = true;

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const projectId = params['id'];
    if (!projectId) {
      this.billableData = [];
      this.billablevsNonBillableHoursLoader = false;
      return;
    }

    let url = `ProjectManagementGraph/project/billable-non-billable/${projectId}`;
    const queryParams: string[] = [];

    // Use the actual passed parameters — NOT the old stored ones!
    if (startDate && endDate) {
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (departmentIds?.length) {
      queryParams.push(`departmentIds=${departmentIds.join(',')}`);
    }
    if (roleIds?.length) {
      queryParams.push(`roleIds=${roleIds.join(',')}`);
    }
    if (phaseIds?.length) {
      queryParams.push(`phaseIds=${phaseIds.join(',')}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.billablevsNonBillableHoursLoader = false;

        const apiData = res?.data?.data || res?.data || [];
        if (!Array.isArray(apiData) || apiData.length === 0) {
          this.billableData = [];
          return;
        }

        const labels = apiData.map((item: any) => item.name || 'N/A');
        const billable = apiData.map((item: any) => item.billableHours ?? 0);
        const nonBillable = apiData.map((item: any) => item.nonBillableHours ?? 0);

        this.billableData = {
          labels,
          datasets: [
            {
              label: 'Billable',
              backgroundColor: '#283593',
              data: billable,
              stack: 'combined'
            },
            {
              label: 'Non-Billable',
              backgroundColor: '#9FA8DA',
              data: nonBillable,
              stack: 'combined'
            }
          ]
        };

        this.billableOptions = {
          responsive: true,
          maintainAspectRatio: false,
          barThickness: 30,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              stacked: false,
              grid: { display: false },
              ticks: { color: '#141414', font: { size: 11 } }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: 'Hours', color: '#505050', font: { size: 12 } },
              ticks: { color: '#72777B', font: { size: 11 } }
            }
          }
        };
      },
      error: (err) => {
        this.billablevsNonBillableHoursLoader = false;
        console.error('Error fetching billable vs non-billable chart:', err);
        this.billableData = [];
      }
    });
  });
}

  // Project Burndown Chart (Line)
burnDownChart(
  startDate?: string,
  endDate?: string,
  departmentIds?: number[],
  roleIds?: number[],
  phaseIds?: number[]
): void {
  this.projectBurndownLoader = true;

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const projectId = params['id'];
    if (!projectId) {
      this.burndownData = [];
      this.projectBurndownLoader = false;
      return;
    }

    let url = `ProjectManagementGraph/project/burndownchart/${projectId}`;
    const queryParams: string[] = [];

    // Use the actual passed parameters — NOT the old stored date range!
    if (startDate && endDate) {
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (departmentIds?.length) {
      queryParams.push(`departmentIds=${departmentIds.join(',')}`);
    }
    if (roleIds?.length) {
      queryParams.push(`roleIds=${roleIds.join(',')}`);
    }
    if (phaseIds?.length) {
      queryParams.push(`phaseIds=${phaseIds.join(',')}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectBurndownLoader = false;

        if (!res?.data) {
          this.burndownData = [];
          this.projectName = '';
          return;
        }

        this.projectName = res.data.projectName || 'Unknown Project';

        interface LineData {
          date: string;
          remainingHours: number;
        }

        const idealLine: LineData[] = res.data.idealLine || [];
        const actualLine: LineData[] = res.data.actualLine || [];

        // Group by week (Sunday to Saturday)
        const groupByWeek = (data: LineData[]) => {
          if (!data.length) return [];
          const grouped: Record<string, LineData[]> = {};

          data.forEach(item => {
            const date = new Date(item.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const key = weekStart.toISOString().split('T')[0];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
          });

          return Object.entries(grouped).map(([weekStart, items]) => {
            const start = new Date(weekStart);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            const avgHours = items.reduce((sum, i) => sum + i.remainingHours, 0) / items.length;

            return { label, avgHours };
          });
        };

        const idealWeeks = groupByWeek(idealLine);
        const actualWeeks = groupByWeek(actualLine);

        const labels = idealWeeks.map(w => w.label);
        const idealData = idealWeeks.map(w => w.avgHours);
        const actualData = actualWeeks.map(w => w.avgHours);

        this.burndownData = {
          labels,
          datasets: [
            {
              label: 'Ideal Line',
              data: idealData,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.3,
              pointBackgroundColor: '#2196F3',
              pointRadius: 4
            },
            {
              label: 'Actual Line',
              data: actualData,
              borderColor: '#E91E63',
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.3,
              pointBackgroundColor: '#E91E63',
              pointRadius: 4
            }
          ]
        };

        this.burndownOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: {
              grid: { display: false },
              title: { display: true, text: 'Weeks', color: '#141414', font: { size: 11 } },
              ticks: { color: '#141414', font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Remaining Hours', color: '#141414', font: { size: 11 } },
              ticks: { color: '#72777B', font: { size: 11 } }
            }
          }
        };
      },
      error: (err) => {
        this.projectBurndownLoader = false;
        console.error('Error fetching burndown chart:', err);
        this.burndownData = [];
        this.projectName = '';
      }
    });
  });
}

  createGaugeChart() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.completionRate = 0;
        return;
      }
      this.http.getData(`ProjectManagementGraph/project/completion-rate/${projectid}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const percent = Number(res?.data?.completionPercent) || 0;
          // Cap gauge at 100%
          this.completionRate = percent > 100 ? 100 : percent;
          // Separate extra value (overrun)
          this.overrunValue = percent > 100 ? percent - 100 : 0;
          // Create 10 colored segments for smoother gradient effect
          const dataValues = new Array(6).fill(6);
          const colors = [
            '#FF5656', '#FF8888', '#FEE114', '#D1D80F',
            '#84BD32', '#30AD43',
          ];
          this.gaugeData = {
            datasets: [
              {
                data: dataValues,
                backgroundColor: colors,
                borderWidth: 0,
                circumference: 180,
                rotation: -90,
                cutout: '90%',
              }
            ]
          };
          this.gaugeOptions = {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            },
            rotation: -90,
            circumference: 180,
          };
        },
        error: (err) => {
          console.error('Error fetching project completion rate:', err);
          this.completionRate = 0;
        }
      });
    });
  }

  // calculate needle rotation based on % value
  getNeedleRotation(): string {
    const angle = (this.completionRate / 100) * 180 - 90;
    return `rotate(${angle}deg)`;
  }

  //graphs no data found conditions
  get hasroleWiseHoursData(): boolean {
    const datasets = this.roleWiseHoursData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some(value => value > 0);
  }

  get hasestimatedActualHoursData(): boolean {
    const datasets = this.estimatedVsActualData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some(value => value > 0);
  }

  get hasbillableData(): boolean {
    const datasets = this.billableData?.datasets;
    if (!datasets?.length) return false;
    return datasets.some((ds: { data: number[] }) =>
      Array.isArray(ds.data) && ds.data.some(value => Number(value) > 0)
    );
  }

  get hasburndownData(): boolean {
    const datasets = this.burndownData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some(value => value > 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
