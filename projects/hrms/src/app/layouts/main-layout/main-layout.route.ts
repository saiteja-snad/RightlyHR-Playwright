import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    {path: 'admin', component: AdminLayoutComponent, loadChildren: () => import('../../admin/admin.route')},
    {path: 'time-off', component: TimeOffLayoutComponent, loadChildren: () => import('../../time-off/time-off.route')},
] as Route[];