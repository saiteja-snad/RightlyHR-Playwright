import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RbacService } from '../../../services/rbac.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject } from 'rxjs/internal/Subject';
import { TimesheetEntry } from '../../../Interfaces/timoff-model';
import { IResourceDetail } from '../../../timesheetmodel';
import { BehaviorSubject, Subscription, takeUntil } from 'rxjs';
import { DailyDataV2, MonthlySummaryItem } from '../../../Interfaces/timesheetsummary';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import dayjs from 'dayjs';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { FormsModule } from '@angular/forms';
import { Paginator } from "primeng/paginator";
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-resource-view-summary',
  imports: [ReactiveFormsModule, ChartModule, FormsModule, TranslateModule, CommonModule, NgbPopoverModule, NoDataFoundComponent,
    DateformatPipe, DataLoaderContentComponent, InfoIconComponent, ProgressBarModule, Paginator, SkeletonModule],
  templateUrl: './resource-view-summary.component.html',
  styleUrl: './resource-view-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class ResourceViewSummaryComponent implements OnInit,OnDestroy{
  empdata = {} as any;
  resourceDataids = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
  totalhrs: any;
  attendanceSummaryData: DailyDataV2[] = [];
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
  approvedColor = '#4CAF50';  // green
  submittedColor = '#FFC107'; // yellow
  rejectedColor = '#F44336';  // red
  rejectedPercent!: number;
  approvedPercent!: number;
  submittedPercent!: number;
  displayApproved!: string;
  displaySubmitted!: string;
  displayRejected!: string;
  // billable vs non billable
  billableVsNonBillableData: any;
  billableVsNonBillableGraphData: any;
  billableVsNonBillableGraphOptions: any;
  // graph Info
  allocatedVsActualInfo = "The Allocated and Actual Hours module provides a graphical representation comparing the total allocated hours against the actual hours logged. This visual summary helps employees and managers quickly assess utilization, identify variances, and ensure that project time allocations align with actual work efforts.";
  timesheetSummaryInfo = "The Timesheet Summary module provides a visual representation of timesheet data through a line diagram. It consolidates the total hours submitted, approved, rejected, and waiting for approval, offering a quick and clear overview of timesheet trends and approval statuses over time.";
  billableVsNonbillableInfo = "The Billable and Non-Billable Hours module provides a graphical representation comparing total billable hours with non-billable hours. This visual summary helps employees and managers analyze resource utilization, monitor project profitability, and maintain an effective balance between revenue-generating and internal activities.";
  // pagination
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  // content loaders variables
  tableLoader = false;
  allocatedVsActualLoader = false;
  billableVsNonbillableLoader = false;

  selectedDepartmentIds: number[] = [];
selectedResourceRoles: number[] = [];
selectedResourcePhases: number[] = [];

  constructor(private modalService: NgbModal, private http: HttpService, public rbac: RbacService) { }

ngOnInit() {
  this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');

  // Keep your existing request$ logic (resourceId + dateRange)
  this.http.request$.pipe(takeUntil(this.destroy$)).subscribe(request => {
    if (request) {
      if (request.resetPagination) {
        this.page = 1;
        this.first = 0;
      }
      this.resourceDataids = {
        ...this.resourceDataids,
        employeeId: request.resourceId || this.resourceDataids.employeeId,
        dateRange: request.dateRange
      };
      this.refreshData();
    } else {
      this.refreshData();
    }
  });

  // NEW: Listen to shared project timesheet filters (Department, Role, Phase, DateRange)
  this.http.projectTimesheetDepartmentIds$
    .pipe(takeUntil(this.destroy$))
    .subscribe(ids => {
      this.selectedDepartmentIds = ids;
      this.refreshData();
    });

  this.http.projectTimesheetRoleFilter$
    .pipe(takeUntil(this.destroy$))
    .subscribe(ids => {
      this.selectedResourceRoles = ids;
      this.refreshData();
    });

  this.http.projectTimesheetPhaseFilter$
    .pipe(takeUntil(this.destroy$))
    .subscribe(ids => {
      this.selectedResourcePhases = ids;
      this.refreshData();
    });

  this.http.getDateRangeObservable()
    .pipe(takeUntil(this.destroy$))
    .subscribe(range => {
      if (range) {
        this.resourceDataids = {
          ...this.resourceDataids,
          dateRange: { startDate: range.startDate, endDate: range.endDate }
        };
      }
      this.refreshData();
    });

  // Initial load
  this.refreshData();
}


private refreshData() {
  this.page = 1;
  this.first = 0;
  this.getProjectSummary();
  this.estimatedActualChart();
  this.billableVSNonBillable();
}

  // setDefaultmounth() {
  //   const startOfMonth = dayjs().startOf('month').toDate();
  //   const endOfMonth = dayjs().endOf('month').toDate();
  //   this.datepickerForm.patchValue({
  //     dateRange: [startOfMonth, endOfMonth]
  //   });
  // }

  // called for pagination
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getProjectSummary();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getProjectSummary();
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getProjectSummary();
  }

  getProjectSummary() {
    debugger
    this.tableLoader = true;
    const { startDate, endDate } = this.resourceDataids?.dateRange || {};
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const { clientId, projectId, employeeId } = this.resourceDataids;

    const deptIds = this.http.getCurrentProjectTimesheetDepartmentIds();
  const roleIds = this.http.getCurrentProjectTimesheetRoleIds();
  const phaseIds = this.http.getCurrentProjectTimesheetPhaseIds();
    // Reset pagination if filters exist
    // if (this.resourceDataids?.dateRange  && Object.keys(this.resourceDataids?.dateRange ).length > 0) {
    //   var page  = 1;
    //   var pagesize = 10; // or whatever your default size is
    // }else{
    var page = this.page;
    var pagesize = this.pageSize;
    // }
    // Reset pagination if filters exist
    let url = `Timesheet/timesheet-summary?clientId=${clientId}&projectId=${projectId}&resourceId=${employeeId}&startDate=${start}&endDate=${end}&page=${page}&pageSize=${pagesize}`;

    if (deptIds.length > 0) url += `&departmentIds=${deptIds.join(',')}`;
  if (roleIds.length > 0) url += `&roleIds=${roleIds.join(',')}`;
  if (phaseIds.length > 0) url += `&phaseIds=${phaseIds.join(',')}`;

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data: any = res?.data;
        this.attendanceSummaryData = (data?.dailyData ?? []) as DailyDataV2[];
        this.collectionSize = res.data.pagination.totalCount;
        // this.totalhrs = data?.totalLoggedHHMM;
        const tsSummary = res?.data?.statusSummary;
        // Convert to decimal hours
        this.approved = this.convertTimeToHours(tsSummary?.approvedHours);
        this.submitted = this.convertTimeToHours(tsSummary?.waitingForApprovalHours);
        this.rejected = this.convertTimeToHours(tsSummary?.rejectedHours);
        // Total hours (prevent divide-by-zero)
        const total = this.approved + this.submitted + this.rejected || 1;
        // Calculate percentages for the gradient
        this.approvedPercent = (this.approved / total) * 100;
        this.submittedPercent = (this.submitted / total) * 100;
        this.rejectedPercent = (this.rejected / total) * 100;
        // Convert back for display labels (HH:mm)
        this.displayApproved = tsSummary?.approvedHoursHHMM;
        this.displaySubmitted = tsSummary?.waitingForApprovalHHMM;
        this.displayRejected = tsSummary?.rejectedHoursHHMM;
        // Colors (use whatever palette you prefer)
        this.approvedColor = '#00A912';   // green
        this.submittedColor = '#FFC107';  // blue
        this.rejectedColor = '#EA362C';   // red
        // Graph Functions
        this.estimatedActualChart();
        this.billableVSNonBillable();
        this.tableLoader = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error fetching attendance summary:', err);
        this.attendanceSummaryData = [];
        this.statusCounts$.next([]);
        this.utilizationcount$.next([]);
        this.totalEntries = 0;
        this.timesheetSummaryChartData = { labels: [], datasets: [] };
        this.timesheetutilizeSummaryChartData = { labels: [], datasets: [] };
        this.tableLoader = false;
      }
    });
  }

  openModal(entries: TimesheetEntry[], content?: any) {
    this.selectedEntries = entries;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  //graphs no data found conditions
  get hasroleWiseHoursData(): boolean {
    return !!(
      this.billableVsNonBillableGraphData?.datasets?.length &&
      this.billableVsNonBillableGraphData.datasets[0]?.data?.length
    );
  }

  get hasallocatedvsactualData(): boolean {
    return !!(
      this.estimatedVsActualGraphData?.datasets?.length &&
      this.estimatedVsActualGraphData.datasets[0]?.data?.length
    );
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    this.allocatedVsActualLoader = true;
    // const dateRange = this.resourceDataids?.dateRange || [];
    const { startDate, endDate } = this.resourceDataids?.dateRange || {};
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    // const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [];
    // const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    // const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');

    const deptIds = this.http.getCurrentProjectTimesheetDepartmentIds();
  const roleIds = this.http.getCurrentProjectTimesheetRoleIds();
  const phaseIds = this.http.getCurrentProjectTimesheetPhaseIds();

    const { projectId, employeeId } = this.resourceDataids;
    let url = `ProjectManagementGraph/project/allocated-vs-actual/${projectId}?employeeId=${employeeId}&startDate=${start}&endDate=${end}&groupBy=employee`;

    if (deptIds.length > 0) url += `&departmentIds=${deptIds.join(',')}`;
  if (roleIds.length > 0) url += `&roleIds=${roleIds.join(',')}`;
  if (phaseIds.length > 0) url += `&phaseIds=${phaseIds.join(',')}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const chart = res?.data?.chart;
        if (!chart) {
          this.estimatedVsActualGraphData = { labels: [], datasets: [] };
          return;
        }
        // Only show Allocated and Actual Hours
        const labels = ['Allocated', 'Actual'];
        const hours = [chart.allocated, chart.actual];
        const colors = ['#EE7956', '#5A00D8'];
        // Store legend data in the same variable you already use
        this.estimatedVsActualData = labels.map((label, index) => ({
          label: label,
          value: hours[index],
          color: colors[index]
        }));
        // Assign Pie Chart Data
        this.estimatedVsActualGraphData = {
          labels,
          datasets: [
            {
              data: hours,
              backgroundColor: colors,
            }
          ]
        };
        // Chart Options
        this.estimatedVsActualGraphOptions = {
          responsive: true,
          plugins: {
            legend: { display: false },
          }
        };
        this.allocatedVsActualLoader = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching estimated vs actual chart data:', err);
        this.estimatedVsActualGraphData = { labels: [], datasets: [] };
        this.allocatedVsActualLoader = false;
      }
    });
  }

  billableVSNonBillable() {
    this.billableVsNonbillableLoader = true;
    const { startDate, endDate } = this.resourceDataids?.dateRange || {};
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const { clientId, projectId, employeeId } = this.resourceDataids;

    const deptIds = this.http.getCurrentProjectTimesheetDepartmentIds();
  const roleIds = this.http.getCurrentProjectTimesheetRoleIds();
  const phaseIds = this.http.getCurrentProjectTimesheetPhaseIds();

    let url = `ProjectManagementGraph/project/billable-non-billable/${projectId}?employeeId=${employeeId}&startDate=${start}&endDate=${end}&groupBy=emp`;

    if (deptIds.length > 0) url += `&departmentIds=${deptIds.join(',')}`;
  if (roleIds.length > 0) url += `&roleIds=${roleIds.join(',')}`;
  if (phaseIds.length > 0) url += `&phaseIds=${phaseIds.join(',')}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const chartData = res?.data?.chartData || [];
        // Extract labels and data
        const labels = chartData.map((item: any) => item.label);
        const hours = chartData.map((item: any) => item.hours);
        const colors = ['#0F358A', '#A2B5E2'];
        // Store legend data in the same variable you already use
        this.billableVsNonBillableData = labels.map((label: string, index: number) => ({
          label: label,
          value: hours[index],
          color: colors[index]
        }));
        // Assign Pie Chart Data
        this.billableVsNonBillableGraphData = {
          labels: labels,
          datasets: [
            {
              data: hours,
              backgroundColor: colors,
            }
          ]
        };
        // Chart options
        this.billableVsNonBillableGraphOptions = {
          responsive: true,
          plugins: {
            legend: { display: false },
          }
        };
        this.billableVsNonbillableLoader = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error fetching billable vs non-billable data:', err);
        this.billableVsNonBillableGraphData = { labels: [], datasets: [] };
        this.billableVsNonbillableLoader = false;
      }
    });
  }

  convertTimeToHours(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
  }

  formatHoursToHHMM(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  }

  get totalPercent(): number {
    return this.approvedPercent + this.submittedPercent + this.rejectedPercent;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
