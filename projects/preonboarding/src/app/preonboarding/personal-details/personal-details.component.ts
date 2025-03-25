import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { ProgressService } from '../../common-services/progress.service';
@Component({
  selector: 'app-personal-details',
  imports: [CommonModule, Select],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss'
})

export class PersonalDetailsComponent implements OnInit{
  currentStep: string = '';
  // Dummy data for dropdowns
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

  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal,private ProgressServices: ProgressService) { }

  ngOnInit(): void {
    this.ProgressServices.step$.subscribe((step) => {
      this.currentStep = '0';
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  navigateDocumentUpload(){
    this.router.navigate(['/document']);
  }
}