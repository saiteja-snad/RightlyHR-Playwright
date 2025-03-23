import { Component } from '@angular/core';
import { OnBeHalfOfApprovalTabsComponent } from "../../shared/on-be-half-of-approval-tabs/on-be-half-of-approval-tabs.component";
import { RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-on-be-half-of',
  imports: [OnBeHalfOfApprovalTabsComponent,RouterModule,Select],
  templateUrl: './on-be-half-of.component.html',
  styleUrl: './on-be-half-of.component.scss'
})
export class OnBeHalfOfComponent {
  leaveType: { id: number; name: string }[] = [
    { id: 1, name: 'Leaves' },
    { id: 2, name: 'Sick' },
    { id: 3, name: 'Casual' },
    { id: 4, name: 'Earned'  }
  ];
  constructor(private modalService: NgbModal) {}

  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }

}
