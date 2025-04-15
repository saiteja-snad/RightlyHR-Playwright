import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iinactive } from './inactive-model';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InactiveEmployeePipe } from '../../Pipes/inactive-employee.pipe';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-inactive-employees',
  imports: [CommonModule, RouterModule, InactiveEmployeePipe, TranslateModule, FormsModule],
  templateUrl: './inactive-employees.component.html',
  styleUrl: './inactive-employees.component.scss'
})

export class InactiveEmployeesComponent {
  subscription!: Subscription;
  InActive = [] as any;
  emp = {} as any;
  searchValue: any;
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal,public rbac:RbacService) { }

  ngOnInit(): void {
    this.empdata();
  }
  //function for inactive employees
  empdata() {
    this.subscription = this.http.getData(`Employeedata/InactiveEmployees`).subscribe({
      next: (data: any) => {
        this.InActive = data as Iinactive[];
      },
      error: (reason: any) => console.log(reason)
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);
    this.router.navigate(['/personalinfo']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}