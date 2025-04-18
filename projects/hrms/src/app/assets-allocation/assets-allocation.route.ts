import { Route } from "@angular/router";
import { AssetsManagmentComponent } from "./assets-managment/assets-managment.component";


export default [
    { path: '', redirectTo: 'management', pathMatch: 'full' },

    {
        path: 'management', component: AssetsManagmentComponent,
        children: [
            { path: '', redirectTo: 'all-assets', pathMatch: 'full' },
            { path: 'all-assets', loadComponent: () => import('./all-assets-list/all-assets-list.component').then((m) => m.AllAssetsListComponent) },
            { path: 'available-assets', loadComponent: () => import('./available-assets-list/available-assets-list.component').then((m) => m.AvailableAssetsListComponent) },
            { path: 'allocated-assets', loadComponent: () => import('./allocated-assets-list/allocated-assets-list.component').then((m) => m.AllocatedAssetsListComponent) },
            { path: 'under-maintenance-assets', loadComponent: () => import('./under-maintenace-assets-list/under-maintenace-assets-list.component').then((m) => m.UnderMaintenaceAssetsListComponent) },
            { path: 'inactive-assets', loadComponent: () => import('./inactive-assets-list/inactive-assets-list.component').then((m) => m.InactiveAssetsListComponent) },
        ]
    },
    { path: 'view-assets-details', loadComponent: () => import('./view-assets-details/view-assets-details.component').then((m) => m.ViewAssetsDetailsComponent) },


] as Route[];