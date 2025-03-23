import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-leaves',
  imports: [ CommonModule,NgbNavModule,NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule,Select],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss'
})
export class LeavesComponent {
  active=1
  totalRecords = 100
  first: any = 0;
  rows: any = 10;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

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

  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }
  
  cardItems = [
    {
      label: 'Sick leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1E8FE',
      profileColor: '#06274F',
    },
    {
      label: 'Casual Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Comp Off',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1FEF4',
      profileColor: '#2B8D6B',
    },
    {
      label: 'Optional Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE1F7',
      profileColor: '#95267A',
    },
    {
      label: 'Anniversary Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE7E1',
      profileColor: '#994530',
    },
    {
      label: 'Achievement Leaves',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE1F1',
      profileColor: '#760C46',
    },
    {
      label: 'Family/Emergency leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Birthday Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1FEE1',
      profileColor: '#0A850A',
    },
  ];
}
