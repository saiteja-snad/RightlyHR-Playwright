import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-new-user-invitation-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './new-user-invitation-tabs.component.html',
  styleUrl: './new-user-invitation-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class NewUserInvitationTabsComponent {
  navTabs: any[] = [
    { label: 'Active Employees', link: '/admin/active-new-user' },
    { label: 'Trainee Active Employees', link: '/admin/prospective-new-user' },
  ];
}