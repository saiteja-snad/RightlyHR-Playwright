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
import { OnBeHalfOfWaitingForApprovalComponent } from "./on-be-half-of-waiting-for-approval/on-be-half-of-waiting-for-approval.component";
import { OnBeHalfOfApprovalComponent } from "./on-be-half-of-approval/on-be-half-of-approval.component";
import { OnBeHalfOfProcessComponent } from "./on-be-half-of-process/on-be-half-of-process.component";
import { OnBeHalfOfRejectComponent } from "./on-be-half-of-reject/on-be-half-of-reject.component";
import { AttendanceComponent } from "./attendance/attendance.component";


export default [
  { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
  {
    path: 'leaves', component: LeavesComponent,

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
  { path: 'attendance', component: AttendanceComponent,}
] as Route[];