import { Component } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-my-team-members',
  imports: [TeamMembersTabsComponent, NoDataFoundComponent],
  templateUrl: './my-team-members.component.html',
  styleUrl: './my-team-members.component.scss'
})
export class MyTeamMembersComponent {

}
