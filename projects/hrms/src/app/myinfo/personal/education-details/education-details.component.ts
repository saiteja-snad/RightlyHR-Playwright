import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-education-details',
  imports: [CommonModule,Select],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})
export class EducationDetailsComponent {
  educationtypes=[
    {label: 'Select', value: null}, ]

  constructor(private modalService: NgbModal) {}

      openModal(content: any) {
        this.modalService.open(content, {centered: true, size:'lg',backdrop: 'static'});
      }
}
