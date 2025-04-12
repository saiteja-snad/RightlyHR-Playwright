        import { Route, } from '@angular/router';
        import { SalutationComponent } from './personal/salutation/salutation.component';
        import { Component } from '@angular/core';
        import { ShitsComponent } from './shits/shits.component';
        import { PendingshitsComponent } from './shits/pendingshits/pendingshits.component';
        import { PulishedShitsComponent } from './shits/pulished-shits/pulished-shits.component';
        import { AddShitsComponent } from './shits/add-shits/add-shits.component';
        import { ExpensesConfigurationComponent } from './expenses-configuration/expenses-configuration.component';
        import { ManagePoliciesComponent } from './manage-policies/manage-policies/manage-policies.component';
        import { ManageHolidaysComponent } from './manage-holidays/manage-holidays/manage-holidays.component';

        export default [
            { path: '', redirectTo: '/settings/employee-fields/personal/salutation', pathMatch: 'full' },
            {
                path: 'personal', children: [
                    { path: '', redirectTo: 'salutation', pathMatch: 'full' },
                    { path: 'salutation', component: SalutationComponent },
                    { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent) },
                    { path: 'maritalstatus', loadComponent: () => import('./personal/maritalstatus/maritalstatus.component').then(m => m.MaritalstatusComponent) },
                    { path: 'identitytype', loadComponent: () => import('./personal/identitytype/identitytype.component').then(m => m.IdentitytypeComponent) },
                    { path: 'relationship', loadComponent: () => import('./personal/relationship/relationship.component').then(m => m.RelationshipComponent) },
                    { path: 'visatype', loadComponent: () => import('./personal/visatype/visatype.component').then(m => m.VisatypeComponent) },

                ]
            },
            {
                path: 'job', children: [
                    { path: '', redirectTo: 'jobrole', pathMatch: 'full' },
                    { path: 'location', loadComponent: () => import('./job/location/location.component').then((m) => m.LocationComponent) },
                    { path: 'sub-location', loadComponent: () => import('./job/sub-location/sub-location.component').then((m) => m.SubLocationComponent) },
                    { path: 'termination', loadComponent: () => import('./job/termination/termination.component').then((m) => m.TerminationComponent) },
                    { path: 'Bussinesarea', loadComponent: () => import('./job/bussinesarea/bussinesarea.component').then((m) => m.BussinesareaComponent) },
                    { path: 'Department', loadComponent: () => import('./job/department/department.component').then((m) => m.DepartmentComponent) },
                    { path: 'Overtime', loadComponent: () => import('./job/overtime/overtime.component').then((m) => m.OvertimeComponent) },
                    { path: 'jobtype', loadComponent: () => import('./job/jobtype/jobtype.component').then((m) => m.JobtypeComponent) },
                    { path: 'compensation-reason', loadComponent: () => import('./job/compensation-reason/compensation-reason.component').then((m) => m.CompensationReasonComponent) },
                    { path: 'eligible-for-rehire', loadComponent: () => import('./job/eligible-for-rehire/eligible-for-rehire.component').then((m) => m.EligibleForRehireComponent) },
                    { path: 'paytype', loadComponent: () => import('./job/paytype/paytype.component').then((m) => m.PaytypeComponent) },
                    { path: 'jobrole', loadComponent: () => import('./job/jobrole/jobrole.component').then((m) => m.JobroleComponent) },
                    { path: 'probation', loadComponent: () => import('./job/probationstatus/probationstatus.component').then((m) => m.ProbationstatusComponent) },
                    { path: 'background', loadComponent: () => import('./job/backgroundcheck/backgroundcheck.component').then((m) => m.BackgroundcheckComponent) },
                    { path: 'frequency', loadComponent: () => import('./job/frequency/frequency.component').then((m) => m.FrequencyComponent) },
                    { path: 'notice', loadComponent: () => import('./job/notice/notice.component').then((m) => m.NoticeComponent) },
                    { path: 'team', loadComponent: () => import('./job/team/team.component').then((m) => m.TeamComponent) },
                ]
            },
            {
                path: 'expenes-configuartion',
                children: [
                    { path: '', redirectTo: 'expenes-configuartion', pathMatch: 'full' },
                    {
                        path: 'expenes-configuartion',
                        component: ExpensesConfigurationComponent
                    },
                    {
                        path: 'expenes-allowed-days',
                        loadComponent: () =>
                            import('./expenses-configuration/expenses-allowed-days/expenses-allowed-days.component').then(
                                (m) => m.ExpensesAllowedDaysComponent
                            )
                    }
                ]
            },
            { path: 'addshits', loadComponent: () => import('./shits/add-shits/add-shits.component').then((m) => m.AddShitsComponent) },
            {
                path: 'shits', component: ShitsComponent,
                children: [
                    { path: 'pending-for-submit', loadComponent: () => import('./shits/pendingshits/pendingshits.component').then((m) => m.PendingshitsComponent) },

                    { path: 'published-shits', loadComponent: () => import('./shits/pulished-shits/pulished-shits.component').then((m) => m.PulishedShitsComponent) },
                    { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' }
                ]
            },

            { path: 'addpolices', loadComponent: () => import('./manage-policies/add-policies/add-policies.component').then((m) => m.AddPoliciesComponent) },
            {
                path: 'policies', component: ManagePoliciesComponent,
                children: [
                    { path: 'pending-for-submit', loadComponent: () => import('./manage-policies/published-policies/published-policies.component').then((m) => m.PublishedPoliciesComponent) },

                    { path: 'published-policies', loadComponent: () => import('./manage-policies/pending-policies/pending-policies.component').then((m) => m.PendingPoliciesComponent) },
                    { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' }
                ]
            },

            { path: 'addholidays', loadComponent: () => import('./manage-holidays/add-holidays/add-holidays.component').then((m) => m.AddHolidaysComponent) },
            {
                path: 'manage-holidays', component: ManageHolidaysComponent,
                children: [
                    { path: 'pending-for-submit', loadComponent: () => import('./manage-holidays/published-holidays/published-holidays.component').then((m) => m.PublishedHolidaysComponent) },

                    { path: 'published-policies', loadComponent: () => import('./manage-holidays/pending-holidays/pending-holidays.component').then((m) => m.PendingHolidaysComponent) },
                    { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' }
                ]
            },

        ] as Route[];