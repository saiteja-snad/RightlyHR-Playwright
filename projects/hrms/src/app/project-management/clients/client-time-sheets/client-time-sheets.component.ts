import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DailyData, MonthlySummaryItem, TimesheetEntry, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
@Component({
  selector: 'app-client-time-sheets',
  imports: [CommonModule, TranslateModule, ChartModule, InfoIconComponent, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe],
  templateUrl: './client-time-sheets.component.html',
  styleUrl: './client-time-sheets.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimeSheetsComponent implements OnInit, OnDestroy {
  attendanceSummaryData: DailyData[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedEntries: TimesheetEntry[] = [];
  timesheetSummaryChartData: any;
  timesheetutilizeSummaryChartData: any;
  timesheetSummaryOptions: any;
  statusCounts$ = new BehaviorSubject<MonthlySummaryItem[]>([]);
  utilizationcount$ = new BehaviorSubject<any>(null);
  totalEntries = 0;
  loading = false


  constructor(private modalService: NgbModal, private route: ActivatedRoute, private http: HttpService) { }

  ngOnInit() {
    //this.resetSummary();
    this.http.requestclienttimesheetdata$.pipe(takeUntil(this.destroy$)).subscribe(request => {
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
        console.log(this.attendanceSummaryData);
        const monthlySummary = data?.monthlySummary;
        const summaryItems = monthlySummary?.items ?? [];
        this.statusCounts$.next(summaryItems);
        this.totalEntries = monthlySummary?.totalEntries ?? 0;
        // utiliztionsummery charts
        const utilizationSummary = data?.utilizationSummary;
       const overall = utilizationSummary?.overall;
       const utilizationArray = (() => {
         if (!overall || !overall.loggedHHMM) return [];

         const hhmm = overall.loggedHHMM as string;

         // If exactly "0:00" or "00:00", return empty array
         if (hhmm === '0:00' || hhmm === '00:00') return [];

         // Split by ":" and convert to numbers
         const parts = hhmm.split(':').map(Number);

         // If parsing fails or less than 2 parts, return empty array
         if (parts.length < 2 || parts.some(isNaN)) return [];

         const h = parts[0];
         const m = parts[1];

         // 🧠 Format display string: omit minutes if 00
         const loggedHHMM = m === 0 ? `${h}h` : `${h}h ${m}m`;

         return [
           {
             key: 'loggedHours',
             label: 'Logged Hours',
             value: parseFloat(`${h}.${m}`), // hours.minutes format for chart
             loggedHHMM, // formatted display value
             loggedISO: overall.loggedISO,
           },
         ];
       })();

       this.utilizationcount$.next(utilizationArray);
       // time sheet summary charts data
       this.timesheetSummaryChartData = {
         datasets: [
           {
             data: summaryItems.map((i) => i.value),
             backgroundColor: summaryItems.map((i) => i.colour),
             borderWidth: 0,
           },
         ],
       };
        // utiliztion summery charts data
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

  openModal(entries: TimesheetEntry[], content?: any) {
    // Calculate overtime if needed (example: loggedHours - allocatedHours if > 0)
    this.selectedEntries = entries.map(e => ({
      ...e,
      overtime: Math.max(0, (e.loggedHours ?? 0) - (e.allocatedHours ?? 0))
    }));
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  resetSummary() {
    this.attendanceSummaryData = [];
    this.statusCounts$.next([]);
    this.totalEntries = 0;
     this.utilizationcount$.next([]);
    this.timesheetSummaryChartData = { labels: [], datasets: [] };
    this.timesheetutilizeSummaryChartData = { labels: [], datasets: [] };
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearRequestclienttimesheet();
  }
}