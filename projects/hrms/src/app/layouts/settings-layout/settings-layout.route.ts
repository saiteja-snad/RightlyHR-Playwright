import { Route } from "@angular/router";
import { EmployeeFieldsLayoutComponent } from "../../settings/employee-fields/employee-fields-layout/employee-fields-layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { RolesPermissionsLayoutComponent } from "../../settings/roles-permissions/roles-permissions-layout/roles-permissions-layout.component";

export default [
    { path: '', redirectTo: '/settings/employee-fields', pathMatch: 'full' },
    { path: 'employee-fields', component: EmployeeFieldsLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../settings/employee-fields/employee-fields.route') },
    { path: 'roles-permissions', component:RolesPermissionsLayoutComponent ,canActivate: [MsalGuard], loadChildren: () => import('../../settings/roles-permissions/roles.route') },
] as Route[];