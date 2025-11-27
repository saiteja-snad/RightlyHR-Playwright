import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { environment } from '../../../environments/environment';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { ICategoryDetails } from '../../settings/time-off/flexible-leave-allocation/leave-allocation.model';
import { forkJoin, Observable } from 'rxjs';
import { IAnniversariesData, IBirthDaysData, IMarriageAnniversary, INewJoinee } from '../../Interfaces/dashboard.modal';
import { AccordionModule } from 'primeng/accordion';
import { Carousel } from 'primeng/carousel';
import { TranslateModule } from '@ngx-translate/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, DateformatPipe,AccordionModule,Carousel,Skeleton,TranslateModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class EmployeeDashboardComponent {
  greetingMessage = ''
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  subscription: any;
  empinfo = {} as Ipersonal;
  teamMemberArray: any[] = [];
  getTeamMemberArray: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  currentMonth!: number;
  currentYear!: number;
  leavesList: any[] = [];
  eventsLoader = false;
  eventItems: any[] = [];
  constructor(
    private http: HttpService,

    private router: Router
  ) { }

  // TEAM MEMBERS
  teamMembers: any[] = [];
  birthdays: any[] = [];

  // GENDER DIVERSITY
  genderTotal = 20;
  femaleCount = 40; // in percent (40%)
  maleCount = 60;   // in percent (60%)

  // WEEKLY WORK LOGS
  weeklyWorkLogs = [
    { day: 'Mon', time: '08:30' },
    { day: 'Tue', time: '09:15' },
    { day: 'Wed', time: '07:45' },
    { day: 'Thu', time: '08:00' },
    { day: 'Fri', time: '06:55' },
  ];

  // TEAM AVAILABILITY CHART (DUMMY)
  teamAvailability = {
    present: 7,
    onLeave: 2,
    workingRemote: 3
  };

  // TODAY TIME ENTRY (DUMMY)
  todayTimeEntry = {
    loggedHours: 6.5,
    targetHours: 8
  };


  // ANNIVERSARY LIST (DUMMY)
  anniversaries: any[] = [];
  ngOnInit(): void {
    this.setIconBasedOnTime();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.employeedata = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
    this.currentTime = new Date();
    this.currentYear = new Date().getFullYear(); // e.g., 2025
    this.currentMonth =  new Date().getMonth() + 1;
    this.getAllTeammembersList();
    this.getworkanniversary();
    this.getbrithday();
    this.loadEvents();
    this.getCategoryempDetails(this.empinfo?.employeeId);
  }

  setIconBasedOnTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      // Morning
      this.greetingMessage = 'Good Morning';

    } else if (hour >= 12 && hour < 16) {
      // Afternoon
      this.greetingMessage = 'Good Afternoon';

    } else if (hour >= 16 && hour < 19) {
      // Evening
      this.greetingMessage = 'Good Evening';

    } else {
      // Night
      this.greetingMessage = 'Good Evening';

    }
  }


  getAllTeammembersList() {
    this.loading = true;
    const EmployeeId = this.empinfo?.employeeId;

    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe(
        (responseData: any) => {
          this.loading = false;

          this.teamMembers = responseData.map((emp: any) => {
            const fullName =
              `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();

            return {
              name: fullName,
              role: emp.jobRole,
              photo: this.getImageUrl(emp.profilePic)
            };
          });
        },
        (error) => {
          console.error(error);
          this.loading = false;
        }
      );
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
    this.subscription = this.http.getData(`Employeedata/ActiveEmployeesAnniversaries?year=${this.currentYear}&months=${this.currentMonth}`).subscribe({
      next: (data: any) => {
        this.anniversaries = data;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  getbrithday() {
    this.subscription = this.http.getData(`Employeedata/ActiveEmployeesbday?months=${this.currentMonth}`).subscribe({
      next: (data: any) => {
        this.birthdays = data;
      },
      error: (err: any) => {
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
    this.subscription = this.http
      .getData(`LeaveEntitlements/v2/employee/${empId}?year=${this.currentYear}`)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leavesList = res.data.map((item: any) => ({
              name: item.category?.name,
              allowed: item.allowedDays,
              used: item.utilizedDays,
              percentage: (item.utilizedDays / item.allowedDays) * 100
            }));
          }
        }
      });
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
}
