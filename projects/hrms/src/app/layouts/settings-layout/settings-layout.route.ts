import { Route } from "@angular/router";
import { EmployeeFieldsLayoutComponent } from "../../settings/employee-fields/employee-fields-layout/employee-fields-layout.component";
import { RolesPermissionsLayoutComponent } from "../../settings/roles-permissions/roles-permissions-layout/roles-permissions-layout.component";
import { TimeOffLayoutComponent } from "../../settings/time-off/time-off-layout/time-off-layout.component";
import { AssetConfigurationLayOutComponent } from "../../settings/assets-configurations/asset-configuration-lay-out/asset-configuration-lay-out.component";
import { DynamicFormsLayoutComponent } from "../../settings/dynamic-forms/dynamic-forms-layout/dynamic-forms-layout.component";
import { SettingsOverviewComponent } from "../../settings/settings-overview/settings-overview.component";
import { authGuard } from "../../auth/auth-guard/auth.guard";
import { ProjectManagementConfigLayoutComponent } from "../../settings/project-management-configurations/project-management-config-layout/project-management-config-layout.component";
import { AttendanceLockLayoutComponent } from "../../settings/attendance-configurations/attendance-lock-layout/attendance-lock-layout.component";
<<<<<<< HEAD
import { ItConfigurationLayoutComponent } from "../../settings/it-configuration/it-configuration-layout/it-configuration-layout.component";
import { TimesheetLockLayoutComponent } from "../../settings/timesheet-locking-configuration/timesheet-lock-layout/timesheet-lock-layout.component";
=======
import { EmployeeFieldsUpdateConfigurationsLayoutComponentComponent } from "../../settings/employee-fields-update-configuration/employee-fields-update-configurations-layout-component/employee-fields-update-configurations-layout-component.component";
>>>>>>> 9e255976dbcf4530b057cef967117f811bd4dc48

export default [
    { path: '', redirectTo: '/settings/overview', pathMatch: 'full' },
    { path: 'overview', component: SettingsOverviewComponent, },
    { path: 'employee-fields', component: EmployeeFieldsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/employee-fields/employee-fields.route') },
    { path: 'roles-permissions', component: RolesPermissionsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/roles-permissions/roles.route') },
    { path: 'timeoff-configurations', component: TimeOffLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/time-off/time-off.route') },
    { path: 'dynamic-forms', component: DynamicFormsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/dynamic-forms/dynamic-forms.route') },
    { path: 'assets-configuration', component: AssetConfigurationLayOutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/assets-configurations/assets-configuration.router') },
    { path: 'project-management-config', component: ProjectManagementConfigLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/project-management-configurations/project-management.route')},
    { path: 'attendance-configuration', component: AttendanceLockLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/attendance-configurations/attendance-configuration.route')   },
<<<<<<< HEAD
    { path: 'it-configuration', component: ItConfigurationLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/it-configuration/it-configuration.router')   },
    { path: 'timesheet-locking-configuration', component: TimesheetLockLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/timesheet-locking-configuration/timesheet-lock-configuration.route')   },
=======
    { path: 'employee-fields-update-configurations', component: EmployeeFieldsUpdateConfigurationsLayoutComponentComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/employee-fields-update-configuration/employee-fields-update-configurations.route') },
>>>>>>> 9e255976dbcf4530b057cef967117f811bd4dc48
] as Route[];