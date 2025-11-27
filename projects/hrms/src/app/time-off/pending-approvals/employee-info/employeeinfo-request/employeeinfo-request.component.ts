import { Component } from '@angular/core';
import { ClaimsandexpenesPendingApprovalTabsComponent } from '../../../../shared/claimsandexpenes-pending-approval-tabs/claimsandexpenes-pending-approval-tabs.component';
import { RouterModule } from '@angular/router';
import { EmployeeinfoPendingApprovalTabsComponent } from "../../../../shared/employeeinfo-pending-approval-tabs/employeeinfo-pending-approval-tabs.component";

@Component({
  selector: 'app-employeeinfo-request',
   imports: [RouterModule, EmployeeinfoPendingApprovalTabsComponent],
  templateUrl: './employeeinfo-request.component.html',
  styleUrl: './employeeinfo-request.component.scss'
})
export class EmployeeinfoRequestComponent {

}
