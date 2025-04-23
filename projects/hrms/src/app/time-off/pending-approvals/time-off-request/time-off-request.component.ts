import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TimeOffRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/time-off-request-tabs/time-off-request-tabs.component";
@Component({
  selector: 'app-time-off-request',
  imports: [RouterModule, TimeOffRequestTabsComponent],
  templateUrl: './time-off-request.component.html',
  styleUrl: './time-off-request.component.scss'
})

export class TimeOffRequestComponent {

}
