import { Route } from "@angular/router";
import { LeavesComponent } from "./leaves/leaves.component";
import { WorkFromHomeComponent } from "./work-from-home/work-from-home.component";
import { WfhWaitingForApprovalComponent } from "./work-from-home/wfh-waiting-for-approval/wfh-waiting-for-approval.component";
import { WfhApprovedComponent } from "./work-from-home/wfh-approved/wfh-approved.component";
import { WfhProcessedComponent } from "./work-from-home/wfh-processed/wfh-processed.component";
import { WfhRejectedComponent } from "./work-from-home/wfh-rejected/wfh-rejected.component";
import { CompOffComponent } from "./comp-off/comp-off.component";
import { CompOffWaitingForApprovalComponent } from "./comp-off/comp-off-waiting-for-approval/comp-off-waiting-for-approval.component";
import { CompOffApprovalComponent } from "./comp-off/comp-off-approval/comp-off-approval.component";
import { CompOffProcessComponent } from "./comp-off/comp-off-process/comp-off-process.component";
import { CompOffRejectComponent } from "./comp-off/comp-off-reject/comp-off-reject.component";
import { PremissionsComponent } from "./premissions/premissions.component";
import { PremissionsWaitingForApprovalComponent } from "./premissions/premissions-waiting-for-approval/premissions-waiting-for-approval.component";
import { PremissionsApprovedComponent } from "./premissions/premissions-approved/premissions-approved.component";
import { PremissionsRejectedComponent } from "./premissions/premissions-rejected/premissions-rejected.component";
import { OnBeHalfOfComponent } from "./on-be-half-of/on-be-half-of.component";

import { AttendanceComponent } from "./attendance/attendance.component";
import { OnBeHalfOfWaitingForApprovalComponent } from "./on-be-half-of/on-be-half-of-waiting-for-approval/on-be-half-of-waiting-for-approval.component";
import { OnBeHalfOfApprovalComponent } from "./on-be-half-of/on-be-half-of-approval/on-be-half-of-approval.component";
import { OnBeHalfOfProcessComponent } from "./on-be-half-of/on-be-half-of-process/on-be-half-of-process.component";
import { OnBeHalfOfRejectComponent } from "./on-be-half-of/on-be-half-of-reject/on-be-half-of-reject.component";
import { PendingApprovalsComponent } from "./pending-approvals/pending-approvals.component";
import { WfhForYouRequsetComponent } from "./pending-approvals/wfh-for-you-requset/wfh-for-you-requset.component";
import { WfhForYourRoleRequsetComponent } from "./pending-approvals/wfh-for-your-role-requset/wfh-for-your-role-requset.component";
import { WfhRequestComponent } from "./pending-approvals/wfh-request/wfh-request.component";
import { CompOffRequestComponent } from "./pending-approvals/comp-off-request/comp-off-request.component";
import { CompoffForYouRequestComponent } from "./pending-approvals/comp-off-request/compoff-for-you-request/compoff-for-you-request.component";
import { CompoffForYourRoleRequestComponent } from "./pending-approvals/comp-off-request/compoff-for-your-role-request/compoff-for-your-role-request.component";
import { PremissionRequestComponent } from "./pending-approvals/premission-request/premission-request.component";
import { PremissionForYouRequestComponent } from "./pending-approvals/premission-for-you-request/premission-for-you-request.component";
import { PremissionForYourRoleRequestComponent } from "./pending-approvals/premission-for-your-role-request/premission-for-your-role-request.component";
import { TimeOffRequestComponent } from "./pending-approvals/time-off-request/time-off-request.component";
import { TimeOffForYouRequestComponent } from "./pending-approvals/time-off-request/time-off-for-you-request/time-off-for-you-request.component";
import { TimeOffForYourRoleRequestComponent } from "./pending-approvals/time-off-request/time-off-for-your-role-request/time-off-for-your-role-request.component";
import { AttendanceRegularizationRequestComponent } from "./pending-approvals/attendance-regularization-request/attendance-regularization-request.component";
import { AttendanceRegularizationForYouRequestComponent } from "./pending-approvals/attendance-regularization-request/attendance-regularization-for-you-request/attendance-regularization-for-you-request.component";
import { LeavesWaitingForApprovalComponent } from "./leaves/leaves-waiting-for-approval/leaves-waiting-for-approval.component";
import { LeavesApprovalComponent } from "./leaves/leaves-approval/leaves-approval.component";
import { LeavesProcessedComponent } from "./leaves/leaves-processed/leaves-processed.component";
import { LeavesRejectedComponent } from "./leaves/leaves-rejected/leaves-rejected.component";
import { ProbationPendingApprovalsComponent } from "./pending-approvals/probation-pending-approvals/probation-pending-approvals.component";
import { AssessmentformComponent } from "./pending-approvals/assessmentform/assessmentform.component";


export default [
  { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
  {
    path: 'leaves', component: LeavesComponent,
    children: [
      { path: 'waiting-for-approval', component: LeavesWaitingForApprovalComponent },
      { path: 'approved', component: LeavesApprovalComponent },
      { path: 'processed', component: LeavesProcessedComponent },
      { path: 'rejected', component: LeavesRejectedComponent },

      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ]

  },
  {
    path: 'wfh',
    component: WorkFromHomeComponent,
    children: [
      { path: 'waiting-for-approval', component: WfhWaitingForApprovalComponent },
      { path: 'approved', component: WfhApprovedComponent },
      { path: 'processed', component: WfhProcessedComponent },
      { path: 'rejected', component: WfhRejectedComponent },

      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'comp-off',
    component: CompOffComponent,
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
      { path: 'waiting-for-approval', component: PremissionsWaitingForApprovalComponent },
      { path: 'approved', component: PremissionsApprovedComponent },
      { path: 'rejected', component: PremissionsRejectedComponent },
      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  {
    path: 'on-behalf-of',
    component: OnBeHalfOfComponent,
    children: [
      { path: 'waiting-for-approval', component: OnBeHalfOfWaitingForApprovalComponent },
      { path: 'approved', component: OnBeHalfOfApprovalComponent },
      { path: 'processed', component: OnBeHalfOfProcessComponent },
      { path: 'rejected', component: OnBeHalfOfRejectComponent },

      { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
    ],
  },
  { path: 'attendance', component: AttendanceComponent, },
  {
    path: 'pending-approvals',
    component: PendingApprovalsComponent,
    children: [{
      path: 'time-off-request',
      component: TimeOffRequestComponent,
      children: [
        { path: 'for-you', component: TimeOffForYouRequestComponent },
        { path: 'for-your-role', component: TimeOffForYourRoleRequestComponent },
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
      path: 'comp-off',
      component: CompOffRequestComponent,
      children: [
        { path: 'for-you', component: CompoffForYouRequestComponent },
        { path: 'for-your-role', component: CompoffForYourRoleRequestComponent },
        { path: '', redirectTo: 'for-you', pathMatch: 'full' },
      ],
    },
    {
      path: 'permissions',
      component: PremissionRequestComponent,
      children: [
        { path: 'for-you', component: PremissionForYouRequestComponent },
        { path: 'for-your-role', component: PremissionForYourRoleRequestComponent },
        { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
      ],
    },

    {
      path: 'attendance-request',
      component: AttendanceRegularizationRequestComponent,
      children: [
        { path: 'for-you', component: AttendanceRegularizationForYouRequestComponent },
        { path: 'for-your-role', component: AttendanceRegularizationForYouRequestComponent },
        { path: '', redirectTo: 'for-you', pathMatch: 'full' }, // Default child route
      ],
    },
    {
      path: 'probation-request',
      component: ProbationPendingApprovalsComponent,
      children: [
        { path: 'assessmentform', component: AssessmentformComponent },
        { path: '', redirectTo: 'for-you', pathMatch: 'full' }
      ],
    },
    {
      path: 'assessmentform',
      component: AssessmentformComponent,
      
    },

    { path: '', redirectTo: 'time-off-request', pathMatch: 'full' }, // Default section
    ]
  }

] as Route[];