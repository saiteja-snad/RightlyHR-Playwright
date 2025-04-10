import { Route } from "@angular/router";
import { RolesComponent } from "./roles/roles.component";
import { PermissionsComponent } from "./permissions/permissions.component";

export default [
    { path: '', redirectTo: '/settings/roles-permissions/roles', pathMatch: 'full' },
    { path: 'roles', component: RolesComponent },
    { path: 'permissions', component: PermissionsComponent },
] as Route[];