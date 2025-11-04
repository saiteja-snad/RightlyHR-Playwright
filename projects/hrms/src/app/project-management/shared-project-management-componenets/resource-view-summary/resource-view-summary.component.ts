import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private modalService: NgbModal, private http: HttpService, public rbac: RbacService) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');
    this.http.request$
      .pipe(takeUntil(this.destroy$))
      .subscribe(request => {
        if (request && request.dateRange || request?.resourceId) {
          // ✅ Use BehaviorSubject data if available
          console.log('Using BehaviorSubject request:', request);

          this.resourceDataids = {
            ...this.resourceDataids, // keep clientId & projectId from localStorage
            employeeId: request.resourceId || this.resourceDataids.employeeId, // override employeeId if needed
            dateRange: request.dateRange
          };
          this.getProjectSummary();
        } else {
          // ✅ Fall back to localStorage
          console.log('Using localStorage data:', this.resourceDataids);
          this.getProjectSummary();
        }


      });
    this.getProjectSummary();

    this.projectTypeChart();
    this.estimatedActualChart();
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
    const start = startDate
      ? dayjs(startDate).format('YYYY-MM-DD')
      : dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate
      ? dayjs(endDate).format('YYYY-MM-DD')
      : dayjs().endOf('month').format('YYYY-MM-DD');
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
        // this.estimatedVsActualData = data?.graphSummary?.allocatedVsActualSummary;
        const tsSummary = res?.data?.graphSummary?.timesheetSummary;

        this.approved = this.convertTimeToHours(tsSummary?.approved);
        this.submitted = this.convertTimeToHours(tsSummary?.submitted);
        this.rejected = this.convertTimeToHours(tsSummary?.rejected);

        const total = this.approved + this.submitted + this.rejected || 1;
        this.displayRejected = this.formatHoursToHHMM(this.rejected);

        this.projectTypeChart();
        this.estimatedActualChart();
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

  // Project Type (Pie)
  projectTypeChart() {
    if (!this.projectTypeData || this.projectTypeData.length === 0) return;

    // Extract labels
    const labels = this.projectTypeData.map((item: any) => item.projectName);

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

    // Chart data
    this.projectTypeGraphData = {
      labels,
      datasets: [
        {
          label: 'Project Hours (in hrs)',
          data,
          backgroundColor: backgroundColors,
        },
      ],
    };

    // Chart options
    this.projectTypeGraphOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const timeString = originalTimes[index]; // e.g., "02:35"
              return `${context.label}: ${timeString} hrs`;
            },
          },
        },
      },
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    if (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0) return;
    // Extract labels
    const labels = this.estimatedVsActualData.map((item: any) => item.projectName);
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
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const datasetLabel = context.dataset.label || '';
              const index = context.dataIndex;
              if (datasetLabel === 'Actual Hours') {
                // show actualHours as HH:mm hrs
                const timeStr = actualDisplay[index];
                return `${datasetLabel}: ${timeStr} hrs`;
              } else if (datasetLabel === 'Estimated Hours') {
                return `${datasetLabel}: ${context.raw.toFixed(2)} hrs`;
              } else {
                return `${datasetLabel}: ${context.raw} hrs`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          title: { display: false }
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
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();

  }
}