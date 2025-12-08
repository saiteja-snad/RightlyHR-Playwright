import { Route } from '@angular/router';
import { LeavesComponent } from './leaves/leaves.component';
import { WorkFromHomeComponent } from './work-from-home/work-from-home.component';
import { WfhWaitingForApprovalComponent } from './work-from-home/wfh-waiting-for-approval/wfh-waiting-for-approval.component';
import { WfhApprovedComponent } from './work-from-home/wfh-approved/wfh-approved.component';
import { WfhProcessedComponent } from './work-from-home/wfh-processed/wfh-processed.component';
import { WfhRejectedComponent } from './work-from-home/wfh-rejected/wfh-rejected.component';
import { CompOffComponent } from './comp-off/comp-off.component';
import { CompOffWaitingForApprovalComponent } from './comp-off/comp-off-waiting-for-approval/comp-off-waiting-for-approval.component';
import { CompOffApprovalComponent } from './comp-off/comp-off-approval/comp-off-approval.component';
import { CompOffProcessComponent } from './comp-off/comp-off-process/comp-off-process.component';
import { CompOffRejectComponent } from './comp-off/comp-off-reject/comp-off-reject.component';
import { PremissionsComponent } from './premissions/premissions.component';
import { PremissionsWaitingForApprovalComponent } from './premissions/premissions-waiting-for-approval/premissions-waiting-for-approval.component';
import { PremissionsApprovedComponent } from './premissions/premissions-approved/premissions-approved.component';
import { PremissionsRejectedComponent } from './premissions/premissions-rejected/premissions-rejected.component';
import { LeavesWaitingForApprovalComponent } from './leaves/leaves-waiting-for-approval/leaves-waiting-for-approval.component';
import { LeavesApprovalComponent } from './leaves/leaves-approval/leaves-approval.component';
import { LeavesProcessedComponent } from './leaves/leaves-processed/leaves-processed.component';
import { LeavesRejectedComponent } from './leaves/leaves-rejected/leaves-rejected.component';
import { RegularizationComponent } from './regularization/regularization.component';
import { RegularizationWaitingForApprovalComponent } from './regularization/regularization-waiting-for-approval/regularization-waiting-for-approval.component';
import { RegularizationApprovedComponent } from './regularization/regularization-approved/regularization-approved.component';
import { RegularizationRejectedComponent } from './regularization/regularization-rejected/regularization-rejected.component';
import { RegularizationProcessedComponent } from './regularization/regularization-processed/regularization-processed.component';
import { OnbehalfOfApprovalsComponent } from './onbehalf-of-approvals/onbehalf-of-approvals.component';
import { TimeOffComponent } from './onbehalf-of-approvals/time-off/time-off.component';
import { CompOffEntitlementComponent } from './onbehalf-of-approvals/comp-off-entitlement/comp-off-entitlement.component';
import { WfhComponent } from './onbehalf-of-approvals/wfh/wfh.component';
import { PermissionsComponent } from './onbehalf-of-approvals/permissions/permissions.component';
import { RemoteLoginComponent } from './remote-login/remote-login.component';
import { RemoteWaitingForApprovalComponent } from './remote-login/remote-waiting-for-approval/remote-waiting-for-approval.component';
import { RemoteApprovedComponent } from './remote-login/remote-approved/remote-approved.component';
import { RemoteProcessedComponent } from './remote-login/remote-processed/remote-processed.component';
import { RemoteRejectedComponent } from './remote-login/remote-rejected/remote-rejected.component';
import { GlobalPermissionsComponent } from './global-permissions/global-permissions.component';
import { CancelledComponent } from './leaves/cancelled/cancelled.component';
import { WfhCancellationComponent } from './work-from-home/wfh-cancellation/wfh-cancellation.component';
import { PermissionsCancellationComponent } from './premissions/permissions-cancellation/permissions-cancellation.component';
import { ExtraHoursComponent } from './extra-hours/extra-hours.component';
import { ExtraHoursWaitingForApprovalComponent } from './extra-hours/extra-hours-waiting-for-approval/extra-hours-waiting-for-approval.component';
import { ExtraHoursProcessComponent } from './extra-hours/extra-hours-process/extra-hours-process.component';
import { ExtraHoursRejectComponent } from './extra-hours/extra-hours-reject/extra-hours-reject.component';

export default [
  { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
  {
    path: 'leaves', component: LeavesComponent,
    children: [
      { path: 'waiting-for-approval', component: LeavesWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'approved', component: LeavesApprovalComponent, data: { permission: 'Approved (Time Off).view' } },
      { path: 'processed', component: LeavesProcessedComponent, data: { permission: 'Processed (Time Off).view' } },
      { path: 'rejected', component: LeavesRejectedComponent, data: { permission: 'Rejected (Time Off).view' } },
      { path: 'cancelled', component: CancelledComponent, data: { permission: 'Cancelled(Time Off).view' } },
    ],
  },
  {
    path: 'wfh', component: WorkFromHomeComponent,
    children: [
      {
        path: 'waiting-for-approval', component: WfhWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (WFH).view' },
      },
      { path: 'approved', component: WfhApprovedComponent, data: { permission: 'Approved (WFH).view' } },
      { path: 'processed', component: WfhProcessedComponent, data: { permission: 'Processed (WFH).view' } },
      { path: 'rejected', component: WfhRejectedComponent, data: { permission: 'Rejected (WFH).view' } },
      { path: 'cancelled', component: WfhCancellationComponent, data: { permission: 'Cancel (WFH).view' } },
    ],
  },
  {
    path: 'remote', component: RemoteLoginComponent,
    children: [
      { path: 'waiting-for-approval', component: RemoteWaitingForApprovalComponent, data: { permission: 'Remote Login.view' } },
      { path: 'approved', component: RemoteApprovedComponent, data: { permission: 'Remote Login.view' } },
      { path: 'processed', component: RemoteProcessedComponent, data: { permission: 'Remote Login.view' } },
      { path: 'rejected', component: RemoteRejectedComponent, data: { permission: 'Remote Login.view' } },
    ],
  },
  {
    path: 'comp-off', component: CompOffComponent,
    children: [
      { path: 'waiting-for-approval', component: CompOffWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (Comp Off).view' } },
      { path: 'approved', component: CompOffApprovalComponent, data: { permission: 'Approved (Comp Off).view' } },
      { path: 'processed', component: CompOffProcessComponent, data: { permission: 'Processed (Comp Off).view' } },
      { path: 'rejected', component: CompOffRejectComponent, data: { permission: 'Rejected (Comp Off).view' } },
    ],
  },
  {
    path: 'premissions', component: PremissionsComponent,
    children: [
      { path: 'waiting-for-approval', component: PremissionsWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (Permissions).view' } },
      { path: 'processed', component: PremissionsApprovedComponent, data: { permission: 'Processed (Permissions).view' } },
      { path: 'rejected', component: PremissionsRejectedComponent, data: { permission: 'Rejected (Permissions).view' } },
      { path: 'cancelled', component: PermissionsCancellationComponent, data: { permission: 'Cancel (Permissions).view' } },
    ],
  },
  {
    path: 'regularization', component: RegularizationComponent,
    children: [
      { path: 'waiting-for-approval', component: RegularizationWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'approved', component: RegularizationApprovedComponent, data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'rejected', component: RegularizationRejectedComponent, data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'process', component: RegularizationProcessedComponent, data: { permission: 'Waiting For Approval (Time Off).view' } },
    ],
  },
  // on be half of approvals
  {
    path: 'on-behalf-of-approvals', component: OnbehalfOfApprovalsComponent,
    children: [
      { path: 'time-off', component: TimeOffComponent, data: { permission: 'Time Off (On Behalf Of Approvals).view' } },
      { path: 'entitlement', component: CompOffEntitlementComponent, data: { permission: 'Comp Off (On Behalf Of Approvals).view' } },
      { path: 'wfh', component: WfhComponent, data: { permission: 'WFH (On Behalf Of Approvals).view' } },
      { path: 'permissions', component: PermissionsComponent, data: { permission: 'Permissions (On Behalf Of Approvals).view' } },
    ],
  },
  
  {
    path: 'extra-hours', component: ExtraHoursComponent,
    children: [
      { path: 'waiting-for-approval', component: ExtraHoursWaitingForApprovalComponent, data: { permission: 'Waiting For Approval (Extra Hours).view' }, },
      // { path: 'approved', component: ExtraHoursApprovalComponent, data: { permission: 'Approved (Extra Hours).view' } },
      { path: 'process', component: ExtraHoursProcessComponent, data: { permission: 'Processed (Extra Hours).view' } },
      { path: 'rejected', component: ExtraHoursRejectComponent, data: { permission: 'Rejected (Extra Hours).view' } },
      // { path: 'cancelled', component: ExtraHoursCancelComponent, data: { permission: 'Cancelled(Extra Hours).view' } },
    ],
  },
 
] as Route[];