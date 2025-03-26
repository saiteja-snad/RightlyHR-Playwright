import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TimeOffTabsComponent } from '../time-off-tabs/time-off-tabs.component';
import { MyExpensesTabComponent } from "../claimsandexpenses-tabs/my-expenses-tab/my-expenses-tab.component";


@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, TimeOffTabsComponent, MyExpensesTabComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(public readonly router: Router) {}
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
  isActive(route: string): boolean {
    return this.router.url.includes(route); // more flexible than strict match
  }
}