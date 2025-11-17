import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-documents-approvals',
  imports: [CommonModule, TranslateModule, NoDataFoundComponent],
  templateUrl: './documents-approvals.component.html',
  styleUrl: './documents-approvals.component.scss'
})
export class DocumentsApprovalsComponent{
}
