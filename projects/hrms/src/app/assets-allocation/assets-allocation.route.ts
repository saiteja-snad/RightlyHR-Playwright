import { Route } from "@angular/router";
import { AssetsManagmentComponent } from "./assets-managment/assets-managment.component";
import { PermissionsGuard } from "../guards/permissions.guard";


export default [
    // { path: '', redirectTo: '', pathMatch: 'full' },

    {
        path: '', component: AssetsManagmentComponent,
        children: [
            // { path: '', redirectTo: 'all-assets', pathMatch: 'full' },
            { path: 'all-assets', loadComponent: () => import('./all-assets-list/all-assets-list.component').then((m) => m.AllAssetsListComponent), canActivate: [PermissionsGuard], data: { permission: 'Asset Management - All.view' }  },
            { path: 'available-assets', loadComponent: () => import('./available-assets-list/available-assets-list.component').then((m) => m.AvailableAssetsListComponent), canActivate: [PermissionsGuard], data: { permission: 'Asset Management - Available.view' }  },
            { path: 'allocated-assets', loadComponent: () => import('./allocated-assets-list/allocated-assets-list.component').then((m) => m.AllocatedAssetsListComponent), canActivate: [PermissionsGuard], data: { permission: 'Asset Management - Allocated.view' }  },
            { path: 'under-maintenance-assets', loadComponent: () => import('./under-maintenace-assets-list/under-maintenace-assets-list.component').then((m) => m.UnderMaintenaceAssetsListComponent), canActivate: [PermissionsGuard], data: { permission: 'Asset Management - Under Maintenance.view' }  },
            { path: 'inactive-assets', loadComponent: () => import('./inactive-assets-list/inactive-assets-list.component').then((m) => m.InactiveAssetsListComponent), canActivate: [PermissionsGuard], data: { permission: 'Asset Management - Inactive.view' }  },
        ]
    },
    { path: 'view-assets-details', 

        children:[
            { path: '', redirectTo: 'asset-data', pathMatch: 'full' },
            {path:'asset-data',loadComponent: () => import('./view-assets-details/view-assets-details.component').then((m) => m.ViewAssetsDetailsComponent)},
            {path:'asset-history',loadComponent: () => import('./asset-history/asset-history.component').then((m) => m.AssetHistoryComponent)}
        ]
     },


] as Route[];