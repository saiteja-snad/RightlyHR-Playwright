import { Component } from '@angular/core';
import { CompOffApprovalTabsComponent } from "../../shared/comp-off-approval-tabs/comp-off-approval-tabs.component";
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comp-off',
  imports: [CompOffApprovalTabsComponent,RouterModule],
  templateUrl: './comp-off.component.html',
  styleUrl: './comp-off.component.scss'
})
export class CompOffComponent {
  constructor(private modalService: NgbModal) {}

  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
}
