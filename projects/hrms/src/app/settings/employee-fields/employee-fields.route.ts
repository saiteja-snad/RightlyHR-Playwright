import { Route, } from '@angular/router';
import { SalutationComponent } from './personal/salutation/salutation.component';
import { ExpensesConfigurationComponent } from './employee-fields-layout/expenses-configuration/expenses-configuration.component';
import { Component } from '@angular/core';
import { ExpensesAllowedDaysComponent } from './employee-fields-layout/expenses-configuration/expenses-allowed-days/expenses-allowed-days.component';

export default [
    { path: '', redirectTo: '/settings/employee-fields/personal/salutation', pathMatch: 'full' },
    {
        path: 'personal', children: [
            { path: '', redirectTo: 'salutation', pathMatch: 'full' },
            { path: 'salutation', component: SalutationComponent },
            { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent) },
            { path: 'maritalstatus', loadComponent: () => import('./personal/maritalstatus/maritalstatus.component').then(m => m.MaritalstatusComponent)},
            { path: 'identitytype', loadComponent: () => import('./personal/identitytype/identitytype.component').then(m => m.IdentitytypeComponent)},
            { path: 'relationship', loadComponent: () => import('./personal/relationship/relationship.component').then(m => m.RelationshipComponent)},
            { path: 'visatype', loadComponent: () => import('./personal/visatype/visatype.component').then(m => m.VisatypeComponent)}
        ]
    },
    {
        path: 'job', children: [
            { path: '', redirectTo: 'job', pathMatch: 'full' },
            { path: 'location', loadComponent: () => import('./job/location/location.component').then((m) => m.LocationComponent) },
            { path: 'sub-location', loadComponent: () => import('./job/sub-location/sub-location.component').then((m) => m.SubLocationComponent) },
            { path: 'termination', loadComponent: () => import('./job/termination/termination.component').then((m) => m.TerminationComponent) },
            { path: 'Bussinesarea', loadComponent: () => import('./job/bussinesarea/bussinesarea.component').then((m) => m.BussinesareaComponent) },
            { path: 'Department', loadComponent: () => import('./job/department/department.component').then((m) => m.DepartmentComponent) },
            { path: 'Overtime', loadComponent: () => import('./job/overtime/overtime.component').then((m) => m.OvertimeComponent) },
            { path: 'jobtype', loadComponent: () => import('./job/jobtype/jobtype.component').then((m) => m.JobtypeComponent) },
            { path: 'compensation-reason', loadComponent: () => import('./job/compensation-reason/compensation-reason.component').then((m) => m.CompensationReasonComponent)},
            { path: 'eligible-for-rehire',loadComponent: () => import('./job/eligible-for-rehire/eligible-for-rehire.component').then((m) => m.EligibleForRehireComponent)},
            { path: 'paytype', loadComponent: () => import('./job/paytype/paytype.component').then((m) => m.PaytypeComponent)},
            { path: 'Jobrole', loadComponent: () => import('./job/jobrole/jobrole.component').then((m) => m.JobroleComponent) },
            { path: 'probation', loadComponent: () => import('./job/probationstatus/probationstatus.component').then((m) => m.ProbationstatusComponent) },
            { path: 'background', loadComponent: () => import('./job/backgroundcheck/backgroundcheck.component').then((m) => m.BackgroundcheckComponent) },
            { path: 'frequency', loadComponent: () => import('./job/frequency/frequency.component').then((m) => m.FrequencyComponent) },
            { path: 'notice', loadComponent: () => import('./job/notice/notice.component').then((m) => m.NoticeComponent) },
            { path: 'grade', loadComponent: () => import('./job/grade/grade.component').then((m) => m.GradeComponent) },
            { path: 'serving-period', loadComponent: () => import('./job/serving-period/serving-period.component').then((m) => m.ServingPeriodComponent)},
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => (m.ProbationDetailsComponent))},
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
                    import('./employee-fields-layout/expenses-configuration/expenses-allowed-days/expenses-allowed-days.component').then(
                        (m) => m.ExpensesAllowedDaysComponent
                    )
            }
        ]
    }
] as Route[];