import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from '../document-history/document-history-layout/document-history-layout.component';
import { forkJoin, Observable, Subject, takeUntil, } from 'rxjs';
import { HttpService } from '../../services/http.service';
import moment from 'moment';

import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Carousel } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import {
  AttendanceResponse, EmployeeStatusCount, IAnniversariesData, IBirthDaysData,
  IMarriageAnniversary, INewJoinee, Permission
} from '../../Interfaces/dashboard.modal';
import { IdayLogs } from '../../Attendance/attendance-view/attendance-modal';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { Skeleton } from 'primeng/skeleton';
import { AccordionModule } from 'primeng/accordion';
import { DashAttIconComponent } from "../../icons/dash-att-icon/dash-att-icon.component";
import { FingerPrintIconComponent } from "../../icons/finger-print-icon/finger-print-icon.component";
import { LeaveIconComponent } from "../../icons/leave-icon/leave-icon.component";
import { WfhIconComponent } from "../../icons/wfh-icon/wfh-icon.component";
import { ICategoryDetails } from '../../settings/time-off/flexible-leave-allocation/leave-allocation.model';
import { Ipersonal } from '../../Interfaces/personal-modal';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { environment } from '../../../environments/environment.dev';
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DatePicker } from "primeng/datepicker";
import { TabList, TabsModule } from "primeng/tabs";
import { Calendar } from "primeng/calendar";
import { FormsModule } from '@angular/forms';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbPopoverModule, Carousel, ModuleInfoIconComponent,
    ChartModule, DateformatPipe, Skeleton, AccordionModule, DashAttIconComponent, FingerPrintIconComponent, LeaveIconComponent, WfhIconComponent, ProfileIconComponent, NoDataFoundComponent, DatePicker, TabList, Calendar, TabsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class DashboardComponent implements OnInit, OnDestroy {
  greetingMessage = '';
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  avaliabletlyloading = false;
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
  eventsLoader = false;
  eventItems: any[] = [];
  todayChartData: any;
  todayChartOptions: any;
  totalLeavesChartData: any;
  totalLeavesChartOptions: any;
  currentDate: number = new Date().getDate();
  previousDate: any;
  startOfWeek: any;
  endOfWeek: any;
  totalHours: any
  brithdayloader = false;
  anniversariesloader = false;
  teamMembers: any[] = [];
  employeesBirthdays: any[] = [];
  teamavailabilityinfo =
    'Displays your team’s current availability for the selected date, including In Office, WFH, On Leave, Half Day, Remote, and Absent statuses.';
  myteammemberinfo =
    'Displays an overview of all team members in the organization, helping employees stay informed about their colleagues.';
  genderdiversityinfo =
    'Displays the gender distribution of employees, giving a quick and clear view of workforce diversity.';
  Weeklyworklogsinfo =
    'Shows a weekly summary of the hours that are logged, making it easy to track their work and productivity.';
  TodaysTimeEntryinfo =
    'Provides an overview of today’s time entry, showing logged hours, active work time, and the previous day’s duration.';
  leavesConsumedinfo = 'Provides an overview of consumed leave balances categorized by leave type.';
  attendancoverviewinfo = 'Displays your attendance details for the selected date, including duty status, first in time, last out time, and the previous day’s log duration.'
  legendList = [
    { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
    { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
    { key: 'wfh', label: 'WFH', color: '#FF1493' },
    { key: 'absent', label: 'Absent', color: '#FF0000' },
    { key: 'leave', label: 'Leave', color: '#8A2BE2' },
    { key: 'remote', label: 'Remote', color: '#EA362C' },
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
  EmployeeInfoData: any;
  EmployeeInfoDataOptions: any;
  totalEmployeesCount: any;
  Inactive!: number;
  ACTDATA!: number;
  Active!: number;
  Trainee!: number;
  traineeactive!: number;
  traineeInactive!: number;
  activeContractCount!: number;
  inActiveContractCount!: number;
  prospectiveContractCount!: number;
  inActiveTrainee!: number;
  PROBDATA!: number;
  active = 'Active';
  activeCount: number = 0;
  jobdata = {} as any;
  cardItems: any[] = [];
  todayMaxdate!: Date
  regularization_list: Permission[] = [];
  attendanceselectedDate!: Date;
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;
  quickMenuItems = [
    {
      label: 'My Info',
      link: '/myinfo/personal/basic-info',
      icon: '/dashboard-icon/personal-information.png',
    },
    {
      label: 'Holidays',
      link: '/holidays/public-holidays',
      icon: '/main-menu-icons/holiday-icon.png',
    },
    {
      label: 'Leaves',
      link: '/time-off/leaves/waiting-for-approval',
      icon: '/time-off-icon/leaves-icon.png',
    },
    {
      label: 'Permissions',
      link: '/time-off/premissions/waiting-for-approval',
      icon: '/time-off-icon/permissions-icon.png',
    },
    {
      label: 'Policies',
      link: '/policies/companypolicies',
      icon: '/main-menu-icons/policies-icon.png',
    },
    {
      label: 'Calendar',
      link: '/calendar-view',
      icon: '/dashboard-icon/calendar.png',
    },
  ]
  previousMonthStartDate: any;
  departmentHeadCountChartData: any;
  departmentHeadCountChartDataOptions: any;
  departmentHeadCounts: any;
  departmentHeadCountsLoader = false;
  employeeOverviewInfo = 'Displays the organization’s employee count by current status, including Active, Probation, Active Trainees, Prospective, and Prospective Trainees.';
  quickLinksInfo = 'Provides quick access to commonly used pages and actions across the portal.';
  departmentByHeadcountInfo = 'Displays the number of employees in each department across the organization.';
  punchPairs = [] as IdayLogs[];
  logsDuration!: string;
  breakDuration!: string
  permissions_list: Permission[] = [];
  topwidgetCount = 0;
  leftWidgetCount = 0;
  rightWidgetCount = 0;

  constructor(private http: HttpService, private router: Router, public modalService: NgbModal,
    private offcanvasService: NgbOffcanvas, public rbac: RbacService,) { }

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
    this.getAllTeammembersList();
    this.getworkanniversary();
    this.getGenderCountChart();
    this.gettodayloggedtime();
    this.getbrithday();
    this.loadEvents();
    this.selectedDate = new Date(); // current date by default
    this.getteamavliabletly(this.selectedDate);
    this.getWeeklyWorkLogHours();
    this.getCategoryempDetails(this.empinfo?.employeeId);
    this.buildDisabledFutureWeekDates();
    this.intialLoading = false;
    // this.getAttendenceLogsOfLoginedUser(this.employeedata.employeeId, this.currentYear, this.currentMonth, this.currentDay);
    this.getEmployeeStatusCount();
    this.getHeadCountByDepartment();
    // this.getpreviousloggedtime();
    this.todayMaxdate = new Date();
    this.widgetCount();
  }

  widgetCount() {
    this.topwidgetCount = [
      this.rbac.allowedToAccess('Sun View.view'),
      this.rbac.allowedToAccess('Attendance Overview.view'),
      this.rbac.allowedToAccess('Consumed Leave Types.view')
    ].filter(Boolean).length;

    this.leftWidgetCount = [
      this.rbac.allowedToAccess('All Employees.view'),
      this.rbac.allowedToAccess('My Team Availability.view'),
      this.rbac.allowedToAccess('Team Members.view')
    ].filter(Boolean).length;

    this.rightWidgetCount = [
      this.rbac.allowedToAccess('Weekly Work Logs.view'),
      this.rbac.allowedToAccess('Headcount by Department.view'),
      this.rbac.allowedToAccess('Headcount by Gender.view'),
      this.rbac.allowedToAccess('Quick Links.view')
    ].filter(Boolean).length;
    console.log(this.rightWidgetCount, this.leftWidgetCount);

  }

  setIconBasedOnTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      // Morning
      this.greetingMessage = 'Good Morning';
      this.iconPath = '/dashboard-icon/morning-icon.png';
    } else if (hour >= 12 && hour < 16) {
      // Afternoon
      this.greetingMessage = 'Good Afternoon';
      this.iconPath = '/dashboard-icon/afternoon-icon.png';
    } else if (hour >= 16 && hour < 19) {
      // Evening
      this.greetingMessage = 'Good Evening';
      this.iconPath = '/dashboard-icon/sunset-icon.png';
    } else {
      // Night
      this.greetingMessage = 'Good Evening';
      this.iconPath = '/dashboard-icon/night-icon.png';
    }
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
        console.log(data);

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
        this.inActiveTrainee = 0;
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

  updateCardItems() {
    this.cardItems = [
      {
        label: 'Active',
        link: '/employee-management/active/employees',
        count: this.Active,
        icon: '/employee-data/active-employees-icon.png',
        employeementTypeColor: '#8B5CF6',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Inactive',
        link: '/employee-management/inactive/employees',
        count: this.Inactive,
        icon: '/employee-data/active-employees-icon.png',
        employeementTypeColor: '#334155',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Probation',
        link: '/employee-management/probation/employees',
        count: this.PROBDATA,
        icon: '/employee-data/Probation-Employee-icon.png',
        employeementTypeColor: '#FF8000',
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },
      {
        label: 'Prospective',
        link: '/employee-management/prospective/employees',
        count: this.ACTDATA,
        icon: '/employee-data/prospective-employee-icon.png',
        employeementTypeColor: '#00ABF9',
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Active Trainees',
        link: '/employee-management/active/interns',
        count: this.traineeactive,
        icon: '/employee-data/active-trainee-icon.png',
        employeementTypeColor: '#53D33A',
        permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Prospective Trainees',
        link: '/employee-management/prospective/interns',
        count: this.Trainee,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#1064CA',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Inactive Trainees',
        link: '/employee-management/inactive/interns',
        count: this.inActiveTrainee,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#973636',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Active Contractors',
        link: '/employee-management/active/contract',
        count: this.activeContractCount,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#00B5AD',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Inactive Contractors',
        link: '/employee-management/inactive/contract',
        count: this.inActiveContractCount,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#E05D5D',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Prospective Contractors',
        link: '/employee-management/prospective/contract',
        count: this.prospectiveContractCount,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#FFC107',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
    ];
    this.initChart();
  }

  initChart() {
    const backgroundColors = this.cardItems.map(
      (item) => item.employeementTypeColor
    );
    this.totalEmployeesCount = this.Active + this.Inactive + this.ACTDATA + this.PROBDATA + this.traineeactive + this.Trainee + this.inActiveTrainee + this.activeContractCount + this.inActiveContractCount + this.prospectiveContractCount;
    this.EmployeeInfoData = {
      datasets: [
        {
          data: [this.Active, this.Inactive, this.PROBDATA, this.ACTDATA, this.traineeactive, this.Trainee, this.inActiveTrainee, this.activeContractCount, this.inActiveContractCount, this.prospectiveContractCount],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        },
      ],
    };
    this.EmployeeInfoDataOptions = {
      cutout: '70%',
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
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const labels = departments.map((d: any) => d.departmentName);
    const headCounts = departments.map((d: any) => d.headCount);
    this.departmentHeadCountChartData = {
      labels,
      datasets: [
        {
          label: 'Head Count',
          data: headCounts,
          barThickness: 24,
          backgroundColor: primaryColor,
        }
      ]
    };
    this.departmentHeadCountChartDataOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${context.label}: ${context.raw}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 12 }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      }
    };
  }

  getAllTeammembersList() {
    this.loading = true;
    const EmployeeId = this.empinfo?.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (responseData: any) => {
        this.loading = false;
        this.teamMembers = responseData.map((emp: any) => {
          const fullName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
          return {
            name: fullName,
            role: emp.jobRole,
            photo: this.getImageUrl(emp.profilePic)
          };
        }).sort((a: any, b: any) =>
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        ); // <-- sorting applied here
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  private getImageUrl(imagePath: string): string | null {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getworkanniversary() {
    this.anniversariesloader = true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = this.currentMonth; // 0-based
    const nextMonth = this.nextMonth;
    let yearParam: string;
    let monthParam: string;
    // December case → pass current + next year
    if (currentMonth === 12) {
      yearParam = `${currentYear},${currentYear + 1}`;
      monthParam = `12,1`; // Dec & Jan
    } else {
      yearParam = `${currentYear}`;
      monthParam = `${currentMonth},${nextMonth}`;
    }
    this.http.getData(`Employeedata/ActiveEmployeesAnniversaries?year=${yearParam}&months=${monthParam}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const today = new Date();
        const next30 = new Date();
        next30.setDate(today.getDate() + 30);
        this.anniversaries = data.filter((item: any) => {
          const doj = new Date(item.dateOfJoining);
          const anniversaryThisYear = new Date(
            today.getFullYear(),
            doj.getMonth(),
            doj.getDate()
          );
          const anniversaryNextYear = new Date(
            today.getFullYear() + 1,
            doj.getMonth(),
            doj.getDate()
          );
          return (
            (anniversaryThisYear >= today && anniversaryThisYear <= next30) ||
            (anniversaryNextYear >= today && anniversaryNextYear <= next30)
          );
        }).sort((a: any, b: any) => {
          return (
            this.getDobWithCurrentYear(a.dateOfJoining).getTime() -
            this.getDobWithCurrentYear(b.dateOfJoining).getTime()
          );
        });
        this.anniversariesloader = false;
      },
      error: err => {
        console.log(err)
        this.anniversariesloader = false;
      },
    });
  }

  getbrithday() {
    this.brithdayloader = true;
    this.http.getData(`Employeedata/ActiveEmployeesbday?months=${this.currentMonth},${this.nextMonth}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const today = new Date();
        const next30 = new Date();
        next30.setDate(today.getDate() + 30);
        this.employeesBirthdays = data.filter((item: any) => {
          const dob = new Date(item.dob);
          // Birthday this year
          const birthdayThisYear = new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
          );
          // Birthday next year (for crossing Dec → Jan)
          const birthdayNextYear = new Date(
            today.getFullYear() + 1,
            dob.getMonth(),
            dob.getDate()
          );
          // Check for next 30 days including next-year birthdays
          return (
            (birthdayThisYear >= today && birthdayThisYear <= next30) ||
            (birthdayNextYear >= today && birthdayNextYear <= next30)
          );
        }).sort((a: any, b: any) => {
          // SORT HERE by upcoming birthday date
          return this.getDobWithCurrentYear(a.dob).getTime() -
            this.getDobWithCurrentYear(b.dob).getTime();
        });
        this.brithdayloader = false;
      },
      error: (err: any) => {
        this.brithdayloader = false;
        console.log(err);
      },
    });
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

  getCategoryempDetails(empId: any) {
    this.consumedLeavesLoader = true;
    this.http.getData(`LeaveEntitlements/v2/employee/${empId}?year=${this.currentYear}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leavesList = res.data.map((item: any) => ({
            name: item.category?.name,
            allowed: item.allowedDays,
            used: item.utilizedDays,
            percentage: item.allowedDays === 0 ? 0 : (item.utilizedDays / item.allowedDays) * 100,
            color: item.category?.categoryColor
          }));
          // NEW: Total leaves calculation
          const totalAllowed = res.data.reduce((sum: number, x: any) => sum + x.allowedDays, 0);
          const totalUsed = res.data.reduce((sum: number, x: any) => sum + x.utilizedDays, 0);
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

  loadEvents() {
    this.eventsLoader = true;
    forkJoin([
      this.http.getData(`Employeedata/ActiveEmployeesbday?months=${this.currentMonth}`) as Observable<IBirthDaysData[]>,
      this.http.getData(`Employeedata/ActiveEmployeesAnniversaries?year=${this.currentYear}&months=${this.currentMonth}`) as Observable<IAnniversariesData[]>,
      this.http.getData(`Employeedata/Newjoinee?year=${this.currentYear}&months=${this.currentMonth}`) as Observable<INewJoinee[]>,
      this.http.getData(`Employeedata/ActiveEmployeeMarriageAnniversary?months=${this.currentMonth}`) as Observable<IMarriageAnniversary[]>,
    ]).subscribe(
      ([birthdays, anniversaries, newJoinees, marriageAnniversary]) => {
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth(); // 0-based
        const birthDayEvents = birthdays.filter((b) => {
          const dob = new Date(b.dob);
          return dob.getDate() === todayDay && dob.getMonth() === todayMonth;
        }).map((b) => ({
          type: 'Birthday',
          name: this.getFullName({
            firstName: b.firstName,
            middleName: b.middleName,
            lastName: b.lastName,
          }),
          date: b.dob,
        }));
        const anniversaryEvents = anniversaries.filter((a) => {
          const doj = new Date(a.dateOfJoining);
          return doj.getDate() === todayDay && doj.getMonth() === todayMonth;
        }).map((a) => ({
          type: 'Work Anniversary',
          name: this.getFullName({
            firstName: a.firstName,
            middleName: a.middleName,
            lastName: a.lastName,
          }),
          yearCount: a.anniversaryYearCount,
          date: a.dateOfJoining,
        }));
        const marriageAnniversariesEvent = marriageAnniversary.filter((a) => {
          const doj = new Date(a.marriedDate);
          return doj.getDate() === todayDay && doj.getMonth() === todayMonth;
        }).map((a) => ({
          type: 'Marriage Anniversary',
          name: this.getFullName({
            firstName: a.firstName,
            middleName: a.middleName,
            lastName: a.lastName,
          }),
          date: a.marriedDate,
        }));
        const todayString = today.toISOString().split('T')[0];
        const newJoineeEvents = newJoinees.filter((n) => n.dateOfJoining?.split('T')[0] === todayString).map((n) => ({
          type: 'New Joinee',
          name: this.getFullName({
            firstName: n.firstName,
            middleName: n.middleName,
            lastName: n.lastName,
          }),
          doj: n.dateOfJoining,
        }));
        const events = [
          ...birthDayEvents,
          ...anniversaryEvents,
          ...newJoineeEvents,
          ...marriageAnniversariesEvent
        ];
        this.eventsLoader = false;
        this.hasRealEvents = events.length > 0;
        if (events.length) {
          this.eventItems = events;
        } else {
          this.quotationsData();
        }
      },
      (err: any) => {
        this.eventsLoader = false;
        console.error(err);
        this.quotationsData();
      }
    );
  }

  quotationsData() {
    this.eventsLoader = true;
    this.subscription = this.http.getData(`EmployeeData/Quotation`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        this.eventItems = shuffled.slice(0, 3);
        this.eventsLoader = false;
      },
      error: (reason) => {
        this.eventsLoader = false;
      },
    });
  }

  genderCountLoader = false;
  genderChartData: any = {};
  genderChartOptions: any = {};
  // Custom carousel indicator properties
  currentCarouselIndex = 0;
  get activeIndicatorIndex() {
    return this.currentCarouselIndex % 3;
  }

  onCarouselPageChange(event: any) {
    this.currentCarouselIndex = event.page;
  }

  getGenderCountChart() {
    this.genderCountLoader = true;
    let apiUrl = `v2/Employeedata/teammembers/gendercount/${this.empinfo.employeeId}`;
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.genderCountLoader = false;
        const female = data.find((x: any) => x.gender === 'Female');
        const male = data.find((x: any) => x.gender === 'Male');
        const others = data.find((x: any) => x.gender === 'Others');
        this.genderTotal = (female?.count || 0) + (male?.count || 0) + (others?.count || 0);
        if (!data || !data.length) {
          this.genderChartData = { labels: [], datasets: [] };
          return;
        }
        // Extract values
        const labels = data.map((item: any) => item.gender);
        const counts = data.map((item: any) => item.count);
        // Dynamic color assignment based on gender
        const colors = labels.map((gender: string) => {
          if (gender === 'Female') return '#E91CAB';
          if (gender === 'Male') return '#1E88E5';
          return '#B146C3'; // Others
        });
        // Assign chart data (same style as your reference)
        this.genderChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Count',
              data: counts,
              backgroundColor: colors,
              barThickness: 10,
              borderRadius: {
                topRight: 12,
                bottomRight: 12,
                topLeft: 0,
                bottomLeft: 0
              },
            }
          ]
        };
        // Chart options (same structure as your reference)
        this.genderChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          layout: {
            padding: {
              right: 30   // gives space for the number
            }
          },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'right',
              color: '#333',
              font: {
                weight: 'bold',
                size: 12
              },
              formatter: (value: number) => value
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { display: false },
              ticks: {
                stepSize: 1,
                callback: (val: any) => Number.isInteger(Number(val)) ? val : '',
              }
            },
            y: {
              grid: { display: false }
            }
          }
        };
      },
      error: (err: any) => {
        this.genderCountLoader = false;
        this.genderChartData = { labels: [], datasets: [] };
        console.error('Error fetching gender chart:', err);
      }
    });
  }

  openModalLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static', });
  }

  onDateChange(date: Date) {
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
  getteamavliabletly(date: Date) {
    const formattedDate = this.formatDate(date);
    this.avaliabletlyloading = true;
    this.http.getData(`v2/Employeedata/TeamAvailability/Summary/${this.empinfo.employeeId}?date=${formattedDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.avaliabletlyloading = false;
        this.teamSummary = res.summary;
        this.OffCanvasemployeeList = res.employees;
        // Total = all except absent
        this.teamTotal = (this.teamSummary.inOffice || 0) + (this.teamSummary.halfDay || 0) + (this.teamSummary.wfh || 0)
          + (this.teamSummary.leave || 0) + (this.teamSummary.absent || 0) + (this.teamSummary.remote || 0);
        this.buildTeamChart();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching team availability:', err);
      }
    });
  }

  buildTeamChart() {
    const summary = this.teamSummary;
    // Keys to display (order matters)
    const keys = ["inOffice", "halfDay", "wfh", "leave", "absent", "remote"];
    // Convert keys into labels (formatted text)
    const labels: string[] = keys.map(x =>
      x.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
    );
    // Values for chart
    const chartData = keys.map(k => summary[k] || 0);
    // Matching colors (same order as keys)
    const colors = ["#1E90FF", "#FFD700", "#FF1493", "#8A2BE2", "#FF0000"];
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
      rotation: -90,        // start from top
      circumference: 180,
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

  openOffcanvas(content: any, data: any) {
    this.searchEmployeeText = '';
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
    this.offCanvasData = data;
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
    const key = this.offCanvasData?.key;
    const list = this.OffCanvasemployeeList?.[key] || [];
    if (!this.searchEmployeeText) {
      return list;
    }
    return list.filter((emp: any) =>
      emp.employeeName?.toLowerCase().includes(this.searchEmployeeText.toLowerCase())
    );
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

  get noCompleterightContentAccess(): boolean {
    return (
      !this.rbac.allowedToAccess('Quick Links.view') &&
      !this.rbac.allowedToAccess('Headcount by Department.view') &&
      !this.rbac.allowedToAccess('Weekly Work Logs.view') &&
      !this.rbac.allowedToAccess('Headcount by Gender.view')
    );
  }

  get norightContentAccess(): boolean {
    return (
      !this.rbac.allowedToAccess('Headcount by Department.view') &&
      !this.rbac.allowedToAccess('Weekly Work Logs.view') &&
      !this.rbac.allowedToAccess('Headcount by Gender.view')
    );
  }


  get singleteammembersview(): boolean {
    return (
      !this.rbac.allowedToAccess('All Employees.view') &&
      !this.rbac.allowedToAccess('My Team Availability.view') &&
      this.rbac.allowedToAccess('Team Members.view')
    );
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}