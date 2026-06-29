import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbPopoverModule, NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdayLogs } from '../../Attendance/attendance-view/attendance-modal';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { AttendanceResponse, Permission, EmployeeStatusCount } from '../../Interfaces/dashboard.modal';
import { IDepartment } from '../../Interfaces/letters-model';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { ICategoryDetails } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-organization-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbPopoverModule, ModuleInfoIconComponent,
    ChartModule, Skeleton, AccordionModule, ProfileIconComponent, NoDataFoundComponent,
    DatePicker, TabsModule, Select],
  templateUrl: './organization-dashboard.component.html',
  styleUrl: './organization-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class OrganizationDashboardComponent implements AfterViewInit {
  greetingMessage = '';
  selectedEmployeeId: any;
  jobdetails: any;
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  availabilityLoading = false;
  showAvailabilityMessage = false;
  showAttendanceMessage = false;
  hasRealEvents: boolean = false;
  weaklyloghrsloader = false;
  subscription: any;
  private intervalId: any;
  empinfo = {} as Ipersonal;
  destroy$: Subject<boolean> = new Subject<boolean>();
  teamMemberArray: any[] = [];
  getTeamMemberArray: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  currentMonth!: number;
  nextMonth!: number;
  currentYear!: number;
  searchEmployeeText: string = '';
  leavesList: any[] = [];
  totalLeaves: any = {};
  todayChartData: any;
  todayChartOptions: any;
  totalLeavesChartData: any;
  totalLeavesChartOptions: any;
  currentDate: number = new Date().getDate();
  previousDate: any;
  startOfWeek: any;
  endOfWeek: any;
  totalHours: any;
  teamMembers: any[] = [];
  employeesBirthdays: any[] = [];
  teamavailabilityinfo = 'Displays your team’s current availability for the selected date, including In Office, WFH, On Leave, Half Day, Remote, and Absent statuses.';
  myteammemberinfo = 'Displays an overview of all team members in the organization, helping employees stay informed about their colleagues.';
  genderdiversityinfo = 'Displays the gender distribution of employees, giving a quick and clear view of workforce diversity.';
  Weeklyworklogsinfo = 'Shows a weekly summary of the hours that are logged, making it easy to track their work and productivity.';
  TodaysTimeEntryinfo = 'Provides an overview of today’s time entry, showing logged hours, active work time, and the previous day’s duration.';
  leavesConsumedinfo = 'Provides an overview of consumed leave balances categorized by leave type.';
  attendancoverviewinfo = 'Displays your attendance details for the selected date, including duty status, first in time, last out time, and the previous day’s log duration.'
  // legendList = [
  //   { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
  //   { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
  //   { key: 'wfh', label: 'WFH', color: '#FF1493' },
  //   { key: 'absent', label: 'Absent', color: '#FF0000' },
  //   { key: 'leave', label: 'Leave', color: '#8A2BE2' },
  //   { key: 'remote', label: 'Remote', color: '#EA362C' },
  //   { key: 'weekend', label: 'Weekend', color: '#32CD32' },
  //   { key: 'holiday', label: 'Holiday', color: '#FFA500' },
  //   { key: 'yetToLogin', label: 'Yet To Login', color: '#94A3B8' },
  // ];

legendList = [
  { key: 'yetToLogin', label: 'Yet To Login', color: '#94A3B8' },
    { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
    { key: 'absent', label: 'Absent', color: '#FF0000' },
    { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
    { key: 'wfh', label: 'WFH', color: '#FF1493' },
    { key: 'remote', label: 'Remote', color: '#EA362C' },
    { key: 'leave', label: 'Leave', color: '#8A2BE2' },
    { key: 'weekend', label: 'Weekend', color: '#32CD32' },
    { key: 'holiday', label: 'Holiday', color: '#FFA500' },
  ];



  genderTotal: number = 0;
  femaleCount: number = 0;
  maleCount: number = 0;
  weeklyWorkLogs: any[] = [];
  anniversaries: any[] = [];
  todayDurationLabel: string = "00:00:00";
  previousDurationLabel: string = "00:00:00";
  todayDurationPercent: number = 0;
  offCanvasData: any;
  OffCanvasemployeeList: any;
  ChartDataLabels = ChartDataLabels;
  datalabelUnderlinePlugin = {
    id: 'datalabelUnderline',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const isHorizontal = chart.config?.options?.indexAxis === 'y';
      const isStacked = chart.config?.options?.scales?.y?.stacked || chart.config?.options?.scales?.x?.stacked;
      const clickableLabelRegions: Array<{ left: number; right: number; top: number; bottom: number }> = [];
      const hasClickableLabels = chart.config?.options?.plugins?.datalabels?.cursor === 'pointer';

      if (isHorizontal) {
        // Check if user has permission to view employee list for gender chart
        const hasViewPermission = this.rbac.allowedToAccess('Headcount by Gender View Employee List.view');
        if (!hasViewPermission) {
          chart.$clickableLabelRegions = [];
          return;
        }

        chart.data.datasets.forEach((dataset: any, dsIndex: number) => {
          const meta = chart.getDatasetMeta(dsIndex);
          if (meta.hidden) return;
          meta.data.forEach((element: any, dataIndex: number) => {
            const value = dataset.data[dataIndex];
            if (!value) return;
            ctx.save();
            ctx.font = 'bold 12px sans-serif';
            const textWidth = ctx.measureText(String(value)).width;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // text starts at element.x + offset(4) + padding.left(4) = element.x + 8
            ctx.moveTo(element.x + 8, element.y + 7);
            ctx.lineTo(element.x + 8 + textWidth, element.y + 7);
            ctx.stroke();
            if (hasClickableLabels) {
              clickableLabelRegions.push({
                left: element.x + 8,
                right: element.x + 8 + textWidth,
                top: element.y - 8,
                bottom: element.y + 8
              });
            }
            ctx.restore();
          });
        });
      } else if (isStacked) {
        const numDatasets = chart.data.datasets.length;
        const numDataPoints = chart.data.datasets[0]?.data?.length || 0;
        for (let dataIndex = 0; dataIndex < numDataPoints; dataIndex++) {
          let total = 0;
          let topDatasetIndex = -1;
          for (let i = numDatasets - 1; i >= 0; i--) {
            const val = chart.data.datasets[i].data[dataIndex] || 0;
            if (val > 0 && topDatasetIndex === -1) topDatasetIndex = i;
            total += val;
          }
          if (!total || topDatasetIndex === -1) continue;
          const meta = chart.getDatasetMeta(topDatasetIndex);
          const element = meta.data[dataIndex];
          if (!element) continue;
          ctx.save();
          ctx.font = 'bold 10px sans-serif';
          const textWidth = ctx.measureText(String(total)).width;
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(element.x - textWidth / 2, element.y - 8);
          ctx.lineTo(element.x + textWidth / 2, element.y - 8);
          ctx.stroke();
          if (hasClickableLabels) {
            clickableLabelRegions.push({
              left: element.x - textWidth / 2,
              right: element.x + textWidth / 2,
              top: element.y - 20,
              bottom: element.y - 2
            });
          }
          ctx.restore();
        }
      } else {
        chart.data.datasets.forEach((dataset: any, dsIndex: number) => {
          const meta = chart.getDatasetMeta(dsIndex);
          if (meta.hidden) return;
          meta.data.forEach((element: any, dataIndex: number) => {
            const value = dataset.data[dataIndex];
            if (!value) return;
            ctx.save();
            ctx.font = 'bold 10px sans-serif';
            const textWidth = ctx.measureText(String(value)).width;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(element.x - textWidth / 2, element.y - 8);
            ctx.lineTo(element.x + textWidth / 2, element.y - 8);
            ctx.stroke();
            if (hasClickableLabels) {
              clickableLabelRegions.push({
                left: element.x - textWidth / 2,
                right: element.x + textWidth / 2,
                top: element.y - 20,
                bottom: element.y - 2
              });
            }
            ctx.restore();
          });
        });
      }
      chart.$clickableLabelRegions = clickableLabelRegions;
    },
    afterEvent: (chart: any, args: any) => {
      const event = args?.event;
      if (!event || !chart?.canvas) return;
      if (event.type === 'mouseout') {
        chart.canvas.style.cursor = 'default';
        return;
      }

      const regions = chart.$clickableLabelRegions || [];
      const isOverClickableLabel = regions.some((region: any) =>
        event.x >= region.left &&
        event.x <= region.right &&
        event.y >= region.top &&
        event.y <= region.bottom
      );

      chart.canvas.style.cursor = isOverClickableLabel ? 'pointer' : 'default';
    }
  };
  selectedDate!: Date;
  timeEntryLoader = false;
  consumedLeavesLoader = false;
  selectedWeek: Date[] | null = null;
  today = new Date();
  disabledDates: Date[] = [];
  intialLoading = false;
  iconPath: string = '';
  attendanceLoader = false;
  attendanceData: AttendanceResponse = {} as AttendanceResponse;
  currentDay!: number;
  chartLoader = false;
  employeeSelected = false;
  EmployeeInfoData: any;
  EmployeeInfoDataOptions: any;
  totalEmployeesCount: any;
  Inactive!: number;
  ACTDATA!: number;
  Active!: number;
  Trainee!: number;
  traineeactive!: number;
  traineeInactive!: number;
  PROBDATA!: number;
  activeContractCount!: number;
  prospectiveContractCount!: number;
  inActiveContractCount!: number;
  active = 'Active';
  activeCount: number = 0;
  activeEmplist = [] as any;
  getEmployeeInfo = [] as any;
  jobdata = {} as any;
  cardItems: any[] = [];
  todayMaxdate!: Date
  regularization_list: Permission[] = [];
  attendanceselectedDate!: Date;
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;
  previousMonthStartDate: any;
  departmentHeadCountChartData: any;
  departmentHeadCountChartDataOptions: any;
  departmentHeadCounts: any;
  departmentHeadCountsLoader = false;
  employeeOverviewInfo = 'Displays the organization’s employee count by current status, including Active, Probation, Active Trainees, Prospective, and Prospective Trainees.';
  departmentByHeadcountInfo = 'Displays the number of employees in each department across the organization.';
  punchPairs = [] as IdayLogs[];
  logsDuration!: string;
  breakDuration!: string;
  permissions_list: Permission[] = [];
  departmentDetails = [] as IDepartment[];
  isScreenLessThan1600 = window.innerWidth < 1600;
  // new joinees and exits variables
  newJoineesandExitsLoader = false;
  newJoineesandExitsData: any;
  newJoineesandExitsChartData: any;
  newJoineesandExitsOptionsData: any;
  date: Date[] | null = [
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  ];
  maxMonth: Date = new Date();
  joineesExitsOffcanvasTitle: string = '';
  joineesExitsOffcanvasList: any[] = [];
  joineesExitsOffcanvasType: string = '';
  // end of new joinees and exits variables
  // location based employee count variables
  LocationwiseEmployeeCountLoader = false;
  LocationwiseEmployeeCountData: any;
  selectedLocationId: number | null = null;
  locationDetails: any[] = [];
  // upcoming actions variables
  upcomingActionsLoader = false;
  upcomingActionsDate: Date[] | null = [
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  ];
  minUpcomingActionsMonth: Date = new Date();
  upcomingPendingActionsData: any;
  upcomingActionsChartData: any;
  upcomingActionsChartOptions: any;
  hasUpcomingActionsData = false;
  totalUpcomingActionsCount = 0;
  // approvals overview variables
  approvalsOverviewLoader = false;
  approvalsList: any[] = [];
  selectedApprovalEmployee: any;
  selectedEmployeeClaims: string[] | null = null;
  approvalsEmployeeClaimsLoader = false;
  // employee experience variables
  experienceDetailsLoader = false;
  experienceChartData: any;
  experienceChartOptions: any;
  hasExperienceData = false;
  // department headcount offcanvas variables
  departmentRawData: any[] = [];
  departmentOffcanvasTitle: string = '';
  departmentOffcanvasList: any[] = [];
  // experience offcanvas variables
  experienceRawData: any[] = [];
  experienceOffcanvasTitle: string = '';
  experienceOffcanvasList: any[] = [];
  // gender diversity offcanvas variables
  genderRawEmployees: any[] = [];
  genderOffcanvasTitle: string = '';
  genderOffcanvasList: any[] = [];
  // shift location offcanvas variables
  shiftLocationRawData: any[] = [];
  shiftLocationOffcanvasTitle: string = '';
  shiftLocationOffcanvasList: any[] = [];
  attendanceOffcanvasTitle: string = '';
  attendanceOffcanvasType: string = '';
  @ViewChild('departmentEmployeesList') departmentOffcanvasTemplate!: TemplateRef<any>;
  @ViewChild('experienceEmployeesList') experienceOffcanvasTemplate!: TemplateRef<any>;
  @ViewChild('genderEmployeesList') genderOffcanvasTemplate!: TemplateRef<any>;
  @ViewChild('shiftLocationEmployeesList') shiftLocationOffcanvasTemplate!: TemplateRef<any>;
  @ViewChild('attendanceEmployeesList') attendanceOffcanvasTemplate!: TemplateRef<any>;

  constructor(private http: HttpService, private router: Router, public modalService: NgbModal,
    private offcanvasService: NgbOffcanvas, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngAfterViewInit(): void { }

  ngOnInit(): void {
    this.intialLoading = true;
    this.setIconBasedOnTime();
    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    const firstDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    this.previousMonthStartDate = `${firstDayPrevMonth.getFullYear()}-${String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0')}-
    ${String(firstDayPrevMonth.getDate()).padStart(2, '0')}`;
    this.currentYear = new Date().getFullYear(); // e.g., 2025
    this.currentMonth = new Date().getMonth() + 1; // 1 (Jan) to 12 (Dec)
    this.currentDay = new Date().getDate();
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.previousDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
    this.currentDate = new Date().getDate();
    this.setCurrentWeek();
    this.getDepartment();
    this.getJobDetails();
    this.getAllEmployeeDetails();
    this.getTeamManagersDetails();
    this.getAllTeammembersList();
    this.gettodayloggedtime();
    this.selectedDate = new Date(); // current date by default
    this.getteamavliabletly(this.selectedDate);
    this.getWeeklyWorkLogHours();
    this.getCategoryempDetails(this.empinfo?.employeeId);
    this.getUpcomingActions();
    this.buildDisabledFutureWeekDates();
    this.intialLoading = false;
    this.getAttendenceLogsOfLoginedUser(this.employeedata.employeeId, this.currentYear, this.currentMonth, this.currentDay);
    this.getEmployeeStatusCount();
    this.getHeadCountByDepartment();
    this.getpreviousloggedtime();
    this.todayMaxdate = new Date();
    this.getNewJoineesAndExits();
    this.getAllLocations();
    this.getAttendanceReportData();
    this.getApprovalsOverview();
    this.getExperienceDetails();
    this.getTeam();
  }

  setIconBasedOnTime() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      // Morning
      this.greetingMessage = 'Good Morning';
    } else if (hour >= 12 && hour < 16) {
      // Afternoon
      this.greetingMessage = 'Good Afternoon';
    } else if (hour >= 16 && hour < 23) {
      // Evening
      this.greetingMessage = 'Good Evening';
    } else {
      // Night
      this.greetingMessage = 'Good Evening';
    }
  }

  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
        this.departmentDropdownOptions = [
          { departmentName: 'All', sno: null },
          { departmentName: 'No Department', sno: 0 },
          ...this.departmentDetails
        ];
        this.departDropdownOptions = [...this.departmentDropdownOptions];
      }
    });
  }

  getJobDetails() {
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails = data[0];
        this.getGenderCountChart();
      },
      error: (data: any) => {
      }
    });
  }

  getAttendenceLogsOfLoginedUser(empId: number, currentYear: number, currentMonth: number, currentDay: number) {
    this.attendanceLoader = true;
    // Calculate start and end dates for the current day
    const startDate = moment().year(currentYear).month(currentMonth - 1).date(currentDay).format('YYYY-MM-DD');
    const endDate = startDate; // Same day for both start and end
    this.subscription = this.http.getData(`v2/AttendanceData/employee/${empId}?fromdate=${startDate}&todate=${endDate}`).subscribe({
      next: (data: any) => {
        this.attendanceLoader = false;
        this.attendanceData = data;
      },
      error: (reason) => {
        this.attendanceData = {} as AttendanceResponse;
        this.attendanceLoader = false;
      },
    });
  }

  //function for to get the Employees count based on the status
  getEmployeeStatusCount() {
    this.subscription = this.http.getData(`Employeedata/get-employees-status-count`).subscribe({
      next: (data: any) => {
        this.employeesStatusCount = data.data as EmployeeStatusCount;
        this.chartLoader = true;
        this.Active = 0;
        this.Inactive = 0;
        this.ACTDATA = 0;
        this.PROBDATA = 0;
        this.traineeactive = 0;
        this.traineeInactive = 0;
        this.Trainee = 0;
        this.activeContractCount = 0;
        this.prospectiveContractCount = 0;
        this.inActiveContractCount = 0;
        const statusList = this.employeesStatusCount?.statusWiseCount;
        if (Array.isArray(statusList)) {
          for (const statusItem of statusList) {
            switch (statusItem.status) {
              case 'Active Employees':
                this.Active = statusItem.count ?? 0;
                break;
              case 'Inactive Employees':
                this.Inactive = statusItem.count ?? 0;
                break;
              case 'Prospective Employees':
                this.ACTDATA = statusItem.count ?? 0;
                break;
              case 'Probation Employees':
                this.PROBDATA = statusItem.count ?? 0;
                break;
              case 'Active Trainees':
                this.traineeactive = statusItem.count ?? 0;
                break;
              case 'Inactive Trainees':
                this.traineeInactive = statusItem.count ?? 0;
                break;
              case 'Prospective Trainees':
                this.Trainee = statusItem.count ?? 0;
                break;
              case 'Active Contract Employees':
                this.activeContractCount = statusItem.count ?? 0;
                break;
              case 'Inactive Contract Employees':
                this.inActiveContractCount = statusItem.count ?? 0;
                break;
              case 'Prospective Contract Employees':
                this.prospectiveContractCount = statusItem.count ?? 0;
                break;
            }
          }
        } else {
          console.warn('statusWiseCount is not an array:', statusList);
        }
        this.updateCardItems();
      },
      error: (reason) => {
        this.chartLoader = false;
      },
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empinfo?.employeeId;
    const satus = ['Active', 'Trainee Active'];
    this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  getTeamManagersDetails() {
    const EmployeeId = this.empinfo?.employeeId;
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((emp: any) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
            return {
              ...emp,
              fullName
            };
          });
          //  Alphabetical sorting by firstName
          this.getEmployeeInfo.sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
          );
        }
      },
      error: (err) => console.error(err)
    });
  }

  updateCardItems() {
    this.cardItems = [
      {
        header: 'Active',
        items: [
          {
            label: 'Employees',
            link: '/employee-management/active/employees',
            count: this.Active,
            color: '#8B5CF6'
          },
          {
            label: 'Trainees',
            link: '/employee-management/active/interns',
            count: this.traineeactive,
            color: '#53D33A'
          },
          {
            label: 'Contractors',
            link: '/employee-management/active/contract',
            count: this.activeContractCount,
            color: '#00B5AD'
          }
        ]
      },
      {
        header: 'Probation',
        items: [
          {
            label: 'Employees',
            link: '/employee-management/probation/employees',
            count: this.PROBDATA,
            color: '#FF8000'
          }
        ]
      },
      {
        header: 'Prospective',
        items: [
          {
            label: 'Employees',
            link: '/employee-management/prospective/employees',
            count: this.ACTDATA,
            color: '#00ABF9'
          },
          {
            label: 'Trainees',
            link: '/employee-management/prospective/interns',
            count: this.Trainee,
            color: '#1064CA'
          },
          {
            label: 'Contractors',
            link: '/employee-management/prospective/contract',
            count: this.prospectiveContractCount,
            color: '#FFC107'
          }
        ]
      },
      {
        header: 'Inactive',
        items: [
          {
            label: 'Employees',
            link: '/employee-management/inactive/employees',
            count: this.Inactive,
            color: '#334155'
          },
          {
            label: 'Trainees',
            link: '/employee-management/inactive/interns',
            count: this.traineeInactive,
            color: '#973636'
          },
          {
            label: 'Contractors',
            link: '/employee-management/inactive/contract',
            count: this.inActiveContractCount,
            color: '#E05D5D'
          }
        ]
      },
    ];
    this.initChart();
  }

  initChart() {
    const data = [
      this.Active,
      this.Inactive,
      this.PROBDATA,
      this.ACTDATA,
      this.traineeactive,
      this.Trainee,
      this.traineeInactive,
      this.activeContractCount,
      this.inActiveContractCount,
      this.prospectiveContractCount
    ];

    const backgroundColors = [
      '#8B5CF6', // Active
      '#334155', // Inactive
      '#FF8000', // Probation
      '#00ABF9', // Prospective
      '#53D33A', // Active Trainees
      '#1064CA', // Prospective Trainees
      '#973636', // Inactive Trainees
      '#00B5AD', // Active Contractors
      '#E05D5D', // Inactive Contractors
      '#FFC107'  // Prospective Contractors
    ];

    this.totalEmployeesCount = data.reduce((sum, val) => sum + (val || 0), 0);

    this.EmployeeInfoData = {
      labels: [
        'Active',
        'Inactive',
        'Probation',
        'Prospective',
        'Active Trainees',
        'Prospective Trainees',
        'Inactive Trainees',
        'Active Contractors',
        'Inactive Contractors',
        'Prospective Contractors'
      ],
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }
      ]
    };

    this.EmployeeInfoDataOptions = {
      cutout: '70%',
      plugins: {
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          displayColors: true,
          callbacks: {
            title: (context: any) => context[0].label,
            label: (context: any) => ` ${context.raw}`
          }
        },
        legend: {
          display: false   // recommended since you already show custom cards
        }
      }
    };

    this.chartLoader = false;
  }

  getHeadCountByDepartment() {
    this.departmentHeadCountsLoader = true;
    this.subscription = this.http.getData(`v2/Employeedata/department-headcount`).subscribe({
      next: (data: any) => {
        this.setDepartmentHeadCountChart(data);
        this.departmentHeadCountsLoader = false;
      },
      error: (reason) => {
        this.attendanceData = {} as AttendanceResponse;
        this.departmentHeadCountsLoader = false;
      },
    });
  }

  setDepartmentHeadCountChart(response: any) {
    const departments = response.data;
    this.departmentRawData = departments;
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const labels = departments.map((d: any) => d.departmentName);
    const headCounts = departments.map((d: any) => d.headCount);
    const backgroundColors = departments.map((d: any) => d.meta?.graphData?.color ? d.meta.graphData.color : primaryColor);

    const maxValue = Math.max(...headCounts, 0);
    let stepSize = 5;
    if (maxValue > 50) stepSize = 10;
    if (maxValue > 100) stepSize = 20;
    if (maxValue > 200) stepSize = 50;
    const suggestedMax = Math.ceil((maxValue * 1.15) / stepSize) * stepSize;

    this.departmentHeadCountChartData = {
      labels,
      datasets: [
        {
          label: 'Head Count',
          data: headCounts,
          barThickness: 24,
          backgroundColor: backgroundColors,
        }
      ]
    };
    this.departmentHeadCountChartDataOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 25 } },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.raw}`
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#000',
          font: {
            weight: 'bold',
            size: 10
          },
          formatter: (value: any) => value,
          cursor: 'pointer',
          listeners: {
            click: (context: any) => {
              const dept = this.departmentRawData[context.dataIndex];
              if (!dept?.headCount) return;
              this.openDepartmentOffcanvas(dept);
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: suggestedMax,
          ticks: {
            stepSize: stepSize
          }
        }
      }
    };
  }

  openDepartmentOffcanvas(dept: any) {
    this.searchEmployeeText = '';
    this.departmentOffcanvasTitle = dept.departmentName;
    this.departmentOffcanvasList = (dept.employees || []).map((emp: any) => ({
      ...emp,
      profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
    }));
    this.offcanvasService.open(this.departmentOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredDepartmentEmployees() {
    return this.searchEmployeeText
      ? this.departmentOffcanvasList.filter((emp: any) => this.matchesSearch(emp))
      : this.departmentOffcanvasList;
  }

  getAllTeammembersList() {
    this.loading = true;
    const EmployeeId = this.empinfo?.employeeId;
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (responseData: any) => {
        this.loading = false;
        this.teamMembers = responseData.map((emp: any) => {
          const fullName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
          return {
            id: emp.employeeId,
            name: fullName,
            role: emp.jobRole,
            photo: this.getImageUrl(emp.profilePic)
          };
        })
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  private getImageUrl = (imagePath: string): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('Profilepics/')) return `${environment.viewUrl}${imagePath}`;
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getSuffix(num: number): string {
    if (!num) return '';
    const lastDigit = num % 10;
    const lastTwo = num % 100;
    if (lastTwo >= 11 && lastTwo <= 13) return `${num}th`;
    switch (lastDigit) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  }

  onCheckemployee(employeedId: any) {
    this.consumedLeavesLoader = true;
    this.selectedEmployeeId = employeedId;
    this.employeeSelected = !!employeedId;
    if (employeedId) {
      this.getCategoryempDetails(employeedId);
    } else {
      this.getCategoryempDetails(this.empinfo?.employeeId)
    }
  }

  getCategoryempDetails(empId: any) {
    this.consumedLeavesLoader = true;
    this.http.getData(`LeaveEntitlements/v2/employee/${empId}?year=${this.currentYear}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leavesList = res.data.map((item: any) => {
            const used = (item.utilizedDays || 0) + (item.booked || 0);
            return {
              name: item.category?.name,
              allowed: item.allowedDays,
              used,
              percentage: item.allowedDays === 0 ? 0 : (used / item.allowedDays) * 100,
              color: item.category?.categoryColor
            };
          });
          // NEW: Total leaves calculation
          const totalAllowed = res.data.reduce((sum: number, x: any) => sum + x.allowedDays, 0);
          const totalUsed = res.data.reduce((sum: number, x: any) => sum + (x.utilizedDays || 0) + (x.booked || 0), 0);
          this.totalLeaves = {
            allowed: totalAllowed,
            used: totalUsed,
            percentage: totalAllowed === 0 ? 0 : (totalUsed / totalAllowed) * 100
          };
        }
        this.buildTotalLeavesChart();
        this.consumedLeavesLoader = false;
      }
    });
  }

  buildTotalLeavesChart() {
    this.totalLeavesChartData = {
      datasets: [
        {
          data: [
            this.totalLeaves.used,
            this.totalLeaves.allowed - this.totalLeaves.used
          ],
          backgroundColor: ["#0B3A83", "#E5E7EB"],
          borderWidth: 0
        }
      ]
    };
    this.totalLeavesChartOptions = {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  getFullName(b: { firstName: string; middleName?: string; lastName: string }): string {
    return [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ');
  }

  // Custom carousel indicator properties
  currentCarouselIndex = 0;
  get activeIndicatorIndex() {
    return this.currentCarouselIndex % 3;
  }

  onCarouselPageChange(event: any) {
    this.currentCarouselIndex = event.page;
  }

  genderCountLoader = false;
  genderChartData: any = {};
  genderChartOptions: any = {};
  hasGenderData: boolean = false;
  selectedDepartmentId: number | null = null;
  departmentDropdownOptions: any[] = [];
  onDepartmentChange(event: any) {
    this.genderCountLoader = true;
    const selectedId = event.value;
    if (selectedId === null || selectedId === undefined) {
      this.getGenderCountChart();
    } else {
      this.getGenderCountChart(selectedId);
    }
  }

  getGenderCountChart(departmentDetailsid?: any) {
    this.genderCountLoader = true;
    let apiUrl = 'v2/Employeedata/DepartmentGenderCount';
    if (departmentDetailsid !== null && departmentDetailsid !== undefined) {
      apiUrl += `?deptId=${departmentDetailsid}`;
    }
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.genderCountLoader = false;
        this.genderTotal = data?.headCount || 0;
        const genders = data?.genders || [];
        // Proper No Data Condition
        if (!genders.length || this.genderTotal === 0) {
          this.hasGenderData = false;
          this.genderChartData = null;
          return;
        }
        this.hasGenderData = true;
        const labels = genders.map((item: any) => item.gender);
        const counts = genders.map((item: any) => item.count);
        this.genderRawEmployees = data?.employees || [];
        // ADD THIS HERE
        const maxValue = Math.max(...counts);
        let stepSize = 5;
        if (maxValue > 50) stepSize = 10;
        if (maxValue > 100) stepSize = 20;
        if (maxValue > 200) stepSize = 50;
        const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize;
        const colors = labels.map((gender: string) => {
          if (gender === 'Female') return '#E91CAB';
          if (gender === 'Male') return '#1E88E5';
          return '#B146C3';
        });
        this.genderChartData = {
          labels,
          datasets: [{
            label: 'Count',
            data: counts,
            backgroundColor: colors,
            barThickness: 10,
            borderRadius: {
              topRight: 12,
              bottomRight: 12,
              topLeft: 0,
              bottomLeft: 0
            }
          }]
        };
        this.genderChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          layout: { padding: { right: 30 } },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'right',
              color: '#000',
              font: { weight: 'bold', size: 12 },
              formatter: (value: number) => value,
              cursor: this.rbac.allowedToAccess('Headcount by Gender View Employee List.view') ? 'pointer' : 'default',
              listeners: {
                click: (context: any) => {
                  if (!this.rbac.allowedToAccess('Headcount by Gender View Employee List.view')) return;
                  const gender = labels[context.dataIndex];
                  const count = counts[context.dataIndex];
                  if (!count) return;
                  this.openGenderOffcanvas(gender, count);
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: suggestedMax,
              ticks: {
                stepSize: stepSize
              },
              grid: { display: false }
            },
            y: {
              grid: { display: false }
            }
          }
        };
      },
      error: (err: any) => {
        this.genderCountLoader = false;
        this.hasGenderData = false;
        this.genderChartData = null;
        console.error('Error fetching gender chart:', err);
      }
    });
  }

  openGenderOffcanvas(gender: string, count: number) {
    if (!count) return;
    this.searchEmployeeText = '';
    this.genderOffcanvasTitle = gender;
    this.genderOffcanvasList = this.genderRawEmployees
      .filter((emp: any) => emp.gender === gender)
      .map((emp: any) => ({
        ...emp,
        profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
      }));
    this.offcanvasService.open(this.genderOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredGenderEmployees() {
    return this.searchEmployeeText ? this.genderOffcanvasList.filter((emp: any) => this.matchesSearch(emp)) : this.genderOffcanvasList;
  }

  openModalLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static', });
  }

  onDateChange(date: Date) {
    this.availabilityLoading = true;
    this.getteamavliabletly(date);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  teamSummary: any = {};
  teamTotal: number = 0;
  teamChartData: any = {};
  teamChartOptions: any = {};
  selectedDepartId: number | null = null;
  departDropdownOptions: any[] = [];
  onDepartChange(event: any) {
    this.availabilityLoading = true;
    const selectedId = event.value;
    this.selectedDepartId = selectedId;
    this.getteamavliabletly(this.selectedDate);
  }

  getteamavliabletly(date: Date) {
    const formattedDate = this.formatDate(date);
    this.availabilityLoading = true;
    this.showAvailabilityMessage = false;

    setTimeout(() => {
      if (this.availabilityLoading) {
        this.showAvailabilityMessage = true;
      }
    }, 2000);

    let apiUrl = `v2/Employeedata/OrgSummary?date=${formattedDate}`;
    if (this.selectedDepartId !== null && this.selectedDepartId !== undefined) {
      apiUrl += `&deptId=${this.selectedDepartId}`;
    }
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.availabilityLoading = false;
        this.showAvailabilityMessage = false;
        this.teamSummary = res.summary;
        this.OffCanvasemployeeList = res.employees;
        // Total = all except absent
        this.teamTotal = (this.teamSummary.inOffice || 0) + (this.teamSummary.halfDay || 0) + (this.teamSummary.wfh || 0)
          + (this.teamSummary.leave || 0) + (this.teamSummary.absent || 0) + (this.teamSummary.remote || 0) +
          (this.teamSummary.weekend || 0) + (this.teamSummary.holiday || 0) + (this.teamSummary.yetToLogin || 0);
        this.buildTeamChart();
      },
      error: (err: any) => {
        this.availabilityLoading = false;
        this.showAvailabilityMessage = false;
        console.error('Error fetching team availability:', err);
      }
    });
  }

  buildTeamChart() {
    const summary = this.teamSummary;
    // Keys to display (order matters)
    const keys = ["inOffice", "halfDay", "wfh", "leave", "absent", "remote", "weekend", "holiday", "yetToLogin"];
    // Convert keys into labels (formatted text)
    const labels: string[] = keys.map(x =>
      x.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
    );
    // Values for chart
    const chartData = keys.map(k => summary[k] || 0);
    // Matching colors (same order as keys)
    const colors = ["#1E90FF", "#FFD700", "#FF1493", "#8A2BE2", "#FF0000", "#EA362C", "#32CD32", "#FFA500", "#94A3B8"];
    this.teamChartData = {
      labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: colors,
          borderWidth: 3,             // gap size
          borderColor: '#ffffff',    // match card background color
          hoverOffset: 0,
          borderRadius: 1,
        }
      ]
    };
    this.teamChartOptions = {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
    };
  }

  gettodayloggedtime() {
    this.timeEntryLoader = true;
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?year=${this.currentYear}&month=${this.currentMonth}&date=${this.currentDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const today = res?.data?.attendanceData?.find((x: any) => x.date === this.currentYear + '-' + this.currentMonth + '-' + this.currentDate) ?? res?.data?.attendanceData?.[0];
        const totalDuration = today?.duration?.totalDuration ?? "00:00:00";
        this.todayDurationLabel = totalDuration;
        const workedSeconds = this.timeToSeconds(totalDuration);
        const fullDaySeconds = 8 * 3600; // 8 hours
        this.todayDurationPercent = Math.min((workedSeconds / fullDaySeconds) * 100, 100);
        this.buildCircularChart();
        this.timeEntryLoader = false;
      },
      error: err => console.log(err),
    });
  }

  getpreviousloggedtime() {
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?fromdate=${this.previousMonthStartDate}&todate=${this.previousDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const attendanceData = res?.data?.attendanceData || [];
        // Find the last day with totalDuration > 00:00:00, excluding current date
        const currentDateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(this.currentDate).padStart(2, '0')}`;
        const previousDay = attendanceData.filter((x: any) => x.date !== currentDateStr && x.duration?.totalDuration !== '00:00:00').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const totalDuration = previousDay?.duration?.totalDuration ?? "00:00:00";
        this.previousDurationLabel = totalDuration;
      },
      error: err => console.log(err),
    });
  }

  timeToSeconds(time: string | null | undefined): number {
    if (!time || !time.includes(':')) return 0;
    const parts = time.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;
    return h * 3600 + m * 60 + s;
  }

  buildCircularChart() {
    this.todayChartData = {
      datasets: [
        {
          data: [this.todayDurationPercent, 100 - this.todayDurationPercent],
          backgroundColor: ["#0B3A83", "#E5E7EB"],
          borderWidth: 0
        }
      ]
    };
    this.todayChartOptions = {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      interaction: {
        mode: false,
      },
      hover: {
        mode: null,
        intersect: false,
      },
      events: []
    };
  }

  setCurrentWeek() {
    const start = moment().startOf('isoWeek');
    const end = moment().endOf('isoWeek');
    this.startOfWeek = start.format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = end.format('YYYY-MM-DDTHH:mm:ss');
    this.selectedWeek = [start.toDate(), end.toDate()];
  }

  onWeekSelect(date: Date) {
    const start = moment(date).startOf('isoWeek');
    const end = moment(date).endOf('isoWeek');
    // Block future weeks
    if (start.isAfter(moment().startOf('isoWeek'))) {
      return;
    }
    this.startOfWeek = start.format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = end.format('YYYY-MM-DDTHH:mm:ss');
    this.selectedWeek = [start.toDate(), end.toDate()];
    this.getWeeklyWorkLogHours();
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  }

  getWeeklyWorkLogHours() {
    this.weaklyloghrsloader = true;
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?fromdate=${this.startOfWeek}&todate=${this.endOfWeek}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const attendance = res.data.attendanceData;
        // Prepare weeklyWorkLogs for template
        this.weeklyWorkLogs = attendance.map((item: any) => ({
          day: moment(item.date).format('dddd'),
          time: item.duration.totalDuration,
          status: item.displayStatus.status,
          statusColor: item.displayStatus.colour
        }));
        // Calculate total hours of the week
        this.totalHours = this.sumDurations(
          attendance.map((item: any) => item.duration.totalDuration)
        );
        this.weaklyloghrsloader = false;
      },
      error: (err) => {
        this.weaklyloghrsloader = false;
      }
    });
  }

  // Sum durations in HH:mm:ss format
  sumDurations(durations: string[]): string {
    let totalSeconds = 0;
    durations.forEach((time) => {
      const [h, m, s] = time.split(':').map(Number);
      totalSeconds += h * 3600 + m * 60 + s;
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getDobWithCurrentYear(dob: string) {
    const date = new Date(dob);
    const today = new Date();
    // Set year as current year first
    date.setFullYear(today.getFullYear());
    // If that birthday already passed → move to next year
    if (date < today) {
      date.setFullYear(today.getFullYear() + 1);
    }
    return date;
  }

  getannuservierWithCurrentYear(dob: string) {
    const date = new Date(dob);
    const today = new Date();
    // Set anniversary to the current year first
    date.setFullYear(today.getFullYear());
    // If the anniversary already passed this year → move to next year
    if (date < today) {
      date.setFullYear(today.getFullYear() + 1);
    }
    return date;
  }

  nagvition() {
    this.router.navigate(['/myinfo/job/team-members']);
  }

  myattendance() {
    this.router.navigate(['/attendance']);
  }

  processedOffcanvasEmployees: any[] = [];
  openOffcanvas(content: any, data: any) {
    this.searchEmployeeText = '';
    this.offCanvasData = data;
    const key = data?.key;
    const list = this.OffCanvasemployeeList?.[key] || [];
    this.processedOffcanvasEmployees = list.map((emp: any) => ({
      ...emp,
      profilePicUrl: this.getImageUrl(emp.profilePic)
    }));
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  dayLogsData(Value: any, date: Date, totalduration: any, permissions: any, regularizations: any, breakDuration: any) {
    this.logsDuration = totalduration;
    this.attendanceselectedDate = date;
    this.permissions_list = permissions;
    this.regularization_list = regularizations;
    this.breakDuration = breakDuration;
    if (Value) {
      this.punchPairs = Value;
    } else {
      this.punchPairs = [];
    }
  }

  getFilteredEmployees() {
    return this.searchEmployeeText ? this.processedOffcanvasEmployees.filter((emp: any) => this.matchesSearch(emp)) : this.processedOffcanvasEmployees;
  }

  close() {
    this.offcanvasService.dismiss();
  }

  buildDisabledFutureWeekDates() {
    const today = moment();
    const endOfCurrentWeek = moment().endOf('isoWeek');
    const maxDisableDate = moment().add(1, 'year'); // reasonable future limit
    const disabled: Date[] = [];
    let cursor = endOfCurrentWeek.clone().add(1, 'day');
    while (cursor.isSameOrBefore(maxDisableDate)) {
      disabled.push(cursor.toDate());
      cursor.add(1, 'day');
    }
    this.disabledDates = disabled;
  }

  get noEventAccess(): boolean {
    return (
      !this.rbac.allowedToAccess('Upcoming Work Anniversaries.view') &&
      !this.rbac.allowedToAccess('Upcoming Birthdays.view') &&
      !this.rbac.allowedToAccess('Today Events.view')
    );
  }

  getLeaveChipStyle(color: string) {
    if (!color) return {};
    return {
      'border-color': color,
      'color': color,
      'background-color': this.hexToRgba(color, 0.05) // 5% opacity
    };
  }

  hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // new joinees and exits functions
  checkdates(value: Date[]) {
    if (!value?.[0] || !value?.[1]) return;
    this.date = value;
    this.newJoineesandExitsLoader = true;
    this.getNewJoineesAndExits();
  }

  getNewJoineesAndExits() {
    this.newJoineesandExitsLoader = true;
    const startDate = moment(this.date?.[0] ?? new Date()).format('YYYY-MM-DD');
    const endDate = moment(this.date?.[1] ?? this.date?.[0] ?? new Date()).format('YYYY-MM-DD');
    this.http.getData(`v2/Employeedata/newjoineesnexitscount?fromDate=${startDate}&toDate=${endDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.newJoineesandExitsData = res;
        this.buildNewJoineesAndExitsChart();
        this.newJoineesandExitsLoader = false;
      },
      error: (err) => {
        this.newJoineesandExitsLoader = false;
        this.newJoineesandExitsData = null;
      }
    });
  }

  buildNewJoineesAndExitsChart() {
    if (!this.newJoineesandExitsData) return;
    const newJoineesCount = this.newJoineesandExitsData.newJoineesCount || 0;
    const exitsCount = this.newJoineesandExitsData.exitsCount || 0;
    this.newJoineesandExitsChartData = {
      labels: ['New Joinees', 'Exits'],
      datasets: [
        {
          data: [newJoineesCount, exitsCount],
          backgroundColor: ['#10B981', '#EF4444'],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 0,
          borderRadius: 1,
        }
      ]
    };
    this.newJoineesandExitsOptionsData = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  get hasJoineesAndExits(): boolean {
    return this.newJoineesandExitsData?.newJoineesCount > 0 || this.newJoineesandExitsData?.exitsCount > 0;
  }

  openJoineesExitsOffcanvas(content: any, key: string, title: string) {
    this.searchEmployeeText = '';
    this.joineesExitsOffcanvasTitle = title;
    this.joineesExitsOffcanvasType = key;
    const rawList = this.newJoineesandExitsData?.[key] || [];
    this.joineesExitsOffcanvasList = rawList.map((emp: any) => {
      const profilePicUrl = emp.profilePic ? this.getImageUrl(emp.profilePic) : null;
      return { ...emp, profilePicUrl };
    });
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredJoineesExits() {
    return this.searchEmployeeText
      ? this.joineesExitsOffcanvasList.filter((emp: any) => this.matchesSearch(emp))
      : this.joineesExitsOffcanvasList;
  }

  // locationwise employee count functions
  shiftLocationChartData: any;
  shiftLocationChartOptions: any;
  hasShiftLocationData: boolean = false;
  getAllLocations(): void {
    this.http.getData('JobLocation').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const locations = res.jobLocations || [];
        this.locationDetails = locations.map((loc: any) => ({
          label: loc.jobLocationName,
          value: loc.id
        }));
        // Initial API call with employeeId
        this.getLocationwiseEmployeeCount();
      },
      error: err => console.error('Error fetching locations:', err)
    });
  }

  onLocationChange(event: any) {
    this.LocationwiseEmployeeCountLoader = true;
    this.selectedLocationId = event.value;
    this.getLocationwiseEmployeeCount();
  }

  getLocationwiseEmployeeCount() {
    this.LocationwiseEmployeeCountLoader = true;
    let url = '';
    if (this.selectedLocationId) {
      url = `v2/Employeedata/locationwiseemployeesoverview?locationId=${this.selectedLocationId}`;
    } else {
      url = `v2/Employeedata/locationwiseemployeesoverview?employeeId=${this.empinfo.employeeId}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.LocationwiseEmployeeCountData = res;
        this.buildShiftLocationChart();
        this.LocationwiseEmployeeCountLoader = false;
      },
      error: () => {
        this.LocationwiseEmployeeCountLoader = false;
        this.LocationwiseEmployeeCountData = null;
        this.hasShiftLocationData = false;
      }
    });
  }

  buildShiftLocationChart() {
    // Handle both single object and array responses
    let dataArray = this.LocationwiseEmployeeCountData;
    if (!Array.isArray(dataArray)) {
      if (dataArray && typeof dataArray === 'object') {
        dataArray = [dataArray];
      } else {
        this.hasShiftLocationData = false;
        return;
      }
    }
    this.shiftLocationRawData = dataArray;

    // Collect all unique shift names across all locations
    const allShifts = new Set<string>();
    const subLocationLabels: string[] = [];

    dataArray.forEach((location: any) => {
      location.subLocations?.forEach((subLoc: any) => {
        subLocationLabels.push(subLoc.subLocationName);
        subLoc.shifts?.forEach((shift: any) => {
          allShifts.add(shift.shiftName);
        });
      });
    });

    if (subLocationLabels.length === 0 || allShifts.size === 0) {
      this.hasShiftLocationData = false;
      return;
    }

    this.hasShiftLocationData = true;

    // Generate colors for each shift
    const shiftColors: { [key: string]: string } = {};
    const colorPalette = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];
    Array.from(allShifts).forEach((shift, index) => {
      shiftColors[shift] = colorPalette[index % colorPalette.length];
    });

    // Create datasets for each shift
    const datasets = Array.from(allShifts).map(shiftName => {
      const data: number[] = [];
      dataArray.forEach((location: any) => {
        location.subLocations?.forEach((subLoc: any) => {
          const shift = subLoc.shifts?.find((s: any) => s.shiftName === shiftName);
          data.push(shift ? shift.employeeCount : 0);
        });
      });
      return {
        label: shiftName,
        data: data,
        backgroundColor: shiftColors[shiftName],
        barThickness: 24
      };
    });

    this.shiftLocationChartData = {
      labels: subLocationLabels,
      datasets: datasets
    };

    const allCounts = datasets.flatMap((ds: any) => ds.data);
    const maxValue = Math.max(...allCounts, 0);
    let stepSize = 5;
    if (maxValue > 50) stepSize = 10;
    if (maxValue > 100) stepSize = 20;
    if (maxValue > 200) stepSize = 50;
    const suggestedMax = Math.ceil((maxValue * 1.15) / stepSize) * stepSize;

    this.shiftLocationChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 25 } },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              return `${context[0].label}`;
            },
            label: (context: any) => {
              return `${context.dataset.label}: ${context.raw}`;
            }
          }
        },
        datalabels: {
          display: (context: any) => {
            const datasets = context.chart.data.datasets;
            const dataIndex = context.dataIndex;
            for (let i = context.datasetIndex + 1; i < datasets.length; i++) {
              if (datasets[i].data[dataIndex] > 0) {
                return false;
              }
            }
            return true;
          },
          anchor: 'end',
          align: 'end',
          color: '#000',
          cursor: 'pointer',
          font: {
            weight: 'bold',
            size: 10
          },
          formatter: (value: any, context: any) => {
            let total = 0;
            context.chart.data.datasets.forEach((dataset: any) => {
              total += dataset.data[context.dataIndex] || 0;
            });
            return total;
          },
          listeners: {
            click: (context: any) => {
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              const shiftName = datasets[datasetIndex]?.label;
              const subLocations: any[] = [];

              dataArray.forEach((location: any) => {
                location.subLocations?.forEach((subLoc: any) => subLocations.push(subLoc));
              });

              const subLoc = subLocations[dataIndex];
              const shift = subLoc?.shifts?.find((s: any) => s.shiftName === shiftName);
              if (!shift?.employeeCount) return;
              this.openShiftLocationOffcanvas(subLoc.subLocationName, shiftName, shift.employees || []);
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: suggestedMax,
          ticks: {
            stepSize: stepSize
          }
        }
      }
    };
  }

  openShiftLocationOffcanvas(subLocationName: string, shiftName: string, employees: any[]) {
    this.searchEmployeeText = '';
    this.shiftLocationOffcanvasTitle = `${subLocationName} - ${shiftName}`;
    this.shiftLocationOffcanvasList = employees.map((emp: any) => ({
      ...emp,
      profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
    }));
    this.offcanvasService.open(this.shiftLocationOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredShiftLocationEmployees() {
    return this.searchEmployeeText
      ? this.shiftLocationOffcanvasList.filter((emp: any) => this.matchesSearch(emp))
      : this.shiftLocationOffcanvasList;
  }

  // attendancereport functions
  attendanceReportData: any;
  attendanceEmployeesList: any[] = [];
  attendanceChartData: any;
  attendanceChartOptions: any;
  hasAttendanceReportData: boolean = false;
  attendanceReportLoader: boolean = false;
  totalAttendanceCount: number = 0;
  attendanceReportDate: Date = new Date();
  maxAttendanceReportDate: Date = new Date();
  minAttendanceReportDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  getAttendanceReportData() {
    this.attendanceReportLoader = true;
    this.showAttendanceMessage = false;

    setTimeout(() => {
      if (this.attendanceReportLoader) {
        this.showAttendanceMessage = true;
      }
    }, 2000);

    const selectedDate = moment(this.attendanceReportDate || new Date());
    const formattedDate = selectedDate.format('YYYY-MM-DD');
    this.http.getData(`v2/Employeedata/OrgAttendanceStatus?date=${formattedDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.attendanceReportLoader = false;
        this.showAttendanceMessage = false;
        this.attendanceReportData = res?.summary;
        this.attendanceEmployeesList = res?.employees || [];
        const summary = this.attendanceReportData;
        this.totalAttendanceCount = (summary?.onTime || 0) + (summary?.lateLogin || 0) + (summary?.earlyLogout || 0)
        + (summary?.hoursDeficit || 0) + (summary?.breakExceeded || 0) + (summary?.permission || 0);
        const values = [
          summary?.onTime || 0,
          summary?.lateLogin || 0,
          summary?.earlyLogout || 0,
          summary?.hoursDeficit || 0,
          summary?.breakExceeded || 0,
          summary?.permission || 0
        ];
        const total = values.reduce((a, b) => a + b, 0);
        this.hasAttendanceReportData = total > 0;
        this.attendanceChartData = {
          labels: ['On Time', 'Late Login', 'Early Logout', 'Hours Deficit', 'Break Exceeded Hours', 'Permissions'],
          datasets: [
            {
              data: values,
              backgroundColor: [
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#6366F1',
                '#06B6D4',
                '#8B5CF6'
              ]
            }
          ]
        };
        this.attendanceChartOptions = {
          responsive: true,
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
        };
        this.attendanceReportLoader = false;
      },
      error: () => {
        this.attendanceReportData = null;
        this.attendanceEmployeesList = [];
        this.hasAttendanceReportData = false;
        this.attendanceReportLoader = false;
        this.showAttendanceMessage = false;
      }
    });
  }

  getAttendanceEmployees(type: string) {
    return this.attendanceEmployeesList.filter((emp: any) => {
      switch (type) {
        case 'onTime': return emp.isOnTime;
        case 'lateLogin': return emp.isLateLogin;
        case 'earlyLogout': return emp.isEarlyLogout;
        case 'hoursDeficit': return emp.isHoursDeficit;
        case 'breakExceeded': return emp.isBreakHrsExceeded;
        case 'permission': return emp.hasPermission;
        default: return false;
      }
    });
  }

  openAttendanceOffcanvas(content: any, type: string, label: string, count: number) {
    if (count === 0) return;
    this.searchEmployeeText = '';
    this.attendanceOffcanvasTitle = label;
    this.attendanceOffcanvasType = type;
    const filteredEmployees = this.getAttendanceEmployees(type);
    this.processedOffcanvasEmployees = filteredEmployees.map((emp: any) => ({
      ...emp,
      profilePicUrl: this.getImageUrl(emp.profilePic)
    }));
    this.offCanvasData = { key: type, label };
    this.offcanvasService.open(this.attendanceOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  onAttendanceReportDateChange(value: Date) {
    this.attendanceReportLoader = true;
    this.attendanceReportDate = value || new Date();
    this.getAttendanceReportData();
  }

  // upcoming actions functions
  getUpcomingActions() {
    this.upcomingActionsLoader = true;
    const startDate = moment(this.upcomingActionsDate?.[0] ?? new Date()).format('YYYY-MM-DD');
    const endDate = moment(this.upcomingActionsDate?.[1] ?? this.upcomingActionsDate?.[0] ?? new Date()).format('YYYY-MM-DD');
    this.http.getData(`v2/PendingApproval/pending-requests?fromDate=${startDate}&toDate=${endDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.upcomingPendingActionsData = res?.counts;
        this.upcomingActionsEmployeesList = res?.requests || [];
        this.buildUpcomingActionsChart();
        this.upcomingActionsLoader = false;
      },
      error: () => {
        this.upcomingPendingActionsData = null;
        this.upcomingActionsEmployeesList = [];
        this.hasUpcomingActionsData = false;
        this.upcomingActionsLoader = false;
      }
    });
  }

  buildUpcomingActionsChart() {
    if (!this.upcomingPendingActionsData) return;
    const probationCount = this.upcomingPendingActionsData.probationCount || 0;
    const traineeCount = this.upcomingPendingActionsData.traineeCount || 0;
    const noDueCount = this.upcomingPendingActionsData.noDueCount || 0;
    const onboardingCount = this.upcomingPendingActionsData.onboardingCount || 0;
    const noticePeriodCount = this.upcomingPendingActionsData.noticePeriodCount || 0;
    this.totalUpcomingActionsCount = this.upcomingPendingActionsData.totalCount ?? (probationCount + traineeCount + noDueCount + onboardingCount + noticePeriodCount);
    this.hasUpcomingActionsData = this.totalUpcomingActionsCount > 0;
    this.upcomingActionsChartData = {
      labels: ['Probation', 'Trainee', 'No Due', 'Onboarding', 'Notice Period'],
      datasets: [
        {
          data: [probationCount, traineeCount, noDueCount, onboardingCount, noticePeriodCount],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 0,
          borderRadius: 1,
        }
      ]
    };
    this.upcomingActionsChartOptions = {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  getUpcomingActionsEmployees(type: string) {
    return this.upcomingActionsEmployeesList.filter((emp: any) => {
      const requestType = emp.requestType?.toLowerCase();
      switch (type) {
        case 'probation': return requestType === 'probation' || requestType === 'probationonboard';
        case 'trainee': return requestType === 'trainee' || requestType === 'traineeonboard';
        case 'noDue': return requestType === 'nodue' || requestType === 'no due';
        case 'onboarding': return requestType === 'onboarding';
        case 'noticePeriod': return requestType === 'noticeperiod' || requestType === 'notice period';
        default: return false;
      }
    });
  }

  upcomingActionsOffcanvasTitle: string = '';
  upcomingActionsOffcanvasList: any[] = [];
  upcomingActionsEmployeesList: any[] = [];
  upcomingActionsOffcanvasType: string = '';
  openUpcomingActionsOffcanvas(content: any, type: string, label: string, count: number) {
    if (count === 0) return;
    this.searchEmployeeText = '';
    this.upcomingActionsOffcanvasTitle = label;
    this.upcomingActionsOffcanvasType = type;
    const filteredEmployees = this.getUpcomingActionsEmployees(type);
    this.upcomingActionsOffcanvasList = filteredEmployees.map((emp: any) => ({
      ...emp,
      profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
    }));
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredUpcomingActions() {
    return this.searchEmployeeText
      ? this.upcomingActionsOffcanvasList.filter((emp: any) => this.matchesSearch(emp))
      : this.upcomingActionsOffcanvasList;
  }

  onUpcomingActionsDateChange(value: Date[]) {
    if (!value?.[0] || !value?.[1]) return;
    this.upcomingActionsDate = value;
    this.upcomingActionsLoader = true;
    this.getUpcomingActions();
  }

  teamdetails = [] as any[];
  getTeam() {
    const statuses = 'Active';
    this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
      next: (data: any) => {
        this.teamdetails = data.map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';
          return {
            ...employee,
            firstName, //  trimmed
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName}
            ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        }).sort((a: any, b: any) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
        );
      },
      error: (reason: any) => console.log(reason),
    });
  }

  // approvals overview functions
  getApprovalsOverview() {
    if (!this.empinfo?.employeeId) {
      this.approvalsOverviewLoader = false;
      return;
    }
    this.approvalsOverviewLoader = true;
    const obs$ = this.selectedApprovalEmployee?.employeeId
      ? this.http.getAllPendingApprovalsCount(undefined, parseInt(this.selectedApprovalEmployee.employeeId))
      : this.http.getData('v2/PendingApproval/PendingApprovalsSummary');
    obs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const leaveCount = this.getCountByModuleId(data, environment.leavesModuleId);
        const wfhCount = this.getCountByModuleId(data, environment.wfhModuleId);
        const remoteCount = this.getCountByModuleId(data, environment.remoteLoginModuleId);
        const compOffCount = this.getCountByModuleId(data, environment.compoffModuleId);
        const permissionCount = this.getCountByModuleId(data, environment.permissionsModuleId);
        const regularizationCount = this.getCountByModuleId(data, environment.attendanceRegularizationModuleId);
        const extraHoursCount = this.getCountByModuleId(data, environment.extraHoursModuleId);
        const probationCount = this.getCountByModuleId(data, environment.ProbationrequestmoduleId);
        const separationCount = this.getCountByModuleId(data, environment.SeparationrequestmoduleId);
        const expensesCount = this.getCountByModuleId(data, environment.expensesModuleId);
        const timesheetCount = this.getCountByModuleId(data, environment.timesheetModuleId);
        const globalCount = this.getCountByModuleId(data, 0);
        const employeeInfoCount = this.getCountByModuleId(data, 32);

        this.approvalsList = [
          { name: 'Leaves', count: leaveCount, color: '#8A2BE2', route: '/pending-approvals/time-off/leaves', permission: 'Time Off Tab.view' },
          { name: 'WFH', count: wfhCount, color: '#FF1493', route: '/pending-approvals/time-off/wfh', permission: 'WFH Tab.view' },
          { name: 'Remote Login', count: remoteCount, color: '#1E90FF', route: '/pending-approvals/time-off/remote', permission: 'Remote Login Tab.view' },
          { name: 'Comp-Off', count: compOffCount, color: '#06B6D4', route: '/pending-approvals/time-off/comp-off', permission: 'Comp Off Tab.view' },
          { name: 'Permissions', count: permissionCount, color: '#10B981', route: '/pending-approvals/time-off/permissions', permission: 'Permissions Tab.view' },
          { name: 'Regularization', count: regularizationCount, color: '#F59E0B', route: '/pending-approvals/time-off/regularization-request', permission: 'Regularization Tab.view' },
          { name: 'Extra Hours', count: extraHoursCount, color: '#EF4444', route: '/pending-approvals/time-off/extra-hours-request', permission: 'Extra Hours Tab.view' },
          { name: 'Probation', count: probationCount, color: '#6366F1', route: '/pending-approvals/on-boarding/probation-request', permission: 'Probation Details Tab.view' },
          { name: 'Separation', count: separationCount, color: '#EC4899', route: '/pending-approvals/off-boarding/separation-request', permission: 'Separation Request Tab.view' },
          { name: 'Expenses', count: expensesCount, color: '#14B8A6', route: '/pending-approvals/claimsandexpenses-request', permission: 'Claims and Expenses Tab.view' },
          { name: 'Timesheets', count: timesheetCount, color: '#F97316', route: '/pending-approvals/time-sheets', permission: 'Time Sheet approval Tab.view' },
          { name: 'Global Permissions', count: globalCount, color: '#A855F7', route: '/on-behalf-of/global/permissions', permission: 'Global Permissions Module.view' },
          { name: 'Employee Info', count: employeeInfoCount, color: '#3B82F6', route: '/pending-approvals/employeeinfo-request', permission: 'EmployeeInfo Tab.view' }
        ].filter(item => this.hasApprovalPermission(item.permission));
        this.approvalsOverviewLoader = false;
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.approvalsList = [];
        this.approvalsOverviewLoader = false;
      }
    });
  }

  onApprovalEmployeeChange(employee: any) {
    this.selectedApprovalEmployee = employee || null;
    if (employee?.employeeId) {
      this.approvalsEmployeeClaimsLoader = true;
      this.approvalsOverviewLoader = true;
      this.http.getData(`Employeedata/${employee.employeeId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (empData: any) => {
            const workEmail = empData?.workEmail || empData?.email || '';
            if (!workEmail) {
              this.selectedEmployeeClaims = [];
              this.approvalsEmployeeClaimsLoader = false;
              this.getApprovalsOverview();
              return;
            }
            this.http.getData(`Employeedata/GetemployeebyemailID?emailid=${encodeURIComponent(workEmail)}`)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res: any) => {
                  this.selectedEmployeeClaims = Array.isArray(res?.claims) ? res.claims : [];
                  this.approvalsEmployeeClaimsLoader = false;
                  this.getApprovalsOverview();
                },
                error: () => {
                  this.selectedEmployeeClaims = [];
                  this.approvalsEmployeeClaimsLoader = false;
                  this.getApprovalsOverview();
                }
              });
          },
          error: () => {
            this.selectedEmployeeClaims = [];
            this.approvalsEmployeeClaimsLoader = false;
            this.getApprovalsOverview();
          }
        });
    } else {
      this.selectedEmployeeClaims = null;
      this.getApprovalsOverview();
    }
  }

  private hasApprovalPermission(permission: string): boolean {
    if (this.selectedEmployeeClaims !== null) {
      return this.selectedEmployeeClaims.map(c => c.toLowerCase()).includes(permission.toLowerCase());
    }
    return this.rbac.allowedToAccess(permission);
  }

  getCountByModuleId(data: any[], moduleId: number): number {
    const item = data.find(d => d.moduleId === moduleId);
    return item?.waitingForApprovalCount ?? item?.totalCount ?? 0;
  }

  // employee experience functions
  getExperienceDetails() {
    this.experienceDetailsLoader = true;
    this.http.getData('v2/Employeedata/employees-experience-summary').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.buildExperienceChart(data);
        this.experienceDetailsLoader = false;
      },
      error: (err) => {
        console.error('Error fetching experience details:', err);
        this.hasExperienceData = false;
        this.experienceDetailsLoader = false;
      }
    });
  }

  buildExperienceChart(data: any[]) {
    if (!data || data.length === 0) {
      this.hasExperienceData = false;
      return;
    }
    const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
    if (totalCount === 0) {
      this.hasExperienceData = false;
      return;
    }
    this.hasExperienceData = true;
    this.experienceRawData = data;
    const labels = data.map(item => item.experienceRange);
    const counts = data.map(item => item.count);
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    this.experienceChartData = {
      labels,
      datasets: [
        {
          label: 'Employee Count',
          data: counts,
          barThickness: 24,
          backgroundColor: primaryColor || '#3B82F6',
        }
      ]
    };
    const maxValue = Math.max(...counts, 0);
    let stepSize = 5;
    if (maxValue > 50) stepSize = 10;
    if (maxValue > 100) stepSize = 20;
    if (maxValue > 200) stepSize = 50;
    const suggestedMax = Math.ceil((maxValue * 1.15) / stepSize) * stepSize;

    this.experienceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 25 } },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.raw}`
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#000',
          cursor: 'pointer',
          font: {
            weight: 'bold',
            size: 10
          },
          formatter: (value: any) => value,
          listeners: {
            click: (context: any) => {
              const item = this.experienceRawData[context.dataIndex];
              if (!item?.count) return;
              this.openExperienceOffcanvas(item);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          max: suggestedMax,
          ticks: {
            stepSize: stepSize
          }
        }
      }
    };
  }

  openExperienceOffcanvas(item: any) {
    this.searchEmployeeText = '';
    this.experienceOffcanvasTitle = item.experienceRange;
    this.experienceOffcanvasList = (item.employees || []).map((emp: any) => ({
      ...emp,
      profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
    }));
    this.offcanvasService.open(this.experienceOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredExperienceEmployees() {
    return this.searchEmployeeText ? this.experienceOffcanvasList.filter((emp: any) => this.matchesSearch(emp)) : this.experienceOffcanvasList;
  }

  private matchesSearch(emp: any): boolean {
    const q = this.searchEmployeeText.toLowerCase();
    return emp.employeeName?.toLowerCase().includes(q)
      || emp.designation?.toLowerCase().includes(q)
      || emp.departmentName?.toLowerCase().includes(q);
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
