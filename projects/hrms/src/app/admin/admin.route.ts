import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ActiveEmployeesComponent } from "./active-employees/active-employees.component";
import { InactiveEmployeesComponent } from "./inactive-employees/inactive-employees.component";
import { ProspectiveInternsComponent } from "./prospective-interns/prospective-interns.component";
import { ProspectiveEmployeesComponent } from "./prospective-employees/prospective-employees.component";
import { ProbationEmployeesComponent } from "./probation-employees/probation-employees.component";
import { ActiveInternsComponent } from "./active-interns/active-interns.component";
import { InactiveInternsComponent } from "./inactive-interns/inactive-interns.component";
import { LettersLayoutComponent } from "../letters/letters-layout/letters-layout.component";
import { ActiveNewUserInvitationComponent } from "./invite-new-user/active-new-user-invitation/active-new-user-invitation.component";
import { ProspectiveNewUserInvitationComponent } from "./invite-new-user/prospective-new-user-invitation/prospective-new-user-invitation.component";
import { NodueFormDetailsComponent } from "./nodue-form-details/nodue-form-details.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent ,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Prospective Employees Card.view' }},
    { path: 'prospective-employees', component: ProspectiveEmployeesComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Prospective Employees Card.view' } },
    { path: 'active-employees', component: ActiveEmployeesComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Active Employees Card.view' } },
    { path: 'inactive-employees', component: InactiveEmployeesComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Inactive Employees Card.view' } },
    { path: 'prospective-interns', component: ProspectiveInternsComponent ,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Prospective Trainee Card.view' }},
    { path: 'active-interns', component: ActiveInternsComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Active Trainees Card.view' } },
    { path: 'inactive-interns', component: InactiveInternsComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Inactive Trainees Card.view' } },
    { path: 'probation-employees', component: ProbationEmployeesComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Probation Employees Card.view' } },
    { path: 'letters', component: LettersLayoutComponent,loadChildren: () => import('./../letters/letters.route'),canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents.view' } },
    { path: 'active-new-user', component: ActiveNewUserInvitationComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Active Invite New User.view' } },
    { path: 'prospective-new-user', component: ProspectiveNewUserInvitationComponent ,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Trainee Active Invite New User.view' }},
    { path: 'nodue-form-details',component:NodueFormDetailsComponent,canActivate: [PermissionsGuard], data: { permission: 'No Due Form.view' }}
] as Route[];