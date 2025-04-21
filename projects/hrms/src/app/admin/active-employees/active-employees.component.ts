import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iactive } from './active-model';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-active-employees',
  imports: [CommonModule, RouterModule, ActiveEmployeePipe, TranslateModule, FormsModule, DataLoaderContentComponent],
  templateUrl: './active-employees.component.html',
  styleUrl: './active-employees.component.scss'
})

export class ActiveEmployeesComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  Active = [] as Iactive[];
  searchValue: any;
  emp = {} as any;
  loader = false;

  constructor(private router: Router, private http: HttpService, private modalService: NgbModal,public rbac:RbacService) { }

  ngOnInit(): void {
    this.empdata();
  }

  //function for active Employees
  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/ActiveEmployeeswithJobDetails`).subscribe({
      next: (data: any) => {
        this.Active = data as Iactive[];
        this.loader = false;
      },
      error: (reason: any) => console.log(reason)
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    this.router.navigate(['/personalinfo']);
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}