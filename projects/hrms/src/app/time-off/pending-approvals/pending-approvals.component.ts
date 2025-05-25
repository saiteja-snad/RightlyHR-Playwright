import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PendingApprovalsTabsComponent } from "../../shared/time-off-module-tabs/pending-approvals-tabs/pending-approvals-tabs.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, PendingApprovalsTabsComponent, TranslateModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class PendingApprovalsComponent {
  constructor(public router: Router) { }

  navigate(){
    this.router.navigate(['/time-off/pending-approvals/probation-request']);
  }

}