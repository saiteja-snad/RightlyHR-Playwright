import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-bank-details',
  imports: [Select,CommonModule],
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.scss'
})
export class BankDetailsComponent {
  educationtypes=[
    {label: 'Select', value: null}, ]

  constructor(private modalService: NgbModal) {}

      openModal(content: any) {
        this.modalService.open(content, {centered: true, size:'lg',backdrop: 'static'});
      }
}
