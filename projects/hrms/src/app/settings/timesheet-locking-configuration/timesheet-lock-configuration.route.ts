import { Route } from '@angular/router';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PendingTimesheetLockComponent } from './pending-timesheet-lock/pending-timesheet-lock.component';
import { PublishedTimesheetLockComponent } from './published-timesheet-lock/published-timesheet-lock.component';

export default [
     { path: 'pending-for-submission', component: PendingTimesheetLockComponent },
     { path: 'published', component: PublishedTimesheetLockComponent },


//       {
//         path: 'timesheet-locking',
//         children: [
//             // { path: '', redirectTo: 'pendingleavecategory', pathMatch: 'full' },
//             { path: 'pending-for-submission', loadComponent: () => import('./pending-timesheet-lock/pending-timesheet-lock.component').then((m) => m.PendingTimesheetLockComponent) },
//             { path: 'published', loadComponent: () => import('./published-timesheet-lock/published-timesheet-lock.component').then((m) => m.PublishedTimesheetLockComponent) },
//         ]
//     },
] as unknown as Route[];