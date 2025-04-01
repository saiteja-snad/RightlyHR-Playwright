import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { IProbationEmployees } from './probation-emp-module';
import { ProbationEmpPipe } from "../../Pipes/probation-emp.pipe";
import { DataformatPipe } from "../../Pipes/dataformat.pipe";
import { FormsModule } from '@angular/forms';
// import * as moment from 'moment';
@Component({
  selector: 'app-probation-employees',
  imports: [CommonModule, RouterModule, TranslateModule, ProbationEmpPipe, DataformatPipe,FormsModule],
  templateUrl: './probation-employees.component.html',
  styleUrl: './probation-employees.component.scss'
})
export class ProbationEmployeesComponent {
  searchValue: any;
  subscription!:Subscription
  probationemp=[] as any
  emp={} as any;
  empinfo = {} as IProbationEmployees;
  StatusMsg : any;
  probationDuration:any;
  constructor(private router: Router,private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getProbationEmployees()
  }
  getProbationEmployees(){
    this.subscription = this.http.getData(`ProbationFlow/getProbationEmployeesStatus`).subscribe({
      next:(data:any) =>{
        console.log(data);
        this.probationemp = data as IProbationEmployees[]
        // this.getprobationPeriodData();
        this.probationemp.probationEndDate=this.formatDate(this.probationemp.probationEndDate);

      }
    })
  }
  select(act: any) {
    this.emp=localStorage.setItem("personaldata", JSON.stringify(act));
    console.log(this.emp);
    localStorage.setItem("routestatus",'Probation');
    this.router.navigate(["/admin/personal"]);

  }
  formatDate(data: any): any {
    if (data) {
 
      // return moment(data).format('YYYY-MM-DD');
    }
    return data
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
