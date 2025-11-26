import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { environment } from '../../../environments/environment';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { ICategoryDetails } from '../../settings/time-off/flexible-leave-allocation/leave-allocation.model';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, DateformatPipe],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
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

  // LEAVE TYPES (DUMMY)
  leaveTypes = [
    { type: 'Casual Leave', value: 6 },
    { type: 'Sick Leave', value: 2 },
    { type: 'Earned Leave', value: 4 }
  ];

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
    this.currentMonth = 12;
    this.getAllTeammembersList();
    this.getworkanniversary();
    this.getbrithday();
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
}
