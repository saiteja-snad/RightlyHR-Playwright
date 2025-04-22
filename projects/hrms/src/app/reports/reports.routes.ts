import { Route, } from '@angular/router';

export default [
    { path: '', redirectTo: '/reports/standard-reports', pathMatch: 'full' },
    {
        path: 'standard-reports', children: [
            { path: '', redirectTo: 'employee-data', pathMatch: 'full' },
            { path: 'employee-data', loadComponent: () => import('./standard-reports/employee-master-data/employee-master-data.component').then(m => m.EmployeeMasterDataComponent) },
            { path: 'job-data', loadComponent: () => import('./standard-reports/job-location-wise-data/job-location-wise-data.component').then(m => m.JobLocationWiseDataComponent) },
            { path: 'branch-data', loadComponent: () => import('./standard-reports/branch-location-wise-data/branch-location-wise-data.component').then(m => m.BranchLocationWiseDataComponent) },
            { path: 'family-data', loadComponent: () => import('./standard-reports/family-members-data/family-members-data.component').then(m => m.FamilyMembersDataComponent) },
        ]
    },
    { path: 'custom-reports', loadComponent: () => import('./custom-reports/custom-reports.component').then((m) => m.CustomReportsComponent) },
    {
        path: 'attendence-reports', children: [
           { path: '',redirectTo: 'leave-report', pathMatch: 'full' },
           { path: 'leave-report', loadComponent: () => import('./attendence-reports/leave-report/leave-report.component').then((m) => m.LeaveReportComponent) },
           { path: 'leave-summary-report', loadComponent: () => import('./attendence-reports/leave-summary-report/leave-summary-report.component').then((m) => m.LeaveSummaryReportComponent) },
           { path: 'comp-off-report', loadComponent: () => import('./attendence-reports/compoff-report/compoff-report.component').then((m) => m.CompoffReportComponent) },
           { path: 'wfh-report', loadComponent: () => import('./attendence-reports/wfh-report/wfh-report.component').then((m) => m.WfhReportComponent) },
           { path: 'absent-report', loadComponent: () => import('./attendence-reports/absent-report/absent-report.component').then((m) => m.AbsentReportComponent) },
           { path: 'inactive-employee-report', loadComponent: () => import('./attendence-reports/inactive-employee-report/inactive-employee-report.component').then((m) => m.InactiveEmployeeReportComponent) },
           { path: 'yearly-summary-report', loadComponent: () => import('./attendence-reports/yearly-summary-report/yearly-summary-report.component').then((m) => m.YearlySummaryReportComponent) },
        ]
    },
    { path: 'monthly-attandance-reports', loadComponent: () => import('./monthly-attandance-report/monthly-attandance-report.component').then((m) => m.MonthlyAttandanceReportComponent) },
] as Route[];