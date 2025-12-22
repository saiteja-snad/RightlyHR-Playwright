import { Route, } from '@angular/router';
import { RateCardComponent } from './rate-card/rate-card.component';
import { RateCardLayoutComponent } from './rate-card-layout/rate-card-layout.component';

export default [
    // {
    //    path: 'rate-card', component: RateCardComponent,data:{ permission: 'Rate Card Module.view'},
    // },
    {
        path: 'rate-card', component: RateCardLayoutComponent, children: [
 
            { path: 'rate-card-active', loadComponent: () => import('./rate-card/rate-card.component').then((m) => m.RateCardComponent) },
            { path: 'rate-card-inactive', loadComponent: () => import('./rate-card-inactive/rate-card-inactive.component').then((m) => m.RateCardInactiveComponent) },
            {path:'rate-card-add',loadComponent: () => import('./add-rate-card/add-rate-card.component').then((m) => m.AddRateCardComponent)},
            {path:'rate-card-update',loadComponent: () => import('./update-rate-card/update-rate-card.component').then((m)=> m.UpdateRateCardComponent)},
            {path:'rate-card-view',loadComponent: () => import('./view-rate-card/view-rate-card.component').then((m)=> m.ViewRateCardComponent)},
             {path:'rate-card-clone',loadComponent: () => import('./clone-rate-card/clone-rate-card.component').then((m)=> m.CloneRateCardComponent)},
        ]
    },
] as Route[]