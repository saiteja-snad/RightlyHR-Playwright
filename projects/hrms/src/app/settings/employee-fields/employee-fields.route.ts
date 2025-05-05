import { Route, } from '@angular/router';
import { SettingsPersonalTabsComponent } from '../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component';
import { SettingsJobTabsComponent } from '../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component';
import { SettingsEmployeeFieldsModuleTabsComponent } from '../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component';
import { SettingsManageShitsTabsComponent } from '../../shared/settings-tabs/settings-manage-shits-tabs/settings-manage-shits-tabs.component';


export default [
    { path: '', redirectTo: 'personal', pathMatch: 'full' },
    {
        path: 'personal', children: [
            { path: '', redirectTo: 'salutation', pathMatch: 'full' },
            { path: 'salutation', loadComponent: () => import('./personal/salutation/salutation.component').then(m => m.SalutationComponent) },
            { path: 'gender', loadComponent: () => import('./personal/gender/gender.component').then(m => m.GenderComponent) },
            { path: 'maritalstatus', loadComponent: () => import('./personal/maritalstatus/maritalstatus.component').then(m => m.MaritalstatusComponent) },
            { path: 'identitytype', loadComponent: () => import('./personal/identitytype/identitytype.component').then(m => m.IdentitytypeComponent) },
            { path: 'relationship', loadComponent: () => import('./personal/relationship/relationship.component').then(m => m.RelationshipComponent) },
            { path: 'visatype', loadComponent: () => import('./personal/visatype/visatype.component').then(m => m.VisatypeComponent) },
            { path: 'status', loadComponent: () => import('./personal/status/status.component').then(m => m.StatusComponent) },
            { path: 'bank-name', loadComponent: () => import("./personal/bank-name/bank-name.component").then(m => m.BankNameComponent) },
            { path: 'degree', loadComponent: () => import("./personal/degree/degree.component").then((m) => m.DegreeComponent) }
        ]
    },
    {
        path: 'job', children: [
            { path: '', redirectTo : 'jobrole', pathMatch: 'full' },
            { path: 'location', loadComponent: () => import('./job/location/location.component').then((m) => m.LocationComponent) },
            { path: 'sub-location', loadComponent: () => import('./job/sub-location/sub-location.component').then((m) => m.SubLocationComponent) },
            { path: 'termination', loadComponent: () => import('./job/termination/termination.component').then((m) => m.TerminationComponent) },
            { path: 'bussinesarea', loadComponent: () => import('./job/bussinesarea/bussinesarea.component').then((m) => m.BussinesareaComponent) },
            { path: 'department', loadComponent: () => import('./job/department/department.component').then((m) => m.DepartmentComponent) },
            { path: 'overtime', loadComponent: () => import('./job/overtime/overtime.component').then((m) => m.OvertimeComponent) },
            { path: 'jobtype', loadComponent: () => import('./job/jobtype/jobtype.component').then((m) => m.JobtypeComponent) },
            { path: 'compensation-reason', loadComponent: () => import('./job/compensation-reason/compensation-reason.component').then((m) => m.CompensationReasonComponent) },
            { path: 'eligible-for-rehire', loadComponent: () => import('./job/eligible-for-rehire/eligible-for-rehire.component').then((m) => m.EligibleForRehireComponent) },
            { path: 'paytype', loadComponent: () => import('./job/paytype/paytype.component').then((m) => m.PaytypeComponent) },
            { path: 'jobrole', loadComponent: () => import('./job/jobrole/jobrole.component').then((m) => m.JobroleComponent) },
            { path: 'probationstatus', loadComponent: () => import('./job/probationstatus/probationstatus.component').then((m) => m.ProbationstatusComponent) },
            { path: 'backgroundcheck', loadComponent: () => import('./job/backgroundcheck/backgroundcheck.component').then((m) => m.BackgroundcheckComponent) },
            { path: 'frequency', loadComponent: () => import('./job/frequency/frequency.component').then((m) => m.FrequencyComponent) },
            { path: 'notice', loadComponent: () => import('./job/notice/notice.component').then((m) => m.NoticeComponent) },
            { path: 'grade', loadComponent: () => import('./job/grade/grade.component').then((m) => m.GradeComponent) },
            { path: 'serving-period', loadComponent: () => import('./job/serving-period/serving-period.component').then((m) => m.ServingPeriodComponent) },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent) },
            { path: 'interview-round', loadComponent: () => import('./job/interview-round/interview-round.component').then((m) => m.InterviewRoundComponent) },
            { path: 'team', loadComponent: () => import('./job/team/team.component').then((m) => m.TeamComponent) },
            { path: 'pre-on-boarding-documents', loadComponent: () => import('./job/pre-on-boarding-documents/pre-on-boarding-documents.component').then((m) => m.PreOnBoardingDocumentsComponent) }
        ]
    },
    { path: 'documents', loadComponent: () => import('./documents-creation/documents-creation.component').then((m) => m.DocumentsCreationComponent) },
    {
        path: 'expenes',
        children: [
            { path: '', redirectTo: 'configuartion', pathMatch: 'full' },
            { path: 'configuartion', loadComponent: () => import('./expenses-configuration/expenses-configuration.component').then((m) => m.ExpensesConfigurationComponent) },
            { path: 'allowed-days', loadComponent: () => import('./expenses-configuration/expenses-allowed-days/expenses-allowed-days.component').then((m) => m.ExpensesAllowedDaysComponent) }
        ]
    },
    {
        path: 'manage-shifts',
        children: [
            { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-shifts/pending-shifts/pending-shifts.component').then((m) => m.PendingShiftsComponent) },
            { path: 'published-shifts', loadComponent: () => import('./manage-shifts/published-shifts/published-shifts.component').then((m) => m.PublishedShiftsComponent) },
        ]
    },
    { path: 'addshifts', loadComponent: () => import('./manage-shifts/add-shift/add-shift.component').then((m) => m.AddShiftComponent) },
    { path: 'updateshifts/:id', loadComponent: () => import('./manage-shifts/update-shift/update-shift.component').then((m) => m.UpdateShiftComponent) },
    { path: 'cloneshifts/:id', loadComponent: () => import('./manage-shifts/clone-shift/clone-shift.component').then((m) => m.CloneShiftComponent) },
    { path: 'viewshifts/:id', loadComponent: () => import('./manage-shifts/view-shift/view-shift.component').then((m) => m.ViewShiftComponent) },
    { path: 'addpolices', loadComponent: () => import('./manage-policies/add-policies/add-policies.component').then((m) => m.AddPoliciesComponent) },
    { path: 'updatepolices', loadComponent: () => import('./manage-policies/update-policies/update-policies.component').then((m) => m.UpdatePoliciesComponent) },
    { path: 'clonepolices/:id', loadComponent: () => import('./manage-policies/clone-policies/clone-policies.component').then((m) => m.ClonePoliciesComponent) },
    { path: 'viewpolices', loadComponent: () => import('./manage-policies/view-policies/view-policies.component').then((m) => m.ViewPoliciesComponent) },
    {
        path: 'manage-policies',
        children: [
            { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-policies/pending-policies/pending-policies.component').then((m) => m.PendingPoliciesComponent) },
            { path: 'published-policies', loadComponent: () => import('./manage-policies/published-policies/published-policies.component').then((m) => m.PublishedPoliciesComponent) }
        ]
    },
    { path: 'addholidays', loadComponent: () => import('./manage-holidays/add-holidays/add-holidays.component').then((m) => m.AddHolidaysComponent) },
    { path: 'updateholidays', loadComponent: () => import('./manage-holidays/update-holidays/update-holidays.component').then((m) => m.UpdateHolidaysComponent) },
    { path: 'cloneholidays', loadComponent: () => import('./manage-holidays/clone-holidays/clone-holidays.component').then((m) => m.CloneHolidaysComponent) },
    { path: 'viewholidays', loadComponent: () => import('./manage-holidays/view-holidays/view-holidays.component').then((m) => m.ViewHolidaysComponent) },
    {
        path: 'manage-holidays',
        children: [
            { path: '', redirectTo: 'pending-for-submit', pathMatch: 'full' },
            { path: 'pending-for-submit', loadComponent: () => import('./manage-holidays/pending-holidays/pending-holidays.component').then((m) => m.PendingHolidaysComponent) },
            { path: 'published-holidays', loadComponent: () => import('./manage-holidays/published-holidays/published-holidays.component').then((m) => m.PublishedHolidaysComponent) },
        ]
    },
    { path: 'no-due-clearnce', loadComponent: () => import('./no-due-clearance-configurations/no-due-clearance-configurations.component').then((m) => m.NoDueClearanceConfigurationsComponent) },
    {
        path: 'manage-weekends',
        children: [
            { path: '', redirectTo: 'pending-for-submission', pathMatch: 'full' },
            { path: 'pending-for-submission', loadComponent: () => import('./manage-weekends/pending-weekends/pending-weekends.component').then((m) => m.PendingWeekendsComponent) },
            { path: 'published-weekends', loadComponent: () => import('./manage-weekends/published-weekends/published-weekends.component').then((m) => m.PublishedWeekendsComponent) },
        ]
    },
    { path: 'add-weekends', loadComponent: () => import('./manage-weekends/add-weekend/add-weekend.component').then((m) => m.AddWeekendComponent) },
    { path: 'update-weekends', loadComponent: () => import('./manage-weekends/update-weekends/update-weekends.component').then((m) => m.UpdateWeekendsComponent) },
    { path: 'clone-weekends', loadComponent: () => import('./manage-weekends/clone-weekends/clone-weekends.component').then((m) => m.CloneWeekendsComponent) },
    { path: 'view-weekends', loadComponent: () => import('./manage-weekends/view-weekends/view-weekends.component').then((m) => m.ViewWeekendsComponent) },
    {
        path: 'manage-dsts',
        children: [
            { path: '', redirectTo: 'pending-for-submission', pathMatch: 'full' },
            { path: 'pending-for-submission', loadComponent: () => import('./manage-dsts/pending-dsts/pending-dsts.component').then((m) => m.PendingDstsComponent) },
            { path: 'published-dsts', loadComponent: () => import('./manage-dsts/published-dsts/published-dsts.component').then((m) => m.PublishedDstsComponent) },
        ]
    },
    { path: 'add-dst', loadComponent: () => import('./manage-dsts/add-dst/add-dst.component').then((m) => m.AddDstComponent) },
    { path: 'update-dst', loadComponent: () => import('./manage-dsts/update-dst/update-dst.component').then((m) => m.UpdateDstComponent) },
    { path: 'clone-dst', loadComponent: () => import('./manage-dsts/clone-dst/clone-dst.component').then((m) => m.CloneDstComponent) },
    { path: 'view-dst', loadComponent: () => import('./manage-dsts/view-dst/view-dst.component').then((m) => m.ViewDstComponent) },
] as Route[];