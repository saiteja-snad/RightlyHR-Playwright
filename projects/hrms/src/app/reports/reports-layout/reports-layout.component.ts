import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReportsMainTabsComponent } from "../../shared/reports-tabs/reports-main-tabs/reports-main-tabs.component";

@Component({
  selector: 'app-reports-layout',
  imports: [RouterModule, CommonModule, ReportsMainTabsComponent],
  templateUrl: './reports-layout.component.html',
  styleUrl: './reports-layout.component.scss'
})

export class ReportsLayoutComponent {
  constructor(public router: Router) {

  }
}