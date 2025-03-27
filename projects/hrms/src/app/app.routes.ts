import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthenticationLayoutComponent } from './layouts/authentication-layout/authentication-layout.component';
import { ProspectiveEmployeesComponent } from './admin/prospective-employees/prospective-employees.component';

export const routes: Routes = [
    { path: '', redirectTo: 'uservalidation', pathMatch: 'full' },
    { path: '', component: AuthenticationLayoutComponent, loadChildren: () => import('./authentication/authentication.route') },
    { path: '', component: MainLayoutComponent, loadChildren: () => import('./layouts/main-layout/main-layout.route') },
    { path: 'ProspectiveEmployee', component: ProspectiveEmployeesComponent }
];
