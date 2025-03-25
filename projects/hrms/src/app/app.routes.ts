import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthenticationLayoutComponent } from './layouts/authentication-layout/authentication-layout.component';

export const routes: Routes = [
    { path: '', component: AuthenticationLayoutComponent, loadChildren: () => import('./authentication/authentication.route') },
    { path: '', component: MainLayoutComponent, loadChildren: () => import('./layouts/main-layout/main-layout.route') },
];
