import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AttendanceRegularizationRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/attendance-regularization-request-tabs/attendance-regularization-request-tabs.component";
@Component({
  selector: 'app-regularization-request',
  imports: [RouterModule, AttendanceRegularizationRequestTabsComponent],
  templateUrl: './regularization-request.component.html',
  styleUrl: './regularization-request.component.scss'
})
export class RegularizationRequestComponent {

}
