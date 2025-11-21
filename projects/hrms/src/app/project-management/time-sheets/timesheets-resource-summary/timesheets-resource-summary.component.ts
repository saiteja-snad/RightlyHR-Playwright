import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TimesheetsResourceTabsComponent } from '../timesheets-resource-tabs/timesheets-resource-tabs.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbPopover, NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Subscription, Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { TimeTrackingData, DailyData } from '../../../Interfaces/team-summary-time-sheet.model';
import { MonthlySummaryItem, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
import { TimesheetEntry } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TimesheetsTabsComponent } from '../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component';
import { IResourceDetail } from '../../../timesheetmodel';
import dayjs from 'dayjs';
import moment from 'moment';
import { EncriptdecriptService } from '../../../services/encriptdecript.service';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-timesheets-resource-summary',
  imports: [TimesheetsTabsComponent, ReactiveFormsModule, NgbPopover, DatePicker, ChartModule,
    TranslateModule, CommonModule, Select, NgbPopoverModule, NoDataFoundComponent, ProgressBarModule,
    ModuleInfoIconComponent, ModuleInformationComponent, Skeleton, TimesheetsResourceTabsComponent,MultiSelectModule
  ],
  templateUrl: './timesheets-resource-summary.component.html',
  styleUrl: './timesheets-resource-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class TimesheetsResourceSummaryComponent implements OnInit {
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  empdata = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
  datepickerForm!: FormGroup;
  totalhrs: any;
  attendanceSummaryData: DailyData[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedEntries: TimesheetEntry[] = [];
  timesheetSummaryChartData: any;
  timesheetutilizeSummaryChartData: any;
  timesheetSummaryOptions: any;
  timesheetUtilizeSummaryOptions: any;
  statusCounts$ = new BehaviorSubject<MonthlySummaryItem[]>([]);
  utilizationcount$ = new BehaviorSubject<any>(null);
  totalEntries = 0;
  loading = false;
  resourcesList: IResourceDetail[] = [];
  // Project Type Data variables
  projectTypeLabelData: any;
  projectTypeData: any;
  projectTypeGraphData: any;
  employeeId: any;
  projectTypeGraphOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualGraphData: any;
  estimatedVsActualGraphOptions: any;
  employename: any;
  // progress bar variables
  progressBarData: any;
  approved = 0;
  submitted = 0;
  rejected = 0;
  approvedColor = '#4CAF50'; // green
  submittedColor = '#FFC107'; // yellow
  rejectedColor = '#F44336'; // red
  rejectedPercent!: number;
  approvedPercent!: number;
  submittedPercent!: number;
  displayApproved!: string;
  displaySubmitted!: string;
  displayRejected!: string;
  projectsummaryinfo = 'The Project-Wise hours summary widget represents a pie chart visualization of the hours logged across different assigned projects. It displays each project along with the total submitted hours, providing a clear graphical representation of effort distribution and helping managers analyse time allocation effectively. ';
  AllocatedActualhours = 'The Allocated and Actual Hours widget provides a graphical representation comparing the total allocated hours against the actual hours logged. This visual summary helps employees and managers quickly assess utilization, identify variances, and ensure that project time allocations align with actual work efforts. ';
  TimesheetSummary = 'The Timesheet Summary widget provides a visual representation of timesheet data through a line diagram. It consolidates the total hours that are approved, rejected, and waiting for approval, offering a quick and clear overview of timesheet trends and approval statuses over time.  ';
  BillablevsNonBillableHoursInfo = 'Illustrates the proportion of hours that are billable versus non-billable across projects, offering a quick insight into profitability and resource utilization.';
  ProjectBurndownChartInfo = 'Visualizes project progress over time by comparing planned work versus actual completion, helping track deadlines and performance trends.';
  timeAllocatedInfo = 'This widget displays the percentage of hours allocated across all active projects for the selected period.It helps managers quickly understand where team effort is being utilized and identify project workload distribution.';
  // content loaders variables
  tableLoader = false;
  allocatedVsActualLoader = false;
  projectwisehour = false;
  // data loader
  projectsummaryLoader = false;
  ProjectwiseResourceCountLoader = false;
  DepartmentwiseContributionLoader = false;
  ProjectTypeLoader = false;
  EstimatedActualHoursLoader = false;
  BillablevsNonBillableHoursLoader = false;
  ProjectBurndownChartLoader = false;
  timeAllocatedLoader = false;
  billablelabels = [
    { label: 'Billable', color: '#0F358A' },
    { label: 'Non-Billable', color: '#A2B5E2' },
  ];

  estimatedlabels = [
    { label: 'Allocated Hours', color: '#0F358A' },
    { label: 'Actual Hours', color: '#A2B5E2' },
    { label: 'Over Due', color: '#FF4848' }
  ];
  billableData: any;
  billableOptions: any;
  storeclientId: any;
  projectNames: any;
  burndownData: any;
  burndownOptions: any;
  projectSummeryData: any;
  timeAllocatedData: any;
  timeAllocatedOptions: any;
  timeAllocatedlist: any;
  startDate: any;
  endDate: any;
  projectDetails=[] as any;
  clientDetails=[] as any;
  departmentDetails=[] as any;
  tmandRmDetails=[]as any;
  filterData={} as any;
  constructor(private fb: FormBuilder, private router: Router, private modalService: NgbModal, private http: HttpService,
    public rbac: RbacService, private route: ActivatedRoute,private encryptionService:EncriptdecriptService) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getprojectData();
    this.getclientData();
    this.getdepartmentData();
    this.getTmandRMData();
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
      const decrypted = this.encryptionService.decrypt(params['data']);
      // console.log('Decrypted Data:', decrypted);
       const resoureID = decrypted?.resourceId;
       this.filterData=decrypted
       if(this.filterData.clientId||this.filterData.projectId||this.filterData.departmentId||this.filterData.tmorrmId){
        this.showFilters=true;
       }
      if (resoureID) {
        this.employeeId = parseInt(resoureID)
      }
    }
      
    })
    this.updateModuleInfo();
    this.createDatepickerForm();
    // this.http.getteamDateRangeObservable().subscribe((data) => {
    //   console.log('Received BehaviorSubject data:', data);
    //   // Optional check to avoid running on empty initial values
    //   if (data && (data.startDate || data.endDate || data.employeeId)) {


    //     this.employeeId = data.employeeId ||  this.employeeId
    //     this.startDate = data.startDate;
    //     this.endDate = data.endDate;
    //     this.setDefaultmounth();
    //     // You can trigger your logic with these updated values
    //     // this.getProjectSummary(this.employeeId);
    //     this.projectSummery(this.employeeId);
    //     this.getallocatedSummary(this.employeeId);
    //     this.getEmployeeId(this.employeeId);
    //     this.billableChart(this.employeeId);
    //     // this.burnDownChart(resoureID);
    //     this.timeAllocatedacrossGraph(this.employeeId);
    //   } else {
    //     this.route.queryParams.subscribe(params => {
    //       if (params['data']) {
    //   const decrypted = this.encryptionService.decrypt(params['data']);
    //   console.log('Decrypted Data:', decrypted);
    //    const resoureID = decrypted?.resourceId;
    //       if (resoureID) {
    //         this.employeeId = parseInt(resoureID)
    //         this.setDefaultmounth();
    //         this.projectSummery(resoureID,decrypted);
    //         this.getallocatedSummary(resoureID);
    //         this.getEmployeeId(resoureID);
    //         this.billableChart(resoureID);
    //         // this.burnDownChart(resoureID);
    //         this.timeAllocatedacrossGraph(resoureID);
    //       }
    //        }
    //     });
    //   }
    // });

    // const startOfMonth = dayjs().startOf('month').toDate();
    // const endOfMonth = dayjs().endOf('month').toDate();
    // this.datepickerForm.patchValue({
    //   dateRange: [startOfMonth, endOfMonth],
    // });


    // this.route.queryParams.subscribe((params) => {
    //   const resoureID = params['id'];
    //   if (resoureID) {
    //     this.employeeId = parseInt(resoureID);
    //      this.setDefaultmounth();
    //     this.projectSummery(resoureID);
    //     this.getallocatedSummary(resoureID);
    //     this.getEmployeeId(resoureID);
    //     this.billableChart(resoureID);
    //     // this.burnDownChart(resoureID);
    //     this.timeAllocatedacrossGraph(resoureID);
    //   }
    // });
    //  this.setDefaultmounth();
    this.route.queryParams.subscribe(params => {
          if (params['data']) {
      const decrypted = this.encryptionService.decrypt(params['data']);
       const resoureID = decrypted?.resourceId;
          if (resoureID) {
            this.employeeId = parseInt(resoureID)
            this.setDefaultmounth();
            this.projectSummery(resoureID,decrypted);
            this.getallocatedSummary(resoureID,decrypted);
            this.getEmployeeId(resoureID);
            this.billableChart(resoureID,decrypted);
            // this.burnDownChart(resoureID);
            this.timeAllocatedacrossGraph(resoureID,decrypted);
          }
           }
        });
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
  }
//get all projects list
  getprojectData(): void {
    this.subscription = this.http.getData(`Project`).subscribe({
      next: (res: any) => {
        this.projectDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all clients list
  getclientData(): void {
    this.subscription = this.http.getData(`Client/GetAll`).subscribe({
      next: (res: any) => {
        this.clientDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all departments list
  getdepartmentData(): void {
    this.subscription = this.http.getData(`Department`).subscribe({
      next: (res: any) => {
        this.departmentDetails = res;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all TM and RM list
  getTmandRMData(): void {
    this.subscription = this.http.getData(`JobDetails/getAllReportingnTeamManagers`).subscribe({
      next: (res: any) => {
        this.tmandRmDetails = [
          ...res.map((emp: any) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`
              : `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
          })),
        ];
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  onSubmit() {
    // Check if form is valid (optional)
    const resoureID = this.datepickerForm.get('resourceId')?.value || this.employeeId;
    this.projectSummery(resoureID,this.filterData);
    this.getallocatedSummary(resoureID,this.filterData);
    this.getEmployeeId(resoureID);
    this.billableChart(resoureID,this.filterData);
    // this.burnDownChart(resoureID);
    this.timeAllocatedacrossGraph(resoureID,this.filterData);
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [null],
      projectId: [null],
      clientId: [null],
      departmentId: [null],
      tmorrmId: [null]
    });
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any field has value
    return formValue?.dateRange && formValue?.dateRange?.length > 0;
  }

  resetForm() {
    // Reset other form fields
    this.datepickerForm.reset({
      resourceId: null,
      dateRange: null,
    });
    // Now manually set the default month range
    // const defaultRange = this.setDefaultmounth();
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });
    this.updateModuleInfo();
    this.createDatepickerForm();
    this.route.queryParams.subscribe((params) => {
      if (params['data']) {
      const decrypted = this.encryptionService.decrypt(params['data']);
       const resoureID = decrypted?.resourceId;
      if (resoureID) {
        this.employeeId = parseInt(resoureID);
        this.projectSummery(resoureID,decrypted);
        this.getallocatedSummary(resoureID,decrypted);
        this.getEmployeeId(resoureID);
        this.billableChart(resoureID,decrypted);
        // this.burnDownChart(resoureID);
        this.timeAllocatedacrossGraph(resoureID,decrypted);
        this.getEmployeeId(resoureID);
      }
    }
    
    });
    this.setDefaultmounth();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
  }

  // setDefaultmounth() {
  //   const startOfMonth = dayjs().startOf('month').toDate();
  //   const endOfMonth = dayjs().endOf('month').toDate();
  //   this.datepickerForm.patchValue({
  //     dateRange: [startOfMonth, endOfMonth],
  //   });
  // }
  setDefaultmounth() {
    // Define current month's start & end
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    // Check if BehaviorSubject values exist
    const BehaviorDataexist = this.startDate && this.endDate;
    // If present → use them; else → fallback to month start/end
    const start = BehaviorDataexist ? dayjs(this.startDate).toDate() : startOfMonth;
    const end = BehaviorDataexist ? dayjs(this.endDate).toDate() : endOfMonth;
    // Patch form values
    this.datepickerForm.patchValue({
      dateRange: [start, end],
      resourceId: this.employeeId || null,
      projectId: this.filterData.projectId,
      clientId: this.filterData.clientId,
      departmentId: this.filterData.departmentId,
      tmorrmId: this.filterData.tmorrmId
    });
  }

  isShowtimesheetforteamRoute(): boolean {
    const showPaths = ['/project-management/timesheet/resourcesummary'];
    return showPaths.some((path) => this.router.url.startsWith(path));
  }

  isShowtimesheetformyRoute(): boolean {
    const showPaths = ['/project-management/timesheet/mysummary'];
    return showPaths.some((path) => this.router.url.startsWith(path));
  }

  onCheckemployee(employeed: any) {
    if (employeed) {
      //  this.getProjectSummary(employeed);
      this.getEmployeeId(employeed);
    } else {
      //  this.getProjectSummary(this.employeeId);
      this.getEmployeeId(this.employeeId);
    }
  }

  getEmployeeId(employeeId: any) {
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employename = data;
      },
      error: (reason) => {
        console.log(reason);
      },
    });
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/project-management/timesheet/resourcesummary':
        MODULE_INFOS.My_Timesheet_Resource_Summary_view,
      '/project-management/timesheet/summary':
        MODULE_INFOS.Team_Timesheet_Summary_view,
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.filter(
            (emp: IResourceDetail) => emp.id !== EmployeeId && emp.isReportee === true
          ).map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
            key: 'team',
          }));
        }
      },
      error: (err: any) => console.error(err),
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const satus = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId,
        }));
      },
    });
  }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  convertTimeToHours(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60; // e.g., "02:30" → 2.5
  }

  formatHoursToHHMM(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Project wise Resource Count
  projectSummery(employeeId?: any,data?:any) {
    this.projectsummaryLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/employee/resource-summary/${employeeId}`;
    // const queryParams: string[] = [];
    // const dateRange = this.datepickerForm.get('dateRange')?.value;
    // if (dateRange && dateRange[0] && dateRange[1]) {
    //   const startDate = moment(dateRange[0]).format('YYYY-MM-DD');
    //   const endDate = moment(dateRange[1]).format('YYYY-MM-DD');
    //   queryParams.push(`startDate=${startDate}`);
    //   queryParams.push(`endDate=${endDate}`);
    // }
    // if (queryParams.length > 0) {
    //   apiUrl += `?${queryParams.join('&')}`;
    // }

    const  payload = data;
    this.http.getProjectSummary(apiUrl,payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsummaryLoader = false;
        this.projectSummeryData = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        this.projectsummaryLoader = false;
        this.projectSummeryData = [];
        console.error('Error fetching project-wise resource count chart:', err);
      },
    });
  }

  resetCharts() {
    this.projectTypeGraphData = { labels: [], datasets: [] };
    this.estimatedVsActualGraphData = { labels: [], datasets: [] };
  }

  openModal(entries: TimesheetEntry[], content?: any) {
    this.selectedEntries = entries;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  get hasbillableData(): boolean {
    const datasets = this.billableData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  // Billable vs Non-Billable Hours (Stacked Bar)
  billableChart(employeeId?: any, payload?:any) {
    this.BillablevsNonBillableHoursLoader = true;
    // Base URL
    let apiUrl = `ProjectManagementGraph/employee/billable-non-billable/${employeeId}?groupBy=project`;
    // Prepare query parameters if BehaviorSubject data exists
    // const queryParams: string[] = [];
    // const dateRange = this.datepickerForm.get('dateRange')?.value;
    // if (dateRange && dateRange[0] && dateRange[1]) {
    //   const startDate = moment(dateRange[0]).format('YYYY-MM-DD');
    //   const endDate = moment(dateRange[1]).format('YYYY-MM-DD');
    //   queryParams.push(`startDate=${startDate}`);
    //   queryParams.push(`endDate=${endDate}`);
    // }
    // if (queryParams.length > 0) {
    //   apiUrl += `?${queryParams.join('&')}`;
    // }
    this.http.getProjectSummary(apiUrl,payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.BillablevsNonBillableHoursLoader = false;
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
        const labels = chartData.map((item: any) =>
          item.projectColor.graphData.code ? item.projectColor.graphData.code : item.name
        );
        const billable = chartData.map((item: any) =>
          convertToHours(item.billableHours)
        );
        const nonBillable = chartData.map((item: any) =>
          convertToHours(item.nonBillableHours)
        );
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
            x: {
              stacked: true,
              ticks: { color: '#141414', font: { size: 11 } },
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
        this.BillablevsNonBillableHoursLoader = false;
        this.billableData = { labels: [], datasets: [] };
        console.error('Error fetching billable/non-billable chart data:', err);
      },
    });
  }

  // Project Burndown Chart (Line)
  burnDownChart(employeeId?: any) {
    this.ProjectBurndownChartLoader = true;
    let apiUrl = `ProjectManagementGraph/employee/projectwiseburndownchart/${employeeId}`;
    const queryParams: string[] = [];
    const dateRange = this.datepickerForm.get('dateRange')?.value;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = moment(dateRange[0]).format('YYYY-MM-DD');
      const endDate = moment(dateRange[1]).format('YYYY-MM-DD');
      queryParams.push(`startDate=${startDate}`);
      queryParams.push(`endDate=${endDate}`);
    }
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
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
        const colors = ['#42A5F5', '#E91E63', '#9C27B0', '#FF9800', '#4CAF50',
          '#795548', '#009688', '#F44336', '#3F51B5', '#8BC34A',];
        projectCharts.forEach((project: any, index: number) => {
          const actualLine = project?.actualLine?.map((item: any) => ({
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

  // Just an example to generate different colors
  getColor(index: number): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFC300', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',];
    return colors[index % colors.length];
  }

  get hasallocatedvsactualData(): boolean {
    return !!(
      this.estimatedVsActualGraphData?.datasets?.length &&
      this.estimatedVsActualGraphData.datasets[0]?.data?.length
    );
  }

  getallocatedSummary(resoureID: any,payload:any) {
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const resourceId = formValue.resourceId ? `&resourceId=${formValue.resourceId}` : '';
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const url = `Timesheet/detailemployeesummary?resourceId=${resoureID || formValue.resourceId}`;
    this.http.getProjectSummary(url,payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data: TimesheetSummaryResponse = res?.data || {};
        const graphSummary = res?.data?.graphSummary || {};
        this.totalhrs = res?.data?.totalLoggedHHMM || '00:00';
        this.projectTypeData = graphSummary?.projectWiseSummary || [];
        this.estimatedVsActualData = graphSummary?.allocatedVsActualSummary || [];
        const tsSummary = graphSummary?.timesheetSummary || {
          approved: '00:00',
          submitted: '00:00',
          rejected: '00:00',
        };
        this.approved = this.convertTimeToHours(tsSummary?.approved);
        this.submitted = this.convertTimeToHours(tsSummary?.submitted);
        this.rejected = this.convertTimeToHours(tsSummary?.rejected);
        // Percentages for bar visualization
        const total = this.approved + this.submitted + this.rejected;
        // avoid division by 0
        if (total > 0) {
          this.approvedPercent = (this.approved / total) * 100;
          this.submittedPercent = (this.submitted / total) * 100;
          this.rejectedPercent = (this.rejected / total) * 100;
        } else {
          this.approvedPercent =
            this.submittedPercent =
            this.rejectedPercent =
            0;
        }
        // Display values in HH:mm format
        this.displayApproved = this.formatHoursToHHMM(this.approved);
        this.displaySubmitted = this.formatHoursToHHMM(this.submitted);
        this.displayRejected = this.formatHoursToHHMM(this.rejected);
        // Handle empty data gracefully — reset charts if needed
        if ((!this.projectTypeData || this.projectTypeData.length === 0) &&
          (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0)) {
          this.resetCharts();
        } else {
          this.estimatedActualChart();
        }
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
          entries: Array.isArray(item.entries) ? item.entries : item.entries ? [item.entries] : [],
        }));
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching attendance summary:', err);
        this.resetCharts();
        this.attendanceSummaryData = [];
      },
    });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    if (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0)
      return;
    // Extract labels
    const labels = this.estimatedVsActualData.map((item: any) =>
      item.meta.graphData.code ? item.meta.graphData.code : item.projectName
    );
    const color = this.estimatedVsActualData.map((item: any) =>
      item.meta.graphData.color ? item.meta.graphData.color : '#1A237E'
    );
    // Convert estimated hours to numbers (already numeric strings)
    const estimatedData = this.estimatedVsActualData.map(
      (item: any) => Number(item.estimatedHours) || 0
    );
    // Convert "HH:mm" to numeric hours for actualHours
    const actualData = this.estimatedVsActualData.map((item: any) => {
      const [h, m] = item.actualHours.split(':').map(Number);
      return h + m / 60;
    });
    // Keep original HH:mm format for display
    const actualDisplay = this.estimatedVsActualData.map(
      (item: any) => (item.actualHours - item.overDueHours)
    );
    // Convert overdue (may come as string)
    const overdueData = this.estimatedVsActualData.map(
      (item: any) => Number(item.overDue) || 0
    );
    // Chart datasets
    this.estimatedVsActualGraphData = {
      labels: labels,
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: color,
          data: estimatedData,
          stack: 'Estimated',
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: actualData,
          stack: 'ActualOverdue',
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: overdueData,
          stack: 'ActualOverdue',
        },
      ],
    };
    // Chart options
    this.estimatedVsActualGraphOptions = {
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
          grid: { display: false },
          ticks: { color: '#141414', font: { size: 11 } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            color: '#505050',
            font: { size: 12 },
          },
          ticks: { color: '#72777B', font: { size: 11 } },
        },
      },
    };
  }

  //time allocated across project
  timeAllocatedacrossGraph(employeeId: any,payload:any) {
    this.timeAllocatedLoader = true;
    //  Get stored date range from HttpService
    const dateRange = this.datepickerForm.get('dateRange')?.value;
    const startDate = dateRange?.startDate ?? null;
    const endDate = dateRange?.endDate ?? null;
    // Build the API URL conditionally
    let url = `ProjectManagementGraph/employee/time-allocation/${employeeId}`;
    // if (startDate && endDate) {
    //   url += `?startDate=${startDate}&endDate=${endDate}`;
    // }
    this.http.getProjectSummary(url,payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.timeAllocatedLoader = false;
        const apiData = res?.data?.projectAllocations || [];
        if (!apiData.length) {
          this.timeAllocatedData = { labels: [], datasets: [] };
          return;
        }
        // if (!Array.isArray(apiData) || apiData.length === 0) {
        //   this.timeAllocatedlist = [];
        //   this.timeAllocatedData = null;
        //   return;
        // }
        // Save list for legends
        this.timeAllocatedlist = apiData;
        // Extract values from API
        const labels = apiData.map((item: any) => item.projectName);
        const dataValues = apiData.map(
          (item: any) => item.allocationPercentage
        ); // or loggedHours if numeric
        const backgroundColors = apiData.map(
          (item: any) => item.meta?.graphData?.color || '#CCCCCC'
        );
        // Build chart dataset dynamically
        this.timeAllocatedData = {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: backgroundColors,
              hoverBackgroundColor: backgroundColors,
            },
          ],
        };
        // Chart options
        this.timeAllocatedOptions = {
          plugins: {
            legend: { display: false },
          },
        };
      },
      error: (err) => {
        this.timeAllocatedLoader = false;
        console.error('Error fetching Role-wise hours:', err);
        this.timeAllocatedlist = [];
        this.timeAllocatedData = null;
      },
    });
  }

  get hasallocationTypeData(): boolean {
    const datasets = this.timeAllocatedData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data.some((value) => value > 0);
  }

  navigatetoteam() {
    this.http.clearTeamDateRange();
    this.router.navigate(['project-management/timesheet/teamtimesheet']);
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

  get hasburndownData(): boolean {
    const datasets = this.burndownData?.datasets;
    if (!datasets?.length) return false;
    const data = datasets[0]?.data;
    return Array.isArray(data) && data?.some((value) => value > 0);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearTeamDateRange();
    this.showFilters=false;
  }
  showFilters: boolean = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}