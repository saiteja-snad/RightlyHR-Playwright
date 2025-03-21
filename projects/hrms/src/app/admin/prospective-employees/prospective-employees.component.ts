import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('success') success: any;
  @ViewChild('confirmation') confirmation: any;
  @ViewChild('verificationbyPartnerHead ') verificationbyPartnerHead: any;
  @ViewChild('verificationbySalesManager') verificationbySalesManager: any;
  
  constructor(private router: Router,private modalService: NgbModal, ) { }

  ngOnInit(): void {

  }

  openAddProspective(){
    this.modalService.open(AddProspectiveEmployeeComponent,{centered:true,backdrop:'static'});
  }

  navigateDashboard(){
    this.router.navigate(['/dashboard'])
  }
}
