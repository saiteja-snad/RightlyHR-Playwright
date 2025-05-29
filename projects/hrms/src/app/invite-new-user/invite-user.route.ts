import { Route } from "@angular/router";
import { ActiveNewUserInvitationComponent } from "./active-new-user-invitation/active-new-user-invitation.component";
import { ProspectiveNewUserInvitationComponent } from "./prospective-new-user-invitation/prospective-new-user-invitation.component";

export default [
    { path: '', redirectTo: '/invite-user/active', pathMatch: 'full' },
    { path: 'active', component: ActiveNewUserInvitationComponent, },
    { path: 'trainees', component: ProspectiveNewUserInvitationComponent, },
] as Route[];