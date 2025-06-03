import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NewUserInvitationTabsComponent } from "../../shared/new-user-invitation-tabs/new-user-invitation-tabs.component";
@Component({
  selector: 'app-invite-user-layout',
  imports: [CommonModule, RouterModule, NewUserInvitationTabsComponent],
  templateUrl: './invite-user-layout.component.html',
  styleUrl: './invite-user-layout.component.scss'
})

export class InviteUserLayoutComponent {
  constructor(public router: Router) { }
  
  navigateEmployeeManagement() {
    this.router.navigate(['/employee-management']);
  }
}