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
            { path: 'jobtype', loadComponent: () => import('./job/jobtype/jobtype.component').then((m) => m.JobtypeComponent) }
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