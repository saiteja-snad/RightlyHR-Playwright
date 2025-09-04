import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RemoteLoginRequestTabsComponent } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/remote-login-request-tabs/remote-login-request-tabs.component';

@Component({
  selector: 'app-remote-login-request',
  imports: [CommonModule,RouterModule,RemoteLoginRequestTabsComponent],
  templateUrl: './remote-login-request.component.html',
  styleUrl: './remote-login-request.component.scss'
})
export class RemoteLoginRequestComponent {

}
