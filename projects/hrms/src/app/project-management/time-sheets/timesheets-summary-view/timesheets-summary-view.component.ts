import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { IResourceDetail } from '../../../timesheetmodel';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../../preonboarding/src/app/http-services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { DatePicker } from 'primeng/datepicker';
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
@Component({
  selector: 'app-timesheets-summary-view',
  imports: [TimesheetsTabsComponent, ReactiveFormsModule, DatePicker, ChartModule, NgbPopover, TranslateModule, CommonModule, ProjectManagementModuleInfoComponent, Select, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './timesheets-summary-view.component.html',
  styleUrl: './timesheets-summary-view.component.scss'
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

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, public rbac: RbacService, private router: Router,private route: ActivatedRoute) { }
  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDatepickerForm();
        this.route.queryParams.subscribe(params => {
      const resoureID = params['id'];
      if (resoureID) {
        this.getProjectSummary(resoureID)
       
      }
    });
    
    this.setDefaultmounth();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
   
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
          this.resourcesList = res.data
            // ✅ Remove employee by ID
            .filter((emp: IResourceDetail) => emp.id !== EmployeeId)
            // ✅ Add fullName for dropdown
            .map((emp: IResourceDetail) => ({
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
    if (this.datepickerForm.invalid) {
      return;
    }

    // ✅ Trigger your existing API call
    this.page = 1; // Reset to first page on new filter apply
   const resoureID=  this.datepickerForm.get('resourceId')?.value
    this.getProjectSummary(resoureID);
  }


  getProjectSummary(resoureID:any) {

    const formValue = this.datepickerForm.value;
    const [startDate, endDate] = formValue.dateRange || [];

    const resourceId = formValue.resourceId ? `&resourceId=${formValue.resourceId}` : '';
    const start = startDate
      ? dayjs(startDate).format('YYYY-MM-DD')
      : dayjs().startOf('month').format('YYYY-MM-DD');

    const end = endDate
      ? dayjs(endDate).format('YYYY-MM-DD')
      : dayjs().endOf('month').format('YYYY-MM-DD');

    const url = `Timesheet/detailemployeesummary?resourceId=${resoureID || formValue.resourceId}&startDate=${start}&endDate=${end}${resourceId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        const data: TimesheetSummaryResponse = res?.data;
        // this.attendanceSummaryData = data?.dailyData ?? [];
        const resourceName = data?.resource;
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
        entries: item.entries ?? []


        }));
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
              value: parseFloat(`${h}.${m.toString().padStart(2, '0')}`),
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
        // utiliztionsummery charts data
        this.timesheetutilizeSummaryChartData = {
          datasets: [
            {
              data: utilizationArray.map((i) => i.value),
              backgroundColor: ['#4CAF50', '#FF9800'],
              borderWidth: 0,
            },
          ],
        };
        this.timesheetSummaryOptions = {
          cutout: '70%',
        };
        this.timesheetUtilizeSummaryOptions = {
          cutout: '70%',
          plugins: {
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const dataIndex = context.dataIndex;
                  const utilizationData = this.utilizationcount$.value;
                  return utilizationData[dataIndex]?.loggedHHMM || '';
                }
              }
            }
          }
        };
      },
      error: err => {
        this.loading = false
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



}


