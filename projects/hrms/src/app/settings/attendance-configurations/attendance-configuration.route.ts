import { Route } from '@angular/router';
import { PendingAttendanceLockComponent } from './pending-attendance-lock/pending-attendance-lock.component';
import { PubllishedAttendanceLockComponent } from './publlished-attendance-lock/publlished-attendance-lock.component';
import { AttendanceLockLayoutComponent } from './attendance-lock-layout/attendance-lock-layout.component';
import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
     { path: 'pending-for-submission', component: PendingAttendanceLockComponent, permission: 'Attendance Pending Tab.view' },
     { path: 'published', component: PubllishedAttendanceLockComponent, permission: 'Attendance Published Tab.view' },
] as unknown as Route[];