import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RbacService } from '../../../services/rbac.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject } from 'rxjs/internal/Subject';
import { TimesheetEntry } from '../../../Interfaces/timoff-model';
import { IResourceDetail } from '../../../timesheetmodel';
import { BehaviorSubject, Subscription, takeUntil } from 'rxjs';
import { DailyData, MonthlySummaryItem, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
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
@Component({
  selector: 'app-resource-view-summary',
  imports: [ReactiveFormsModule, ChartModule, TranslateModule, CommonModule, NgbPopoverModule, 
    NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent, InfoIconComponent, ProgressBarModule],
  templateUrl: './resource-view-summary.component.html',
  styleUrl: './resource-view-summary.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class ResourceViewSummaryComponent {
  empdata = {} as any;
  resourceDataids = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
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

  constructor(private modalService: NgbModal, private http: HttpService, public rbac: RbacService) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');
    this.http.request$.pipe(takeUntil(this.destroy$)).subscribe(request => {
      if (request) {
        this.resourceDataids = {
          ...this.resourceDataids, // keep clientId & projectId from localStorage
          employeeId: request.resourceId || this.resourceDataids.employeeId, // override employeeId if needed
          dateRange: request.dateRange
        };
      } else {
        this.getProjectSummary();
      }
      this.getProjectSummary();
    });
    this.getProjectSummary();
    // this.setDefaultmounth();
  }

  // setDefaultmounth() {
  //   const startOfMonth = dayjs().startOf('month').toDate();
  //   const endOfMonth = dayjs().endOf('month').toDate();
  //   this.datepickerForm.patchValue({
  //     dateRange: [startOfMonth, endOfMonth]
  //   });
  // }

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

  getProjectSummary() {
    const { startDate, endDate } = this.resourceDataids?.dateRange || {};
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const { clientId, projectId, employeeId } = this.resourceDataids;
    const url = `Timesheet/timesheet-summary?clientId=${clientId}&projectId=${projectId}&resourceId=${employeeId}&startDate=${start}&endDate=${end}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data: TimesheetSummaryResponse = res?.data;
        this.attendanceSummaryData = (data?.dailyData ?? []).map(item => ({
          ...item,
          entries: item.entries ?? []
        }));
        // this.totalhrs = data?.totalLoggedHHMM;
        const tsSummary = res?.data?.statusSummary;

        this.approved = this.convertTimeToHours(tsSummary?.approvedHours);
        this.submitted = this.convertTimeToHours(tsSummary?.waitingForApprovalHours);
        this.rejected = this.convertTimeToHours(tsSummary?.rejectedHours);

        const total = this.approved + this.submitted + this.rejected || 1;
        this.displayRejected = this.formatHoursToHHMM(this.rejected);

        this.estimatedActualChart();
        this.billableVSNonBillable();
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
      }
    });
  }

  openModal(entries: TimesheetEntry[], content?: any) {
    this.selectedEntries = entries;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    const dateRange = this.resourceDataids?.dateRange || [];
    const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [];
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const { projectId, employeeId } = this.resourceDataids;
    const url = `ProjectManagementGraph/project/allocated-vs-actual/${projectId}?employeeId=${employeeId}&groupBy=employee`;
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
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching estimated vs actual chart data:', err);
        this.estimatedVsActualGraphData = { labels: [], datasets: [] };
      }
    });
  }

  billableVSNonBillable() {
    const dateRange = this.resourceDataids?.dateRange || [];
    const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [];
    const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const { clientId, projectId, employeeId } = this.resourceDataids;
    const url = `ProjectManagementGraph/project/billable-non-billable/${projectId}?employeeId=${employeeId}&groupBy=emp`;
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
      },
      error: err => {
        this.loading = false;
        console.error('Error fetching billable vs non-billable data:', err);
        this.billableVsNonBillableGraphData = { labels: [], datasets: [] };
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}