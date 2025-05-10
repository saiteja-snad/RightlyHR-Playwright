import { Route } from "@angular/router";
import { CompanypoliciesComponent } from "./companypolicies/companypolicies.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    { path: '', redirectTo: '/policies/companypolicies', pathMatch: 'full' },
    { path: 'companypolicies', component: CompanypoliciesComponent, canActivate: [PermissionsGuard], data: { permission: 'Policies.view' } }
] as Route[];