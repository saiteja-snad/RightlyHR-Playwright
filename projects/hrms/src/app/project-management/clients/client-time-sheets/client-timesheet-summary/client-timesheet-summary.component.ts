import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-client-timesheet-summary',
  imports: [CommonModule, SelectModule, TranslateModule, ChartModule],
  templateUrl: './client-timesheet-summary.component.html',
  styleUrl: './client-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimesheetSummaryComponent {
  projectsDataDropdown = [
    { projectId: 1, projectName: 'Website Redesign' },
    { projectId: 2, projectName: 'Mobile App Development' },
    { projectId: 3, projectName: 'CRM Integration' },
    { projectId: 4, projectName: 'E-commerce Platform' },
    { projectId: 5, projectName: 'Data Migration' }
  ];
  statusOptions = [
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];
  // Project wise Resource Count variables
  projectResourceData: any;
  projectResourceOptions: any;
  // Department wise Contribution variables
  departmentContributionData: any;
  departmentContributionOptions: any;
  // Project Type Data variables
  projectTypeData: any;
  projectTypeOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualOptions: any;
  // Billable Data variables
  billableData: any;
  billableOptions: any;
  // Burn Down Data variables
  burndownData: any;
  burndownOptions: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.projectWiseResourceCountGraph();
    this.departmentWiseContributionGraph();
    this.projectTypeChart();
    this.estimatedActualChart();
    this.billableChart();
    this.burnDownChart();
  }

  // Project wise Resource Count
  projectWiseResourceCountGraph() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectResourceData = [];
        return;
      }

      this.http.getData(`ProjectManagementGraph/client/project-wise-resource/${clientID}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('Project-wise Resource Count Response:', res);

            if (res?.length) {
              const responseData = res;

              // ✅ Use correct property names from your response
              const labels = responseData.map((item: any) => item.projectName);
              const resourceCounts = responseData.map((item: any) => item.resourceCount || 0);

              this.projectResourceData = {
                labels,
                datasets: [
                  {
                    label: 'Resource Count',
                    data: resourceCounts,
                    backgroundColor: ['#FDCC11', '#FF207F', '#187DF5', '#00A912', '#4533E3'],
                    barThickness: 10
                  }
                ]
              };
            } else {
              // Fallback dummy data if API returns empty
              this.projectResourceData = {
                labels: ['E-commerce', 'Admin App', 'User App', 'Web App', 'Mobile App'],
                datasets: [
                  {
                    label: 'Resource Count',
                    data: [60, 50, 70, 30, 40],
                    backgroundColor: ['#FDCC11', '#FF207F', '#187DF5', '#00A912', '#4533E3'],
                    barThickness: 10
                  }
                ]
              };
            }

            this.projectResourceOptions = {
              indexAxis: 'y', // Horizontal bar
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  title: { display: true, text: 'Resource Count' },
                  grid: { display: false }
                },
                y: {
                  title: { display: true, text: 'Projects' },
                  grid: { display: false }
                }
              }
            };
          },
          error: (err) => {
            console.error('Error fetching project-wise resource count chart:', err);
          }
        });
    });
  }

  // Department wise Contribution
  departmentWiseContributionGraph() {
    this.departmentContributionData = {
      labels: ['BA Team', 'Design Team', 'Development Team', 'Testing Team', 'DevOps Team', 'Sales Team'],
      datasets: [
        {
          data: [40.2, 33, 44.5, 50, 50, 60],
          backgroundColor: ['#FF6E06', '#EA267A', '#0F358A', '#22D235', '#25BBFF', '#1D79E6'],
        }
      ]
    };

    this.departmentContributionOptions = {
      cutout: '75%',
      plugins: {
        legend: { position: 'right', labels: { usePointStyle: true } },
      },
    };
  }

  // Project Type (Pie)
  projectTypeChart() {
    this.projectTypeData = {
      labels: ['Implementation', 'Development', 'Migration', 'Integration', 'Support', 'Design'],
      datasets: [
        {
          data: [10, 5, 3, 2, 1, 4],
          backgroundColor: ['#FFD54F', '#E91E63', '#4DB6AC', '#64B5F6', '#81C784', '#3F51B5'],
        },
      ],
    };
    this.projectTypeOptions = {
      plugins: {
        legend: { position: 'right', labels: { usePointStyle: true } },
      },
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {

      const clientID = params['id'];
      if (!clientID) {
        this.estimatedVsActualData = [];
        return;
      }

      this.http.getData(`ProjectManagementGraph/client/allocated-vs-actual/${clientID}?groupBy=project`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.data?.length) {
            const chartData = res.data.data;
            const labels = chartData.map((item: any) => item.name);
            const estimatedHours = chartData.map((item: any) => item.allocateHours);
            const actualHours = chartData.map((item: any) => item.actualHours);
            const overdueHours = chartData.map((item: any) => item.overDue ? (item.allocateHours - item.actualHours) : 0);

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
              plugins: {
                legend: {
                  display: false,
                  position: 'top'
                },
              },
              scales: {
                x: {
                  stacked: false, // show Estimated vs Actual+Overdue as separate bars
                  grid: { display: false },
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Hours'
                  }
                }
              }
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
  billableChart() {
    this.billableData = {
      labels: ['Project Management', 'Development', 'Design', 'QA'],
      datasets: [
        {
          label: 'Billable',
          backgroundColor: '#283593',
          data: [900, 600, 700, 500],
        },
        {
          label: 'Non-Billable',
          backgroundColor: '#9FA8DA',
          data: [300, 200, 150, 100],
        },
      ],
    };
    this.billableOptions = {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Hours' } },
      },
      plugins: {
        legend: {
          display: false
        }
      },
    };
  }

  // Project Burndown Chart (Line)
  burnDownChart() {
    this.burndownData = {
      labels: ['1', '5', '10', '15', '20', '25', '30'],
      datasets: [
        {
          label: 'E-commerce',
          data: [500, 480, 400, 300, 200, 120, 100],
          borderColor: '#FFD54F',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Admin App',
          data: [300, 280, 200, 180, 220, 260, 300],
          borderColor: '#E91E63',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'E-commerce (Softkill)',
          data: [800, 750, 700, 600, 500, 400, 300],
          borderColor: '#2196F3',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Web app',
          data: [400, 390, 380, 300, 250, 200, 180],
          borderColor: '#4CAF50',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Mobile App',
          data: [100, 120, 110, 100, 90, 80, 70],
          borderColor: '#FFEB3B',
          fill: false,
          tension: 0.3,
        },
      ],
    };
    this.burndownOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: { title: { display: true, text: 'Days of Month' } },
        y: { title: { display: true, text: 'No. of Hours' }, beginAtZero: true },
      },
    };
  }
}