import { Component, OnInit } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    // Employee Fields
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

    //employee fields update configurations
    else if (url.startsWith('/settings/employee-fields-update-configurations/personal')) {
      this.moduleName = 'Employee Fields Update Configurations';
      this.componentName = 'Personal';
    }
    else if (url.startsWith('/settings/employee-fields-update-configurations/job')) {
      this.moduleName = 'Employee Fields Update Configurations';
      this.componentName = 'Job';
    }
    else if (url.startsWith('/settings/employee-fields-update-configurations/documents')) {
      this.moduleName = 'Employee Fields Update Configurations';
      this.componentName = 'Documents';
    }

    // Roles & Permissions
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

    // Time Off
    else if (url.startsWith('/settings/timeoff-configurations/leave-categoery')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Leave Category';
    }
    else if (url.startsWith('/settings/timeoff-configurations/leave-allocation')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Leave Allocation';
    }
    else if (url.startsWith('/settings/timeoff-configurations/flexible-leave-allocation')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Flexible Leave Allocation';
    }
    else if (url.startsWith('/settings/timeoff-configurations/eligibility-criterias')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Eligibility Criteria';
    }
    else if (url.startsWith('/settings/timeoff-configurations/load-entitlements')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Load Entitlements';
    }
    else if (url.startsWith('/settings/timeoff-configurations/flexible-wfh-allocation')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Flexible WFH Allocation';
    }
    // Assets Configuration
    else if (url.startsWith('/settings/assets-configuration/vendor-detiles')) {
      this.moduleName = 'Assets Configuration';
      this.componentName = 'Vendor Details';
    }
    else if (url.startsWith('/settings/assets-configuration/asset-catagory')) {
      this.moduleName = 'Assets Configuration';
      this.componentName = 'Asset Category';
    }
    else if (url.startsWith('/settings/assets-configuration/asset-subcatagory')) {
      this.moduleName = 'Assets Configuration';
      this.componentName = 'Asset Sub Category';
    }

    // PMS Configurations
    else if (url.startsWith('/pmsconfiguration/increment')) {
      this.moduleName = 'PMS Configurations';
      this.componentName = 'Increment Percentage';
    }
    else if (url.startsWith('/pmsconfiguration/assessor')) {
      this.moduleName = 'PMS Configurations';
      this.componentName = 'Assessor Configuration';
    }

    //Dynamic Forms
    else if (url.startsWith('/settings/dynamic-forms/active-forms')) {
      this.moduleName = 'Dynamic Forms';
      this.componentName = 'Active Forms';
    }
    else if (url.startsWith('/settings/dynamic-forms/inactive-forms')) {
      this.moduleName = 'Dynamic Forms';
      this.componentName = 'Inactive Forms';
    }
    else if (url.startsWith('/settings/dynamic-forms/draft-forms')) {
      this.moduleName = 'Dynamic Forms';
      this.componentName = 'Draft Forms';
    }
    else if (url.startsWith('/settings/dynamic-forms/form-settings')) {
      this.moduleName = 'Dynamic Forms';
      this.componentName = 'Form Settings';
    }

    //Project Management
    else if (url.startsWith('/settings/project-management-config/project-type')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Project Type';
    }
    else if (url.startsWith('/settings/project-management-config/industry-type')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Industry Type';
    }
    else if (url.startsWith('/settings/project-management-config/client-document-type')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Client Document Type';
    }

    else if (url.startsWith('/settings/project-management-config/project-document-type')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Project Document Type';
    }
    else if (url.startsWith('/settings/project-management-config/letter-type')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Letter Configurations';
    }
    else if (url.startsWith('/settings/project-management-config/letter-frequency')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Frequency Configurations';
    }
    else if (url.startsWith('/settings/project-management-config/signature-authority')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Project Management Authority';
    }
    else if (url.startsWith('/settings/project-management-config/letter-frequency')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = ' Letter Configurations Frequency';
    }

    else if (url.startsWith('/settings/attendance-configuration/pending-for-submission')) {
      this.moduleName = 'Attendance Configuration';
      this.componentName = 'Pending For Submission';
    }
    else if (url.startsWith('/settings/attendance-configuration/published')) {
      this.moduleName = 'Attendance Configuration';
      this.componentName = 'Published';
    }
    else if (url.startsWith('/settings/project-management-config/project-role')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Project Role';
    }
    else if (url.startsWith('/settings/project-management-config/task')) {
      this.moduleName = 'Project Management Configurations';
      this.componentName = 'Task';
    }
    else if (url.startsWith('/settings/it-configuration/itsupport-category')) {
      this.moduleName = 'IT Configuration';
      this.componentName = 'IT Support Category';
    }
    else if (url.startsWith('/settings/it-configuration/itsupport-sub-category')) {
      this.moduleName = 'IT Configuration';
      this.componentName = 'IT Support Sub Category';
    }
    // else if (url.startsWith('/settings/timesheet-locking-configuration')) {
    //   this.moduleName = 'Timesheet Configuration';
    //   this.componentName = 'Timesheet Locking';
    // }
    else if (url.startsWith('/settings/timesheet-locking-configuration/pending-for-submission')) {
      this.moduleName = 'Timesheet Configuration';
      this.componentName = 'Pending For Submission';
    }
    else if (url.startsWith('/settings/timesheet-locking-configuration/published')) {
      this.moduleName = 'Timesheet Configuration';
      this.componentName = 'Published';
    }
    else if (url.startsWith('/settings/timeoff-configurations/flexible-workhours-allocation')) {
      this.moduleName = 'Time Off';
      this.componentName = 'Flexible Work Hours Allocation';
    }
    else if (url.startsWith('/settings/timeoff-configurations/loadentitlements')) {
      this.moduleName = 'Load Entitlements';
      this.componentName = 'Load Entitlements Configuration';
    }
  }

  navigateToSettings() {
    this.router.navigate(['/settings'])
  }
}
