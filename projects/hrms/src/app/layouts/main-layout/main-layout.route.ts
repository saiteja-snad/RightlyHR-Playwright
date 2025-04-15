import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";
import { EventsLayoutComponent } from "../../events/events-layout/events-layout.component";
import { MyinfoLayoutComponent } from "../../myinfo/myinfo-layout/myinfo-layout.component";
import { ClaimsandexpensesLayoutComponent } from "../../claimsandexpenses/claimsandexpenses-layout/claimsandexpenses-layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { PersonalinfoLayoutComponent } from "../../personal-info/personalinfo-layout/personalinfo-layout.component";
import { PmsLayoutComponent } from "../../pms/pms-layout/pms-layout.component";
import { CalendarViewComponent } from "../../calendar/calendar-view/calendar-view.component";
import { HolidayslayoutComponent } from "../../holidays/holidayslayout/holidayslayout.component";
import { DeskAlloctionLayoutComponent } from "../../desk-allocation/desk-alloction-layout/desk-alloction-layout.component";

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
    { path: 'calendar', component: CalendarViewComponent},
    { path: 'holidays', component: HolidayslayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../holidays/holidays.route') },

    { path: 'desk', component: DeskAlloctionLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../desk-allocation/desk.route')}
] as Route[];