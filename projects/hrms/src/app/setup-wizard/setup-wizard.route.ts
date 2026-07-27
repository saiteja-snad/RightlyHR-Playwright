import { Route } from '@angular/router';
import { SetupWizardPageComponent } from './setup-wizard-page/setup-wizard-page.component';
import { SetupModuleFormComponent } from './setup-wizard-page/setup-module-form/setup-module-form.component';
import { SetupCompleteComponent } from './setup-wizard-page/setup-complete/setup-complete.component';

export default [
  {
    path: '',
    component: SetupWizardPageComponent,
    children: [
      { path: '', redirectTo: 'module-1', pathMatch: 'full' },
      {
        path: 'module-1',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 0 }
      },
      {
        path: 'module-2',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 1 }
      },
      {
        path: 'module-3',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 2 }
      },
      {
        path: 'module-4',
        component: SetupModuleFormComponent,
        data: { moduleIndex: 3 }
      },
      {
        path: 'complete',
        component: SetupCompleteComponent
      }
    ]
  }
] as Route[];
