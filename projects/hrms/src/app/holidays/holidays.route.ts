import { Route } from "@angular/router";

export default [
    { path: 'optional-holidays', loadComponent: () => import('./optionalholidays/optionalholidays.component').then((m) => m.OptionalholidaysComponent) },
    { path: 'public-holidays', loadComponent: () => import('./publicholidays/publicholidays.component').then((m) => m.PublicholidaysComponent) }
] as Route[];