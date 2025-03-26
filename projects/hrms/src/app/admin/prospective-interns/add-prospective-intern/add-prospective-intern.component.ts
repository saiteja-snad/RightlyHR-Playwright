import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-prospective-intern',
  imports: [CommonModule,Select,TranslateModule],
  templateUrl: './add-prospective-intern.component.html',
  styleUrl: './add-prospective-intern.component.scss'
})
export class AddProspectiveInternComponent {
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
    
    constructor(private router: Router,private modalService: NgbModal ) { }
  
    close(){
      this.modalService.dismissAll();
    }
}
