import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { PreonboardingLayoutComponent } from './preonboarding/preonboarding-layout/preonboarding-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: '', component: PreonboardingLayoutComponent, loadChildren: () => import('./preonboarding/preonboarding.route'),canActivateChild: [authGuard] },
];