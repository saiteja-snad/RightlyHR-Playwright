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
        path: 'attendance-report', children: [
            // { path: '', redirectTo: 'salutation', pathMatch: 'full' },
            // { path: 'salutation', loadComponent: () => import('./personal/salutation/salutation.component').then(m => m.SalutationComponent) },
            // { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent) },
            // { path: 'maritalstatus', loadComponent: () => import('./personal/maritalstatus/maritalstatus.component').then(m => m.MaritalstatusComponent) },
            // { path: 'identitytype', loadComponent: () => import('./personal/identitytype/identitytype.component').then(m => m.IdentitytypeComponent) },
        ]
    },
    { path: 'monthly-attandance-reports', loadComponent: () => import('./monthly-attandance-report/monthly-attandance-report.component').then((m) => m.MonthlyAttandanceReportComponent) },
] as Route[];