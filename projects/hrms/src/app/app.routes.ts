import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthenticationLayoutComponent } from './layouts/authentication-layout/authentication-layout.component';
import { ProspectiveEmployeesComponent } from './admin/prospective-employees/prospective-employees.component';
import { ProspectiveInternsComponent } from './admin/prospective-interns/prospective-interns.component';
import { authGuard } from './auth/auth-guard/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '', component: AuthenticationLayoutComponent, loadChildren: () => import('./authentication/authentication.route') },
    { path: '', component: MainLayoutComponent, loadChildren: () => import('./layouts/main-layout/main-layout.route') , canActivate:[authGuard]},
    { path: 'settings', component: MainLayoutComponent, loadChildren: () => import('./layouts/settings-layout/settings-layout.route') ,canActivate:[authGuard]},
    { path: 'prospective-employees', component: ProspectiveEmployeesComponent , canActivate:[authGuard] },
    { path: 'prospective-interns', component: ProspectiveInternsComponent, canActivate:[authGuard] }
];