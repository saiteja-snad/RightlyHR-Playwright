import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeskRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/desk-request-tabs/desk-request-tabs.component";


@Component({
  selector: 'app-desk-approval-request',
  imports: [CommonModule, RouterModule, DeskRequestTabsComponent],
  templateUrl: './desk-approval-request.component.html',
  styleUrl: './desk-approval-request.component.scss'
})
export class DeskApprovalRequestComponent {

}
