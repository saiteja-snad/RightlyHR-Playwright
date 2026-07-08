import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Project } from '../../../../Interfaces/projects.model';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { SkeletonModule } from 'primeng/skeleton';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import dayjs from 'dayjs'
import { ModuleInfoIconComponent } from '../../../../icons/module-info-icon/module-info-icon.component';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-client-timesheet-summary',
  imports: [
    CommonModule,
    SelectModule,
    NgbPopover,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    ChartModule,
    NoDataFoundComponent,
    SkeletonModule,
    ModuleInfoIconComponent,
    TableModule
  ],
  templateUrl: './client-timesheet-summary.component.html',
  styleUrl: './client-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClientTimesheetSummaryComponent implements OnInit, OnDestroy {
  statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'On Track', value: 'On Track' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Inactive/Closed', value: 'Inactive/Closed' },
  ];
  // Project wise Resource Count variables
  projectResourcesLableData: any;
  projectResourceData: any;
  projectResourceOptions: any;
  // Department wise Contribution variables
  departmentContributionData: any;
  departmentContributionOptions: any;
  // Project Type Data variables
  projectTypeLableData: any;
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
  storeclientId: any;
  selectedDeptProjectId: any = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  estimatedlabels = [
    { label: 'Allocated Hours', color: '#0F358A' },
    { label: 'Actual Hours', color: '#A2B5E2' },
    { label: 'Over Due', color: '#FF4848' },
  ];
  billablelabels = [
    { label: 'Billable', color: '#0F358A' },
    { label: 'Non-Billable', color: '#A2B5E2' },
  ];
  // project name
  projectNames: any;
  // Graph Info
  projectsummaryinfo =
    'Displays an overview of all active, completed, and upcoming projects, helping track overall project distribution and current workload status';
  ProjectwiseResourceCountInfo =
    'Represents the total number of employees assigned to each project, providing insight into resource allocation and team size per project';
  DepartmentwiseContributionInfo =
    'Shows how different departments are contributing across projects, giving a visual understanding of departmental workload and involvement.';
  ProjectTypeInfo =
    'Displays the distribution of projects based on their type (e.g., internal, client-based, or support), enabling quick analysis of project categories handled by the organization.';
  EstimatedActualHoursInfo =
    'Compares the estimated hours allocated for each project against the actual hours logged, helping to identify project efficiency and time variance.';
  BillablevsNonBillableHoursInfo =
    'Illustrates the proportion of hours that are billable versus non-billable across projects, offering a quick insight into profitability and resource utilization.';
  ProjectBurndownChartInfo =
    'Visualizes project progress over time by comparing planned work versus actual completion, helping track deadlines and performance trends.';
  // data loader
  projectsummaryLoader = false;
  ProjectwiseResourceCountLoader = false;
  DepartmentwiseContributionLoader = false;
  ProjectTypeLoader = false;
  EstimatedActualHoursLoader = false;
  BillablevsNonBillableHoursLoader = false;
  ProjectBurndownChartLoader = false;

  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];
  selectedProjectIds : number[] = [];

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

ngOnInit() {
  this.createClientForm();

  this.route.queryParams.subscribe((params) => {
    const clientID = params['id'];
    if (clientID) {
      this.storeclientId = clientID;
      this.getClientById(clientID);
    }
  });

  combineLatest([
    this.http.requestclienttimesheetdata$,
    this.http.selectedDepartmentIds$,
    this.http.clientTimesheetRoleFilter$,
    this.http.clientTimesheetPhaseFilter$,
    this.http.clientTimesheetProjectFilter$
  ]).pipe(
    debounceTime(150),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    takeUntil(this.destroy$)
  ).subscribe(([dateRequest, deptIds, roleIds, phaseIds, projectIds]) => {

    const departments = Array.isArray(deptIds) ? deptIds : [];
    const roles = Array.isArray(roleIds) ? roleIds : [];
    const phases = Array.isArray(phaseIds) ? phaseIds : [];
    const projects = Array.isArray(projectIds) ? projectIds : [];

        console.log("Date Request:", dateRequest);
    console.log("Selected Departments:", departments);
    console.log("Selected Roles:", roles);
    console.log("Selected Phases:", phases);
    console.log("Selected Projects:", projects);


    const request: any = {
      ...(dateRequest || {}),

      ...(departments.length > 0 ? { departmentIds: departments } : {}),
      ...(roles.length > 0 ? { roleIds: roles } : {}),
      ...(phases.length > 0 ? { phaseIds: phases } : {}),
      ...(projects.length > 0 ? {projectIds : projects } : {}),
    };

    // Default date range: current month (if none provided)
    if (!request.dateRange?.startDate || !request.dateRange?.endDate) {
      const start = dayjs().startOf('month').format('YYYY-MM-DD');
      const end = dayjs().endOf('month').format('YYYY-MM-DD');
      request.dateRange = { startDate: start, endDate: end };
    }

    this.refreshAllCharts(request);
  });

  // Initial load with current month
  const defaultRange = {
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD')
    }
  };
  this.refreshAllCharts(defaultRange);
}

  private refreshAllCharts(request: any = {}) {
    this.projectSummery(request);
    this.projectWiseResourceCountGraph(request);
    this.departmentWiseContributionGraph(request);
    this.projectTypeChart(request);
    this.estimatedActualChart(request);
    this.billableChart(request);
    this.burnDownChart(request);
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
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FFC300',
      '#9B59B6',
      '#1ABC9C',
      '#E67E22',
      '#34495E',
    ];
    return colors[index % colors.length];
  }

  // get all project based on client for filter use
  getClientById(clientID: any): void {
    this.http
      .getData(`Project?clientId=${clientID}&status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsDataDrown = Array.isArray(res?.data) ? res.data : [];
          // store the clientId from the first project if exists
          const statuses = this.projectsDataDrown.map((p) => p.status);
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
        },
      });
  }

  // initialization of form
  createClientForm() {
    this.datepickerForm = this.fb.group({
      projectId: [''],
      status: [''],
    });
  }

  filters: any = {
    projectId: null,
    status: null,
    dateRange: null, // optional if you have date filters
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
    this.projectsummaryLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/client/project-summary/${this.storeclientId}`;
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
    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }

     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }
    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }

    this.http
      .getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsummaryLoader = false;
          this.projectSummeryData = Array.isArray(res?.data) ? res.data : [];
        },
        error: (err) => {
          this.projectsummaryLoader = false;
          this.projectSummeryData = [];
          console.error(
            'Error fetching project-wise resource count chart:',
            err
          );
        },
      });
  }

  // Project wise Resource Count
  projectWiseResourceCountGraph(request?: any) {
    this.ProjectwiseResourceCountLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/client/project-wise-resource/${this.storeclientId}`;
    // Prepare query parameters if BehaviorSubject data exists
    const queryParams: string[] = [];
    if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
      queryParams.push(`startDate=${request.dateRange.startDate}`);
      queryParams.push(`endDate=${request.dateRange.endDate}`);
    }
    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }
     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }
    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }
    this.http
      .getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.ProjectwiseResourceCountLoader = false;
          const data = res?.data || [];
          if (!data.length) {
            this.projectResourceData = {
              labels: [],
              datasets: [],
            };
            return;
          }
          // Extract data from API response
          const labels = data.map((item: any) =>
            item.projectColor?.graphData?.code
              ? item.projectColor?.graphData?.code
              : item.projectName
          );
          const resourceCounts = data.map((item: any) => item.resourceCount);
          // Assign chart data
          // this.projectResourceData = {
          //   labels: labels,
          //   datasets: [
          //     {
          //       label: 'Resource Count',
          //       data: resourceCounts,
          //       backgroundColor: [
          //         '#FDCC11',
          //         '#FF207F',
          //         '#187DF5',
          //         '#00A912',
          //         '#4533E3',
          //         '#FFA500',
          //         '#008080',
          //         '#9932CC',
          //         '#FF6347',
          //         '#4682B4',
          //       ],
          //       barThickness: 10,
          //     },
          //   ],
          // };

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
            indexAxis: 'y',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (tooltipItems: any) => {
                    const index = tooltipItems[0].dataIndex;
                    return data[index].projectName || 'No Name';
                  },
                  label: (tooltipItem: any) => {
                    const datasetLabel = tooltipItem.dataset.label || '';
                    const value = tooltipItem.raw;
                    return `${datasetLabel}: ${value}`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Resource Count',
                  color: '#505050',
                  font: { size: 10, weight: 400 },
                },
                grid: { display: false },
                ticks: {
                  color: '#505050',
                  font: { size: 10, weight: '400' },
                  stepSize: 1,
                  callback: (value: any) =>
                    Number.isInteger(Number(value)) ? value : '',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Projects',
                  color: '#505050',
                  font: { size: 10, weight: 400 },
                },
                grid: { display: false },
                ticks: {
                  color: '#505050',
                  font: { size: 10, weight: '400' },
                  callback: (value: any, index: number) => {
                    const label = data[index]?.projectColor?.graphData?.code || data[index]?.projectName || '-';
                    return this.truncateLabel(label, 15);
                  }
                },
              },
            },
          };
        },
        error: (err) => {
          this.ProjectwiseResourceCountLoader = false;
          this.projectResourceData = {
            labels: [],
            datasets: [],
          };
          console.error(
            'Error fetching project-wise resource count chart:',
            err
          );
        },
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
    this.DepartmentwiseContributionLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/client/deptwisecontribution/${this.storeclientId}`;
    // Prepare query parameters if BehaviorSubject data exists
    const queryParams: string[] = [];
    if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
      queryParams.push(`startDate=${request.dateRange.startDate}`);
      queryParams.push(`endDate=${request.dateRange.endDate}`);
    }
    if (request?.projectId) {
      queryParams.push(`projectId=${request.projectId}`);
    }

    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }

     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }
    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }

    this.http
      .getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.DepartmentwiseContributionLoader = false;
          const apiData = res?.data?.data || [];
          this.projectResourcesLableData = res?.data?.data || [];
          if (!Array.isArray(apiData) || apiData.length === 0) {
            this.departmentContributionData = [];
            return;
          }
          // Extract chart data
          const labels = apiData.map((item: any) => item.name);
          const dataValues = apiData.map((item: any) => item.percentage);
          const backgroundColors = apiData.map(
            (item: any) => item.meta?.graphData?.color || '#CCCCCC'
          ); // fallback gray
          this.departmentContributionData = {
            labels: labels,
            datasets: [
              {
                data: dataValues,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors,
              },
            ],
          };
          this.departmentContributionOptions = {
            cutout: '60%',
            plugins: {
              legend: { display: false },
            },
          };
        },
        error: (err) => {
          this.DepartmentwiseContributionLoader = false;
          console.error('Error fetching Role-wise hours:', err);
          this.departmentContributionData = [];
        },
      });
  }

  // Project Type (Pie)
  projectTypeChart(request?: any) {
    this.ProjectTypeLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/client/project-type-summary/${this.storeclientId}`;
    // Prepare query parameters if BehaviorSubject data exists
    const queryParams: string[] = [];
    if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
      queryParams.push(`startDate=${request.dateRange.startDate}`);
      queryParams.push(`endDate=${request.dateRange.endDate}`);
    }

    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }

     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }
    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }

    this.http
      .getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.ProjectTypeLoader = false;
          const data = res?.data || [];
          this.projectTypeLableData = res?.data || [];
          if (!data.length) {
            this.projectTypeData = { labels: [], datasets: [] };
            return;
          }
          // Extract project type names and their counts
          const labels = data.map((item: any) => item.projectType);
          const counts = data.map((item: any) => item.projectTypeCount);
          const backgroundColors = data.map(
            (item: any) => item.projectTypeColor?.graphData?.color || '#CCCCCC'
          ); // fallback gray
          // Assign chart data dynamically
          this.projectTypeData = {
            labels: labels,
            datasets: [
              {
                data: counts,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors,
              },
            ],
          };
          // Chart options
          this.projectTypeOptions = {
            plugins: {
              legend: {
                display: false,
              },
            },
          };
        },
        error: (err) => {
          this.ProjectTypeLoader = false;
          this.projectTypeData = { labels: [], datasets: [] };
          console.error('Error fetching project type summary chart:', err);
        },
      });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart(request?: any) {
    this.EstimatedActualHoursLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/client/allocated-vs-actual/${this.storeclientId}?groupBy=project`;
    // Prepare query parameters if BehaviorSubject data exists
    const queryParams: string[] = [];
    if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
      queryParams.push(`startDate=${request.dateRange.startDate}`);
      queryParams.push(`endDate=${request.dateRange.endDate}`);
    }

    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }

     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }
    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `&${queryParams.join('&')}`;
    }
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.EstimatedActualHoursLoader = false;
        if (res?.success && res?.data?.data?.length) {
          const chartData = res.data.data;
          const labels = chartData.map((item: any) => item.meta.graphData.code ? item.meta.graphData.code : item.name);
          const estimatedHours = chartData.map((item: any) => item.allocateHours);
          const actualHours = chartData.map((item: any) => (item.actualHours - item.overDueHours));
          const overdueHours = chartData.map((item: any) => item.overDue ? item.overDueHours : 0);
          const actualDisplay = chartData.map(
            (item: any) => item?.actualHoursHHMM   // already HH:MM from backend
          );
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
          // options
          this.estimatedVsActualOptions = {
            responsive: true,
            barThickness: 30,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (tooltipItems: any) => {
                    const index = tooltipItems[0].dataIndex;
                    return chartData[index].name;
                  },
                  label: (context: any) => {
                    const idx = context.dataIndex;
                    if (context.dataset.label === 'Estimated Hours') {
                      return `Estimated: ${estimatedHours[idx]} hrs`;
                    }
                    if (context.dataset.label === 'Actual Hours') {
                      return `Actual: ${actualDisplay[idx]} hrs`;
                    }
                    if (context.dataset.label === 'Over Due') {
                      return `Over Due: ${overdueHours[idx]} hrs`;
                    }
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                stacked: false,
                grid: { display: false },
                ticks: {
                  color: '#141414', font: { size: 11 },
                  callback: (value: any, index: number) => {
                    return this.truncateLabel(labels[index], 12);
                  }
                },
              },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Hours',
                    color: '#505050',
                    font: { size: 9 },
                  },
                  ticks: { color: '#72777B', font: { size: 11 } },
                },
              },
            };
          } else {
            this.estimatedVsActualData = [];
          }
        },
        error: (err) => {
          this.EstimatedActualHoursLoader = false;
          this.estimatedVsActualData = [];
          console.error('Error fetching estimated vs actual chart:', err);
        },
      });
  }

  truncateLabel(label: string, maxLength: number = 12): string {
    return label?.length > maxLength ? label?.substring(0, maxLength) + '...' : label;
  }

  // Billable vs Non-Billable Hours (Stacked Bar)
  // billableChart(request?: any) {
  //   this.BillablevsNonBillableHoursLoader = true;
  //   // Base URL
  //   let apiUrl = `ProjectManagementGraph/client/billable-non-billable/${this.storeclientId}?groupBy=project`;
  //   // Prepare query parameters if BehaviorSubject data exists
  //   const queryParams: string[] = [];
  //   if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
  //     queryParams.push(`startDate=${request.dateRange.startDate}`);
  //     queryParams.push(`endDate=${request.dateRange.endDate}`);
  //   }

  //   if (request?.departmentIds && request.departmentIds.length > 0) {
  //     queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
  //   }

  //   if (request?.roleIds && request.roleIds.length > 0) {
  //     queryParams.push(`roleIds=${request.roleIds.join(',')}`);
  //   }

  //   if (request?.phaseIds && request.phaseIds.length > 0) {
  //     queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
  //   }
  //   // Append query parameters if any exist
  //   if (queryParams.length > 0) {
  //     apiUrl += `?${queryParams.join('&')}`;
  //   }

  //   this.http
  //     .getData(apiUrl)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res: any) => {
  //         this.BillablevsNonBillableHoursLoader = false;
  //         const chartData = res?.data?.data || [];
  //         if (!chartData.length) {
  //           this.billableData = { labels: [], datasets: [] };
  //           return;
  //         }
  //         // Utility to handle both "HH:mm" and decimal string formats
  //         const convertToHours = (timeStr: string | number): number => {
  //           if (!timeStr) return 0;
  //           const str = timeStr.toString();
  //           if (str.includes(':')) {
  //             const [hours, minutes] = str.split(':').map(Number);
  //             return hours + minutes / 60;
  //           }
  //           return parseFloat(str); // directly convert decimal string to number
  //         };
  //         // const chartData = response.data.data;
  //         const labels = chartData.map((item: any) =>
  //           item.projectColor?.graphData.code
  //             ? item.projectColor?.graphData.code
  //             : item.name
  //         );
  //         const billable = chartData.map((item: any) =>
  //           convertToHours(item.billableHours)
  //         );
  //         const nonBillable = chartData.map((item: any) =>
  //           convertToHours(item.nonBillableHours)
  //         );
  //         // Assign dynamic chart data
  //         this.billableData = {
  //           labels: labels,
  //           datasets: [
  //             {
  //               label: 'Billable Hours',
  //               backgroundColor: '#283593',
  //               data: billable,
  //             },
  //             {
  //               label: 'Non-Billable Hours',
  //               backgroundColor: '#9FA8DA',
  //               data: nonBillable,
  //             },
  //           ],
  //         };
  //         // Chart options
  //         this.billableOptions = {
  //           responsive: true,
  //           barThickness: 30,
  //           scales: {
  //             x: {
  //               stacked: true,
  //               ticks: { color: '#141414', font: { size: 11 } },
  //             },
  //             y: {
  //               stacked: true,
  //               beginAtZero: true,
  //               title: {
  //                 display: true,
  //                 text: 'Hours',
  //                 color: '#505050',
  //                 font: { size: 9 },
  //               },
  //               ticks: { color: '#72777B', font: { size: 11 } },
  //             },
  //           },
  //           plugins: {
  //             legend: { display: false },
  //             tooltip: {
  //               callbacks: {
  //                 title: (tooltipItems: any) => {
  //                   const index = tooltipItems[0].dataIndex;
  //                   return chartData[index].name;
  //                 },
  //                 label: (tooltipItem: any) => {
  //                   const datasetLabel = tooltipItem.dataset.label || '';
  //                   const value = tooltipItem.raw;
  //                   return `${datasetLabel}: ${value}`;
  //                 },
  //               },
  //             },
  //           },
  //           maintainAspectRatio: false,
  //         };
  //       },
  //       error: (err) => {
  //         this.BillablevsNonBillableHoursLoader = false;
  //         this.billableData = { labels: [], datasets: [] };
  //         console.error(
  //           'Error fetching billable/non-billable chart data:',
  //           err
  //         );
  //       },
  //     });
  // }

  billableChart(request?: any) {
  this.BillablevsNonBillableHoursLoader = true;

  // Base URL
  let apiUrl = `ProjectManagementGraph/client/billable-non-billable/${this.storeclientId}?groupBy=project`;

  // Prepare query parameters if BehaviorSubject data exists
  const queryParams: string[] = [];

  if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
    queryParams.push(`startDate=${request.dateRange.startDate}`);
    queryParams.push(`endDate=${request.dateRange.endDate}`);
  }

  if (request?.departmentIds?.length) {
    queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
  }

  if (request?.roleIds?.length) {
    queryParams.push(`roleIds=${request.roleIds.join(',')}`);
  }

  if (request?.phaseIds?.length) {
    queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
  }

   if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }

  // Append query parameters
  if (queryParams.length > 0) {
    apiUrl += `&${queryParams.join('&')}`;
  }

  this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
    next: (res: any) => {
      this.BillablevsNonBillableHoursLoader = false;

      const chartData = res?.data?.data || [];
      if (!chartData.length) {
        this.billableData = { labels: [], datasets: [] };
        return;
      }

      // HH:MM → Decimal Conversion
      const convertHHMMToNumber = (hhmm: string): number => {
        if (!hhmm) return 0;
        const [h, m] = hhmm.split(':').map(Number);
        return Number((h + m / 60).toFixed(2));
      };

      // Labels
      const labels = chartData.map((item: any) =>
        item.projectColor?.graphData.code
          ? item.projectColor.graphData.code
          : item.name
      );

      // Numeric (decimal) values for Chart Bars
      const billable = chartData.map((i: any) =>
        convertHHMMToNumber(i?.billableHoursHHMM)
      );

      const nonBillable = chartData.map((i: any) =>
        convertHHMMToNumber(i?.nonBillableHoursHHMM)
      );

      // HH:MM Display strings for Tooltip
      const billableDisplay = chartData.map((i: any) => i?.billableHoursHHMM);
      const nonBillableDisplay = chartData.map((i: any) => i?.nonBillableHoursHHMM);

      // Assign chart data
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
          }
        ]
      };

      // Chart options
      this.billableOptions = {
        responsive: true,
        barThickness: 30,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: '#141414',
              font: { size: 11 },
              callback: (value: any, index: number) => {
                return this.truncateLabel(labels[index], 12);
              }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Hours',
              color: '#505050',
              font: { size: 9 }
            },
            ticks: {
              color: '#72777B',
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: any) => {
                const idx = items[0].dataIndex;
                return chartData[idx].name;
              },
              label: (tooltipItem: any) => {
                const idx = tooltipItem.dataIndex;

                if (tooltipItem.dataset.label === 'Billable Hours') {
                  return `Billable: ${billableDisplay[idx]} hrs`;
                }

                if (tooltipItem.dataset.label === 'Non-Billable Hours') {
                  return `Non-Billable: ${nonBillableDisplay[idx]} hrs`;
                }

                return `${tooltipItem.dataset.label}: ${tooltipItem.raw} hrs`;
              }
            }
          }
        }
      };
    },

    error: (err) => {
      this.BillablevsNonBillableHoursLoader = false;
      this.billableData = { labels: [], datasets: [] };
      console.error('Error fetching billable/non-billable chart data:', err);
    }
  });
}


  // Project Burndown Chart (Line)
  burnDownChart(request?: any) {
    this.ProjectBurndownChartLoader = true;
    let apiUrl = `ProjectManagementGraph/client/burndownchart/${this.storeclientId}`;
    const queryParams: string[] = [];
    if (request?.dateRange?.startDate && request?.dateRange?.endDate) {
      queryParams.push(`startDate=${request.dateRange.startDate}`);
      queryParams.push(`endDate=${request.dateRange.endDate}`);
    }

    if (request?.departmentIds && request.departmentIds.length > 0) {
      queryParams.push(`departmentIds=${request.departmentIds.join(',')}`);
    }

    if (request?.roleIds && request.roleIds.length > 0) {
      queryParams.push(`roleIds=${request.roleIds.join(',')}`);
    }

    if (request?.phaseIds && request.phaseIds.length > 0) {
      queryParams.push(`phaseIds=${request.phaseIds.join(',')}`);
    }

     if (request?.projectIds && request.projectIds.length > 0) {
      queryParams.push(`projectId=${request.projectIds.join(',')}`);
    }

    // Append query parameters if any exist
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }

    this.http
      .getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.ProjectBurndownChartLoader = false;
          const data = res?.data;
          const projectCharts = data?.projectBurndownCharts || [];
          if (!projectCharts.length) {
            this.burndownData = { labels: [], datasets: [] };
            return;
          }
          // --- Store all project names ---
          this.projectNames = projectCharts.map(
            (p: any) => p.projectName || `Project ${p.projectId}`
          );
          // --- Function to group by week ---
          const groupByWeek = (line: any[]) => {
            const weeks: Record<string, number> = {};
            line.forEach((item) => {
              const d = new Date(item.date);
              const monday = new Date(d);
              monday.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday of that week
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const label = `${monday.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}-${sunday.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}`;
              weeks[label] = item.remainingHours;
            });
            return weeks;
          };
          // --- Collect all labels and datasets dynamically ---
          const allLabelsSet = new Set<string>();
          const datasets: any[] = [];
          // Predefined color palette (extendable)
          const colors = [
            '#42A5F5',
            '#E91E63',
            '#9C27B0',
            '#FF9800',
            '#4CAF50',
            '#795548',
            '#009688',
            '#F44336',
            '#3F51B5',
            '#8BC34A',
          ];
          projectCharts.forEach((project: any, index: number) => {
            const actualLine = project.actualLine.map((item: any) => ({
              date: new Date(item.date),
              remainingHours: item.remainingHours,
            }));
            const actualByWeek = groupByWeek(actualLine);
            Object.keys(actualByWeek).forEach((label) =>
              allLabelsSet.add(label)
            );
            datasets.push({
              label: `${project.projectName || 'Project ' + project.projectId}`,
              data: Object.values(actualByWeek),
              borderColor: colors[index % colors.length],
              borderWidth: 2,
              fill: false,
              tension: 0.3,
            });
          });
          const labels = Array.from(allLabelsSet);
          this.burndownData = {
            labels,
            datasets,
          };
          this.burndownOptions = {
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const value = context.parsed.y;
                    return `${context.dataset.label}: ${value.toFixed(2)} hrs`;
                  },
                },
              },
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
                ticks: { color: '#141414', font: { size: 11 } },
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
                ticks: { color: '#72777B', font: { size: 11 } },
              },
            },
            maintainAspectRatio: false,
          };
        },
        error: (err) => {
          this.ProjectBurndownChartLoader = false;
          this.burndownData = { labels: [], datasets: [] };
          console.error('Error fetching burndown chart data:', err);
        },
      });
  }

  //graphs no data found conditions
  get hasProjectResourceData(): boolean {
    const datasets = this.projectResourceData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  get hasDepartmentWiseData(): boolean {
    const datasets = this.departmentContributionData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  get hasProjectTypeData(): boolean {
    const datasets = this.projectTypeData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  get hasestimatedActualHoursData(): boolean {
    const datasets = this.estimatedVsActualData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  get hasbillableData(): boolean {
    const datasets = this.billableData?.datasets;
    if (!datasets?.length) return false;
    return datasets.some(
      (ds: { data: number[] }) =>
        Array.isArray(ds.data) && ds.data.some((value) => Number(value) > 0)
    );
  }

  get hasburndownData(): boolean {
    const datasets = this.burndownData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
