import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iactive } from './active-model';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-active-employees',
  imports: [CommonModule, RouterModule, ActiveEmployeePipe,TranslateModule,FormsModule],
  templateUrl: './active-employees.component.html',
  styleUrl: './active-employees.component.scss'
})

export class ActiveEmployeesComponent {
  subscription!: Subscription;
  Active=[] as Iactive[];
  searchValue: any;
  emp={} as any;
  constructor(private router: Router,private http:HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
this.empdata();
  }
//function for active Employees
empdata() {
  this.subscription = this.http.getData(`Employeedata/ActiveEmployeeswithJobDetails`).subscribe({
    next: (data: any) => {
      console.log(data);
   this.Active = data as Iactive[];
    },

    error: (reason: any) => console.log(reason)
  });

}
select(act: any) {
  this.emp=localStorage.setItem("personaldata", JSON.stringify(act));
  console.log(this.emp);

  this.router.navigate(["/admin/personal"])

}
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
