import { Route } from "@angular/router";
import { EmployeeDashboardComponent } from "./employee-dashboard/employee-dashboard.component";
import { OrganizationDashboardComponent } from "./organization-dashboard/organization-dashboard.component";
import { ManagerDashboardComponent } from "./manager-dashboard/manager-dashboard.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
  { path: '', redirectTo: '/dashboard/emp', pathMatch: 'full' },
  { path: 'emp', component: EmployeeDashboardComponent, data: { auditModule: 'Employee Dashboard', auditPage: 'Employee Dashboard View' } },
  { path: 'rm-tm', component: ManagerDashboardComponent ,canActivate: [PermissionsGuard], data: { permission: 'Manager Toggle.view', auditModule: 'Manager Dashboard', auditPage: 'Manager Dashboard View' } },
  { path: 'org', component: OrganizationDashboardComponent,canActivate: [PermissionsGuard], data: { permission: 'Organization Toggle.view', auditModule: 'Organization Dashboard', auditPage: 'Organization Dashboard View' }  },
] as Route[];
