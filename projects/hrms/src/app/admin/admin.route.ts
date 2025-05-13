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
    // { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent ,},
    { path: 'prospective-employees', component: ProspectiveEmployeesComponent,},
    { path: 'active-employees', component: ActiveEmployeesComponent,  },
    { path: 'inactive-employees', component: InactiveEmployeesComponent, },
    { path: 'prospective-interns', component: ProspectiveInternsComponent , },
    { path: 'active-interns', component: ActiveInternsComponent, },
    { path: 'inactive-interns', component: InactiveInternsComponent, },
    { path: 'probation-employees', component: ProbationEmployeesComponent,},
    { path: 'letters', component: LettersLayoutComponent,loadChildren: () => import('./../letters/letters.route'),  },
    { path: 'active-new-user', component: ActiveNewUserInvitationComponent,  },
    { path: 'prospective-new-user', component: ProspectiveNewUserInvitationComponent ,},
    { path: 'nodue-form-details',component:NodueFormDetailsComponent,}
] as Route[];