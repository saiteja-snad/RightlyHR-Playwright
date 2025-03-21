import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveEmployeeComponent } from './add-prospective-employee/add-prospective-employee.component';
@Component({
  selector: 'app-prospective-employees',
  imports: [CommonModule],
  templateUrl: './prospective-employees.component.html',
  styleUrl: './prospective-employees.component.scss'
})

export class ProspectiveEmployeesComponent implements OnInit {

  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  openAddProspective() {
    this.modalService.open(AddProspectiveEmployeeComponent, { centered: true, backdrop: 'static', size:'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/dashboard'])
  }
}
