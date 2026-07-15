import { Routes } from '@angular/router';
import { DemoFormComponent } from './demo-form/demo-form.component';

export const routes: Routes = [
  { path: 'form', component: DemoFormComponent },
  { path: '', redirectTo: 'form', pathMatch: 'full' },
];
