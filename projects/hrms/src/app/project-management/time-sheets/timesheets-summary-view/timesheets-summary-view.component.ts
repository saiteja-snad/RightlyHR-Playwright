import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { IResourceDetail } from '../../../timesheetmodel';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute } from '@angular/router';
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
@Component({
  selector: 'app-timesheets-summary-view',
  imports: [TimesheetsTabsComponent, ReactiveFormsModule, DatePicker, ChartModule, TranslateModule, CommonModule,
    ProjectManagementModuleInfoComponent, Select, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent,
    InfoIconComponent, ProgressBarModule],
  templateUrl: './timesheets-summary-view.component.html',
  styleUrl: './timesheets-summary-view.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class TimesheetsSummaryViewComponent {
  empdata = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
  datepickerForm!: FormGroup;
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
  // progress bar variables
  progressBarData: any;
  approved = 0;
  submitted = 0;
  rejected = 0;
  approvedColor = '#4CAF50';  // green
  submittedColor = '#FFC107'; // yellow
  rejectedColor = '#F44336';  // red

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService,
    public rbac: RbacService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.createDatepickerForm();
    this.route.queryParams.subscribe(params => {
      const resoureID = params['id'];
      if (resoureID) {
        this.employeeId = parseInt(resoureID)
        console.log(this.employeeId);
        this.getProjectSummary(resoureID);
      }
    });
    this.setDefaultmounth();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.projectTypeChart();
    this.estimatedActualChart();
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [null]
    });
  }

  setDefaultmounth() {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfMonth, endOfMonth]
    });
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.filter((emp: IResourceDetail) => emp.id !== EmployeeId).map((emp: IResourceDetail) => ({
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

  onSubmit() {
    // Check if form is valid (optional)

    // ✅ Trigger your existing API call
    this.page = 1; // Reset to first page on new filter apply
    const resoureID = this.datepickerForm.get('resourceId')?.value ||   this.employeeId
    this.getProjectSummary(resoureID);
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
        const data: TimesheetSummaryResponse = res?.data;
        this.projectTypeData = res?.data.graphSummary.projectWiseSummary;
        this.estimatedVsActualData = res?.data.graphSummary.allocatedVsActualSummary;
        this.progressBarData = res?.data.graphSummary.timesheetSummary;
        this.approved = this.progressBarData.approved;
        this.submitted = this.progressBarData.submitted;
        this.rejected = this.progressBarData.rejected;
        // this.attendanceSummaryData = data?.dailyData ?? [];
        this.projectTypeChart();
        this.estimatedActualChart();
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
          entries: item.entries ?? []
        }));
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

  get total(): number {
    return this.approved + this.submitted + this.rejected;
  }

  get approvedPercent(): number {
    return (this.approved / this.total) * 100;
  }

  get submittedPercent(): number {
    return (this.submitted / this.total) * 100;
  }

  get rejectedPercent(): number {
    return (this.rejected / this.total) * 100;
  }

  // Project Type (Pie)
  projectTypeChart() {
    if (!this.projectTypeData || this.projectTypeData.length === 0) return;
    // Extract labels and data from API response
    const labels = this.projectTypeData.map((item: any) => item.projectName);
    const data = this.projectTypeData.map((item: any) => item.hours);
    // Generate random colors for each project (optional)
    const backgroundColors = [
      '#FFD54F', '#E91E63', '#4DB6AC', '#64B5F6', '#81C784', '#3F51B5', '#FF8A65', '#BA68C8',
    ].slice(0, this.projectTypeData.length); // adjust for number of items
    // Assign chart data dynamically
    this.projectTypeGraphData = {
      labels: labels,
      datasets: [
        {
          label: 'Project Hours',
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    };
    // Chart options
    this.projectTypeGraphOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true }
        },
      },
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    if (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0) return;
    // Extract project names and corresponding data
    const labels = this.estimatedVsActualData.map((item: any) => item.projectName);
    const estimatedData = this.estimatedVsActualData.map((item: any) => item.estimatedHours);
    const actualData = this.estimatedVsActualData.map((item: any) => item.actualHours);
    const overdueData = this.estimatedVsActualData.map((item: any) => item.overDue);
    // Create chart datasets
    this.estimatedVsActualGraphData = {
      labels: labels,
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: '#1A237E',
          data: estimatedData,
          stack: 'Estimated' // separate stack
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: actualData,
          stack: 'ActualOverdue' // stacked with Overdue
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: overdueData,
          stack: 'ActualOverdue' // stacked on top of Actual
        }
      ]
    };
    // Chart options
    this.estimatedVsActualGraphOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false // hides the top "Resource Count" label
        }
      },
      scales: {
        x: {
          stacked: false, // Estimated shown separately from Actual+Overdue
          grid: { display: false },
          title: { display: false }
        },
        y: {
          stacked: true, // Actual + Overdue stacked vertically
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          },
        }
      }
    };
  }
}