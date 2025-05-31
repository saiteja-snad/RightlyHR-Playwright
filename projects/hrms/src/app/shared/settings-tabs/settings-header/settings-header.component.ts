import { Component, OnInit } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-header',
  imports: [CommonModule, TranslateModule],
  templateUrl: './settings-header.component.html',
  styleUrl: './settings-header.component.scss'
})

export class SettingsHeaderComponent implements OnInit {
  moduleName: string = '';
  componentName: string = '';

  constructor(public router: Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.ComponentnameDisplay();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.ComponentnameDisplay();
      }
    });
  }

  ComponentnameDisplay() {
    const url = this.router.url;
    if (url.startsWith('/settings/employee-fields/personal')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Personal';
    }
    else if (url.startsWith('/settings/employee-fields/job')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Job';
    }
    else if (url.startsWith('/settings/employee-fields/documents')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Documents';
    }
    else if (url.startsWith('/settings/employee-fields/manage-shifts')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Manage Shifts';
    }
    else if (url.startsWith('/settings/employee-fields/manage-policies')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Manage Policies';
    }
    else if (url.startsWith('/settings/employee-fields/manage-holidays')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Manage Holidays';
    }
    else if (url.startsWith('/settings/employee-fields/manage-weekends')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Manage Weekends';
    }
    else if (url.startsWith('/settings/employee-fields/expenes')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Expense Configurations';
    }
    else if (url.startsWith('/settings/employee-fields/manage-dsts')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'Manage DST';
    }
    else if (url.startsWith('/settings/employee-fields/no-due-clearnce')) {
      this.moduleName = 'Employee Fields';
      this.componentName = 'No Due Clearance';
    }
    else if (url.startsWith('/settings/roles-permissions/roles')) {
      this.moduleName = 'Roles-Permissions';
      this.componentName = 'Roles';
    }
    else if (url.startsWith('/settings/roles-permissions/roles')) {
      this.moduleName = 'Roles-Permissions';
      this.componentName = 'Roles';
    }
    else if (url.startsWith('/settings/roles-permissions/permissions')) {
      this.moduleName = 'Roles-Permissions';
      this.componentName = 'Permissions';
    }
    else if (url.startsWith('/settings/roles-permissions/role-assignee')) {
      this.moduleName = 'Roles-Permissions';
      this.componentName = 'Assignee';
    }
  }

  navigateToSettings() {
    this.router.navigate(['/settings'])
  }
}