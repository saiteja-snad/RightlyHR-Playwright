import { Component } from '@angular/core';
import { AttendanceRegularizationRequestTabsComponent } from "../../../shared/pending-approvals-tabs/attendance-regularization-request-tabs/attendance-regularization-request-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-regularization-request',
  imports: [AttendanceRegularizationRequestTabsComponent,RouterModule],
  templateUrl: './regularization-request.component.html',
  styleUrl: './regularization-request.component.scss'
})
export class RegularizationRequestComponent {

}
