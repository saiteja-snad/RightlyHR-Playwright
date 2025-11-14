import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-job-approvals',
  imports: [CommonModule, TranslateModule],
  templateUrl: './job-approvals.component.html',
  styleUrl: './job-approvals.component.scss'
})
export class JobApprovalsComponent {

}
