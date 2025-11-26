import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent {
  greetingMessage = ''
  employeedata: any;
   // TEAM MEMBERS
  teamMembers = [
    { name: 'Ravi Kumar', role: 'UI Developer', photo: 'assets/user1.png' },
    { name: 'Sita Devi', role: 'QA Analyst', photo: 'assets/user2.png' },
    { name: 'Arjun R', role: 'Backend Engineer', photo: 'assets/user3.png' },
    { name: 'Divya S', role: 'Project Lead', photo: 'assets/user4.png' },
    { name: 'Manoj T', role: 'DevOps Engineer', photo: 'assets/user5.png' },
  ];

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
  anniversaries = [
    { name: 'Rahul Verma', date: 'Dec 10' },
    { name: 'Kavya R', date: 'Dec 14' },
    { name: 'Srinivas', date: 'Dec 20' }
  ];
  ngOnInit(): void {
    this.setIconBasedOnTime();
      this.employeedata = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
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
}
