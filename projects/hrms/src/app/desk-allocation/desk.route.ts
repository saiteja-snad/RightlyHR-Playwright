import { Route } from "@angular/router";
import { DeskManagementComponent } from "./desk-management/desk-management.component";
import { PermissionsGuard } from "../guards/permissions.guard";


export default [
    // { path: '', redirectTo: 'management', pathMatch: 'full' },
   
    { path: 'management', component: DeskManagementComponent,
        children:[
            // { path: '', redirectTo: 'all-desks', pathMatch: 'full' },

                 { path: 'all-desks', loadComponent: () => import('./all-desk-list/all-desk-list.component').then((m) => m.AllDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - All.view' }  },

                { path: 'available-desks', loadComponent: () => import('./available-desk-list/available-desk-list.component').then((m) => m.AvailableDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - Available.view' }  },
                { path: 'allocated-desk', loadComponent: () => import('./allocated-desk-list/allocated-desk-list.component').then((m) => m.AllocatedDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - Allocated.view' }  },
                { path: 'under-maintenance-desk', loadComponent: () => import('./under-maintenance-desk-list/under-maintenance-desk-list.component').then((m) => m.UnderMaintenanceDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - Under Maintenance.view' }  },
                { path: 'inactive-desk', loadComponent: () => import('./inactive-desk-list/inactive-desk-list.component').then((m) => m.InactiveDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - Inactive.view' }  },
                { path: 'waiting-for-approval-desks', loadComponent: () => import('./waiting-for-approval-desk-list/waiting-for-approval-desk-list.component').then((m) => m.WaitingForApprovalDeskListComponent), canActivate: [PermissionsGuard], data: { permission: 'Desk Allocation - Waiting For Approval.view' }  },
                

        ]
     },
     { path: 'view-desk', 

        children:[
            { path: '', redirectTo: 'desk-data', pathMatch: 'full' },
            { path: 'desk-data', loadComponent: () => import('./view-desk-details/view-desk-details.component').then((m) => m.ViewDeskDetailsComponent) },
            {path:'desk-history',loadComponent: () => import('./desk-history/desk-history.component').then((m) => m.DeskHistoryComponent)}
        ]
     },

   

    
   
] as Route[];