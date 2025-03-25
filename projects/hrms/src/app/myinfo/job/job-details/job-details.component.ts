import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule,Select],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Full-Time' },
    { id: 2, name: 'Part-Time' },
    { id: 3, name: 'Contract' },
    { id: 4, name: 'Internship' }
  ];

  designation: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'HR Executive' },
    { id: 4, name: 'Data Analyst' }
  ];

  location: { id: number; name: string }[] = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' }
  ];

  sublocation: { id: number; name: string; locationId: number }[] = [
    { id: 1, name: 'Brooklyn', locationId: 1 },
    { id: 2, name: 'Downtown', locationId: 1 },
    { id: 3, name: 'Hollywood', locationId: 2 },
    { id: 4, name: 'South Side', locationId: 3 }
  ];
  constructor(private modalService: NgbModal) {}

      openModal(content: any) {
        this.modalService.open(content, {centered: true, size:'lg',backdrop: 'static'});
      }
}
