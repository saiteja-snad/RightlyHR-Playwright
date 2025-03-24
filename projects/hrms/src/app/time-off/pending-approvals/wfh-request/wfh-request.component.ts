import { Component } from '@angular/core';
import { WfhRequestTabsComponent } from "../../../shared/pending-approvals-tabs/wfh-request-tabs/wfh-request-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-wfh-request',
  imports: [WfhRequestTabsComponent,RouterModule],
  templateUrl: './wfh-request.component.html',
  styleUrl: './wfh-request.component.scss'
})
export class WfhRequestComponent {

}
