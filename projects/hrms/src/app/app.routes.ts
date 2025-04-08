import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthenticationLayoutComponent } from './layouts/authentication-layout/authentication-layout.component';
import { ProspectiveEmployeesComponent } from './admin/prospective-employees/prospective-employees.component';
import { ProspectiveInternsComponent } from './admin/prospective-interns/prospective-interns.component';
import { SettingsLayoutComponent } from './layouts/settings-layout/settings-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'uservalidation', pathMatch: 'full' },
    { path: '', component: AuthenticationLayoutComponent, loadChildren: () => import('./authentication/authentication.route') },
    { path: '', component: MainLayoutComponent, loadChildren: () => import('./layouts/main-layout/main-layout.route') },
    { path: 'settings', component: SettingsLayoutComponent, loadChildren: () => import('./layouts/settings-layout/settings-layout.route') },
    { path: 'prospective-employees', component: ProspectiveEmployeesComponent },
    { path: 'prospective-interns', component: ProspectiveInternsComponent }
];
