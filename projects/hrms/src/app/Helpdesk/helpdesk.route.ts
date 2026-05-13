import { Route } from "@angular/router";

import { PermissionsGuard } from "../guards/permissions.guard";
import { EmployeeHelpDeskComponent } from "./employee-help-desk/employee-help-desk.component";
import { SupportHelpdeskComponent } from "./support-helpdesk/support-helpdesk.component";
import { HelpdeskMyqueriesDetailsComponent } from "./helpdesk-myqueries-details/helpdesk-myqueries-details.component";
export default [
    // { path: '', redirectTo: 'mytickets', pathMatch: 'full' },
    { path: 'employee-desk', component: EmployeeHelpDeskComponent, canActivate: [PermissionsGuard], data: { permission: 'Employee Helpdesk Queries Tab.view' } ,
      children: [
      {path: 'myqueries/:id',loadComponent: () => import('./helpdesk-myqueries-details/helpdesk-myqueries-details.component').then(m => m.HelpdeskMyqueriesDetailsComponent) },
]
},
    {
        path: 'support-desk', component: SupportHelpdeskComponent, canActivate: [PermissionsGuard], data: { permission: 'Support Helpdesk Queries Tab.view' },
        children: [
            // { path: '', redirectTo: 'all-tickets', pathMatch: 'full' },
            { path: 'all-tickets', loadComponent: () => import('./helpdesk-all-ticket/helpdesk-all-ticket.component').then((m) => m.HelpdeskAllTicketComponent), canActivate: [PermissionsGuard], data: { permission: 'Helpdesk All Queries Tab.view' } },
            { path: 'open-tickets', loadComponent: () => import('./helpdesk-open-tickets/helpdesk-open-tickets.component').then((m) => m.HelpdeskOpenTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Helpdesk Open Queries Tab.view' } },
            { path: 'await-on-user-tickets', loadComponent: () => import('./await-on-user-helpdesk-ticket/await-on-user-helpdesk-ticket.component').then((m) => m.AwaitOnUserHelpdeskTicketComponent), canActivate: [PermissionsGuard], data: { permission: 'Helpdesk Await On User Queries Tab.view' } },
            { path: 'solved-tickets', loadComponent: () => import('./helpdesk-solved-tickets/helpdesk-solved-tickets.component').then((m) => m.HelpdeskSolvedTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Helpdesk Solved Queries Tab.view' } },
            { path: 'rejected-tickets', loadComponent: () => import('./helpdesk-reject-tickets/helpdesk-reject-tickets.component').then((m) => m.HelpdeskRejectTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Helpdesk Rejected Queries Tab.view' } },
            {path: 'teamqueries/:id',loadComponent: () => import('./helpdesk-team-queries-details/helpdesk-team-queries-details.component').then(m => m.HelpdeskTeamQueriesDetailsComponent) },
            //    { path: 'inactive-assets', loadComponent: () => import('./inactive-assets-list/inactive-assets-list.component').then((m) => m.InactiveAssetsListComponent) },
        ]
    },
] as Route[];
