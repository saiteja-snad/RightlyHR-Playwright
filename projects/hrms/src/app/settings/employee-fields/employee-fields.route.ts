import { Route, } from '@angular/router';
import { SalutationComponent } from './personal/salutation/salutation.component';

export default [
    { path: '', redirectTo: '/settings/employee-fields/personal/salutation', pathMatch: 'full' },
    {
        path: 'personal', children: [
            { path: '', redirectTo: 'salutation', pathMatch: 'full' },
            { path: 'salutation', component: SalutationComponent },
            { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent) },
        ]
    },
    {
        path: 'job', children: [
            { path: '', redirectTo: 'job', pathMatch: 'full' },
            { path: 'location', loadComponent: () => import('./job/location/location.component').then((m) => m.LocationComponent) },
            { path: 'sub-location', loadComponent: () => import('./job/sub-location/sub-location.component').then((m) => m.SubLocationComponent) },
        ]   
    },
] as Route[];