import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientTimesheetTabsComponent } from "../../../shared/project-management-tabs/client-timesheet-tabs/client-timesheet-tabs.component";
@Component({
  selector: 'app-client-time-sheets',
  imports: [RouterModule, ClientTimesheetTabsComponent],
  templateUrl: './client-time-sheets.component.html',
  styleUrl: './client-time-sheets.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimeSheetsComponent { }