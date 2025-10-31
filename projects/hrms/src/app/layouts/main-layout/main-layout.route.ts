import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";
import { TimeOffLayoutComponent } from "../../time-off/time-off-layout/time-off-layout.component";
import { EventsLayoutComponent } from "../../events/events-layout/events-layout.component";
import { ClaimsandexpensesLayoutComponent } from "../../claimsandexpenses/claimsandexpenses-layout/claimsandexpenses-layout.component";
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
import { ThemeLayoutComponent } from "../../theme-customization/theme-layout/theme-layout.component";
import { AttendanceViewComponent } from "../../Attendance/attendance-view/attendance-view.component";
import { EmployeeManagementLayoutComponent } from "../../admin/employee-management-layout/employee-management-layout.component";
import { InviteUserLayoutComponent } from "../../invite-new-user/invite-user-layout/invite-user-layout.component";
import { LettersLayoutComponent } from "../../letters/letters-layout/letters-layout.component";
import { BloodBankComponent } from "../../blood-bank/blood-bank/blood-bank.component";
import { PhonebookComponent } from "../../phonebook/phonebook/phonebook.component";
import { ContactDirectoryComponent } from "../../contact-directory/contact-directory/contact-directory.component";
import { authGuard } from "../../auth/auth-guard/auth.guard";
import { ProjectManagementLayoutComponent } from "../../project-management/project-management-layout/project-management-layout.component";
import { SkillDirectoryManagementComponent } from "../../skill-set-management/skill-directory-management/skill-directory-management.component";
import { SkillsetManagementLayoutComponent } from "../../skill-set-management/skillset-management-layout/skillset-management-layout.component";

export default [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: AdminLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../admin/admin.route') },
    { path: 'dashboard', component: PersonalinfoLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'personalinfo', component: PersonalinfoLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'myinfo', component: PersonalinfoLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../personal-info/personal-info-routes') },
    { path: 'time-off', component: TimeOffLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../time-off/time-off.route') },
    { path: 'events', component: EventsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../events/events.route') },
    { path: 'claimsandexpenses', component: ClaimsandexpensesLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../claimsandexpenses/claimsandexpenses.route') },
    { path: 'pms', component: PmsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../pms/pms.route') },
    { path: 'calendar-view', component: CalendarViewComponent, canActivate: [authGuard] },
    { path: 'policies', component: PolicieslayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../policies/policies.route') },
    { path: 'desk', component: DeskAlloctionLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../desk-allocation/desk.route') },
    { path: 'reports', component: ReportsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../reports/reports.routes') },
    { path: 'assets-management', component: AssetsAllocationsLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../assets-allocation/assets-allocation.route') },
    { path: 'it-support', component: ItsupportLayOutComponent, canActivate: [authGuard], loadChildren: () => import('../../ITsupport/itsupport.route') },
    { path: 'pmsconfiguration', component: PmsConfigurationLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../pms-configuration/pms-configuration.route') },
    { path: 'organization-chart', component: OrganizationchartComponent, canActivate: [authGuard] },
    { path: 'holidays', component: HolidaysLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../holidays/holidays.route') },
    { path: 'theme', component: ThemeLayoutComponent, loadChildren: () => import('../../theme-customization/theme.route') },
    { path: 'attendance', component: AttendanceViewComponent, canActivate: [authGuard] },
    { path: 'employee-management', component: EmployeeManagementLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../admin/employee-management.route') },
    { path: 'invite-user', component: InviteUserLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../invite-new-user/invite-user.route') },
    { path: 'letters', component: LettersLayoutComponent, loadChildren: () => import('../../letters/letters.route') },
    { path: 'blood-bank', component: BloodBankComponent, canActivate: [authGuard] },
    { path: 'phonebook', component: PhonebookComponent, canActivate: [authGuard] },
    { path: 'contacts-directory', component: ContactDirectoryComponent, canActivate: [authGuard] },
    { path: 'project-management', component: ProjectManagementLayoutComponent, loadChildren: () => import('../../project-management/project-management.route') },
    { path: 'on-behalf-of', component: TimeOffLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../time-off/on-behalf-of.route') },
    { path: 'skill-management', component: SkillsetManagementLayoutComponent, canActivate: [authGuard], loadChildren: () => import('../../skill-set-management/skillset-management.route') }
] as Route[];