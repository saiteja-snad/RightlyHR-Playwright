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
import { OnBeHalfOfComponent } from './on-be-half-of/on-be-half-of.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { OnBeHalfOfWaitingForApprovalComponent } from './on-be-half-of/on-be-half-of-waiting-for-approval/on-be-half-of-waiting-for-approval.component';
import { OnBeHalfOfApprovalComponent } from './on-be-half-of/on-be-half-of-approval/on-be-half-of-approval.component';
import { OnBeHalfOfProcessComponent } from './on-be-half-of/on-be-half-of-process/on-be-half-of-process.component';
import { OnBeHalfOfRejectComponent } from './on-be-half-of/on-be-half-of-reject/on-be-half-of-reject.component';
import { PendingApprovalsComponent } from './pending-approvals/pending-approvals.component';
import { WfhForYouRequsetComponent } from './pending-approvals/wfh-for-you-requset/wfh-for-you-requset.component';
import { WfhForYourRoleRequsetComponent } from './pending-approvals/wfh-for-your-role-requset/wfh-for-your-role-requset.component';
import { WfhRequestComponent } from './pending-approvals/wfh-request/wfh-request.component';
import { CompOffRequestComponent } from './pending-approvals/comp-off-request/comp-off-request.component';
import { CompoffForYouRequestComponent } from './pending-approvals/comp-off-request/compoff-for-you-request/compoff-for-you-request.component';
import { CompoffForYourRoleRequestComponent } from './pending-approvals/comp-off-request/compoff-for-your-role-request/compoff-for-your-role-request.component';
import { PremissionRequestComponent } from './pending-approvals/premission-request/premission-request.component';
import { PremissionForYouRequestComponent } from './pending-approvals/premission-for-you-request/premission-for-you-request.component';
import { PremissionForYourRoleRequestComponent } from './pending-approvals/premission-for-your-role-request/premission-for-your-role-request.component';
import { TimeOffRequestComponent } from './pending-approvals/time-off-request/time-off-request.component';
import { TimeOffForYouRequestComponent } from './pending-approvals/time-off-request/time-off-for-you-request/time-off-for-you-request.component';
import { TimeOffForYourRoleRequestComponent } from './pending-approvals/time-off-request/time-off-for-your-role-request/time-off-for-your-role-request.component';
import { LeavesWaitingForApprovalComponent } from './leaves/leaves-waiting-for-approval/leaves-waiting-for-approval.component';
import { LeavesApprovalComponent } from './leaves/leaves-approval/leaves-approval.component';
import { LeavesProcessedComponent } from './leaves/leaves-processed/leaves-processed.component';
import { LeavesRejectedComponent } from './leaves/leaves-rejected/leaves-rejected.component';
import { ProbationPendingApprovalsComponent } from './pending-approvals/probation-pending-approvals/probation-pending-approvals.component';
import { AssessmentformComponent } from './pending-approvals/assessmentform/assessmentform.component';
import { SeparationForYouRequestComponent } from './pending-approvals/separation-for-you-request/separation-for-you-request.component';
import { SeparationRequestComponent } from './separation-request/separation-request.component';
import { SeparationForYourRoleRequestComponent } from './pending-approvals/separation-for-your-role-request/separation-for-your-role-request.component';
import { RecallForYouRequestComponent } from './pending-approvals/recall-for-you-request/recall-for-you-request.component';
import { RecallForYourRoleRequestComponent } from './pending-approvals/recall-for-your-role-request/recall-for-your-role-request.component';
import { RecallRequestsComponent } from './pending-approvals/recall-requests/recall-requests.component';
import { TraineeApprovalsComponent } from './pending-approvals/trainee-approvals/trainee-approvals.component';
import { NodueApprovalDetailsComponent } from './pending-approvals/nodue-approval-details/nodue-approval-details.component';
import { ClaimsandexpensesRequestComponent } from './pending-approvals/claimsandexpenses-request/claimsandexpenses-request.component';
import { ClaimsandexpensesForYouRequestComponent } from './pending-approvals/claimsandexpenses-request/claimsandexpenses-for-you-request/claimsandexpenses-for-you-request.component';
import { ClaimsandexpensesForYourRoleRequestComponent } from './pending-approvals/claimsandexpenses-request/claimsandexpenses-for-your-role-request/claimsandexpenses-for-your-role-request.component';
import { RegularizationComponent } from './regularization/regularization.component';
import { RegularizationWaitingForApprovalComponent } from './regularization/regularization-waiting-for-approval/regularization-waiting-for-approval.component';
import { RegularizationApprovedComponent } from './regularization/regularization-approved/regularization-approved.component';
import { RegularizationRejectedComponent } from './regularization/regularization-rejected/regularization-rejected.component';
import { RegularizationProcessedComponent } from './regularization/regularization-processed/regularization-processed.component';
import { RegularizationRequestComponent } from './pending-approvals/regularization-request/regularization-request.component';
import { RegularizationForYouRequestComponent } from './pending-approvals/regularization-for-you-request/regularization-for-you-request.component';
import { RegularizationForYourRoleRequestComponent } from './pending-approvals/regularization-for-your-role-request/regularization-for-your-role-request.component';
import { OnbehalfOfApprovalsComponent } from './onbehalf-of-approvals/onbehalf-of-approvals.component';
import { TimeOffComponent } from './onbehalf-of-approvals/time-off/time-off.component';
import { CompOffEntitlementComponent } from './onbehalf-of-approvals/comp-off-entitlement/comp-off-entitlement.component';
import { WfhComponent } from './onbehalf-of-approvals/wfh/wfh.component';
import { PermissionsComponent } from './onbehalf-of-approvals/permissions/permissions.component';
import { DeskApprovalRequestComponent } from './pending-approvals/desk-approval-request/desk-approval-request.component';
import { DeskForYouRequestComponent } from './pending-approvals/desk-for-you-request/desk-for-you-request.component';
import { DeskForYourRoleRequestComponent } from './pending-approvals/desk-for-your-role-request/desk-for-your-role-request.component';
import { RemoteLoginComponent } from './remote-login/remote-login.component';
import { RemoteWaitingForApprovalComponent } from './remote-login/remote-waiting-for-approval/remote-waiting-for-approval.component';
import { RemoteApprovedComponent } from './remote-login/remote-approved/remote-approved.component';
import { RemoteProcessedComponent } from './remote-login/remote-processed/remote-processed.component';
import { RemoteRejectedComponent } from './remote-login/remote-rejected/remote-rejected.component';
import { GlobalPermissionsComponent } from './global-permissions/global-permissions.component';
import { TeamLeaveBalanceComponent } from './leaves/team-leave-balance/team-leave-balance.component';
import { TeamLeaveSummaryComponent } from './leaves/team-leave-summary/team-leave-summary.component';
import { CancelledComponent } from './leaves/cancelled/cancelled.component';
import { OrgLeaveBalanceComponent } from './leaves/org-leave-balance/org-leave-balance.component';

export default [
  { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
  { path: 'leaves', component: LeavesComponent,
    children: [
      { path: 'waiting-for-approval', component: LeavesWaitingForApprovalComponent },
      { path: 'approved', component: LeavesApprovalComponent },
      { path: 'processed', component: LeavesProcessedComponent },
      { path: 'rejected', component: LeavesRejectedComponent },
      { path: 'cancelled', component: CancelledComponent },
      { path: 'team-leave-balance', component: TeamLeaveBalanceComponent },
      { path: 'team-leave-summary', component: TeamLeaveSummaryComponent },
      { path: 'org-leave-balance', component: OrgLeaveBalanceComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'wfh', component: WorkFromHomeComponent,
    children: [
      { path: 'waiting-for-approval', component: WfhWaitingForApprovalComponent },
      { path: 'approved', component: WfhApprovedComponent },
      { path: 'processed', component: WfhProcessedComponent },
      { path: 'rejected', component: WfhRejectedComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'remote', component: RemoteLoginComponent,
    children: [
      { path: 'waiting-for-approval', component: RemoteWaitingForApprovalComponent },
      { path: 'approved', component: RemoteApprovedComponent },
      { path: 'processed', component: RemoteProcessedComponent },
      { path: 'rejected', component: RemoteRejectedComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'comp-off', component: CompOffComponent,
    children: [
      { path: 'waiting-for-approval', component: CompOffWaitingForApprovalComponent },
      { path: 'approved', component: CompOffApprovalComponent },
      { path: 'processed', component: CompOffProcessComponent },
      { path: 'rejected', component: CompOffRejectComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },

  {
    path: 'premissions',
    component: PremissionsComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: PremissionsWaitingForApprovalComponent,
      },
      { path: 'approved', component: PremissionsApprovedComponent },
      { path: 'rejected', component: PremissionsRejectedComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'regularization',
    component: RegularizationComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: RegularizationWaitingForApprovalComponent,
      },
      { path: 'approved', component: RegularizationApprovedComponent },
      { path: 'rejected', component: RegularizationRejectedComponent },
      { path: 'process', component: RegularizationProcessedComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'on-behalf-of',
    component: OnBeHalfOfComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: OnBeHalfOfWaitingForApprovalComponent,
      },
      { path: 'approved', component: OnBeHalfOfApprovalComponent },
      { path: 'processed', component: OnBeHalfOfProcessComponent },
      { path: 'rejected', component: OnBeHalfOfRejectComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'attendance', component: AttendanceComponent },
  {
    path: 'pending-approvals',
    component: PendingApprovalsComponent,
    children: [
      {
        path: 'time-off-request',
        component: TimeOffRequestComponent,
        children: [
          { path: 'for-you', component: TimeOffForYouRequestComponent },
          {
            path: 'for-your-role',
            component: TimeOffForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
        ],
      },
      {
        path: 'wfh',
        component: WfhRequestComponent,
        children: [
          { path: 'for-you', component: WfhForYouRequsetComponent },
          { path: 'for-your-role', component: WfhForYourRoleRequsetComponent },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'desk-approval',
        component:DeskApprovalRequestComponent,
        children: [
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
          { path: 'for-you', component: DeskForYouRequestComponent },
          { path: 'for-your-role', component: DeskForYourRoleRequestComponent },
         
        ],
      },
      {
        path: 'comp-off',
        component: CompOffRequestComponent,
        children: [
          { path: 'for-you', component: CompoffForYouRequestComponent },
          {
            path: 'for-your-role',
            component: CompoffForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'permissions',
        component: PremissionRequestComponent,
        children: [
          { path: 'for-you', component: PremissionForYouRequestComponent },
          {
            path: 'for-your-role',
            component: PremissionForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
        ],
      },
      {
        path: 'regularization-request',
        component: RegularizationRequestComponent,
        children: [
          { path: 'for-you', component: RegularizationForYouRequestComponent },
          {
            path: 'for-your-role',
            component: RegularizationForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
        ],
      },
      {
        path: 'claimsandexpenses-request',
        component: ClaimsandexpensesRequestComponent,
        children: [
          {
            path: 'for-you',
            component: ClaimsandexpensesForYouRequestComponent,
          },
          {
            path: 'for-your-role',
            component: ClaimsandexpensesForYourRoleRequestComponent,
          },

          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'probation-request',
        component: ProbationPendingApprovalsComponent,
      },
      {
        path: 'assessmentform',
        component: AssessmentformComponent,
      },
      {
        path: 'separation-request',
        component: SeparationRequestComponent,
        children: [
          {
            path: 'separation-for-you',
            component: SeparationForYouRequestComponent,
          },
          {
            path: 'separation-for-role',
            component: SeparationForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'separation-for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'recall-request',
        component: RecallRequestsComponent,
        children: [
          { path: 'recall-for-you', component: RecallForYouRequestComponent },
          {
            path: 'recall-for-role',
            component: RecallForYourRoleRequestComponent,
          },
          { path: '', redirectTo: 'recall-for-you', pathMatch: 'full' },
        ],
      },

      { path: 'nodue-request', component: NodueApprovalDetailsComponent,
        children: [
          { path: '', redirectTo: 'nodue-request', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'time-off-request', pathMatch: 'full' },
      { path: 'trainee-approvals', component: TraineeApprovalsComponent },
    ],
  },
  // on be half of approvals
  { path: 'on-behalf-of-approvals', component: OnbehalfOfApprovalsComponent,
    children: [
      { path: '', redirectTo: 'time-off', pathMatch: 'full' },
      { path: 'time-off', component: TimeOffComponent, },
      { path: 'entitlement', component: CompOffEntitlementComponent },
      { path: 'wfh', component: WfhComponent },
      { path: 'permissions', component: PermissionsComponent },
    ],
  },
  { path: 'global-permissions', component: GlobalPermissionsComponent },
] as Route[];