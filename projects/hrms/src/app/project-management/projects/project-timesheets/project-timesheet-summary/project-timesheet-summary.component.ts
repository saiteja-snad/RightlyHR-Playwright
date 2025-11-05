import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-project-timesheet-summary',
  imports: [CommonModule, SelectModule, TranslateModule, ChartModule, NgbPopover],
  templateUrl: './project-timesheet-summary.component.html',
  styleUrl: './project-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetSummaryComponent {
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

  constructor(private router: Router, public formValidation: FormValidationsService,
    private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.http.getDateRangeObservable().pipe(takeUntil(this.destroy$)).subscribe(dateRange => {
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        // Call APIs with date range
        this.projectResourceSummary(dateRange.startDate, dateRange.endDate);
        this.roleWiseHoursGraph(dateRange.startDate, dateRange.endDate);
        this.createGaugeChart();
        this.estimatedActualChart(dateRange.startDate, dateRange.endDate);
        this.billableChart(dateRange.startDate, dateRange.endDate);
        this.burnDownChart(dateRange.startDate, dateRange.endDate);
      } else {
        this.projectResourceSummary();
        this.roleWiseHoursGraph();
        this.createGaugeChart();
        this.estimatedActualChart();
        this.billableChart();
        this.burnDownChart();
      }
    });
  }

  getProgressColor(utilization: number): string {
    if (utilization >= 75) return '#22c55e'; // green
    if (utilization >= 40) return '#facc15'; // yellow
    if (utilization > 0) return '#ef4444';   // red
    return '#e5e7eb'; // gray for 0%
  }
  
  projectResourceSummary(startDate?: string, endDate?: string): void {
    const fullPath = this.router.url;
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.projectResourceSummaryData = [];
        return;
      }
      // Get stored date range from HttpService
      const dateRange = this.http.getCurrentDateRange();
      const startDate = dateRange?.startDate ?? null;
      const endDate = dateRange?.endDate ?? null;

      // Build the API URL conditionally
      let url = `ProjectManagementGraph/project/resource-summary/${projectid}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // this.projectResourceData.get('clientName')?.enable();
          this.projectResourceSummaryData = Array.isArray(res?.data) ? res.data : [];
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        }
      });
    });
  }

  // Department wise Contribution
  roleWiseHoursGraph(startDate?: string, endDate?: string) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.roleWiseHoursData = [];
        return;
      }
      //  Get stored date range from HttpService
      const dateRange = this.http.getCurrentDateRange();
      const startDate = dateRange?.startDate ?? null;
      const endDate = dateRange?.endDate ?? null;
      // Build the API URL conditionally
      let url = `ProjectManagementGraph/project/rolewisehours/${projectid}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const apiData = res?.data?.data || [];
          this.roleWiseData = res?.data?.data || [];
          console.log(this.roleWiseData)
          if (!Array.isArray(apiData) || apiData.length === 0) {
            this.roleWiseHoursData = [];
            return;
          }
          // Extract values from API
          const labels = apiData.map((item: any) => item.name);
          const dataValues = apiData.map((item: any) => item.percentage);
          const backgroundColors = apiData.map((item: any) => item.meta?.graphData?.color || '#CCCCCC'); // fallback gray
          // Build chart dataset dynamically
          this.roleWiseHoursData = {
            labels,
            datasets: [
              {
                data: dataValues,
                backgroundColor: backgroundColors,
              },
            ],
          };
          // Chart options
          this.roleWiseHoursOptions = {
            cutout: '75%',
            plugins: {
              legend: { display: false },
            },
          };
        },
        error: (err) => {
          console.error('Error fetching Role-wise hours:', err);
          this.roleWiseHoursData = [];
        },
      });
    });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart(startDate?: string, endDate?: string) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.estimatedVsActualData = [];
        return;
      }
      //  Get stored date range from HttpService
      const dateRange = this.http.getCurrentDateRange();
      const startDate = dateRange?.startDate ?? null;
      const endDate = dateRange?.endDate ?? null;

      // Build the API URL conditionally
      let url = `ProjectManagementGraph/project/allocated-vs-actual/${projectid}?groupBy=role`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.data?.length) {
            const chartData = res.data.data;
            const labels = chartData.map((item: any) => item.name);
            const estimatedHours = chartData.map((item: any) => item.allocateHours);
            const actualHours = chartData.map((item: any) => (item.actualHours - item.overDueHours));
            const overdueHours = chartData.map((item: any) => item.overDue ? item.overDueHours : 0);

            this.estimatedVsActualData = {
              labels: labels,
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
              barThickness: 30,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  stacked: false,
                  grid: { display: false, },
                  ticks: { color: '#141414', font: { size: 11 } },
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  title: {
                    display: true, text: 'Hours', color: '#505050',
                    font: { size: 9 },
                  },
                  ticks: {
                    color: '#72777B',
                    font: { size: 11 },
                  },
                },
              },
            };
          } else {
            this.estimatedVsActualData = [];
          }
        },
        error: (err) => {
          console.error('Error fetching estimated vs actual chart:', err);
        }
      });
    });
  }

  // Billable vs Non-Billable Hours (Stacked Bar)
  billableChart(startDate?: string, endDate?: string) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.billableData = [];
        return;
      }

      //  Get stored date range from HttpService
      const dateRange = this.http.getCurrentDateRange();
      const startDate = dateRange?.startDate ?? null;
      const endDate = dateRange?.endDate ?? null;

      // Build the API URL conditionally
      let url = `ProjectManagementGraph/project/billable-non-billable/${projectid}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Correct extraction based on your actual structure
          const apiData = res?.data?.data || res?.data || [];
          if (!Array.isArray(apiData) || apiData.length === 0) {
            console.warn('No valid billable data found:', apiData);
            this.billableData = [];
            return;
          }

          // Extract data safely
          const labels = apiData.map((item: any) => item.name || 'N/A');
          const billable = apiData.map((item: any) => item.billableHours || 0);
          const nonBillable = apiData.map((item: any) => item.nonBillableHours || 0);

          // Chart data
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
              },
            ],
          };

          // Chart options
          this.billableOptions = {
            responsive: true,
            barThickness: 30,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                stacked: false,
                grid: { display: false, },
                ticks: { color: '#141414', font: { size: 11 } },
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true, text: 'Hours', color: '#505050',
                  font: { size: 9 },
                },
                ticks: {
                  color: '#72777B',
                  font: { size: 11 },
                },
              },
            },
          };
        },
        error: (err) => {
          console.error('Error fetching billable chart:', err);
        }
      });
    });
  }

  // Project Burndown Chart (Line)
  burnDownChart(startDate?: string, endDate?: string): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [key: string]: any }) => {
      const projectId = params['id'];
      if (!projectId) {
        this.burndownData = [];
        return;
      }
      // Get stored date range from HttpService
      const dateRange = this.http.getCurrentDateRange();
      const start = dateRange?.startDate ?? null;
      const end = dateRange?.endDate ?? null;

      // Build API URL conditionally
      let url = `ProjectManagementGraph/project/burndownchart/${projectId}`;
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          interface LineData {
            date: string;
            remainingHours: number;
          }

          this.projectName = res?.data?.projectName;
          const idealLine: LineData[] = res?.data?.idealLine || [];
          const actualLine: LineData[] = res?.data?.actualLine || [];

          // Helper function to group data by week (Sunday–Saturday)
          const groupByWeek = (data: LineData[]) => {
            const weeks: { label: string; avgHours: number }[] = [];
            if (!data.length) return weeks;

            const grouped: Record<string, LineData[]> = {};
            data.forEach(item => {
              const date = new Date(item.date);
              const firstDayOfWeek = new Date(date);
              firstDayOfWeek.setDate(date.getDate() - date.getDay()); // Week starts on Sunday
              const key = firstDayOfWeek.toISOString().split('T')[0];
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(item);
            });

            Object.entries(grouped).forEach(([weekStart, items]) => {
              const start = new Date(weekStart);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', 
                { month: 'short', day: 'numeric' })}`;
              const avgHours = items.reduce((sum, i) => sum + i.remainingHours, 0) / items.length;
              weeks.push({ label, avgHours });
            });

            return weeks;
          };

          // Apply grouping
          const idealWeeks = groupByWeek(idealLine);
          const actualWeeks = groupByWeek(actualLine);

          // Labels and data for chart
          const labels = idealWeeks.map(w => w.label);
          const idealData = idealWeeks.map(w => w.avgHours);
          const actualData = actualWeeks.map(w => w.avgHours);

          // Chart.js dataset
          this.burndownData = {
            labels,
            datasets: [
              {
                label: 'Ideal Line',
                data: idealData,
                borderColor: '#2196F3',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: '#2196F3',
              },
              {
                label: 'Actual Line',
                data: actualData,
                borderColor: '#E91E63',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: '#E91E63',
              },
            ],
          };

          // Chart options
          this.burndownOptions = {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: 'index', intersect: false },
            },
            scales: {
              x: {
                grid: { display: false },
                title: {
                  display: true,
                  text: 'Weeks',
                  color: '#141414',
                  font: { size: 11 },
                },
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
                  text: 'No. of Hours',
                  color: '#141414',
                  font: { size: 11 },
                },
                ticks: {
                  color: '#72777B',
                  font: { size: 11 },
                },
              },
            },
            maintainAspectRatio: false,
          };
        },
        error: (err) => {
          console.error('Error fetching burndown chart:', err);
          this.burndownData = [];
        },
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
          this.completionRate = percent;
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
}