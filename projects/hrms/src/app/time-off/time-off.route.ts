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
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
  { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
  { path: 'leaves', component: LeavesComponent, 
    children: [
      { path: 'waiting-for-approval', component: LeavesWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'approved', component: LeavesApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Approved (Time Off).view' } },
      { path: 'processed', component: LeavesProcessedComponent,canActivate: [PermissionsGuard], data: { permission: 'Processed (Time Off).view' } },
      { path: 'rejected', component: LeavesRejectedComponent,canActivate: [PermissionsGuard], data: { permission: 'Rejected (Time Off).view' } },
      { path: 'cancelled', component: CancelledComponent ,canActivate: [PermissionsGuard], data: { permission: 'Cancelled(Time Off).view' }},
      { path: 'team-leave-balance', component: TeamLeaveBalanceComponent ,canActivate: [PermissionsGuard], data: { permission: 'Team Leave Balance(Time Off).view' }},
      { path: 'team-leave-summary', component: TeamLeaveSummaryComponent ,canActivate: [PermissionsGuard], data: { permission: 'Team Leave Balance Summary(Time Off).view' }},
      { path: 'org-leave-balance', component: OrgLeaveBalanceComponent,canActivate: [PermissionsGuard], data: { permission: 'Org Leave Balance(Time Off).view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'wfh', component: WorkFromHomeComponent,
    children: [
      { path: 'waiting-for-approval', component: WfhWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (WFH).view' } },
      { path: 'approved', component: WfhApprovedComponent,canActivate: [PermissionsGuard], data: { permission: 'Approved (WFH).view' } },
      { path: 'processed', component: WfhProcessedComponent,canActivate: [PermissionsGuard], data: { permission: 'Processed (WFH).view' } },
      { path: 'rejected', component: WfhRejectedComponent,canActivate: [PermissionsGuard], data: { permission: 'Rejected (WFH).view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'remote', component: RemoteLoginComponent,
    children: [
      { path: 'waiting-for-approval', component: RemoteWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Remote Login.view' } },
      { path: 'approved', component: RemoteApprovedComponent,canActivate: [PermissionsGuard], data: { permission: 'Remote Login.view' } },
      { path: 'processed', component: RemoteProcessedComponent,canActivate: [PermissionsGuard], data: { permission: 'Remote Login.view' } },
      { path: 'rejected', component: RemoteRejectedComponent,canActivate: [PermissionsGuard], data: { permission: 'Remote Login.view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'comp-off', component: CompOffComponent,
    children: [
      { path: 'waiting-for-approval', component: CompOffWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Comp Off).view' } },
      { path: 'approved', component: CompOffApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Approved (Comp Off).view' } },
      { path: 'processed', component: CompOffProcessComponent,canActivate: [PermissionsGuard], data: { permission: 'Processed (Comp Off).view' } },
      { path: 'rejected', component: CompOffRejectComponent,canActivate: [PermissionsGuard], data: { permission: 'Rejected (Comp Off).view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },

  {
    path: 'premissions',
    component: PremissionsComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: PremissionsWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Permissions).view' }
      },
      { path: 'approved', component: PremissionsApprovedComponent,canActivate: [PermissionsGuard], data: { permission: 'Approved (Permissions).view' } },
      { path: 'rejected', component: PremissionsRejectedComponent ,canActivate: [PermissionsGuard], data: { permission: 'Rejected (Permissions).view' }},
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'regularization',
    component: RegularizationComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: RegularizationWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Time Off).view' }
      },
      { path: 'approved', component: RegularizationApprovedComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'rejected', component: RegularizationRejectedComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: 'process', component: RegularizationProcessedComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Time Off).view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'on-behalf-of',
    component: OnBeHalfOfComponent,
    children: [
      {
        path: 'waiting-for-approval',
        component: OnBeHalfOfWaitingForApprovalComponent,canActivate: [PermissionsGuard], data: { permission: 'Waiting For Approval (Regularization).view' }
      },
      { path: 'approved', component: OnBeHalfOfApprovalComponent ,canActivate: [PermissionsGuard], data: { permission: 'Approved (Regularization).view' }},
      { path: 'processed', component: OnBeHalfOfProcessComponent,canActivate: [PermissionsGuard], data: { permission: 'Processed (Regularization).view' } },
      { path: 'rejected', component: OnBeHalfOfRejectComponent,canActivate: [PermissionsGuard], data: { permission: 'Rejected (Regularization).view' } },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'attendance', component: AttendanceComponent,canActivate: [PermissionsGuard], data: { permission: 'Attendance Module.view' } },
  {
    path: 'pending-approvals',
    component: PendingApprovalsComponent,
    children: [
      {
        path: 'time-off-request',
        component: TimeOffRequestComponent,
        children: [
          { path: 'for-you', component: TimeOffForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Time Off).view' } },
          {
            path: 'for-your-role',
            component: TimeOffForYourRoleRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (Time Off).view' }
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
        ],
      },
      {
        path: 'wfh',
        component: WfhRequestComponent,
        children: [
          { path: 'for-you', component: WfhForYouRequsetComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (WFH).view'  }},
          { path: 'for-your-role', component: WfhForYourRoleRequsetComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (WFH).view'  }},
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'desk-approval',
        component:DeskApprovalRequestComponent,
        children: [
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
          { path: 'for-you', component: DeskForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Desk Requests).view'  }},
          { path: 'for-your-role', component: DeskForYourRoleRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (Desk Requests).view' } },
         
        ],
      },
      {
        path: 'comp-off',
        component: CompOffRequestComponent,
        children: [
          { path: 'for-you', component: CompoffForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Comp Off).view' } },
          {
            path: 'for-your-role',
            component: CompoffForYourRoleRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (Comp Off).view' }
          },
          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'permissions',
        component: PremissionRequestComponent,
        children: [
          { path: 'for-you', component: PremissionForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Permission).view'}  },
          {
            path: 'for-your-role',
            component: PremissionForYourRoleRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (Permission).view' }
          },
          // { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
        ],
      },
      {
        path: 'regularization-request',
        component: RegularizationRequestComponent,
        children: [
          { path: 'for-you', component: RegularizationForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Regularization).view' } },
          {
            path: 'for-your-role',
            component: RegularizationForYourRoleRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For Role (Regularization).view' }  
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
            component: ClaimsandexpensesForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Claims and Expenses).view' }  
          },
          {
            path: 'for-your-role',
            component: ClaimsandexpensesForYourRoleRequestComponent,canActivate: [PermissionsGuard], data : { permission: 'For Role (Claims and Expenses).view' }
          },

          { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'probation-request',
        component: ProbationPendingApprovalsComponent,canActivate: [PermissionsGuard], data: { permission: 'Probation Details.view' }
      },
      {
        path: 'assessmentform',
        component: AssessmentformComponent,canActivate: [PermissionsGuard], data: { permission: 'Probation Assessment Form.view' }
      },
      {
        path: 'separation-request',
        component: SeparationRequestComponent,
        children: [
          {
            path: 'separation-for-you',
            component: SeparationForYouRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'For You (Seperation Request)' }
          },
          {
            path: 'separation-for-role',
            component: SeparationForYourRoleRequestComponent,canActivate: [PermissionsGuard], data  : { permission: 'For Role (Seperation Request)' }
          },
          { path: '', redirectTo: 'separation-for-you', pathMatch: 'full' },
        ],
      },
      {
        path: 'recall-request',
        component: RecallRequestsComponent,
        children: [
          { path: 'recall-for-you', component: RecallForYouRequestComponent ,canActivate: [PermissionsGuard], data: { permission: 'For You (Recall Requests).view' }
        },
          {
            path: 'recall-for-role',
            component: RecallForYourRoleRequestComponent, canActivate: [PermissionsGuard], data: { permission: 'For Role (Recall Requests).view' }
          },
          { path: '', redirectTo: 'recall-for-you', pathMatch: 'full' },
        ],
      },

      { path: 'nodue-request', component: NodueApprovalDetailsComponent, canActivate: [PermissionsGuard], data: { permission: 'No Due Clearance Request.view'  },
        children: [
          { path: '', redirectTo: 'nodue-request', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'time-off-request', pathMatch: 'full' },
      { path: 'trainee-approvals', component: TraineeApprovalsComponent, canActivate: [PermissionsGuard], data: { permission: 'Trainee Details.view' } },
    ],
  },
  // on be half of approvals
  { path: 'on-behalf-of-approvals', component: OnbehalfOfApprovalsComponent,
    children: [
      { path: '', redirectTo: 'time-off', pathMatch: 'full' },
      { path: 'time-off', component: TimeOffComponent,canActivate: [PermissionsGuard], data: { permission: 'Time Off (On Behalf Of Approvals).view' } },
      { path: 'entitlement', component: CompOffEntitlementComponent,canActivate: [PermissionsGuard], data: { permission: 'Comp Off (On Behalf Of Approvals).view' } },
      { path: 'wfh', component: WfhComponent ,canActivate: [PermissionsGuard], data: { permission: 'WFH (On Behalf Of Approvals).view' }},
      { path: 'permissions', component: PermissionsComponent,canActivate: [PermissionsGuard], data: { permission: 'Permissions (On Behalf Of Approvals).view' } },
    ],
  },
  { path: 'global-permissions', component: GlobalPermissionsComponent ,canActivate: [PermissionsGuard], data: { permission: 'Global Permissions Module.view' } },
] as Route[];