import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-team-numbers',
  imports: [CommonModule,Select,FormsModule, PaginatorModule, DropdownModule],
  templateUrl: './team-numbers.component.html',
  styleUrl: './team-numbers.component.scss'
})
export class TeamNumbersComponent {
  rmData=[
    {name:'Rajesh',designation:'Software Engineer',team:'Development',location:'Bangalore'}]
    totalRecords = 100
    first: any = 0;
    rows: any = 10;
  
    options = [
      { label: 10, value: 10 },
      { label: 15, value: 15 },
      { label: 20, value: 20 },
      { label: 25, value: 25 }
    ];
  
  constructor(private modalService: NgbModal) { }
  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true,backdrop: 'static' });
  }
}
