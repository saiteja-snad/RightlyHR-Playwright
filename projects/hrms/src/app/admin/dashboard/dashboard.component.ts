import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from "../document-history/document-history-layout/document-history-layout.component";
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DocumentHistoryLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  cardItems = [
    {
      label: 'Prospective Employees',
      link: '/prospective-employees',
      count: '100',
      backgroundColor: '#E1E8FE',
      profileColor: '#06274F',
    },
    {
      label: 'Active Employees',
      link: '/active-employees',
      count: '200',
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Inactive Employees',
      link: '/inactive-employees',
      count: '300',
      backgroundColor: '#E1FEF4',
      profileColor: '#2B8D6B',
    },
    {
      label: 'Prospective Interns',
      link: '/prospective-interns',
      count: '400',
      backgroundColor: '#FEE1F7',
      profileColor: '#95267A',
    },
    {
      label: 'Active Interns',
      link: '/active-interns',
      count: '500',
      backgroundColor: '#FEE7E1',
      profileColor: '#994530',
    },
    {
      label: 'Inactive Interns',
      link: '/inactive-interns',
      count: '600',
      backgroundColor: '#FEE1F1',
      profileColor: '#760C46',
    },
    {
      label: 'Current Openings',
      link: '/timeoff',
      count: '700',
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Probation Employees',
      link: '/probation-employees',
      count: '800',
      backgroundColor: '#E1FEE1',
      profileColor: '#0A850A',
    },
  ];
}
