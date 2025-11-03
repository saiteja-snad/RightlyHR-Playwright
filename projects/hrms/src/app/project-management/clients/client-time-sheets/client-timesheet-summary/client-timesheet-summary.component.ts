import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../../Interfaces/projects.model';
@Component({
  selector: 'app-client-timesheet-summary',
  imports: [CommonModule, SelectModule,ReactiveFormsModule,TranslateModule, ChartModule],
  templateUrl: './client-timesheet-summary.component.html',
  styleUrl: './client-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimesheetSummaryComponent {
  // projectsDataDropdown = [
  //   { projectId: 1, projectName: 'Website Redesign' },
  //   { projectId: 2, projectName: 'Mobile App Development' },
  //   { projectId: 3, projectName: 'CRM Integration' },
  //   { projectId: 4, projectName: 'E-commerce Platform' },
  //   { projectId: 5, projectName: 'Data Migration' }
  // ];
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
  projectSummeryData:any;
  datepickerForm!: FormGroup;
  projectsDataDrown: Project[] = [];
  clientsId!: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService,private route: ActivatedRoute,private fb: FormBuilder) { }

  ngOnInit() {
     this.createClientForm();
   this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [key: string]: any }) => {
    const clientID = params['id'];
    this.getprojectbyid(clientID);
   });
    this.http.requestclienttimesheetdata$
    .pipe(takeUntil(this.destroy$))
    .subscribe((request) => {
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
      }
    });
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
  // clear button show/hilde
  isFilterApplied(): boolean {
    const { projectId, status } = this.datepickerForm.value;

    return (
      (projectId !== null && projectId !== undefined && projectId !== '') ||
      (status !== null && status !== undefined && status !== '')
    );
  }
  // clear the field
  resetForm() {
    this.datepickerForm.reset();
    this.projectSummery();
  }
  // apply button disable condition
  isFormCompletelyValid(): boolean {
    const formValue = this.datepickerForm.getRawValue(); // includes disabled controls
    return (
      (formValue.projectId !== null && formValue.projectId !== undefined && formValue.projectId !== '') ||
      (formValue.status !== null && formValue.status !== undefined && formValue.status !== '')
    );
  }
  // onsubmit data 
  onSubmit() {
    this.projectSummerydata();
  }

  projectSummerydata() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [key: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectSummeryData = [];
        return;
      }

      // Base URL
      let apiUrl = `ProjectManagementGraph/client/project-summary/${clientID}`;

      // Get form values
      const formValue = this.datepickerForm.getRawValue();

      // Build query params dynamically if values exist
      const queryParams: any = {};

      if (formValue.projectId) {
        queryParams.projectId = formValue.projectId;
      }

      if (formValue.status) {
        queryParams.status = formValue.status;
      }

      // If query params exist, append them to API URL
      const queryString = Object.keys(queryParams).length
        ? '?' + new URLSearchParams(queryParams).toString()
        : '';

      // Final URL
      apiUrl += queryString;

      console.log('Final API URL:', apiUrl);

      this.http
        .getData(apiUrl)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('API Response:', res);
            this.projectSummeryData = Array.isArray(res?.data) ? res.data : [];
          },
          error: (err) => {
            console.error('Error fetching project summary:', err);
          },
        });
    });
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

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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
  billableChart(request?: any) {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.billableData = [];
        return;
      }

      // Base URL
      let apiUrl = `ProjectManagementGraph/client/billable-non-billable/${clientID}`;

      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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
          const chartData = res?.data?.data || [];
          if (!chartData.length) {
            this.billableData = { labels: [], datasets: [] };
            return;
          }

          // Utility to convert "HH:mm" to decimal hours
          const convertToHours = (timeStr: string): number => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours + minutes / 60;
          };

          // Extract dynamic labels and data
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
      // Base URL
      let apiUrl = `ProjectManagementGraph/client/burndownchart/${clientID}`;

      // Prepare query parameters if BehaviorSubject data exists
      const queryParams: string[] = [];

      if (request?.projectId) {
        queryParams.push(`projectId=${request.projectId}`);
      }
      if (request?.resourceId) {
        queryParams.push(`resourceId=${request.resourceId}`);
      }
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
          const data = res?.data;
          const projectCharts = data?.projectBurndownCharts || [];
          if (!projectCharts.length) {
            this.burndownData = { labels: [], datasets: [] };
            return;
          }

          // Get the first project’s burndown data
          const project = projectCharts[0];
          const projectName = project.projectName || 'Project';

          // Extract labels and datasets
          const labels = project.idealLine.map((item: any) =>
            new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          );

          const idealValues = project.idealLine.map((item: any) => item.remainingHours);
          const actualValues = project.actualLine.map((item: any) => item.remainingHours);

          // Chart data
          this.burndownData = {
            labels: labels,
            datasets: [
              {
                label: `${projectName} - Ideal Line`,
                data: idealValues,
                borderColor: '#42A5F5',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.3
              },
              {
                label: `${projectName} - Actual Line`,
                data: actualValues,
                borderColor: '#E91E63',
                borderWidth: 2,
                fill: false,
                tension: 0.3
              }
            ]
          };

          // Chart options
          this.burndownOptions = {
            plugins: {
              legend: {
                display: false,
              },
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
                title: { display: true, text: 'Date' },
                grid: { display: false }
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