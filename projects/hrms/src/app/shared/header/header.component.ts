import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  events = [
    { name: "John Doe's (SD153462) Birthday", time: '1 hour ago', type: 'birthday' },
    { name: "Jane's (SD164732) Anniversary", time: '3 hours ago', type: 'anniversary' },
    { name: 'Team Meeting with HR', time: '1 day ago', type: 'meeting' },
    { name: 'Holiday', time: '1 day ago', type: 'holiday' },
  ];

  // Define colors based on event types
  getEventClass(type: string): string {
    switch (type) {
      case 'birthday':
        return 'birthday-event';
      case 'anniversary':
        return 'anniversary-event';
      case 'holiday':
        return 'holiday-event';
      default:
        return 'other-event'; // Custom class for Other events
    }
  }
}