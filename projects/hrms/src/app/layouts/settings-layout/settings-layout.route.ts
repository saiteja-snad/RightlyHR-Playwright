import { Route } from "@angular/router";
import { EmployeeFieldsLayoutComponent } from "../../settings/employee-fields/employee-fields-layout/employee-fields-layout.component";
import { RolesPermissionsLayoutComponent } from "../../settings/roles-permissions/roles-permissions-layout/roles-permissions-layout.component";
import { TimeOffLayoutComponent } from "../../settings/time-off/time-off-layout/time-off-layout.component";
import { AssetConfigurationLayOutComponent } from "../../settings/assets-configurations/asset-configuration-lay-out/asset-configuration-lay-out.component";
import { DynamicFormsLayoutComponent } from "../../settings/dynamic-forms/dynamic-forms-layout/dynamic-forms-layout.component";
import { SettingsOverviewComponent } from "../../settings/settings-overview/settings-overview.component";
import { authGuard } from "../../auth/auth-guard/auth.guard";

export default [
    { path: '', redirectTo: '/settings/overview', pathMatch: 'full' },
    { path: 'overview', component: SettingsOverviewComponent, },
    { path: 'employee-fields', component: EmployeeFieldsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/employee-fields/employee-fields.route') },
    { path: 'roles-permissions', component: RolesPermissionsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/roles-permissions/roles.route') },
    { path: 'timeoff-configurations', component: TimeOffLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/time-off/time-off.route') },
    { path: 'dynamic-forms', component: DynamicFormsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/dynamic-forms/dynamic-forms.route') },
    { path: 'assets-configuration', component: AssetConfigurationLayOutComponent, canActivate: [authGuard], loadChildren: () => import('../../settings/assets-configurations/assets-configuration.router') },
] as Route[];