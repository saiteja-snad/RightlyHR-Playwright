import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PendingApprovalsTabsComponent } from "../../shared/time-off-module-tabs/pending-approvals-tabs/pending-approvals-tabs.component";
@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, PendingApprovalsTabsComponent],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss'
})

export class PendingApprovalsComponent {
  constructor(public router: Router) {

  }
}