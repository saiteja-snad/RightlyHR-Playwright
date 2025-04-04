import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";
import { EventsLayoutComponent } from "../../events/events-layout/events-layout.component";
import { MyinfoLayoutComponent } from "../../myinfo/myinfo-layout/myinfo-layout.component";
import { ClaimsandexpensesLayoutComponent } from "../../claimsandexpenses/claimsandexpenses-layout/claimsandexpenses-layout.component";
import { MsalGuard } from "@azure/msal-angular";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: AdminLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../admin/admin.route') },
    { path: 'myinfo', component: MyinfoLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../myinfo/myinfo-routes') },
    { path: 'personalinfo', component: MyinfoLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../myinfo/myinfo-routes') },
    { path: 'time-off', component: TimeOffLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../time-off/time-off.route') },
    { path: 'events', component: EventsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../events/events.route') },
    { path: 'claimsandexpenses', component: ClaimsandexpensesLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../claimsandexpenses/claimsandexpenses.route') }
] as Route[];