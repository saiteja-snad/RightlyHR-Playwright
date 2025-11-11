import { Route } from '@angular/router';
import { OnBehalfOfWfhComponent } from './on-behalf-of-wfh/on-behalf-of-wfh.component';
import { OnBehalfOfWhfWaitingForApprovalComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-waiting-for-approval/on-behalf-of-wfh-waiting-for-approval.component';
import { OnBehalfOfWhfApprovedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-approved/on-behalf-of-whf-approved.component';
import { OnBehalfOfWhfProcessedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-processed/on-behalf-of-wfh-processed.component';
import { OnBehalfOfWhfRejectedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-rejected/on-behalf-of-wfh-rejected.component';
import { OnBehalfOfWhfCancellationComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-cancellation/on-behalf-of-wfh-cancellation.component';
import { OnBeHalfOfProcessComponent } from './on-be-half-of/on-be-half-of-process/on-be-half-of-process.component';
import { OnBeHalfOfRejectComponent } from './on-be-half-of/on-be-half-of-reject/on-be-half-of-reject.component';
import { OnBeHalfOfCancelComponent } from './on-be-half-of/on-be-half-of-cancel/on-be-half-of-cancel.component';
import { OnBeHalfOfApprovalComponent } from './on-be-half-of/on-be-half-of-approval/on-be-half-of-approval.component';
import { OnBeHalfOfWaitingForApprovalComponent } from './on-be-half-of/on-be-half-of-waiting-for-approval/on-be-half-of-waiting-for-approval.component';
import { OnBeHalfOfComponent } from './on-be-half-of/on-be-half-of.component';
import { OnBehalfOfRemoteloginComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin.component';
import { OnBehalfOfRemoteloginWaitingForApprovalComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin-waiting-for-approval/on-behalf-of-remotelogin-waiting-for-approval.component';
import { OnBehalfOfRemoteloginApprovedComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin-approved/on-behalf-of-remotelogin-approved.component';
import { OnBehalfOfRemoteloginProcessedComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin-processed/on-behalf-of-remotelogin-processed.component';
import { OnBehalfOfRemoteloginRejectedComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin-rejected/on-behalf-of-remotelogin-rejected.component';
import { OnBehalfOfRemoteloginCancellationComponent } from './on-behalf-of-remotelogin/on-behalf-of-remotelogin-cancellation/on-behalf-of-remotelogin-cancellation.component';
import { OnBehalfOfExpensesApprovedComponent } from './on-behalf-of-expenses/on-behalf-of-expenses/on-behalf-of-expenses-approved/on-behalf-of-expenses-approved.component';
import { OnBehalfOfExpensesProcessedComponent } from './on-behalf-of-expenses/on-behalf-of-expenses/on-behalf-of-expenses-processed/on-behalf-of-expenses-processed.component';
import { OnBehalfOfExpensesRejectedComponent } from './on-behalf-of-expenses/on-behalf-of-expenses/on-behalf-of-expenses-rejected/on-behalf-of-expenses-rejected.component';
import { OnBehalfOfExpensesComponent } from './on-behalf-of-expenses/on-behalf-of-expenses/on-behalf-of-expenses.component';
import { OnBehalfOfExpensesWaitingForApprovalComponent } from './on-behalf-of-expenses/on-behalf-of-expenses/on-behalf-of-expenses-waiting-for-approval/on-behalf-of-expenses-waiting-for-approval.component';
import { AddClaimsandexpensesComponent } from '../claimsandexpenses/add-claimsandexpenses/add-claimsandexpenses.component';
export default [
    { path: '', redirectTo: '/on-behalf-of/on-behalf-of', pathMatch: 'full' },
    {
        path: 'on-behalf-of',
        component: OnBeHalfOfComponent,
        children: [
            {
                path: 'waiting-for-approval',
                component: OnBeHalfOfWaitingForApprovalComponent,
                data: { permission: 'Waiting For Approval (Regularization).view' },
            },
            { path: 'approved', component: OnBeHalfOfApprovalComponent },
            { path: 'processed', component: OnBeHalfOfProcessComponent },
            { path: 'rejected', component: OnBeHalfOfRejectComponent },
            { path: 'cancel', component: OnBeHalfOfCancelComponent },
            // { path: '', redirectTo: 'waiting-for-approval', pathMatch: 'full' },
        ],
    },

    {
        path: 'on-behalf-of-wfh', component: OnBehalfOfWfhComponent,
        children: [
            { path: 'waiting-for-approval', component: OnBehalfOfWhfWaitingForApprovalComponent, },
            { path: 'approved', component: OnBehalfOfWhfApprovedComponent },
            { path: 'processed', component: OnBehalfOfWhfProcessedComponent },
            { path: 'rejected', component: OnBehalfOfWhfRejectedComponent },
            { path: 'cancelled', component: OnBehalfOfWhfCancellationComponent }
        ],
    },

    {
        path: 'on-behalf-of-remotelogin', component: OnBehalfOfRemoteloginComponent,
        children: [
            { path: 'waiting-for-approval', component: OnBehalfOfRemoteloginWaitingForApprovalComponent, },
            { path: 'approved', component: OnBehalfOfRemoteloginApprovedComponent },
            { path: 'processed', component: OnBehalfOfRemoteloginProcessedComponent },
            { path: 'rejected', component: OnBehalfOfRemoteloginRejectedComponent },
            { path: 'cancelled', component: OnBehalfOfRemoteloginCancellationComponent }
        ],
    },
       {
        path: 'on-behalf-of-expenses', component: OnBehalfOfExpensesComponent,
        children: [
            { path: 'waiting-for-approval', component: OnBehalfOfExpensesWaitingForApprovalComponent, },
            { path: 'approved', component: OnBehalfOfExpensesApprovedComponent },
            { path: 'processed', component: OnBehalfOfExpensesProcessedComponent },
            { path: 'rejected', component: OnBehalfOfExpensesRejectedComponent },
            { path: 'add', component: AddClaimsandexpensesComponent }
        ],
    },
] as Route[];