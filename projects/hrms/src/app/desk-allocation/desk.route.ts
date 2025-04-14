import { Route } from "@angular/router";
import { DeskManagementComponent } from "./desk-management/desk-management.component";


export default [
    { path: '', redirectTo: 'management', pathMatch: 'full' },
    { path: 'management', component: DeskManagementComponent,
        children:[
            
                { path: 'all-desks', loadComponent: () => import('./all-desk-list/all-desk-list.component').then((m) => m.AllDeskListComponent) },
                { path: 'available-desks', loadComponent: () => import('./available-desk-list/available-desk-list.component').then((m) => m.AvailableDeskListComponent) },
                { path: 'allocated-desk', loadComponent: () => import('./allocated-desk-list/allocated-desk-list.component').then((m) => m.AllocatedDeskListComponent) },

                { path: 'under-maintenance-desk', loadComponent: () => import('./under-maintenance-desk-list/under-maintenance-desk-list.component').then((m) => m.UnderMaintenanceDeskListComponent) },
                { path: 'inactive-desk', loadComponent: () => import('./inactive-desk-list/inactive-desk-list.component').then((m) => m.InactiveDeskListComponent) },

                { path: 'waiting-for-approval-desks', loadComponent: () => import('./waiting-for-approval-desk-list/waiting-for-approval-desk-list.component').then((m) => m.WaitingForApprovalDeskListComponent) },


            
        ]
     }
    
   
] as Route[];