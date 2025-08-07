import { Route } from '@angular/router';
import { PendingAttendanceLockComponent } from './pending-attendance-lock/pending-attendance-lock.component';
import { PubllishedAttendanceLockComponent } from './publlished-attendance-lock/publlished-attendance-lock.component';
import { AttendanceLockLayoutComponent } from './attendance-lock-layout/attendance-lock-layout.component';
import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
     // { path: '', redirectTo: '/settings/attendance-configuration/pending-for-submission', pathMatch: 'full', },
     { path: 'pending-for-submission', component: PendingAttendanceLockComponent, permission: 'Attendance Pending Tab.view' },

     { path: 'published', component: PubllishedAttendanceLockComponent, permission: 'Attendance Published Tab.view' },
     //  {
     //         path: 'Attendance-lock',
     //         children: [
     //             // { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
     //             { path: 'pending-for-submit', loadComponent: () => import('./pending-attendance-lock/pending-attendance-lock.component').then((m) => m.PendingAttendanceLockComponent), canActivate: [PermissionsGuard], data: { permission: 'Attendance Published Tab.view' } },
     //             { path: 'published-shifts', loadComponent: () => import('./publlished-attendance-lock/publlished-attendance-lock.component').then((m) => m.PubllishedAttendanceLockComponent), canActivate: [PermissionsGuard], data: { permission: 'Attendance Published Tab.view' } },
     //         ]
     //     },
] as unknown as Route[];