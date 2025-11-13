import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { IResourceDetail } from '../../../timesheetmodel';
import { NgbModal, NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { DatePicker } from 'primeng/datepicker';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DailyData, MonthlySummaryItem, TimesheetEntry, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
import { Subject } from 'rxjs/internal/Subject';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { ChartModule } from 'primeng/chart';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { ProgressBarModule } from 'primeng/progressbar';
import { ModuleInfoIconComponent } from "../../../icons/module-info-icon/module-info-icon.component";
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { Skeleton } from "primeng/skeleton";
@Component({
  selector: 'app-timesheets-summary-view',
  imports: [TimesheetsTabsComponent, ReactiveFormsModule, NgbPopover, DatePicker, ChartModule, TranslateModule, CommonModule, Select, NgbPopoverModule,
    NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent, InfoIconComponent, ProgressBarModule, ModuleInfoIconComponent,
    ModuleInformationComponent, Skeleton],
  templateUrl: './timesheets-summary-view.component.html',
  styleUrl: './timesheets-summary-view.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class TimesheetsSummaryViewComponent {
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  empdata = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
  datepickerForm!: FormGroup;
  totalhrs: any
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
  employeeId: any
  projectTypeGraphOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualGraphData: any;
  estimatedVsActualGraphOptions: any;
  employename: any
  // progress bar variables
  progressBarData: any;
  approved = 0;
  submitted = 0;
  rejected = 0;
  approvedColor = '#4CAF50';  // green
  submittedColor = '#FFC107'; // yellow
  rejectedColor = '#F44336';  // red
  rejectedPercent!: number;
  approvedPercent!: number;
  submittedPercent!: number;
  displayApproved!: string;
  displaySubmitted!: string;
  displayRejected!: string;
  ProjectwisehoursSummary = 'The Project-Wise hours summary widget represents a pie chart visualization of the hours logged across different assigned projects. It displays each project along with the total submitted hours, providing a clear graphical representation of effort distribution and helping managers analyse time allocation effectively. '
  AllocatedActualhours = 'The Allocated and Actual Hours widget provides a graphical representation comparing the total allocated hours against the actual hours logged. This visual summary helps employees and managers quickly assess utilization, identify variances, and ensure that project time allocations align with actual work efforts. '
  TimesheetSummary = 'The Timesheet Summary widget provides a visual representation of timesheet data through a line diagram. It consolidates the total hours that are approved, rejected, and waiting for approval, offering a quick and clear overview of timesheet trends and approval statuses over time.  '
  // content loaders variables
  tableLoader = false;
  allocatedVsActualLoader = false;
  projectwisehour = false;
  startDate: any;
  endDate: any;

  constructor(private fb: FormBuilder, private router: Router, private modalService: NgbModal, private http: HttpService,
    public rbac: RbacService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.updateModuleInfo()
    this.createDatepickerForm();
  this.http.getteamDateRangeObservable().subscribe((data) => {
    console.log('Received BehaviorSubject data:', data);
    // Optional check to avoid running on empty initial values
    if (data && (data.startDate || data.endDate || data.employeeId)) {
      this.employeeId = data.employeeId || null;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
         this.setDefaultmounth();
      // You can trigger your logic with these updated values
      this.getProjectSummary(this.employeeId);
    }else{
    this.route.queryParams.subscribe(params => {
      const resoureID = params['id'];
      if (resoureID) {
        this.employeeId = parseInt(resoureID)
           this.setDefaultmounth();
         this.getProjectSummary(resoureID);
        this.getEmployeeId(resoureID);
      }
    });
    }
  });
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.projectWiseChart();
    this.estimatedActualChart();
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [null]
    });
  }
  
  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any field has value
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0)
    );
  }

  resetForm() {
    // Reset other form fields
    this.datepickerForm.reset({
      resourceId: null,
      dateRange: null
    });
    // Now manually set the default month range
    // const defaultRange = this.setDefaultmounth();
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth]
    });
    this.updateModuleInfo()
    this.createDatepickerForm();
    this.route.queryParams.subscribe(params => {
      const resoureID = params['id'];
      if (resoureID) {
        this.employeeId = parseInt(resoureID)
        this.getProjectSummary(resoureID);
        this.getEmployeeId(resoureID);
      }
    });
    this.setDefaultmounth();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.projectWiseChart();
    this.estimatedActualChart();
  }

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
    resourceId: this.employeeId || null
  });
  console.log('📅 Date Range set:', start, end);
}

  isShowtimesheetforteamRoute(): boolean {
    const showPaths = ['/project-management/timesheet/summary'];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetformyRoute(): boolean {
    const showPaths = ['/project-management/timesheet/mysummary'];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  onCheckemployee(employeed: any) {
    if (employeed) {
      //  this.getProjectSummary(employeed);
      this.getEmployeeId(employeed);
    }
    else {
      //  this.getProjectSummary(this.employeeId);
      this.getEmployeeId(this.employeeId);
    }
  }

  //graphs no data found conditions
  get hasprojectWiseHoursData(): boolean {
    return !!(
      this.projectTypeGraphData?.datasets?.length &&
      this.projectTypeGraphData.datasets[0]?.data?.length
    );
  }

  get hasallocatedvsactualData(): boolean {
    return !!(
      this.estimatedVsActualGraphData?.datasets?.length &&
      this.estimatedVsActualGraphData.datasets[0]?.data?.length
    );
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
      '/project-management/timesheet/mysummary': MODULE_INFOS.My_Timesheet_Summary_view,
      '/project-management/timesheet/summary': MODULE_INFOS.Team_Timesheet_Summary_view
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.filter((emp: IResourceDetail) => emp.id !== EmployeeId && emp.isReportee === true).map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
            key: 'team'
          }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const satus = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  onSubmit() {
    // Check if form is valid (optional)
    const resoureID = this.datepickerForm.get('resourceId')?.value || this.employeeId
    this.getProjectSummary(resoureID);
    this.getEmployeeId(resoureID);
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

  getProjectSummary(resoureID: any) {
    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];
    const resourceId = formValue.resourceId ? `&resourceId=${formValue.resourceId}` : '';
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const url = `Timesheet/detailemployeesummary?resourceId=${resoureID || formValue.resourceId}&startDate=${start}&endDate=${end}${resourceId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
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
          rejected: '00:00'
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
          this.approvedPercent = this.submittedPercent = this.rejectedPercent = 0;
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
          this.projectWiseChart();
          this.estimatedActualChart();
        }
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
          entries: Array.isArray(item.entries) ? item.entries : (item.entries ? [item.entries] : [])
        }));
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching attendance summary:', err);
        this.resetCharts();
        this.attendanceSummaryData = [];
      }
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

  // Project Type (Pie)
  projectWiseChart() {
    if (!this.projectTypeData || this.projectTypeData.length === 0) return;
    // Extract labels
    const labels = this.projectTypeData.map((item: any) => item.meta?.graphData?.code);
    // Convert "HH:mm" string → numeric hours for plotting
    const data = this.projectTypeData.map((item: any) => {
      const [hours, minutes] = item.hours.split(':').map(Number);
      return hours + minutes / 60;
    });
    // Keep original HH:mm values for display
    const originalTimes = this.projectTypeData.map((item: any) => item.hours);
    // Chart colors
    const backgroundColors = [
      '#FFD54F', '#E91E63', '#4DB6AC', '#64B5F6',
      '#81C784', '#3F51B5', '#FF8A65', '#BA68C8',
    ].slice(0, labels.length);
    // Store for legend display (outside chart)
    this.projectTypeLabelData = labels.map((label: string, index: number) => ({
      label,
      color: backgroundColors[index],
      hours: originalTimes[index],
    }));
    // Chart data
    this.projectTypeGraphData = {
      labels,
      datasets: [
        {
          label: 'Project Hours (in Hrs)',
          data,
          backgroundColor: backgroundColors,
        },
      ],
    };
    // Chart options
    this.projectTypeGraphOptions = {
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { size: 11 },
          bodyFont: { size: 10 },
          callbacks: {
            title: (tooltipItems: any) => {
              const index = tooltipItems[0].dataIndex;
              const name = this.projectTypeData[index].projectName;
              // Wrap long names (max 20 chars per line)
              return name.match(/.{1,20}/g);
            },
            label: (tooltipItem: any) => {
              const value = Number(tooltipItem.raw).toFixed(2);
              return `Project Hours (in Hrs): ${value}`;
            }
          }
        }
      }
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    if (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0) return;
    // Extract labels
    const labels = this.estimatedVsActualData.map((item: any) => item.meta?.graphData?.code);
    // Convert estimated hours to numbers (already numeric strings)
    const estimatedData = this.estimatedVsActualData.map((item: any) => Number(item.estimatedHours) || 0);
    // Convert "HH:mm" to numeric hours for actualHours
    const actualData = this.estimatedVsActualData.map((item: any) => {
      const [h, m] = item.actualHours.split(':').map(Number);
      return h + (m / 60);
    });
    // Keep original HH:mm format for display
    const actualDisplay = this.estimatedVsActualData.map((item: any) => item.actualHours);
    // Convert overdue (may come as string)
    const overdueData = this.estimatedVsActualData.map((item: any) => Number(item.overDue) || 0);
    // Chart datasets
    this.estimatedVsActualGraphData = {
      labels: labels,
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: '#1A237E',
          data: estimatedData,
          stack: 'Estimated'
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: actualData,
          stack: 'ActualOverdue'
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: overdueData,
          stack: 'ActualOverdue'
        }
      ]
    };
    // Chart options
    this.estimatedVsActualGraphOptions = {
      responsive: true,
      barThickness: 30,
      scales: {
        x: {
          stacked: false,
          grid: { display: false, },
          ticks: { color: '#141414', font: { size: 11 } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: 'Hours', color: '#505050', font: { size: 12 } },
          ticks: { color: '#72777B', font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (tooltipItems: any) => {
              const index = tooltipItems[0].dataIndex;
              return this.estimatedVsActualData[index].projectName;
            },
            label: (tooltipItem: any) => {
              const datasetLabel = tooltipItem.dataset.label || '';
              const value = tooltipItem.raw;
              return `${datasetLabel}: ${value}`;
            }
          }
        }
      },
    };
  }

  navigatetoteam() {
    this.router.navigate(['project-management/timesheet/teamtimesheet']);
  }
      ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearTeamDateRange();
  }
}