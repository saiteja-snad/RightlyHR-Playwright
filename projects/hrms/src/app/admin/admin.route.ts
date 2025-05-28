import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { LettersLayoutComponent } from "../letters/letters-layout/letters-layout.component";
import { ActiveNewUserInvitationComponent } from "./invite-new-user/active-new-user-invitation/active-new-user-invitation.component";
import { ProspectiveNewUserInvitationComponent } from "./invite-new-user/prospective-new-user-invitation/prospective-new-user-invitation.component";
import { NodueFormDetailsComponent } from "./nodue-form-details/nodue-form-details.component";

export default [
    { path: 'dashboard', component: DashboardComponent ,},
    { path: 'letters', component: LettersLayoutComponent,loadChildren: () => import('./../letters/letters.route'),  },
    { path: 'active-new-user', component: ActiveNewUserInvitationComponent,  },
    { path: 'prospective-new-user', component: ProspectiveNewUserInvitationComponent ,},
    { path: 'nodue-form-details',component:NodueFormDetailsComponent,},
] as Route[];