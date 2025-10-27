import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { SettingsAttendanceTabsComponent } from "../../../shared/settings-tabs/settings-attendance-tabs/settings-attendance-tabs.component";
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-attendance-lock-layout',
  imports: [RouterModule, SettingsAttendanceTabsComponent, SettingsHeaderComponent,CommonModule],
  templateUrl: './attendance-lock-layout.component.html',
  styleUrl: './attendance-lock-layout.component.scss'
})
export class AttendanceLockLayoutComponent {

   constructor(
    public rbac: RbacService
  ) { }
}
