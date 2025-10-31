import { Route } from "@angular/router";

export default [
    { path: 'details', loadComponent: () => import('./card-details/card-details.component').then((m) => m.CardDetailsComponent) },
    { path: 'allocated', loadComponent: () => import('./card-allocated-details/card-allocated-details.component').then((m) => m.CardAllocatedDetailsComponent) },
    { path: 'expiry', loadComponent: () => import('./card-expiry-details/card-expiry-details.component').then((m) => m.CardExpiryDetailsComponent) },
    { path: 'hold', loadComponent: () => import('./card-hold-details/card-hold-details.component').then((m) => m.CardHoldDetailsComponent) },
    {path:'card-history',loadComponent:()=> import ('./cards-history/cards-history.component').then((m)=>m.CardsHistoryComponent)}
] as Route[];