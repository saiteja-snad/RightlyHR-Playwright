import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { environment } from '../../../environments/environment';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { ICategoryDetails } from '../../settings/time-off/flexible-leave-allocation/leave-allocation.model';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { IAnniversariesData, IBirthDaysData, IMarriageAnniversary, INewJoinee } from '../../Interfaces/dashboard.modal';
import { AccordionModule } from 'primeng/accordion';
import { Carousel } from 'primeng/carousel';
import { TranslateModule } from '@ngx-translate/core';
import { Skeleton } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import moment from 'moment';
import { TabsModule } from 'primeng/tabs';
import { display } from 'html2canvas/dist/types/css/property-descriptors/display';
@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, DateformatPipe, ChartModule, TabsModule, AccordionModule, Carousel, Skeleton, TranslateModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  greetingMessage = ''
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  avaliabletlyloading = false;
  hasRealEvents: boolean = false;
  subscription: any;
  empinfo = {} as Ipersonal;
  destroy$: Subject<boolean> = new Subject<boolean>();
  teamMemberArray: any[] = [];
  getTeamMemberArray: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  currentMonth!: number;
  nextMonth!: number;
  currentYear!: number;
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
  teamMembers: any[] = [];
  employeesBirthdays: any[] = [];
  legendList = [
    { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
    { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
    { key: 'wfh', label: 'WFH', color: '#FF1493' },
    { key: 'leave', label: 'Leave', color: '#8A2BE2' },
    { key: 'absent', label: 'Absent', color: '#FF0000' },
  ];

  genderTotal: number = 0;
  femaleCount: number = 0;
  maleCount: number = 0;
  weeklyWorkLogs: any[] = [];
  anniversaries: any[] = [];
  todayDurationLabel: string = "00:00:00";
  previousDurationLabel: string = "00:00:00";
  todayDurationPercent: number = 0;

  constructor(
    private http: HttpService,
    private router: Router) { }

  // TEAM MEMBERS

  ngOnInit(): void {
    this.setIconBasedOnTime();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeedata = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
    this.currentTime = new Date();
    this.currentYear = new Date().getFullYear(); // e.g., 2025
    this.currentMonth = new Date().getMonth() + 1;
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const previousDate = today;
    this.previousDate = previousDate.getDate();
    console.log(this.previousDate);

    this.nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
    this.currentDate = new Date().getDate();
    this.startOfWeek = moment().startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = moment().endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss');
    this.getAllTeammembersList();
    this.getworkanniversary();
    this.getGenderCountChart();
    this.getpreviousloggedtime();
    this.gettodayloggedtime();
    this.getbrithday();
    this.loadEvents();
    this.getteamavliabletly();
    this.getWeeklyWorkLogHours();
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
      .subscribe({
        next: (responseData: any) => {
          this.loading = false;

          this.teamMembers = responseData
            .map((emp: any) => {
              const fullName =
                `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();

              return {
                name: fullName,
                role: emp.jobRole,
                photo: this.getImageUrl(emp.profilePic)
              };
            })
            .sort((a: any, b: any) =>
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
    this.http
      .getData(`Employeedata/ActiveEmployeesAnniversaries?year=${this.currentYear}&months=${this.currentMonth},${this.nextMonth}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {

          const today = new Date();
          const next30 = new Date();
          next30.setDate(today.getDate() + 30); // next 30 days

          this.anniversaries = data.filter((item: any) => {
            const doj = new Date(item.dateOfJoining);

            // Anniversary THIS year (ignore original joining year)
            const anniversaryThisYear = new Date(
              today.getFullYear(),
              doj.getMonth(),
              doj.getDate()
            );

            return anniversaryThisYear >= today && anniversaryThisYear <= next30;
          });
        },

        error: (err: any) => console.log(err),
      });
  }



  getbrithday() {
    this.http
      .getData(`Employeedata/ActiveEmployeesbday?months=${this.currentMonth},${this.nextMonth}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {

          const today = new Date();
          const next30 = new Date();
          next30.setDate(today.getDate() + 30); // next 30 days

          this.employeesBirthdays = data.filter((item: any) => {
            const dob = new Date(item.dob);

            // birthday in CURRENT year
            const birthdayThisYear = new Date(
              today.getFullYear(),
              dob.getMonth(),
              dob.getDate()
            );

            return birthdayThisYear >= today && birthdayThisYear <= next30;
          });
        },

        error: (err: any) => console.log(err),
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
    this.http
      .getData(`LeaveEntitlements/v2/employee/${empId}?year=${this.currentYear}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leavesList = res.data.map((item: any) => ({
              name: item.category?.name,
              allowed: item.allowedDays,
              used: item.utilizedDays,
              percentage: (item.utilizedDays / item.allowedDays) * 100
            }));

            // ✅ NEW: Total leaves calculation
            const totalAllowed = res.data.reduce(
              (sum: number, x: any) => sum + x.allowedDays,
              0
            );

            const totalUsed = res.data.reduce(
              (sum: number, x: any) => sum + x.utilizedDays,
              0
            );

            this.totalLeaves = {
              allowed: totalAllowed,
              used: totalUsed,
              percentage: totalAllowed === 0 ? 0 : (totalUsed / totalAllowed) * 100
            };
          }
          this.buildTotalLeavesChart();
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




  genderCountLoader = false;
  genderChartData: any = {};
  genderChartOptions: any = {};

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

        // Assign chart data (same style as your reference)
        this.genderChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Gender Count',
              data: counts,
              backgroundColor: ['#E91CAB', '#1E88E5', '#B146C3'],
              barThickness: 10,
              borderRadius: {
                topRight: 12,
                bottomRight: 12,
                topLeft: 0,
                bottomLeft: 0
              },
              borderSkipped: 'left'

            }
          ]
        };

        // Chart options (same structure as your reference)
        this.genderChartOptions = {
          responsive: true,
          maintainAspectRatio: false,

          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (tooltipItems: any) => labels[tooltipItems[0].dataIndex],
                label: (tooltipItem: any) =>
                  `${tooltipItem.dataset.label}: ${tooltipItem.raw}`
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,

                color: '#505050',
                font: { size: 10, weight: 400 }
              },
              grid: { display: false },
              ticks: {
                color: '#505050',
                font: { size: 10 },
                stepSize: 1,
                callback: (val: any) => Number.isInteger(Number(val)) ? val : ''
              }
            },
            y: {
              title: {
                display: false,

              },
              grid: { display: false },
              ticks: {
                color: '#505050',
                font: { size: 10 }
              }
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


  teamSummary: any = {};
  teamTotal: number = 0;

  teamChartData: any = {};
  teamChartOptions: any = {};

  getteamavliabletly() {
    this.avaliabletlyloading = true;
    this.http.getData(`v2/Employeedata/TeamAvailability/Summary/${this.empinfo.employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.avaliabletlyloading = false;
          this.teamSummary = res.summary;

          // Total = all except absent
          this.teamTotal =
            (this.teamSummary.inOffice || 0) +
            (this.teamSummary.halfDay || 0) +
            (this.teamSummary.wfh || 0) +
            (this.teamSummary.leave || 0) +
            (this.teamSummary.absent || 0);

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
    const keys = ["inOffice", "halfDay", "wfh", "leave", "absent"];

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
          borderWidth: 0
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
    this.http
      .getData(
        `v2/AttendanceData/employee/${this.empinfo.employeeId}?year=${this.currentYear}&month=${this.currentMonth}&date=${this.currentDate}`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

          const today = res?.data?.attendanceData?.find(
            (x: any) => x.date === this.currentYear + '-' + this.currentMonth + '-' + this.currentDate
          ) ?? res?.data?.attendanceData?.[0];

          const totalDuration = today?.duration?.totalDuration ?? "00:00:00";

          this.todayDurationLabel = totalDuration;

          const workedSeconds = this.timeToSeconds(totalDuration);
          const fullDaySeconds = 8 * 3600; // 8 hours

          this.todayDurationPercent = Math.min(
            (workedSeconds / fullDaySeconds) * 100,
            100
          );

          this.buildCircularChart();
        },
        error: err => console.log(err),
      });
  }

  getpreviousloggedtime() {
    this.http
      .getData(
        `v2/AttendanceData/employee/${this.empinfo.employeeId}?year=${this.currentYear}&month=${this.currentMonth}&date=${this.previousDate}`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

          const today = res?.data?.attendanceData?.find(
            (x: any) => x.date === this.currentYear + '-' + this.currentMonth + '-' + this.currentDate
          ) ?? res?.data?.attendanceData?.[0];

          const totalDuration = today?.duration?.totalDuration ?? "00:00:00";

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
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },

    };
  }


  getWeeklyWorkLogHours() {
    this.http
      .getData(
        `v2/AttendanceData/employee/${this.empinfo.employeeId}?fromdate=${this.startOfWeek}&todate=${this.endOfWeek}`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const attendance = res.data.attendanceData;

          // Prepare weeklyWorkLogs for template
          this.weeklyWorkLogs = attendance.map((item: any) => ({
            day: moment(item.date).format('dddd'),
            time: item.duration.totalDuration,
          }));

          // Calculate total hours of the week
          this.totalHours = this.sumDurations(
            attendance.map((item: any) => item.duration.totalDuration)
          );
        },
        error: (err) => console.log(err),
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

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  nagvition() {
    this.router.navigate(['/myinfo/job/team-members']);
  }

  myattendance() {
    this.router.navigate(['/attendance']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}