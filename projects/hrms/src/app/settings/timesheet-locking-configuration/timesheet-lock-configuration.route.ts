import { Route } from '@angular/router';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PendingTimesheetLockComponent } from './pending-timesheet-lock/pending-timesheet-lock.component';
import { PublishedTimesheetLockComponent } from './published-timesheet-lock/published-timesheet-lock.component';

export default [
     { path: 'pending-for-submission', component: PendingTimesheetLockComponent },
     { path: 'published', component: PublishedTimesheetLockComponent },
] as unknown as Route[];