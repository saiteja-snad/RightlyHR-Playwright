import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecallRequestTabsComponent } from "../../../shared/pending-approvals-tabs/recall-request-tabs/recall-request-tabs.component";

@Component({
  selector: 'app-recall-requests',
  imports: [RouterModule, RecallRequestTabsComponent],
  templateUrl: './recall-requests.component.html',
  styleUrl: './recall-requests.component.scss'
})
export class RecallRequestsComponent {

}
