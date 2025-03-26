import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-identity-details',
  imports: [CommonModule, Select],
  templateUrl: './identity-details.component.html',
  styleUrl: './identity-details.component.scss'
})
export class IdentityDetailsComponent {
  educationtypes = [
    { label: 'High School', value: 'high_school' },
    { label: 'Associate Degree', value: 'associate_degree' },
    { label: 'Bachelor\'s Degree', value: 'bachelors_degree' },
    { label: 'Master\'s Degree', value: 'masters_degree' },
    { label: 'Doctorate', value: 'doctorate' },
    { label: 'Professional Certification', value: 'professional_certification' },
    { label: 'Diploma', value: 'diploma' },
    { label: 'Other', value: 'other' }
  ];

  constructor(private modalService: NgbModal) { }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
}
