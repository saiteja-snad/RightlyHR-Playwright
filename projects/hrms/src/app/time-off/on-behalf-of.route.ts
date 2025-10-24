import { Route } from '@angular/router';
import { OnBehalfOfWfhComponent } from './on-behalf-of-wfh/on-behalf-of-wfh.component';
import { OnBehalfOfWhfWaitingForApprovalComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-waiting-for-approval/on-behalf-of-wfh-waiting-for-approval.component';
import { OnBehalfOfWhfApprovedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-approved/on-behalf-of-whf-approved.component';
import { OnBehalfOfWhfProcessedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-processed/on-behalf-of-wfh-processed.component';
import { OnBehalfOfWhfRejectedComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-rejected/on-behalf-of-wfh-rejected.component';
import { OnBehalfOfWhfCancellationComponent } from './on-behalf-of-wfh/on-behalf-of-wfh-cancellation/on-behalf-of-wfh-cancellation.component';

export default [
    { path: '', redirectTo: '/on-behalf-of/on-behalf-of-wfh', pathMatch: 'full' },
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
] as Route[];