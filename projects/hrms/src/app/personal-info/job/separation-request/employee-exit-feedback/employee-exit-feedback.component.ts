import { Component } from '@angular/core';
import { SeparationSubTabsComponent } from "../../../../shared/personalinfo-tabs/separation-sub-tabs/separation-sub-tabs.component";
import { MyinfoSeparationSubTabsComponent } from "../../../../shared/myinfo-tabs/myinfo-separation-sub-tabs/myinfo-separation-sub-tabs.component";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-exit-feedback',
  imports: [CommonModule,  SeparationSubTabsComponent, MyinfoSeparationSubTabsComponent],
  templateUrl: './employee-exit-feedback.component.html',
  styleUrl: './employee-exit-feedback.component.scss'
})
export class EmployeeExitFeedbackComponent {

  constructor(
    private router: Router,
  ) {
    // Initialize any required services or dependencies here
  }

   isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
