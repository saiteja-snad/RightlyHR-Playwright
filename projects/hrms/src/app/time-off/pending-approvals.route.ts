import { Route } from '@angular/router';
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
import { RegularizationRequestComponent } from './pending-approvals/regularization-request/regularization-request.component';
import { RegularizationForYouRequestComponent } from './pending-approvals/regularization-for-you-request/regularization-for-you-request.component';
import { RegularizationForYourRoleRequestComponent } from './pending-approvals/regularization-for-your-role-request/regularization-for-your-role-request.component';
import { DeskApprovalRequestComponent } from './pending-approvals/desk-approval-request/desk-approval-request.component';
import { DeskForYouRequestComponent } from './pending-approvals/desk-for-you-request/desk-for-you-request.component';
import { DeskForYourRoleRequestComponent } from './pending-approvals/desk-for-your-role-request/desk-for-your-role-request.component';
import { RemoteLoginRequestComponent } from './pending-approvals/remote-login-request/remote-login-request.component';
import { RemoteLoginForYouRequestComponent } from './pending-approvals/remote-login-request/remote-login-for-you-request/remote-login-for-you-request.component';
import { RemoteLoginForRoleRequestComponent } from './pending-approvals/remote-login-request/remote-login-for-role-request/remote-login-for-role-request.component';
import { TimeSheetApprovalsComponent } from './pending-approvals/time-sheet-approvals/time-sheet-approvals.component';
import { ContractConversionForYourRoleComponent } from './pending-approvals/contract-conversion/contract-conversion-for-your-role/contract-conversion-for-your-role.component';
import { ContractConversionForYouComponent } from './pending-approvals/contract-conversion/contract-conversion-for-you/contract-conversion-for-you.component';
import { ContractConversionComponent } from './pending-approvals/contract-conversion/contract-conversion.component';
import { ContractorsComponent } from './pending-approvals/contractors/contractors.component';
import { ContractForYouComponent } from './pending-approvals/contractors/contract-for-you/contract-for-you.component';
import { ContractForYourRoleComponent } from './pending-approvals/contractors/contract-for-your-role/contract-for-your-role.component';
import { ExtraHoursRequestComponent } from './pending-approvals/extra-hours-request/extra-hours-request.component';
import { ExtraHoursForYouComponent } from './pending-approvals/extra-hours-for-you/extra-hours-for-you.component';
import { ExtraHoursForYourRoleComponent } from './pending-approvals/extra-hours-for-your-role/extra-hours-for-your-role.component';
import { EmployeeinfoRequestComponent } from './pending-approvals/employee-info/employeeinfo-request/employeeinfo-request.component';
import { EmployeeinfoForYouRequestComponent } from './pending-approvals/employee-info/employeeinfo-for-you-request/employeeinfo-for-you-request.component';
import { EmployeeinfoForYourRoleRequestComponent } from './pending-approvals/employee-info/employeeinfo-for-your-role-request/employeeinfo-for-your-role-request.component';
import { KraKpiApprovalsComponent } from './pending-approvals/kra-kpi-approvals/kra-kpi-approvals.component';

export default [
    // Leaves
    {
        path: 'time-off',
        children: [
            {
                path: 'leaves', component: TimeOffRequestComponent,
                children: [
                    { path: 'for-you', component: TimeOffForYouRequestComponent, data: { permission: 'For You (Time Off).view' } },
                    { path: 'for-your-role', component: TimeOffForYourRoleRequestComponent, data: { permission: 'For Role (Time Off).view' } },
                ],
            },
            // WFH
            {
                path: 'wfh', component: WfhRequestComponent,
                children: [
                    { path: 'for-you', component: WfhForYouRequsetComponent, data: { permission: 'For You (WFH).view' } },
                    { path: 'for-your-role', component: WfhForYourRoleRequsetComponent, data: { permission: 'For Role (WFH).view' } },
                ],
            },
            // Remote
            {
                path: 'remote', component: RemoteLoginRequestComponent,
                children: [
                    { path: 'for-you', component: RemoteLoginForYouRequestComponent, data: { permission: 'For You (Remote Login).view' } },
                    { path: 'for-your-role', component: RemoteLoginForRoleRequestComponent, data: { permission: 'For Role (Remote Login).view' } },
                ],
            },
            // Comp Off
            {
                path: 'comp-off', component: CompOffRequestComponent,
                children: [
                    { path: 'for-you', component: CompoffForYouRequestComponent, data: { permission: 'For You (Comp Off).view' } },
                    { path: 'for-your-role', component: CompoffForYourRoleRequestComponent, data: { permission: 'For Role (Comp Off).view' }, },
                ],
            },
            // permissions
            {
                path: 'permissions', component: PremissionRequestComponent,
                children: [
                    { path: 'for-you', component: PremissionForYouRequestComponent, data: { permission: 'For You (Permission).view' } },
                    { path: 'for-your-role', component: PremissionForYourRoleRequestComponent, data: { permission: 'For Role (Permission).view' } },
                ],
            },
            // Regularization
            {
                path: 'regularization-request', component: RegularizationRequestComponent,
                children: [
                    { path: 'for-you', component: RegularizationForYouRequestComponent, data: { permission: 'For You (Regularization).view' } },
                    { path: 'for-your-role', component: RegularizationForYourRoleRequestComponent, data: { permission: 'For Role (Regularization).view' } },
                ],
            },
            // Extra-Hrs-Request
            {
                path: 'extra-hours-request', component: ExtraHoursRequestComponent,
                children: [
                    { path: 'for-you', component: ExtraHoursForYouComponent, data: { permission: 'For You (Extra Hours).view' } },
                    { path: 'for-your-role', component: ExtraHoursForYourRoleComponent, data: { permission: 'For Role (Extra Hours).view' } },
                ],
            },
        ],
    },
    // Claims and Expenses
    {
        path: 'claimsandexpenses-request', component: ClaimsandexpensesRequestComponent,
        children: [
            { path: 'for-you', component: ClaimsandexpensesForYouRequestComponent, data: { permission: 'For You (Claims and Expenses).view' } },
            { path: 'for-your-role', component: ClaimsandexpensesForYourRoleRequestComponent, data: { permission: 'For Role (Claims and Expenses).view' } },
        ],
    },
    // Contractors
    {
        path: 'contractors',
        children: [
            {
                path: 'request', component: ContractorsComponent,
                children: [
                    { path: 'for-you', component: ContractForYouComponent, data: { permission: 'For You (Contractors).view' } },
                    { path: 'for-your-role', component: ContractForYourRoleComponent, data: { permission: 'For Role (Contractors).view' } },
                ],
            },
            {
                path: 'conversion',
                component: ContractConversionComponent,
                children: [
                    { path: 'for-you', component: ContractConversionForYouComponent, data: { permission: 'For You (Contract-Conversion).view' } },
                    { path: 'for-your-role', component: ContractConversionForYourRoleComponent, data: { permission: 'For Role (Contract-Conversion).view' } },
                ],
            },
        ],
    },
    // Assessment Form
    { path: 'assessmentform', component: AssessmentformComponent, data: { permission: 'Probation Assessment Form.view' } },
    // Seperation
    {
        path: 'off-boarding',
        children: [
            {
                path: 'separation-request', component: SeparationRequestComponent,
                children: [
                    { path: 'separation-for-you', component: SeparationForYouRequestComponent, data: { permission: 'For You (Seperation Request)' } },
                    { path: 'separation-for-role', component: SeparationForYourRoleRequestComponent, data: { permission: 'For Role (Seperation Request)' } },
                ],
            },
            {
                path: 'recall-request', component: RecallRequestsComponent,
                children: [
                    { path: 'recall-for-you', component: RecallForYouRequestComponent, data: { permission: 'For You (Recall Requests).view' }, },
                    { path: 'recall-for-role', component: RecallForYourRoleRequestComponent, data: { permission: 'For Role (Recall Requests).view' }, },
                ],
            },
            { path: 'nodue-request', component: NodueApprovalDetailsComponent, data: { permission: 'No Due Clearance Request.view' }, },
        ]
    },
    // Desk
    {
        path: 'desk-approval', component: DeskApprovalRequestComponent,
        children: [
            { path: 'for-you', component: DeskForYouRequestComponent, data: { permission: 'For You (Desk Requests).view' } },
            { path: 'for-your-role', component: DeskForYourRoleRequestComponent, data: { permission: 'For Role (Desk Requests).view' } },
        ],
    },
    // onboarding
    {
        path: 'on-boarding',
        children: [
            // probation
            { path: 'probation-request', component: ProbationPendingApprovalsComponent, data: { permission: 'Probation Details.view' } },
            // Trainee
            { path: 'trainee-approvals', component: TraineeApprovalsComponent, data: { permission: 'Trainee Details.view' } },
        ]
    },
    { path: 'time-sheets', component: TimeSheetApprovalsComponent, data: { permission: 'Time Sheet approval Tab.view' } },
    { path: 'kra-kpi', component: KraKpiApprovalsComponent, data: { permission: 'KRA KPI approval Tab.view' } },
    {
        path: 'employeeinfo-request',
        component: EmployeeinfoRequestComponent,
        children: [
          {
            path: 'for-you',
            component: EmployeeinfoForYouRequestComponent,
           data: { permission: 'For You (Employee Info).view' },
          },
          {
            path: 'for-your-role',
            component: EmployeeinfoForYourRoleRequestComponent,
            data: { permission: 'For Role (Employee Info).view' },
          },

          // { path: '', redirectTo: 'for-you', pathMatch: 'full' },
        ],
      },
] as Route[];
