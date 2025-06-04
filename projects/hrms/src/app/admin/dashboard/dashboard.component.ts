import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from '../document-history/document-history-layout/document-history-layout.component';
import { filter, forkJoin, Observable, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Carousel } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { AttendanceResponse, EmployeeStatusCount, IAnniversariesData, IBirthDaysData, IMarriageAnniversary, INewJoinee, Permission } from '../../Interfaces/dashboard.modal';
import { IdayLogs } from '../../Attendance/attendance-view/attendance-modal';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    DocumentHistoryLayoutComponent,
    TranslateModule,
    NgbPopoverModule,
    Carousel,
    ChartModule,
    DateformatPipe,
    Skeleton
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class DashboardComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  employeedata: any;
  Inactive!: number;
  ACTDATA!: number;
  Active!: number;
  Trainee!: number;
  traineeactive!: number;
  traineeInactive!: number;
  PROBDATA!: number;
  active = 'Active';
  activeCount: number = 0;
  jobdata = {} as any;
  filtredActivedata = {} as any;
  trackByFn(index: number, item: any): number {
    return index;
  }
  greetingMessage = ''
  cardItems: any[] = [];
  eventItems: any[] = [];
  EmployeeInfoData: any;
  EmployeeInfoDataOptions: any;
  totalEmployeesCount: any;
  currentTime: Date = new Date();
  iconPath: string = '';
  private intervalId: any;
  currentMonth!: number;
  currentYear!: number;
  currentDay!: number;
  birthDaysData: IBirthDaysData[] = [];
  anniversariesData: IAnniversariesData[] = [];
  newJoineesData: INewJoinee[] = [];
  attendanceData: AttendanceResponse = {}  as AttendanceResponse;
  punchPairs = [] as IdayLogs[];
  logsDuration!: string;
  selectedDate!: Date;
  permissions_list: Permission[] = [];
  regularization_list: Permission[] = [];
  marriageAnniversaryData: IMarriageAnniversary[] = [];
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;
  attendanceLoader = false;
  chartLoader = false;
  eventsLoader = false;

  constructor(
    private router: Router,
    private http: HttpService,
    public rbac: RbacService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.employeedata = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
    this.currentYear = new Date().getFullYear(); // e.g., 2025
    this.currentMonth = new Date().getMonth() + 1; // 1 (Jan) to 12 (Dec)
    this.currentDay = new Date().getDate();
    // this.fetchData();
    this.cardItems = this.cardItems.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.setIconBasedOnTime();
    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.getAttendenceLogsOfLoginedUser(
      this.employeedata.employeeId,
      this.currentYear,
      this.currentMonth,
      this.currentDay
    );
    this.loadEvents();
    this.getEmployeeStatusCount();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/admin/dashboard': MODULE_INFOS.DASHBOARD_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  //function for prospective employee
  quotationsData() {
    this.eventsLoader = true;
    this.subscription = this.http.getData(`EmployeeData/Quotation`).subscribe({
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

  //function for to get the Employees count based on the status
  getEmployeeStatusCount() {
    this.chartLoader = true;
    this.subscription = this.http.getData(`Employeedata/get-employees-status-count`).subscribe({
      next: (data: any) => {
        this.employeesStatusCount = data.data as EmployeeStatusCount;
        this.chartLoader = false;
        this.Active = 0;
        this.Inactive = 0;
        this.ACTDATA = 0;
        this.PROBDATA = 0;
        this.traineeactive = 0;
        this.traineeInactive = 0;
        this.Trainee = 0;
        const statusList = this.employeesStatusCount?.statusWiseCount;
        if (Array.isArray(statusList)) {
          for (const statusItem of statusList) {
            switch (statusItem.status) {
              case 'Active Employees':
                this.Active = statusItem.count;
                break;
              case 'Inactive Employees':
                this.Inactive = statusItem.count;
                break;
              case 'Prospective Employees':
                this.ACTDATA = statusItem.count;
                break;
              case 'Probation Employees':
                this.PROBDATA = statusItem.count;
                break;
              case 'Active Trainees':
                this.traineeactive = statusItem.count;
                break;
              case 'Inactive Trainees':
                this.traineeInactive = statusItem.count;
                break;
              case 'Prospective Trainees':
                this.Trainee = statusItem.count;
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
        const anniversaryEvents = anniversaries
          .filter((a) => {
            const doj = new Date(a.dateOfJoining);
            return doj.getDate() === todayDay && doj.getMonth() === todayMonth;
          })
          .map((a) => ({
            type: 'Work Anniversary',
            name: this.getFullName({
              firstName: a.firstName,
              middleName: a.middleName,
              lastName: a.lastName,
            }),
            yearCount: a.anniversaryYearCount,
            date: a.dateOfJoining,
          }));
        const marriageAnniversariesEvent = marriageAnniversary
          .filter((a) => {
            const doj = new Date(a.marriedDate);
            return doj.getDate() === todayDay && doj.getMonth() === todayMonth;
          })
          .map((a) => ({
            type: 'Marriage Anniversary',
            name: this.getFullName({
              firstName: a.firstName,
              middleName: a.middleName,
              lastName: a.lastName,
            }),
            date: a.marriedDate,
          }));
        const todayString = today.toISOString().split('T')[0];
        const newJoineeEvents = newJoinees
          .filter((n) => n.dateOfJoining?.split('T')[0] === todayString)
          .map((n) => ({
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

  getFullName(b: { firstName: string; middleName?: string; lastName: string }): string {
    return [b.firstName, b.middleName, b.lastName]
      .filter(Boolean) // removes undefined or empty strings
      .join(' ');
  }

  openModalLarge(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  dayLogsData(
    Value: any,
    date: Date,
    totalduration: any,
    permissions: any,
    regularizations: any
  ) {
    this.logsDuration = totalduration;
    this.selectedDate = date;
    this.permissions_list = permissions;
    this.regularization_list = regularizations;
    if (Value) {
      this.punchPairs = Value;
    } else {
      this.punchPairs = [];
    }
  }

  filterJobsByStatus(status: string): any[] {
    return this.jobdata.filter(
      (job: { status: string }) => job.status === status
    );
  }

  getStatusCount(status: string): number {
    return this.jobdata.reduce((count: number, job: { status: string }) => {
      if (job.status === status) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  getAttendenceLogsOfLoginedUser(
    empId: number,
    currentYear: number,
    currentMonth: number,
    currentDay: number
  ) {
    this.attendanceLoader = true;
    this.subscription = this.http.getData(
        `v2/AttendanceData/employee/${empId}?year=${currentYear}&month=${currentMonth}&date=${currentDay}`
      )
      .subscribe({
        next: (data: any) => {
          this.attendanceLoader = false;
          this.attendanceData = data;
        },
        error: (reason) => {
          this.attendanceData = {} as AttendanceResponse
          this.attendanceLoader = false;
        },
      });
  }

  navigateToAttendance() {
    this.router.navigate(['/attendance']);
  }

  updateCardItems() {
    this.cardItems = [
      {
        label: 'Active',
        link: '/employee-management/active-employees',
        count: this.Active,
        icon: '/employee-data/active-employees-icon.png',
        employeementTypeColor: '#F9D339',
        permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Inactive',
        link: '/employee-management/inactive-employees',
        count: this.Inactive,
        icon: '/employee-data/inactive-employee-icon.png',
        employeementTypeColor: '#E54288',
        permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
      {
        label: 'Prospective',
        link: '/employee-management/prospective-employees',
        count: this.ACTDATA,
        icon: '/employee-data/prospective-employee-icon.png',
        employeementTypeColor: '#03A9F4',
        permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Probation',
        link: '/employee-management/probation-employees',
        count: this.PROBDATA,
        icon: '/employee-data/Probation-Employee-icon.png',
        employeementTypeColor: '#FF2E22',
        permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },

      {
        label: 'Active Trainees',
        link: '/employee-management/active-interns',
        count: this.traineeactive,
        icon: '/employee-data/active-trainee-icon.png',
        employeementTypeColor: '#0B3A83',
        permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Inactive Trainees',
        link: '/employee-management/inactive-interns',
        count: this.traineeInactive,
        icon: '/employee-data/inactive-trainee-icon.png',
        employeementTypeColor: '#1064CA',
        permission: { feature: 'Dashboard Inactive Trainees Card', action: 'view' }
      },
      {
        label: 'Prospective Trainees',
        link: '/employee-management/prospective-interns',
        count: this.Trainee,
        icon: '/employee-data/prospective-trainee-icon.png',
        employeementTypeColor: '#53D33A',
        permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
    ];
    // this.filterTabsByRbac();
    this.initChart();
  }

  initChart() {
    const backgroundColors = this.cardItems.map(
      (item) => item.employeementTypeColor
    );
    this.totalEmployeesCount = this.employeesStatusCount.totalCount
    this.EmployeeInfoData = {
      datasets: [
        {
          data: [this.Active, this.Inactive, this.ACTDATA, this.PROBDATA, this.traineeactive, this.traineeInactive, this.Trainee,],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        },
      ],
    };
    this.EmployeeInfoDataOptions = {
      cutout: '70%',
    };
  }

  filterTabsByRbac(): void {
    this.cardItems = this.cardItems.filter((tab) => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}