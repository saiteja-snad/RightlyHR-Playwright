import { Route, } from '@angular/router';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PolicyAcknowledgementReportComponent } from './policy-reports/policy-acknowledgement-report/policy-acknowledgement-report.component';

export default [
    // { path: '', redirectTo: '/reports/standard-reports', pathMatch: 'full' },
    {
        path: 'standard-reports', children: [
            // { path: '', redirectTo: 'employee-data', pathMatch: 'full' },
            { path: 'employee-data', loadComponent: () => import('./standard-reports/employee-master-data/employee-master-data.component').then(m => m.EmployeeMasterDataComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Master Data.view' } },
            { path: 'job-data', loadComponent: () => import('./standard-reports/job-location-wise-data/job-location-wise-data.component').then(m => m.JobLocationWiseDataComponent), canActivate: [PermissionsGuard], data: { permission: 'Job Location Wise Data.view' } },
            { path: 'branch-data', loadComponent: () => import('./standard-reports/branch-location-wise-data/branch-location-wise-data.component').then(m => m.BranchLocationWiseDataComponent), canActivate: [PermissionsGuard], data: { permission: 'Branch Location Wise Data.view' } },
            { path: 'family-data', loadComponent: () => import('./standard-reports/family-members-data/family-members-data.component').then(m => m.FamilyMembersDataComponent), canActivate: [PermissionsGuard], data: { permission: 'Family Members Data.view' } },
        ]
    },
    { path: 'custom-reports', loadComponent: () => import('./custom-reports/custom-reports.component').then((m) => m.CustomReportsComponent), canActivate: [PermissionsGuard], data: { permission: 'Custom Reports.view' } },
    {
        path: 'attendence-reports', children: [
        //    { path: '',redirectTo: 'leave-report', pathMatch: 'full' },
           { path: 'leave-report', loadComponent: () => import('./attendence-reports/leave-report/leave-report.component').then((m) => m.LeaveReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Leave Report.view' } },
           { path: 'leave-summary-report', loadComponent: () => import('./attendence-reports/leave-summary-report/leave-summary-report.component').then((m) => m.LeaveSummaryReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Leave Summary Report.view' } },
           { path: 'compoff-report', loadComponent: () => import('./attendence-reports/compoff-report/compoff-report.component').then((m) => m.CompoffReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Comp Off Report.view' } },
           { path: 'wfh-report', loadComponent: () => import('./attendence-reports/wfh-report/wfh-report.component').then((m) => m.WfhReportComponent), canActivate: [PermissionsGuard], data: { permission: 'WFH Report.view' } },
           { path: 'absent-report', loadComponent: () => import('./attendence-reports/absent-report/absent-report.component').then((m) => m.AbsentReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Absent Report.view' } },
           { path: 'inactive-employee-report', loadComponent: () => import('./attendence-reports/inactive-employee-report/inactive-employee-report.component').then((m) => m.InactiveEmployeeReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Inactive Empolyee Report.view' } },
           { path: 'yearly-summary-report', loadComponent: () => import('./attendence-reports/yearly-summary-report/yearly-summary-report.component').then((m) => m.YearlySummaryReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Yearly Summary Report.view' } },
           { path: 'permission-report', loadComponent: () => import('./attendence-reports/permission-reports/permission-reports.component').then((m) => m.PermissionReportsComponent), canActivate: [PermissionsGuard], data: { permission: 'Permission Report.view' } },
           { path: 'regularization-report', loadComponent: () => import('./attendence-reports/regularization-reports/regularization-reports.component').then((m) => m.RegularizationReportsComponent), canActivate: [PermissionsGuard], data: { permission: 'Regularization Report.view' } },
        ]
    },
    { path: 'monthly-attandance-reports', loadComponent: () => import('./monthly-attandance-report/monthly-attandance-report.component').then((m) => m.MonthlyAttandanceReportComponent), canActivate: [PermissionsGuard], data: { permission: 'Monthly Attendance Reports.view' } },
    {
        path: 'policy-reports', children:[
            {path: 'policy-acknowledgment-report', component : PolicyAcknowledgementReportComponent}
        ]
    },
] as Route[];