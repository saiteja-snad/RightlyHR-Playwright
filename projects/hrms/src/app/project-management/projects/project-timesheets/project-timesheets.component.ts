import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectTimesheetTabsComponent } from "../../../shared/project-management-tabs/project-timesheet-tabs/project-timesheet-tabs.component";
@Component({
  selector: 'app-project-timesheets',
  imports: [CommonModule, RouterModule, ProjectTimesheetTabsComponent],
  templateUrl: './project-timesheets.component.html',
  styleUrl: './project-timesheets.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetsComponent implements OnInit, OnDestroy {
  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }
}