import { Route } from "@angular/router";
import { EmployeeFieldsLayoutComponent } from "../../settings/employee-fields/employee-fields-layout/employee-fields-layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { RolesPermissionsLayoutComponent } from "../../settings/roles-permissions/roles-permissions-layout/roles-permissions-layout.component";
import { TimeOffLayoutComponent } from "../../settings/time-off/time-off-layout/time-off-layout.component";

import { AssetConfigurationLayOutComponent } from "../../settings/assets-configurations/asset-configuration-lay-out/asset-configuration-lay-out.component";
import { DynamicFormsLayoutComponent } from "../../settings/dynamic-forms/dynamic-forms-layout/dynamic-forms-layout.component";
import { CompanySettingsComponent } from "../../settings/company-settings/company-settings/company-settings.component";



export default [
    { path: '', redirectTo: '/settings/employee-fields', pathMatch: 'full' },
    { path: 'employee-fields', component: EmployeeFieldsLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../settings/employee-fields/employee-fields.route') },
    { path: 'roles-permissions', component:RolesPermissionsLayoutComponent ,canActivate: [MsalGuard], loadChildren: () => import('../../settings/roles-permissions/roles.route') },
    { path: 'timeoff-configurations', component: TimeOffLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../settings/time-off/time-off.route') },
    { path: 'dynamic-forms', component: DynamicFormsLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../settings/dynamic-forms/dynamic-forms.route') },
    { path: 'assets-configuration', component: AssetConfigurationLayOutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../settings/assets-configurations/assets-configuration.router') },
    { path: 'company-settings', component: CompanySettingsComponent, canActivate: [MsalGuard]},
] as Route[];