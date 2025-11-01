import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule,ChartModule,RouterModule,CardModule],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss'
})
export class SkillsetDashboardComponent {

}
