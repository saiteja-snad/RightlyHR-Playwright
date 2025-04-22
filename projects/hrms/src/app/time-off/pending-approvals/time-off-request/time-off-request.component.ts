import { Component } from '@angular/core';
import { TimeOffRequestTabsComponent } from "../../../shared/pending-approvals-tabs/time-off-request-tabs/time-off-request-tabs.component";
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-time-off-request',
  imports: [TimeOffRequestTabsComponent,RouterModule],
  templateUrl: './time-off-request.component.html',
  styleUrl: './time-off-request.component.scss'
})

export class TimeOffRequestComponent {

}
