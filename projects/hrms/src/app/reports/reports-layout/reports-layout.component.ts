import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StandardReportTabsComponent } from "../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";

@Component({
  selector: 'app-reports-layout',
  imports: [
    RouterModule, 
    CommonModule, 
    StandardReportTabsComponent
  ],
  templateUrl: './reports-layout.component.html',
  styleUrl: './reports-layout.component.scss'
})

export class ReportsLayoutComponent {
   constructor(public router:Router){

   }
}
