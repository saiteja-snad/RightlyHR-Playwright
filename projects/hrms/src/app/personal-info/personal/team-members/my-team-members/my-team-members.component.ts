import { Component } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MyInfoTeamNumbersTabComponent } from "../../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-team-members',
  imports: [TeamMembersTabsComponent, NoDataFoundComponent, MyInfoTeamNumbersTabComponent,CommonModule],
  templateUrl: './my-team-members.component.html',
  styleUrl: './my-team-members.component.scss'
})
export class MyTeamMembersComponent {

  constructor(private router: Router) { }
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
