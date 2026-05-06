import { Route } from "@angular/router";

export default [
    { path: '', redirectTo: '/menus/personalization', pathMatch: 'full' },
    { path: 'personalization', loadComponent: () => import('./menus-personalization/menus-personalization.component').then((m) => m.MenusPersonalizationComponent) },
] as Route[];
