import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
@Component({
  selector: 'app-timesheets-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './timesheets-layout.component.html',
  styleUrl: './timesheets-layout.component.scss'
})

export class TimesheetsLayoutComponent { }