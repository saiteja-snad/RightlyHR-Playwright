import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";
import { EventsLayoutComponent } from "../../events/events-layout/events-layout.component";
import { MyinfoLayoutComponent } from "../../myinfo/myinfo-layout/myinfo-layout.component";
import { ClaimsandexpensesLayoutComponent } from "../../claimsandexpenses/claimsandexpenses-layout/claimsandexpenses-layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { PersonalinfoLayoutComponent } from "../../personal-info/personalinfo-layout/personalinfo-layout.component";
import { PmsLayoutComponent } from "../../pms/pms-layout/pms-layout.component";
import { DeskAlloctionLayoutComponent } from "../../desk-allocation/desk-alloction-layout/desk-alloction-layout.component";
import { CalenderLayOutComponent } from "../../calendar/calender-lay-out/calender-lay-out.component";
import { ReportsLayoutComponent } from "../../reports/reports-layout/reports-layout.component";
import { PmsConfigurationLayoutComponent } from "../../pms-configuration/pms-configuration-layout/pms-configuration-layout.component";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: AdminLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../admin/admin.route') },
    { path: 'dashboard', component: MyinfoLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'myinfo', component: MyinfoLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../myinfo/myinfo-routes') },
    { path: 'personalinfo', component: PersonalinfoLayoutComponent,canActivate: [MsalGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'time-off', component: TimeOffLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../time-off/time-off.route') },
    { path: 'events', component: EventsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../events/events.route') },
    { path: 'claimsandexpenses', component: ClaimsandexpensesLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../claimsandexpenses/claimsandexpenses.route') },
    { path: 'pms', component: PmsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../pms/pms.route') },
    { path: 'calendar', component: CalenderLayOutComponent,canActivate: [MsalGuard],loadChildren: () => import('../../calendar/calendar.route')},
    { path: 'desk', component: DeskAlloctionLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../desk-allocation/desk.route')},
    { path: 'reports', component: ReportsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../reports/reports.routes')},
    { path: 'pmsconfiguration', component: PmsConfigurationLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../pms-configuration/pms-configuration.route')}
] as Route[];