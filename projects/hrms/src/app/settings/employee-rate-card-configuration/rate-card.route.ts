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
        
        ]
    },
] as Route[];