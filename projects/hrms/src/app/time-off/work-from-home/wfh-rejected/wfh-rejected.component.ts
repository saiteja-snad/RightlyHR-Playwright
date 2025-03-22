import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-wfh-rejected',
  imports: [CommonModule,NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule],
  templateUrl: './wfh-rejected.component.html',
  styleUrl: './wfh-rejected.component.scss'
})
export class WfhRejectedComponent {
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
