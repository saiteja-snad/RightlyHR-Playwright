import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './reports-layout.component.html',
  styleUrl: './reports-layout.component.scss'
})

export class ReportsLayoutComponent {
  constructor(public router: Router) {

  }
}