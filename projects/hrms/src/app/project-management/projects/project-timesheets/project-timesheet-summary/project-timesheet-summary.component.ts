import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-project-timesheet-summary',
  imports: [CommonModule, SelectModule, TranslateModule, ChartModule],
  templateUrl: './project-timesheet-summary.component.html',
  styleUrl: './project-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetSummaryComponent {
  // Project Resource Data variable
  projectResourceSummaryData: any;
  // Department wise Contribution variables
  departmentContributionData: any;
  departmentContributionOptions: any;
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

  constructor(private router: Router, public formValidation: FormValidationsService, 
    private http: HttpService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.projectResourceSummary();
    this.departmentWiseContributionGraph();
    this.createGaugeChart();
    this.estimatedActualChart();
    this.billableChart();
    this.burnDownChart();
  }

  projectResourceSummary(): void {
    const fullPath = this.router.url;
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.projectResourceSummaryData = [];
        return;
      }
      this.http.getData(`ProjectManagementGraph/project/resource-summary/${projectid}`).pipe(takeUntil(this.destroy$)).subscribe({
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
  departmentWiseContributionGraph() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.departmentContributionData = [];
        return;
      }

      this.http.getData(`ProjectManagementGraph/project/rolewisehours/${projectid}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const apiData = res?.data?.data || [];
          if (!Array.isArray(apiData) || apiData.length === 0) {
            this.departmentContributionData = [];
            return;
          }
          const labels = apiData.map((item: any) => item.name);
          const dataValues = [20, 30];
          this.departmentContributionData = {
            labels: labels,
            datasets: [
              {
                data: dataValues,
                backgroundColor: ['#FF6E06', '#EA267A', '#0F358A', '#22D235', '#25BBFF', '#1D79E6'],
                hoverBackgroundColor: ['#FFB74D', '#F06292', '#5C6BC0', '#81C784', '#26A69A', '#64B5F6']
              }
            ]
          };

          this.departmentContributionOptions = {
            cutout: '75%',
            plugins: {
              legend: { position: 'right', labels: { usePointStyle: true } },
            },
          };
        },

        error: (err) => {
          console.error('Error fetching Role-wise hours:', err);
          this.departmentContributionData = [];
        }
      });
    });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    this.estimatedVsActualData = {
      labels: ['Softkill E-commerce', 'Admin App', 'E-commerce', 'Web app', 'Mobile App'],
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: '#1A237E',
          data: [850, 950, 700, 880, 900],
          stack: 'Estimated' // separate stack
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: [800, 700, 450, 850, 700],
          stack: 'ActualOverdue' // stacked with Overdue
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: [100, 0, 0, 80, 0],
          stack: 'ActualOverdue' // stacked on top of Actual
        }
      ]
    };

    this.estimatedVsActualOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          stacked: false, // show two separate bars per project (Estimated vs Actual+Overdue)
          grid: { display: false },
          title: { display: false }
        },
        y: {
          stacked: true, // stack Actual + Overdue vertically
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          },
        }
      }
    };
  }

  // Billable vs Non-Billable Hours (Stacked Bar)
  billableChart() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.billableData = [];
        return;
      }

      this.http.getData(`ProjectManagementGraph/project/billable-non-billable/${projectid}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('Billable chart response:', res);

            // ✅ Correct extraction based on your actual structure
            const apiData = res?.data?.data || res?.data || [];

            if (!Array.isArray(apiData) || apiData.length === 0) {
              console.warn('No valid billable data found:', apiData);
              this.billableData = [];
              return;
            }

            // ✅ Extract data safely
            const labels = apiData.map((item: any) => item.name || 'N/A');
            const billable = apiData.map((item: any) => item.billableHours || 0);
            const nonBillable = apiData.map((item: any) => item.nonBillableHours || 0);

            // ✅ Chart data
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

            // ✅ Chart options
            this.billableOptions = {
              responsive: true,
              scales: {
                x: { stacked: true },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  title: { display: true, text: 'Hours' },
                  ticks: { stepSize: 50 } // optional: split by 50s
                },
              },
              plugins: {
                legend: {
                  display: true, // set false if you want to hide legend
                  position: 'top',
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
  burnDownChart() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.burndownData = [];
        return;
      }
      this.http.getData(`ProjectManagementGraph/project/burndownchart/${projectid}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // ✅ Define a proper interface for type safety
          interface LineData {
            date: string;
            remainingHours: number;
          }

          const idealLine: LineData[] = res?.data?.idealLine || [];
          const actualLine: LineData[] = res?.data?.actualLine || [];

          // ✅ Generate labels from ideal line dates
          const labels = idealLine.map((item: LineData) =>
            new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          );

          // ✅ Extract remaining hours
          const idealData = idealLine.map((item: LineData) => item.remainingHours);
          const actualData = actualLine.map((item: LineData) => item.remainingHours);

          // ✅ Chart.js dataset
          this.burndownData = {
            labels: labels,
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

          // ✅ Chart options
          this.burndownOptions = {
            plugins: {
              legend: {
                display: false,
                position: 'top',
                labels: { boxWidth: 12, color: '#333' }
              },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: {
                title: { display: true, text: 'Date', color: '#333' },
                grid: { display: false }
              },
              y: {
                title: { display: true, text: 'Remaining Hours', color: '#333' },
                beginAtZero: true,
                ticks: {
                  stepSize: 1, // 👈 adds 100-unit intervals
                },
                grid: {
                  color: '#e0e0e0'
                }
              }
            },
            responsive: true,
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