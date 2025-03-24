import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-wfh-waiting-for-approval',
  imports: [CommonModule, FormsModule, PaginatorModule, DropdownModule,NgbPopoverModule],
  templateUrl: './wfh-waiting-for-approval.component.html',
  styleUrl: './wfh-waiting-for-approval.component.scss'
})
export class WfhWaitingForApprovalComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }

}
