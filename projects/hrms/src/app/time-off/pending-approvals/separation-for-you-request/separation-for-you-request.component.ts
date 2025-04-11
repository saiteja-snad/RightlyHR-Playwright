import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-separation-for-you-request',
  imports: [CommonModule,RouterModule,NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule],
  templateUrl: './separation-for-you-request.component.html',
  styleUrl: './separation-for-you-request.component.scss'
})
export class SeparationForYouRequestComponent {
totalRecords = 100
   first: any = 0;
   rows: any = 10;
 
   options = [
     { label: 10, value: 10 },
     { label: 15, value: 15 },
     { label: 20, value: 20 },
     { label: 25, value: 25 }
   ];
   constructor(private modalService: NgbModal) {}
 
   openModal(content: any) {
     this.modalService.open(content, {centered: true,backdrop: 'static' });
   }
   onRowsChange() {
     this.first = 0;
 
   }
   onPageChange(event: PaginatorState) {
     this.first = event.first;
     this.rows = event.rows;
 
   }
}
