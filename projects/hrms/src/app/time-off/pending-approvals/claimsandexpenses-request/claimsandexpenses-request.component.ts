import { Component } from '@angular/core';
import { ClaimsandexpenesPendingApprovalTabsComponent } from "../../../shared/claimsandexpenes-pending-approval-tabs/claimsandexpenes-pending-approval-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-claimsandexpenses-request',
  imports: [ClaimsandexpenesPendingApprovalTabsComponent,RouterModule],
  templateUrl: './claimsandexpenses-request.component.html',
  styleUrl: './claimsandexpenses-request.component.scss'
})
export class ClaimsandexpensesRequestComponent {

}
