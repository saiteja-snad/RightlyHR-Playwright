import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventApi, EventInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { firstValueFrom, Subscription } from 'rxjs';
import { IemployeeDetails } from '../../Interfaces/job-model';
import { HttpService } from '../../services/http.service';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, TranslateModule, FullCalendarModule, FormsModule],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  calendarOptions!: CalendarOptions;
  eventsPromise!: Promise<EventInput[]>;
  @ViewChild(FullCalendarComponent) fullcalendar!: FullCalendarComponent;
  subscription!: Subscription;
  employeeInfo = {} as IemployeeDetails;
  mixedMonth!: any;
  changeYear!: number;
  currentMonth!: number;
  currentendMonth!: number;
  currentEvents: EventApi[] = [];
  originalEvents: EventApi[] = [];
  showBirthdays: boolean = true;
  showAnniversaries: boolean = true;
  showJoinees: boolean = true;
  showCustomEvents: boolean = true;
  showCompOffs: boolean = true;
  showHolidays: boolean = true;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private http: HttpService, 
    public rbac : RbacService
  ) {}

  ngOnInit(): void {
    this.filterEventsByTitle();
    this.employeeInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    this.mixedMonth = currentDate.getMonth() + 1; // getMonth() returns 0 for January, so add 1
    this.changeYear = new Date(currentDate).getFullYear();
  }

  handleDatesSet(arg: any) {
    const currentDate = arg.view.currentStart;
    const currentendDate = arg.view.currentEnd;
    this.currentMonth = new Date(currentDate).getMonth() + 1;
    this.currentendMonth = new Date(currentendDate).getMonth() + 1;
    this.changeYear = new Date(currentDate).getFullYear();
    this.mixedMonth = `${this.currentMonth},${this.currentendMonth}`;
    this.filterEventsByTitle();
  }

  getOrdinalSuffix(number: any) {
    if (number > 0) {
      const lastDigit = number % 10;
      const secondLastDigit = Math.floor(number / 10) % 10;
      if (secondLastDigit === 1) return 'th'; // Special case for numbers ending in 11, 12, 13
      switch (lastDigit) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }
    return '';
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.originalEvents = events;
    this.changeDetector.detectChanges();
  }

  isEventDuplicate(events: any[], title: any, startDate: any) {
    return events.some(
      (event) => event.title === title && event.start === startDate
    );
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
  }

  filterEventsByTitle() {
    this.showCalendar();
  }

  showCalendar() {
    this.calendarOptions = {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next customTodayButton',
        center: 'title',
        right: 'customMonthButton,customWeekButton,customDayButton,customlistButton',
      },
      customButtons: {
        customTodayButton: {
          text: 'Today',
          click: () => {
            const calendarApi = this.fullcalendar.getApi();
            calendarApi.today();
          },
        },
        customMonthButton: {
          text: 'Month',
          click: () => {
            const calendarApi = this.fullcalendar.getApi();
            calendarApi.changeView('dayGridMonth');
          },
        },
        customWeekButton: {
          text: 'Week',
          click: () => {
            const calendarApi = this.fullcalendar.getApi();
            calendarApi.changeView('timeGridWeek');
          },
        },
        customDayButton: {
          text: 'Day',
          click: () => {
            const calendarApi = this.fullcalendar.getApi();
            calendarApi.changeView('timeGridDay');
          },
        },
        customlistButton: {
          text: 'List',
          click: () => {
            const calendarApi = this.fullcalendar.getApi();
            calendarApi.changeView('listWeek');
          },
        },
      },
      weekends: true,
      editable: false,
      allDayText: 'All Day',
      events: this.LoadEvents.bind(this),
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      eventsSet: this.handleEvents.bind(this),
      datesSet: this.handleDatesSet.bind(this),
    };
  }

  async LoadEvents(): Promise<any[]> {
    try {
      const employeeId = parseInt(this.employeeInfo.employeeId, 10);
      const apiEndpoints = [
        `Employeedata/ActiveEmployeesbday?months=${this.mixedMonth}`,
        `Employeedata/ActiveEmployeesAnniversaries?year=${this.changeYear}&months=${this.mixedMonth}`,
        `Employeedata/Newjoinee?year=${this.changeYear}&months=${this.mixedMonth}`,
        `orgHolidays/getOrgHoliday/${employeeId}?year=${this.changeYear}`,
      ];
      const apiPromises = apiEndpoints.map((endpoint) =>
        firstValueFrom(this.http.getData(endpoint))
      );
      const results = await Promise.all(apiPromises);
      const events: any[] = [];
      for (let index = 0; index < results?.length; index++) {
        const allEventsData: any = results[index];
        for (let j = 0; j < allEventsData?.length; j++) {
          // Birthdays
          if (index === 0 && this.showBirthdays) {
            const bday = new Date(allEventsData[j].dob);
            const formattedBday = `${this.changeYear}-${String(bday.getMonth() + 1).padStart(2, '0')}-${String(bday.getDate()).padStart(2, '0')}`;
            events.push({
              title: (allEventsData[j].fusionEmpId ? `(${allEventsData[j].fusionEmpId})`:'') + 
              `${allEventsData[j].firstName} ${allEventsData[j].lastName}'s` + ` Birthday`,
              start: formattedBday,
              color: 'rgb(143, 143, 204)',
              textColor: 'black',
              display: 'calendar/birthday.png',
            });
          }
          // Anniversaries
          if (index === 1 && this.showAnniversaries) {
            const joinDate = new Date(allEventsData[j].dateOfJoining);
            const formattedJoinDate = `${this.changeYear}-${String(joinDate.getMonth() + 1).padStart(2, '0')}-${String(joinDate.getDate()).padStart(2, '0')}`;
            if (allEventsData[j]?.anniversaryYearCount > 0) {
              events.push({
                title:
                  (allEventsData[j].fusionEmpId ? ` (${allEventsData[j].fusionEmpId})` : '') +
                  ` ${allEventsData[j]?.firstName ?? ''} ${
                    allEventsData[j]?.middleName ?? ''
                  } ${allEventsData[j]?.lastName ?? ''}'s` +
                  ` ${
                    allEventsData[j].anniversaryYearCount
                  }${this.getOrdinalSuffix(
                    allEventsData[j].anniversaryYearCount
                  )} Work Anniversary`,
                start: formattedJoinDate,
                color: 'rgb(204, 143, 143)',
                textColor: 'black',
                display: 'calendar/milestone.png',
              });
            }
          }
          // New Joinees
          if (index === 2 && this.showJoinees) {
            const joinDate = new Date(allEventsData[j].dateOfJoining);
            const formattedJoinDate = `${this.changeYear}-${String(
              joinDate.getMonth() + 1
            ).padStart(2, '0')}-${String(joinDate.getDate()).padStart(2, '0')}`;
            events.push({
              title:
                (allEventsData[j].fusionEmpId ? `(${allEventsData[j].fusionEmpId})` : '') +
                `${allEventsData[j].firstName} ${allEventsData[j].lastName} joined as ${allEventsData[j].jobRole}`,
              start: formattedJoinDate,
              color: 'rgb(204, 204, 143)',
              textColor: 'black',
              display: 'calendar/new-joinees.png',
            });
          }
        }
        // Holidays (index === 3)
        const holidaysResult = results[3] as { orgHolidaysItems: any[] };
        if (index === 3 && this.showHolidays && holidaysResult) {
          const orgHolidaysItems = holidaysResult.orgHolidaysItems;
          for (let j = 0; j < orgHolidaysItems?.length; j++) {
            const holidayDate = new Date(orgHolidaysItems[j].holidayDate);
            const formattedHolidayDate = `${this.changeYear}-${String(
              holidayDate.getMonth() + 1
            ).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(
              2,
              '0'
            )}`;
            const eventTitle = `${orgHolidaysItems[j].holidayName}${
              orgHolidaysItems[j].isOptional ? ' (Optional)' : ''
            }`;

            if (
              orgHolidaysItems[j].status === 'Published' &&
              !this.isEventDuplicate(events, eventTitle, formattedHolidayDate)
            ) {
              events.push({
                title: eventTitle,
                start: formattedHolidayDate,
                color: '#28692b4d',
                textColor: 'black',
                display: 'calendar/birthday.png',
              });
            }
          }
        }
      }
      return events;
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  ngOnDestroy(): void {}
}