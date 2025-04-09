import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PendingApprovalsTabsComponent } from '../../shared/pending-approvals-tabs/pending-approvals-tabs.component';


@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, PendingApprovalsTabsComponent],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss'
})
export class PendingApprovalsComponent {

}
