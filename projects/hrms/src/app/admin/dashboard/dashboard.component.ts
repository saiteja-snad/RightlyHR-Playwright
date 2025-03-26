import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from "../document-history/document-history-layout/document-history-layout.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DocumentHistoryLayoutComponent,TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  subscription!: Subscription;
  
  ngOnInit(): void {
    this.activeEmpData();
  }
  cardItems = [
    {
      label: 'Prospective Employees',
      link: '/admin/prospective-employees',
      count: '100',
      backgroundColor: '#E1E8FE',
      profileColor: '#06274F',
    },
    {
      label: 'Active Employees',
      link: '/admin/active-employees',
      count: '200',
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Inactive Employees',
      link: '/admin/inactive-employees',
      count: '300',
      backgroundColor: '#E1FEF4',
      profileColor: '#2B8D6B',
    },
    {
      label: 'Prospective Interns',
      link: '/admin/prospective-interns',
      count: '400',
      backgroundColor: '#FEE1F7',
      profileColor: '#95267A',
    },
    {
      label: 'Active Interns',
      link: '/admin/active-interns',
      count: '500',
      backgroundColor: '#FEE7E1',
      profileColor: '#994530',
    },
    {
      label: 'Inactive Interns',
      link: '/admin/inactive-interns',
      count: '600',
      backgroundColor: '#FEE1F1',
      profileColor: '#760C46',
    },
    {
      label: 'Current Openings',
      link: '/admin/timeoff',
      count: '700',
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Probation Employees',
      link: '/admin/probation-employees',
      count: '800',
      backgroundColor: '#E1FEE1',
      profileColor: '#0A850A',
    },
  ];

  constructor(private router:Router,private http: HttpService,){

  }
  activeEmpData() {
    this.subscription = this.http
      .getData(`Employeedata/ActiveEmployees`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          
          }
      });
  }
  generateDocument(){
    this.router.navigate(['/admin/letters/offer-letter'])
  }


  
}
