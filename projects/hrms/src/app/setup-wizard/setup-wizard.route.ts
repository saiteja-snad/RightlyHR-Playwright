import { Route } from '@angular/router';
import { SetupWizardPageComponent } from './setup-wizard-page/setup-wizard-page.component';
import { SetupModuleFormComponent } from './setup-wizard-page/setup-module-form/setup-module-form.component';
import { SetupCompleteComponent } from './setup-wizard-page/setup-complete/setup-complete.component';

export default [
  {
    path: '',
    component: SetupWizardPageComponent,
    children: [
      { path: '', redirectTo: 'location-shifts', pathMatch: 'full' },
      {
        path: 'location-shifts',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 0 }
      },
      {
        path: 'calendar-policies',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 1 }
      },
      {
        path: 'department-team',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 2 }
      },
      {
        path: 'employee-config',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 3 }
      },
      {
        path: 'org-hierarchy',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 4 }
      },
      {
        path: 'leaves',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 5 }
      },
      {
        path: 'signature-authorities',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 6 }
      },
      {
        path: 'complete',
        component: SetupCompleteComponent
      },
      // Legacy routes redirect
      { path: 'module-1', redirectTo: 'location-shifts', pathMatch: 'full' },
      { path: 'module-2', redirectTo: 'calendar-policies', pathMatch: 'full' },
      { path: 'module-3', redirectTo: 'department-team', pathMatch: 'full' },
      { path: 'module-4', redirectTo: 'employee-config', pathMatch: 'full' }
    ]
  }
] as Route[];
