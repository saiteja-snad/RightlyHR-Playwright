import { Route } from "@angular/router";
import { RolesComponent } from "./roles/roles.component";

export default [
    { path: '', redirectTo: '/settings/roles-permissions/roles', pathMatch: 'full' },
    { path: 'roles', component: RolesComponent },
] as Route[];