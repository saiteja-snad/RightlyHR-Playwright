import { Route } from "@angular/router";
import { RolesComponent } from "./roles/roles.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { RoleAssigneeComponent } from "./role-assignee/role-assignee.component";

export default [
    { path: '', redirectTo: '/settings/roles-permissions/roles', pathMatch: 'full' },
    { path: 'roles', component: RolesComponent },
    { path: 'permissions', component: PermissionsComponent },
    { path: 'role-assignee', component: RoleAssigneeComponent },
] as Route[];