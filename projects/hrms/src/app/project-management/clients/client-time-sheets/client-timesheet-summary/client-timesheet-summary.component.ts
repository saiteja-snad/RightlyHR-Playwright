import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../../Interfaces/projects.model';
@Component({
  selector: 'app-client-timesheet-summary',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, TranslateModule, FormsModule, ChartModule],
  templateUrl: './client-timesheet-summary.component.html',
  styleUrl: './client-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimesheetSummaryComponent {
  statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'On Track', value: 'On Track' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Inactive/Closed', value: 'Inactive/Closed' }
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
  projectSummeryData: any;
  datepickerForm!: FormGroup;
  projectsDataDrown: Project[] = [];
  clientsId!: any;
  selectedDeptProjectId: any = null;
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
  projectNames: any;

  constructor(private http: HttpService, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.createClientForm();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [key: string]: any }) => {
      const clientID = params['id'];
      this.getprojectbyid(clientID);
    });
    this.http.requestclienttimesheetdata$.pipe(takeUntil(this.destroy$)).subscribe((request) => {
      if (request && request.dateRange) {
        // Call API with date filter (if BehaviorSubject has data)
        this.projectSummery(request);
        this.projectWiseResourceCountGraph(request);
        this.departmentWiseContributionGraph(request);
        this.projectTypeChart(request);
        this.estimatedActualChart(request);
        this.billableChart(request);
        this.burnDownChart(request);
      } else {
        // Call API without any date filter
        this.projectSummery();
        this.projectWiseResourceCountGraph();
        this.departmentWiseContributionGraph();
        this.projectTypeChart();
        this.estimatedActualChart();
        this.billableChart();
        this.burnDownChart();
        // Reset form dropdowns here
        this.datepickerForm.reset({
          projectId: '',
          status: ''
        });
        this.selectedDeptProjectId = null;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'On Track':
        return 'on-track';
      case 'Delayed':
        return 'delayed';
      case 'Progress':
      case 'In Progress':
        return 'progress';
      case 'Not Started':
        return 'not-started';
      case 'Inactive/Closed':
        return 'inactive';
      default:
        return '';
    }
  }

  // Just an example to generate different colors
  getColor(index: number): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFC300', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'];
    return colors[index % colors.length];
  }

  // get all project based on client for filter use
  getprojectbyid(clientID: any): void {
    this.http.getData(`Project?clientId=${clientID}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = Array.isArray(res?.data) ? res.data : [];
        // store the clientId from the first project if exists
        const statuses = this.projectsDataDrown.map(p => p.status);
        if (this.projectsDataDrown.length > 0) {
          const project = this.projectsDataDrown[0];
          this.clientsId = project?.client?.clientId ?? null;
        } else {
          this.clientsId = null; // No projects returned
        }
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.projectsDataDrown = [];
        this.clientsId = null;
      }
    });
  }

  // initialization of form
  createClientForm() {
    this.datepickerForm = this.fb.group({
      projectId: [''],
      status: ['']
    });
  }

  filters: any = {
    projectId: null,
    status: null,
    dateRange: null // optional if you have date filters
  };

  onProjectChange(event: any) {
    this.filters.projectId = event?.value || null;
    this.projectSummery(this.filters);
  }

  onStatusChange(event: any) {
    this.filters.status = event?.value || null;
    this.projectSummery(this.filters);
  }

  // Project wise Resource Count
  projectSummery(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectSummeryData = [];
        return;
      }
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/project-summary/${clientID}`;
      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }

      if (request?.status) {
        queryParams.push(`status=${request.status}`);
      }
      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }
      this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.projectSummeryData = Array.isArray(res?.data) ? res.data : [];
        },
        error: (err) => {
          console.error('Error fetching project-wise resource count chart:', err);
        }
      });
    });
  }

  // Project wise Resource Count
  projectWiseResourceCountGraph(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectResourceData = [];
        return;
      }
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/project-wise-resource/${clientID}`;
      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];

      // if (request?.projectId) {
      //   queryParams.push(`projectId=${request.projectId}`);
      // }
      // if (request?.resourceId) {
      //   queryParams.push(`resourceId=${request.resourceId}`);
      // }
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }

      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }

      this.http.getData(apiUrl)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('API Response:', res);

            const data = res?.data || [];
            if (!data.length) {
              this.projectResourceData = {
                labels: [],
                datasets: []
              };
              return;
            }

            // Extract data from API response
            const labels = data.map((item: any) => item.projectName);
            const resourceCounts = data.map((item: any) => item.resourceCount);
            // Assign chart data
            this.projectResourceData = {
              labels: labels,
              datasets: [
                {
                  label: 'Resource Count',
                  data: resourceCounts,
                  backgroundColor: [
                    '#FDCC11', '#FF207F', '#187DF5', '#00A912', '#4533E3',
                    '#FFA500', '#008080', '#9932CC', '#FF6347', '#4682B4'
                  ],
                  barThickness: 10
                }
              ]
            };

            // Chart options
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

  onDeptProjectChange(event: any) {
    // event is the selected projectId
    const selectedProjectId = event?.value;
    const request = { projectId: selectedProjectId };
    this.selectedDeptProjectId = selectedProjectId;
    this.departmentWiseContributionGraph(request);
  }

  // Department wise Contribution
  departmentWiseContributionGraph(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.departmentContributionData = [];
        return;
      }
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/deptwisecontribution/${clientID}`;

      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }

      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }
      this.http.getData(apiUrl)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const apiData = res?.data?.data || [];
            if (!Array.isArray(apiData) || apiData.length === 0) {
              this.departmentContributionData = [];
              return;
            }

            // Extract chart data
            const labels = apiData.map((item: any) => item.name);
            const dataValues = apiData.map((item: any) => item.percentage);



            this.departmentContributionData = {
              labels: labels,
              datasets: [
                {
                  data: dataValues,
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
          },
          error: (err) => {
            console.error('Error fetching Role-wise hours:', err);
            this.departmentContributionData = [];
          }
        });
    });
  }

  // Project Type (Pie)
  projectTypeChart(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectTypeData = [];
        return;
      }

      // Base URL
      let apiUrl = `ProjectManagementGraph/client/project-type-summary/${clientID}`;

      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }
      this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: any) => {
            console.log('API Response:', res);
            const data = res?.data || [];
            if (!data.length) {
              this.projectTypeData = { labels: [], datasets: [] };
              return;
            }
            // Extract project type names and their counts
            const labels = data.map((item: any) => item.projectType);
            const counts = data.map((item: any) => item.projectTypeCount);

            // Assign chart data dynamically
            this.projectTypeData = {
              labels: labels,
              datasets: [
                {
                  data: counts,
                  backgroundColor: [
                    '#FFD54F', '#E91E63', '#4DB6AC', '#64B5F6', '#81C784', '#3F51B5',
                    '#FF8A65', '#BA68C8', '#7986CB', '#AED581', '#F06292'
                  ],
                  hoverBackgroundColor: [
                    '#FFE082', '#F06292', '#80CBC4', '#90CAF9', '#A5D6A7', '#5C6BC0'
                  ]
                }
              ]
            };

            // Chart options
            this.projectTypeOptions = {
              plugins: {
                legend: {
                  position: 'right',
                  labels: { usePointStyle: true }
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const label = context.label || '';
                      const value = context.parsed;
                      return `${label}: ${value}`;
                    }
                  }
                }
              }
            };
          },
          error: (err) => {
            console.error('Error fetching project type summary chart:', err);
          }
        });
    });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.estimatedVsActualData = [];
        return;
      }
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/allocated-vs-actual/${clientID}?groupBy=project`;
      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `&${queryParams.join('&')}`;
      }
      this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.data?.length) {
            const chartData = res.data.data;
            const labels = chartData.map((item: any) => item.name);
            const estimatedHours = chartData.map((item: any) => item.allocateHours);
            const actualHours = chartData.map((item: any) => item.actualHours);
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
  billableChart(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.billableData = [];
        return;
      }
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/billable-non-billable/${clientID}?groupBy=project`;
      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      // Append query parameters if any exist
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }

      this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const chartData = res?.data?.data || [];
          if (!chartData.length) {
            this.billableData = { labels: [], datasets: [] };
            return;
          }
          // Utility to handle both "HH:mm" and decimal string formats
          const convertToHours = (timeStr: string | number): number => {
            if (!timeStr) return 0;
            const str = timeStr.toString();
            if (str.includes(':')) {
              const [hours, minutes] = str.split(':').map(Number);
              return hours + minutes / 60;
            }
            return parseFloat(str); // directly convert decimal string to number
          };

          // Example usage
          // const chartData = response.data.data;
          const labels = chartData.map((item: any) => item.name);
          const billable = chartData.map((item: any) => convertToHours(item.billableHours));
          const nonBillable = chartData.map((item: any) => convertToHours(item.nonBillableHours));

          // Assign dynamic chart data
          this.billableData = {
            labels: labels,
            datasets: [
              {
                label: 'Billable Hours',
                backgroundColor: '#283593',
                data: billable,
              },
              {
                label: 'Non-Billable Hours',
                backgroundColor: '#9FA8DA',
                data: nonBillable,
              },
            ],
          };

          // Chart options
          this.billableOptions = {
            responsive: true,
            barThickness: 30,
            scales: {
              x: { stacked: true, title: { display: true, text: 'Projects' } },
              y: {
                stacked: true,
                beginAtZero: true,
                title: { display: true, text: 'Total Hours' },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const value = context.parsed.y;
                    return `${context.dataset.label}: ${value.toFixed(2)} hrs`;
                  },
                },
              },
            },
            maintainAspectRatio: false,
          };
        },
        error: (err) => {
          console.error('Error fetching billable/non-billable chart data:', err);
        }
      });
    });
  }

  // Project Burndown Chart (Line)
  burnDownChart(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.burndownData = [];
        return;
      }

      let apiUrl = `ProjectManagementGraph/client/burndownchart/${clientID}`;
      const queryParams: string[] = [];
      if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
        queryParams.push(`startDate=${request.dateRange.startDate}`);
        queryParams.push(`endDate=${request.dateRange.endDate}`);
      }
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }

      this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const data = res?.data;
          const projectCharts = data?.projectBurndownCharts || [];
          if (!projectCharts.length) {
            this.burndownData = { labels: [], datasets: [] };
            return;
          }

          const project = projectCharts[0];
          // store all project names/options
          this.projectNames = projectCharts.map((p: any) => p.projectName || `Project ${p.projectId}`);
          // --- Group by Week ---
          const idealLine = project.idealLine.map((item: any) => ({
            date: new Date(item.date),
            remainingHours: item.remainingHours
          }));
          const actualLine = project.actualLine.map((item: any) => ({
            date: new Date(item.date),
            remainingHours: item.remainingHours
          }));

          // Group by week (starting Monday)
          const groupByWeek = (line: any[]) => {
            const weeks: Record<string, number> = {};
            line.forEach((item) => {
              const d = new Date(item.date);
              const monday = new Date(d);
              monday.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday of that week
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const label = `${monday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}-${sunday.toLocaleDateString('en-GB',
                { day: '2-digit', month: 'short' })}`;
              weeks[label] = item.remainingHours;
            });
            return weeks;
          };

          const idealByWeek = groupByWeek(idealLine);
          const actualByWeek = groupByWeek(actualLine);

          const labels = Object.keys(idealByWeek);
          const idealValues = Object.values(idealByWeek);
          const actualValues = Object.values(actualByWeek);

          this.burndownData = {
            labels,
            datasets: [
              {
                label: `${this.projectNames} - Ideal Line`,
                data: idealValues,
                borderColor: '#42A5F5',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.3
              },
              {
                label: `${this.projectNames} - Actual Line`,
                data: actualValues,
                borderColor: '#E91E63',
                borderWidth: 2,
                fill: false,
                tension: 0.3
              }
            ]
          };

          this.burndownOptions = {
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const value = context.parsed.y;
                    return `${context.dataset.label}: ${value.toFixed(2)} hrs`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Weeks' },
                grid: { display: false },
                ticks: { autoSkip: true, maxRotation: 45, minRotation: 45 }
              },
              y: {
                title: { display: true, text: 'Remaining Hours' },
                beginAtZero: true,
                grid: { color: '#f0f0f0' }
              }
            },
            maintainAspectRatio: false
          };
        },
        error: (err) => {
          console.error('Error fetching burndown chart data:', err);
        }
      });
    });
  }
}