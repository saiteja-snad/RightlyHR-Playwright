import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WfhRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/wfh-request-tabs/wfh-request-tabs.component";

@Component({
  selector: 'app-wfh-request',
  imports: [RouterModule, WfhRequestTabsComponent],
  templateUrl: './wfh-request.component.html',
  styleUrl: './wfh-request.component.scss'
})

export class WfhRequestComponent {

}
