import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-reports-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './reports-layout.component.html',
  styleUrl: './reports-layout.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class ReportsLayoutComponent {
 
}