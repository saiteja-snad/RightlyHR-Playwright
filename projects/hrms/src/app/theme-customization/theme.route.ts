import { Route } from "@angular/router";

export default [
    { path: '', redirectTo: '/theme/selection', pathMatch: 'full' },
    { path: 'selection', loadComponent: () => import('./predefined-theme-selection/predefined-theme-selection.component').then((m) => m.PredefinedThemeSelectionComponent) },
    { path: 'custom-theme-selection', loadComponent: () => import('./theme-selection/theme-selection.component').then((m) => m.ThemeSelectionComponent) },
    { path: 'creation', loadComponent: () => import('./theme-creation/theme-creation.component').then((m) => m.ThemeCreationComponent) },
] as Route[];
