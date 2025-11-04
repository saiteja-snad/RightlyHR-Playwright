import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsAttendanceTabsComponent } from '../../../shared/settings-tabs/settings-attendance-tabs/settings-attendance-tabs.component';
import { SettingsHeaderComponent } from '../../../shared/settings-tabs/settings-header/settings-header.component';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../../services/rbac.service';
import { SettingsLockingSystemTabsComponent } from '../../../shared/settings-tabs/settings-locking-system-tabs/settings-locking-system-tabs.component';

@Component({
  selector: 'app-timesheet-lock-layout',
   imports: [RouterModule, SettingsLockingSystemTabsComponent, SettingsHeaderComponent,CommonModule],
  templateUrl: './timesheet-lock-layout.component.html',
  styleUrl: './timesheet-lock-layout.component.scss'
})
export class TimesheetLockLayoutComponent {
constructor(
    public rbac: RbacService
  ) { }
}
