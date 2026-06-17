import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Carousel } from 'primeng/carousel';
import { Skeleton } from 'primeng/skeleton';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { IBirthDaysData, IAnniversariesData, INewJoinee, IMarriageAnniversary } from '../../Interfaces/dashboard.modal';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { Ipersonal } from '../../Interfaces/personal-modal';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbPopoverModule, Carousel, ChartModule, Skeleton, AccordionModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})

export class DashboardLayoutComponent {
  selectedEmployeeId: any;
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  hasRealEvents: boolean = false;
  subscription: any;
  private intervalId: any;
  empinfo = {} as Ipersonal;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentMonth!: number;
  nextMonth!: number;
  currentYear!: number;
  eventsLoader = false;
  eventItems: any[] = [];
  currentDate: number = new Date().getDate();
  previousDate: any;
  startOfWeek: any;
  endOfWeek: any;
  brithdayloader = false;
  anniversariesloader = false;
  employeesBirthdays: any[] = [];
  anniversaries: any[] = [];
  selectedDate!: Date;
  selectedWeek: Date[] | null = null;
  today = new Date();
  disabledDates: Date[] = [];
  intialLoading = false;
  currentDay!: number;
  todayMaxdate!: Date
  previousMonthStartDate: any;

  constructor(private http: HttpService, public modalService: NgbModal, public rbac: RbacService,) { }

  ngOnInit(): void {
    this.intialLoading = true;
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
    this.getworkanniversary();
    this.getbrithday();
    this.loadEvents();
    this.selectedDate = new Date(); // current date by default
    this.buildDisabledFutureWeekDates();
    this.intialLoading = false;
    this.todayMaxdate = new Date();
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
        console.log(err);
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

  // Custom carousel indicator properties
  currentCarouselIndex = 0;
  get activeIndicatorIndex() {
    return this.currentCarouselIndex % 3;
  }

  onCarouselPageChange(event: any) {
    this.currentCarouselIndex = event.page;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  timeToSeconds(time: string | null | undefined): number {
    if (!time || !time.includes(':')) return 0;
    const parts = time.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;
    return h * 3600 + m * 60 + s;
  }

  setCurrentWeek() {
    const start = moment().startOf('isoWeek');
    const end = moment().endOf('isoWeek');
    this.startOfWeek = start.format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = end.format('YYYY-MM-DDTHH:mm:ss');
    this.selectedWeek = [start.toDate(), end.toDate()];
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

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}