import { CommonModule } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveEmployeeComponent } from './add-prospective-employee/add-prospective-employee.component';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import {  Iprospective } from './Prospective-model';
import { TranslateModule } from '@ngx-translate/core';
import { ProspectivePipe } from '../../Pipes/prospective.pipe';
@Component({
  selector: 'app-prospective-employees',
  imports: [CommonModule, FormsModule, ProspectivePipe,TranslateModule],
  templateUrl: './prospective-employees.component.html',
  styleUrl: './prospective-employees.component.scss'
})

export class ProspectiveEmployeesComponent implements OnInit {
  Prospective = [] as any;
  searchValue: any;
  subscription!: Subscription;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  constructor(private router: Router,private http:HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
      this.empdata();
      this.jobLocationList();
      this.http.activeTabSubject
      .subscribe((selectedObj) => {
        console.log('Received designation from child via Observable:', selectedObj);
        this.empdata();
      });
  }
  empdata() {
    this.subscription = this.http
      .getData(`Employeedata/ProspectiveEmployees`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        
           this.Prospective = data as Iprospective[];
        },

        error: (reason: any) => console.log(reason),
      });
  }
  jobLocationList() {
    this.subscription = this.http
      .getData(`JobLocation/getAllLocations`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.jobLocationDropDownData = data;
        },
      });
  }
  openAddProspective() {
    this.modalService.open(AddProspectiveEmployeeComponent, { centered: true, backdrop: 'static', size:'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);
    this.router.navigate(['/personalinfo']);
  }

}
