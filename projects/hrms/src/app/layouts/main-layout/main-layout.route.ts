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
import { PolicieslayoutComponent } from "../../policies/policieslayout/policieslayout.component";
import { ReportsLayoutComponent } from "../../reports/reports-layout/reports-layout.component";
import { AssetsAllocationsLayoutComponent } from "../../assets-allocation/assets-allocations-layout/assets-allocations-layout.component";
import { ItsupportLayOutComponent } from "../../ITsupport/itsupport-lay-out/itsupport-lay-out.component";
import { PmsConfigurationLayoutComponent } from "../../pms-configuration/pms-configuration-layout/pms-configuration-layout.component";
import { OrganizationchartComponent } from "../../organizationchart/organizationchart/organizationchart.component";
import { CalendarViewComponent } from "../../calendar/calendar-view/calendar-view.component";
import { HolidaysLayoutComponent } from "../../holidays/holidays-layout/holidays-layout.component";
import { ThemingComponent } from "../../theme-customization/theming/theming.component";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: AdminLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../admin/admin.route') },
    { path: 'dashboard', component: MyinfoLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'myinfo', component: MyinfoLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../myinfo/myinfo-routes') },
    { path: 'personalinfo', component: PersonalinfoLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'time-off', component: TimeOffLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../time-off/time-off.route') },
    { path: 'events', component: EventsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../events/events.route') },
    { path: 'claimsandexpenses', component: ClaimsandexpensesLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../claimsandexpenses/claimsandexpenses.route') },
    { path: 'pms', component: PmsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../pms/pms.route') },
    { path: 'calendar', component: CalendarViewComponent,canActivate: [MsalGuard]},
    { path: 'policies', component:PolicieslayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../policies/policies.route') },
    { path: 'desk', component: DeskAlloctionLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../desk-allocation/desk.route')},
    { path: 'reports', component: ReportsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../reports/reports.routes')},
    { path: 'assets-management', component: AssetsAllocationsLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../assets-allocation/assets-allocation.route')},
    { path: 'it-support', component: ItsupportLayOutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../ITsupport/itsupport.route')},
    { path: 'pmsconfiguration', component: PmsConfigurationLayoutComponent, canActivate: [MsalGuard],loadChildren: () => import('../../pms-configuration/pms-configuration.route')},
    { path: 'organization-chart', component: OrganizationchartComponent, canActivate: [MsalGuard]},
    { path: 'holidays', component: HolidaysLayoutComponent, canActivate: [MsalGuard], loadChildren: () => import('../../holidays/holidays.route')},
    { path: 'theme', component: ThemingComponent},
] as Route[];