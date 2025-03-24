import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule,NgbPopoverModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent {
   attendanceData = [
    { date: "01-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "First Half Leave" },
    { date: "02-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "03-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half Leave" },
    { date: "04-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Absent" },
    { date: "05-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "First Half WFH" },
    { date: "08-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Absent" },
    { date: "09-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "10-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half WFH" },
    { date: "11-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "12-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "13-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "14-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half Leave" },
    { date: "15-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "16-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" }
  ];
  

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
      case 'absent(permission)':
        return 'status-absent';
      case 'leave':
      case 'first half leave':
      case 'second half leave':
        return 'status-leave';
      case 'wfh':
      case 'first half wfh':
      case 'second half wfh':
        return 'status-wfh';
      case 'weekend':
        return 'status-weekend';
      case 'no records':
      case 'norecords':
        return 'status-norecords';
      default:
        return '';
    }
  }
  
}
