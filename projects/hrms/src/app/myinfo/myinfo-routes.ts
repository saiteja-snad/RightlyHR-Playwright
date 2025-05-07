import { Route, } from '@angular/router';
import { BasicInfoComponent } from './personal/basic-info/basic-info.component';
import { TeamNumbersComponent } from './team-numbers/team-numbers.component';
import { OnboardingRequestComponent } from './onboarding-request/onboarding-request.component';
import { DocumentsComponent } from './documents/documents.component';
import { PermissionGuard } from '../guards/permission.guard';

export default [
    // { path: '', redirectTo: '/myinfo/personal/basic-info', pathMatch: 'full' },
    {
        path: 'personal', children: [
            // { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
            { path: 'basic-info', component: BasicInfoComponent, canActivate:[PermissionGuard], data: {permission: 'My Info Basic Information.view',route : 'myinfo/personal/basic-info'}}, // Add your guards here
            { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then(m => m.AddressInfoComponent),canActivate:[PermissionGuard], data: {permission: 'My Info Address Details.view',route : '/myinfo/personal/address-info'} },
            { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then(m => m.FamilyDetailsComponent), data: {permission: 'My Info Family Details.view',route : '/myinfo/personal/family-details'} },
            { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then(m => m.IdentityDetailsComponent), data: {permission: 'My Info Identity Details.view',route : '/myinfo/personal/identity-details'} },
            { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then(m => m.EducationDetailsComponent), data: {permission: 'My Info Education Details.view',route : '/myinfo/personal/education-details'} },
            { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then(m => m.BankDetailsComponent), data: {permission: 'My Info Bank Details.view',route : '/myinfo/personal/bank-details'} },
            { path: 'visa-details', loadComponent: () => import('./personal/visa-details/visa-details.component').then(m => m.VisaDetailsComponent), data: {permission: 'My Info Visa Details.view',route : '/myinfo/personal/visa-details'} },
            { path: 'contact-details', loadComponent: () => import('./personal/contact-details/contact-details.component').then(m => m.ContactDetailsComponent), data: {permission: 'My Info Contact Details.view',route : '/myinfo/personal/contact-details'} },
            { path: 'emergency-contact-details', loadComponent: () => import('./personal/emergency-contact-details/emergency-contact-details.component').then(m => m.EmergencyContactDetailsComponent), data: {permission: 'My Info Emergency Contact Details.view',route : '/myinfo/personal/emergency-contact-details'} }
        ]
    },

    {
        path: 'job', children: [
            { path: '', redirectTo: 'pre-onboarding-details', pathMatch: 'full' },
            { path: 'pre-onboarding-details', loadComponent: () => import('./job/pre-onboaring-details/pre-onboaring-details.component').then((m) => m.PreOnboaringDetailsComponent) },
            { path: 'onboarding-details', loadComponent: () => import('./job/onboarding-details/onboarding-details.component').then((m) => m.OnboardingDetailsComponent) },
            { path: 'employmentType', loadComponent: () => import('./job/offboarding-details/offboarding-details.component').then((m) => m.OffboardingDetailsComponent) },
            { path: 'desk-details', loadComponent: () => import('./job/desk/desk.component').then((m) => m.DeskComponent) },
            { path: 'assets-details', loadComponent: () => import('./job/assets/assets.component').then((m) => m.AssetsComponent) },
            { path: 'past-experiences', loadComponent: () => import('./job/previous-experince/previous-experince.component').then((m) => m.PreviousExperinceComponent) },
            { path: 'certifications', loadComponent: () => import('./job/certification/certification.component').then((m) => m.CertificationComponent) },
            { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent) },
            { path: 'compensation-details', loadComponent: () => import('./job/compensation/compensation.component').then((m) => m.CompensationComponent) },
            { path: 'no-due-clearance-details', loadComponent: () => import('./job/nodue-details/nodue-details.component').then((m) => m.NodueDetailsComponent) },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent) },
            { path: 'separation-details', loadComponent: () => import('./job/separation-details/separation-details.component').then((m) => m.SeparationDetailsComponent) },
        ]
    },
    {
        path: 'team-members', component: TeamNumbersComponent
    },
    {
        path: 'onboarding-request', component: OnboardingRequestComponent
    },
    { path: 'documents', component: DocumentsComponent },


] as Route[];
