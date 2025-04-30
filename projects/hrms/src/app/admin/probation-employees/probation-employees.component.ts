import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { IProbationEmployees } from './probation-emp-module';
import { FormsModule } from '@angular/forms';
import { ProbationpipePipe } from "../../Pipes/probationpipe.pipe";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-probation-employees',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, ProbationpipePipe, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './probation-employees.component.html',
  styleUrl: './probation-employees.component.scss'
})

export class ProbationEmployeesComponent {
  searchValue: any;
  subscription!: Subscription
  probationemp = [] as any
  emp = {} as any;
  empinfo = {} as IProbationEmployees;
  StatusMsg : any;
  probationDuration:any;
  loader = false;
  
  constructor(private router: Router,private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getProbationEmployees()
  }

  getProbationEmployees() {
    this.loader = true;
    this.subscription = this.http.getData(`ProbationFlow/getProbationEmployeesStatus`).subscribe({
      next: (data: any) => {
        this.probationemp = data as IProbationEmployees[]
        this.probationemp.probationEndDate=this.formatDate(this.probationemp.probationEndDate);
        this.loader = false;
      }
    })
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    this.router.navigate(['/personalinfo']);
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