import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";

@Component({
  selector: 'app-timesheets-layout',
  imports: [RouterModule, CommonModule, TimesheetsTabsComponent],
  templateUrl: './timesheets-layout.component.html',
  styleUrl: './timesheets-layout.component.scss'
})

export class TimesheetsLayoutComponent { }