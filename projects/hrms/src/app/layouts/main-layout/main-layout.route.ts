import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";
import { EventsLayoutComponent } from "../../events/events-layout/events-layout.component";
import { MyinfoLayoutComponent } from "../../myinfo/myinfo-layout/myinfo-layout.component";
import { ClaimsandexpensesLayoutComponent } from "../../claimsandexpenses/claimsandexpenses-layout/claimsandexpenses-layout.component";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: AdminLayoutComponent, loadChildren: () => import('../../admin/admin.route') },
    { path: 'myinfo', component: MyinfoLayoutComponent, loadChildren: () => import('../../myinfo/myinfo-routes') },
    { path: 'time-off', component: TimeOffLayoutComponent, loadChildren: () => import('../../time-off/time-off.route') },
    { path: 'events', component: EventsLayoutComponent, loadChildren: () => import('../../events/events.route') },
    { path: 'claimsandexpenses', component: ClaimsandexpensesLayoutComponent, loadChildren: () => import('../../claimsandexpenses/claimsandexpenses.route') }
] as Route[];