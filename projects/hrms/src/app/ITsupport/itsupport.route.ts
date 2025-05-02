
import { Route } from "@angular/router";
import { MyTicketsComponent } from "./my-tickets/my-tickets.component";
import { TeamTicketsComponent } from "./team-tickets/team-tickets.component";


export default [
    { path: '', redirectTo: 'mytickets', pathMatch: 'full' },
    { path: 'mytickets', component: MyTicketsComponent },
    {
        path: 'team-tickets', component: TeamTicketsComponent,
        children: [
            { path: '', redirectTo: 'all-tickets', pathMatch: 'full' },
            { path: 'all-tickets', loadComponent: () => import('./all-tickets/all-tickets.component').then((m) => m.AllTicketsComponent) },
            { path: 'open-tickets', loadComponent: () => import('./open-tickets/open-tickets.component').then((m) => m.OpenTicketsComponent) },
            { path: 'await-on-user-tickets', loadComponent: () => import('./await-on-user-tickets/await-on-user-tickets.component').then((m) => m.AwaitOnUserTicketsComponent) },
            { path: 'solved-tickets', loadComponent: () => import('./solved-tickets/solved-tickets.component').then((m) => m.SolvedTicketsComponent) },
            { path: 'rejected-tickets', loadComponent: () => import('./rejected-tickets/rejected-tickets.component').then((m) => m.RejectedTicketsComponent) },
            //    { path: 'inactive-assets', loadComponent: () => import('./inactive-assets-list/inactive-assets-list.component').then((m) => m.InactiveAssetsListComponent) },
        ]
    },


] as Route[];