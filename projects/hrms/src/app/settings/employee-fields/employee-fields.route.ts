import { Route, } from '@angular/router';
import { SettingsPersonalTabsComponent } from '../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component';
import { SettingsJobTabsComponent } from '../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component';
import { PermissionsGuard } from '../../guards/permissions.guard';


export default [
    // { path: '', redirectTo: '/settings/employee-fields/personal', pathMatch: 'full' },
    {
        path: 'personal', children: [
            // { path: '', component : SettingsPersonalTabsComponent },
            { path: 'salutation', loadComponent: () => import('./personal/salutation/salutation.component').then(m => m.SalutationComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent), canActivate: [PermissionsGuard],data: { permission: 'Gender.view' } },
            { path: 'maritalstatus', loadComponent: () => import('./personal/maritalstatus/maritalstatus.component').then(m => m.MaritalstatusComponent), canActivate: [PermissionsGuard],data: { permission: 'Marital Status.view' } },
            { path: 'identitytype', loadComponent: () => import('./personal/identitytype/identitytype.component').then(m => m.IdentitytypeComponent), canActivate: [PermissionsGuard],data: { permission: 'Identity Type.view' } },
            { path: 'relationship', loadComponent: () => import('./personal/relationship/relationship.component').then(m => m.RelationshipComponent), canActivate: [PermissionsGuard],data: { permission: 'Relationship.view' } },
            { path: 'visatype', loadComponent: () => import('./personal/visatype/visatype.component').then(m => m.VisatypeComponent), canActivate: [PermissionsGuard],data: { permission: 'Visa Type.view' } },
            { path: 'status', loadComponent: () => import('./personal/status/status.component').then(m => m.StatusComponent), canActivate: [PermissionsGuard],data: { permission: 'Status.view' } },
            { path: 'bank-name', loadComponent: () => import("./personal/bank-name/bank-name.component").then(m => m.BankNameComponent), canActivate: [PermissionsGuard],data: { permission: 'Bank Names.view' } },
            { path: 'degree', loadComponent: () => import("./personal/degree/degree.component").then((m) => m.DegreeComponent), canActivate: [PermissionsGuard],data: { permission: 'Degree.view' } }
        ]
    },
    {
        path: 'job', children: [
            // { path: '', component : SettingsJobTabsComponent },
            { path: 'location', loadComponent: () => import('./job/location/location.component').then((m) => m.LocationComponent), canActivate: [PermissionsGuard],data: { permission: 'Location.view' } },
            { path: 'sub-location', loadComponent: () => import('./job/sub-location/sub-location.component').then((m) => m.SubLocationComponent), canActivate: [PermissionsGuard],data: { permission: 'Sub Location.view' } },
            { path: 'termination', loadComponent: () => import('./job/termination/termination.component').then((m) => m.TerminationComponent), canActivate: [PermissionsGuard],data: { permission: 'Termination Reason.view' } },
            { path: 'bussinesarea', loadComponent: () => import('./job/bussinesarea/bussinesarea.component').then((m) => m.BussinesareaComponent), canActivate: [PermissionsGuard],data: { permission: 'Business Area.view' } },
            { path: 'department', loadComponent: () => import('./job/department/department.component').then((m) => m.DepartmentComponent), canActivate: [PermissionsGuard],data: { permission: 'Department.view' } },
            { path: 'overtime', loadComponent: () => import('./job/overtime/overtime.component').then((m) => m.OvertimeComponent), canActivate: [PermissionsGuard],data: { permission: 'Overtime Eligibility.view' } },
            { path: 'jobtype', loadComponent: () => import('./job/jobtype/jobtype.component').then((m) => m.JobtypeComponent), canActivate: [PermissionsGuard],data: { permission: 'Job Type.view' } },
            { path: 'compensation-reason', loadComponent: () => import('./job/compensation-reason/compensation-reason.component').then((m) => m.CompensationReasonComponent), canActivate: [PermissionsGuard],data: { permission: 'Compensation Reason.view' } },
            { path: 'eligible-for-rehire', loadComponent: () => import('./job/eligible-for-rehire/eligible-for-rehire.component').then((m) => m.EligibleForRehireComponent), canActivate: [PermissionsGuard],data: { permission: 'Eligible For Rehire.view' } },
            { path: 'paytype', loadComponent: () => import('./job/paytype/paytype.component').then((m) => m.PaytypeComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'jobrole', loadComponent: () => import('./job/jobrole/jobrole.component').then((m) => m.JobroleComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'probationstatus', loadComponent: () => import('./job/probationstatus/probationstatus.component').then((m) => m.ProbationstatusComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'backgroundcheck', loadComponent: () => import('./job/backgroundcheck/backgroundcheck.component').then((m) => m.BackgroundcheckComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'frequency', loadComponent: () => import('./job/frequency/frequency.component').then((m) => m.FrequencyComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'notice', loadComponent: () => import('./job/notice/notice.component').then((m) => m.NoticeComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'grade', loadComponent: () => import('./job/grade/grade.component').then((m) => m.GradeComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'serving-period', loadComponent: () => import('./job/serving-period/serving-period.component').then((m) => m.ServingPeriodComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'interview-round', loadComponent: () => import('./job/interview-round/interview-round.component').then((m) => m.InterviewRoundComponent) },
            { path: 'team', loadComponent: () => import('./job/team/team.component').then((m) => m.TeamComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'pre-on-boarding-documents', loadComponent: () => import('./job/pre-on-boarding-documents/pre-on-boarding-documents.component').then((m) => m.PreOnBoardingDocumentsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } }
        ]
    },
    { path: 'documents', loadComponent: () => import('./documents-creation/documents-creation.component').then((m) => m.DocumentsCreationComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    {
        path: 'expenes',
        children: [
            // { path: '', redirectTo: 'configuartion', pathMatch: 'full' },
            { path: 'configuartion', loadComponent: () => import('./expenses-configuration/expenses-configuration.component').then((m) => m.ExpensesConfigurationComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'allowed-days', loadComponent: () => import('./expenses-configuration/expenses-allowed-days/expenses-allowed-days.component').then((m) => m.ExpensesAllowedDaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } }
        ]
    },
    {
        path: 'manage-shifts',
        children: [
            // { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-shifts/pending-shifts/pending-shifts.component').then((m) => m.PendingShiftsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'published-shifts', loadComponent: () => import('./manage-shifts/published-shifts/published-shifts.component').then((m) => m.PublishedShiftsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
        ]
    },
    { path: 'addshifts', loadComponent: () => import('./manage-shifts/add-shift/add-shift.component').then((m) => m.AddShiftComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'updateshifts/:id', loadComponent: () => import('./manage-shifts/update-shift/update-shift.component').then((m) => m.UpdateShiftComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'cloneshifts/:id', loadComponent: () => import('./manage-shifts/clone-shift/clone-shift.component').then((m) => m.CloneShiftComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'viewshifts/:id', loadComponent: () => import('./manage-shifts/view-shift/view-shift.component').then((m) => m.ViewShiftComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'addpolices', loadComponent: () => import('./manage-policies/add-policies/add-policies.component').then((m) => m.AddPoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'updatepolices', loadComponent: () => import('./manage-policies/update-policies/update-policies.component').then((m) => m.UpdatePoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'clonepolices/:id', loadComponent: () => import('./manage-policies/clone-policies/clone-policies.component').then((m) => m.ClonePoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'viewpolices', loadComponent: () => import('./manage-policies/view-policies/view-policies.component').then((m) => m.ViewPoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    {
        path: 'manage-policies',
        children: [
            // { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-policies/pending-policies/pending-policies.component').then((m) => m.PendingPoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'published-policies', loadComponent: () => import('./manage-policies/published-policies/published-policies.component').then((m) => m.PublishedPoliciesComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } }
        ]
    },
    { path: 'addholidays', loadComponent: () => import('./manage-holidays/add-holidays/add-holidays.component').then((m) => m.AddHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'updateholidays', loadComponent: () => import('./manage-holidays/update-holidays/update-holidays.component').then((m) => m.UpdateHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'cloneholidays', loadComponent: () => import('./manage-holidays/clone-holidays/clone-holidays.component').then((m) => m.CloneHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'viewholidays', loadComponent: () => import('./manage-holidays/view-holidays/view-holidays.component').then((m) => m.ViewHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    {
        path: 'manage-holidays',
        children: [
            // { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-holidays/pending-holidays/pending-holidays.component').then((m) => m.PendingHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'published-holidays', loadComponent: () => import('./manage-holidays/published-holidays/published-holidays.component').then((m) => m.PublishedHolidaysComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
        ]
    },
    { path: 'no-due-clearnce', loadComponent: () => import('./no-due-clearance-configurations/no-due-clearance-configurations.component').then((m) => m.NoDueClearanceConfigurationsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    {
        path: 'manage-weekends',
        children: [
            // { path: '', redirectTo: 'pending-for-submission', pathMatch: 'full' },
            { path: 'pending-for-submission', loadComponent: () => import('./manage-weekends/pending-weekends/pending-weekends.component').then((m) => m.PendingWeekendsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'published-weekends', loadComponent: () => import('./manage-weekends/published-weekends/published-weekends.component').then((m) => m.PublishedWeekendsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
        ]
    },
    { path: 'add-weekends', loadComponent: () => import('./manage-weekends/add-weekend/add-weekend.component').then((m) => m.AddWeekendComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'update-weekends', loadComponent: () => import('./manage-weekends/update-weekends/update-weekends.component').then((m) => m.UpdateWeekendsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'clone-weekends', loadComponent: () => import('./manage-weekends/clone-weekends/clone-weekends.component').then((m) => m.CloneWeekendsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'view-weekends', loadComponent: () => import('./manage-weekends/view-weekends/view-weekends.component').then((m) => m.ViewWeekendsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    {
        path: 'manage-dsts',
        children: [
            // { path: '', redirectTo: 'pending-for-submission', pathMatch: 'full' },
            { path: 'pending-for-submission', loadComponent: () => import('./manage-dsts/pending-dsts/pending-dsts.component').then((m) => m.PendingDstsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
            { path: 'published-dsts', loadComponent: () => import('./manage-dsts/published-dsts/published-dsts.component').then((m) => m.PublishedDstsComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
        ]
    },
    { path: 'add-dst', loadComponent: () => import('./manage-dsts/add-dst/add-dst.component').then((m) => m.AddDstComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'update-dst', loadComponent: () => import('./manage-dsts/update-dst/update-dst.component').then((m) => m.UpdateDstComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'clone-dst', loadComponent: () => import('./manage-dsts/clone-dst/clone-dst.component').then((m) => m.CloneDstComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
    { path: 'view-dst', loadComponent: () => import('./manage-dsts/view-dst/view-dst.component').then((m) => m.ViewDstComponent), canActivate: [PermissionsGuard],data: { permission: 'Salutation.view' } },
] as Route[];