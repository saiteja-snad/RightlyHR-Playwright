import { Route } from "@angular/router";
import { MyTicketsComponent } from "./my-tickets/my-tickets.component";
import { TeamTicketsComponent } from "./team-tickets/team-tickets.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    // { path: '', redirectTo: 'mytickets', pathMatch: 'full' },
    { path: 'mytickets', component: MyTicketsComponent, canActivate: [PermissionsGuard], data: { permission: 'My Tickets Tab.view' } },
    {
        path: 'team-tickets', component: TeamTicketsComponent, canActivate: [PermissionsGuard], data: { permission: 'Team Tickets Tab.view' },
        children: [
            // { path: '', redirectTo: 'all-tickets', pathMatch: 'full' },
            { path: 'all-tickets', loadComponent: () => import('./all-tickets/all-tickets.component').then((m) => m.AllTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'All Tickets Tab.view' } },
            { path: 'open-tickets', loadComponent: () => import('./open-tickets/open-tickets.component').then((m) => m.OpenTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Open Tickets Tab.view' } },
            { path: 'await-on-user-tickets', loadComponent: () => import('./await-on-user-tickets/await-on-user-tickets.component').then((m) => m.AwaitOnUserTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Await On User Tickets Tab.view' } },
            { path: 'solved-tickets', loadComponent: () => import('./solved-tickets/solved-tickets.component').then((m) => m.SolvedTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Solved Tickets Tab.view' } },
            { path: 'rejected-tickets', loadComponent: () => import('./rejected-tickets/rejected-tickets.component').then((m) => m.RejectedTicketsComponent), canActivate: [PermissionsGuard], data: { permission: 'Rejected Tickets Tab.view' } },
            //    { path: 'inactive-assets', loadComponent: () => import('./inactive-assets-list/inactive-assets-list.component').then((m) => m.InactiveAssetsListComponent) },
        ]
    },
] as Route[];