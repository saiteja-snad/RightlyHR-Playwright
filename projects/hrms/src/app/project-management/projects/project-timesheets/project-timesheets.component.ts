import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { DailyData, MonthlySummaryItem, TimesheetEntry, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
@Component({
  selector: 'app-project-timesheets',
  imports: [CommonModule, TranslateModule, ChartModule, DataLoaderContentComponent, NoDataFoundComponent, DateformatPipe],
  templateUrl: './project-timesheets.component.html',
  styleUrl: './project-timesheets.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetsComponent implements OnInit, OnDestroy {
  attendanceSummaryData: DailyData[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedEntries: TimesheetEntry[] = [];
  timesheetSummaryChartData: any;
  timesheetutilizeSummaryChartData: any;
  timesheetSummaryOptions: any;
  statusCounts$ = new BehaviorSubject<MonthlySummaryItem[]>([]);
  utilizationcount$ = new BehaviorSubject<any>(null);
  totalEntries = 0;
  loading = false;

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private http: HttpService) { }

  ngOnInit() {
    // this.resetSummary();
    this.http.request$.pipe(takeUntil(this.destroy$)).subscribe(request => {
      if (request) {
        this.getProjectSummary(request);
      }
      else{
        this.resetSummary();
      }
    });
  }

  getProjectSummary(request: any) {
    this.loading = true
    this.http.getData(`Timesheet/summary?clientId=${request.clientId}&projectId=${request.projectId}&resourceId=${request.resourceId}&startDate=${request.dateRange.startDate}&endDate=${request.dateRange.endDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        const data: TimesheetSummaryResponse = res?.data;
        // this.attendanceSummaryData = data?.dailyData ?? [];
        const resourceName = data?.resource;
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
          fusionEmployeeId: resourceName.fusionEmployeeId,
          resourceName: resourceName.name
        }));
        const monthlySummary = data?.monthlySummary;
        const summaryItems = monthlySummary?.items ?? [];
        this.statusCounts$.next(summaryItems);
        this.totalEntries = monthlySummary?.totalEntries ?? 0;
        // utiliztionsummery charts
        const utilizationSummary = data?.utilizationSummary;
        const overall = utilizationSummary?.overall;
        const utilizationArray = Object.entries(overall || {}).filter(([key, value]) => (value ?? 0) > 0).map(([key, value]) => ({
          key,
          label: key
            .replace(/([A-Z])/g, ' $1') // add spaces before capital letters
            .replace(/^./, str => str.toUpperCase()), // capitalize first letter
          value
        }));
        this.utilizationcount$.next(utilizationArray);
        // time sheet summary charts data
        this.timesheetSummaryChartData = {
          datasets: [
            {
              data: summaryItems.map(i => i.value),
              backgroundColor: summaryItems.map(i => i.colour),
              borderWidth: 0
            }
          ]
        };
        // utiliztionsummery charts data
        this.timesheetutilizeSummaryChartData = {
          datasets: [
            {
              data: utilizationArray.map(i => i.value),
              backgroundColor: ['#4CAF50', '#FF9800'],
              borderWidth: 0
            }
          ]
        };
        this.timesheetSummaryOptions = {
          cutout: '70%',
        };
      },
      error: err => {
        this.loading = false
        console.error('Error fetching attendance summary:', err);
        this.attendanceSummaryData = [];
        this.statusCounts$.next([]);
        this.totalEntries = 0;
        this.timesheetSummaryChartData = { labels: [], datasets: [] };
        this.timesheetutilizeSummaryChartData = { labels: [], datasets: [] };
      }
    });
  }

  resetSummary() {
    this.attendanceSummaryData = [];
    this.statusCounts$.next([]);
    this.totalEntries = 0;
    this.utilizationcount$.next([]);
    this.timesheetSummaryChartData = { labels: [], datasets: [] };
    this.timesheetutilizeSummaryChartData = { labels: [], datasets: [] };
  }

  openModal(entries: TimesheetEntry[], content?: any) {
    // Calculate overtime if needed (example: loggedHours - allocatedHours if > 0)
    this.selectedEntries = entries.map(e => ({
      ...e,
      overtime: Math.max(0, (e.loggedHours ?? 0) - (e.allocatedHours ?? 0))
    }));
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.setRequest(null);
  }
}