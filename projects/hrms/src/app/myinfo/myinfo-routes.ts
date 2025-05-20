import { Route, } from '@angular/router';
import { BasicInfoComponent } from './personal/basic-info/basic-info.component';
import { TeamNumbersComponent } from './team-numbers/team-numbers.component';
import { OnboardingRequestComponent } from './onboarding-request/onboarding-request.component';
import { DocumentsComponent } from './documents/documents.component';
import { PermissionsGuard } from '../guards/permissions.guard';

export default [
    { path: '', redirectTo: '/myinfo/personal/basic-info', pathMatch: 'full' },
    {
        path: 'personal', children: [
            // { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
            { path: 'basic-info', component: BasicInfoComponent ,canActivate: [PermissionsGuard], data: { permission: 'My Info Basic Information.view' }},
            { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then(m => m.AddressInfoComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Address Details.view' } },
            { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then(m => m.FamilyDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Family Details.view' } },
            { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then(m => m.IdentityDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Identity Details.view' } },
            { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then(m => m.EducationDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Education Details.view' }},
            { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then(m => m.BankDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Bank Details.view' } },
            { path: 'visa-details', loadComponent: () => import('./personal/visa-details/visa-details.component').then(m => m.VisaDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Visa Details.view' } },
            { path: 'contact-details', loadComponent: () => import('./personal/contact-details/contact-details.component').then(m => m.ContactDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Contact Details.view' }},
            { path: 'emergency-contact-details', loadComponent: () => import('./personal/emergency-contact-details/emergency-contact-details.component').then(m => m.EmergencyContactDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Emergency Contact Details.view' }}
        ]
    },

    {
        path: 'job', children: [
            // { path: '', redirectTo: 'pre-onboarding-details', pathMatch: 'full' },
            { path: 'pre-onboarding-details', loadComponent: () => import('./job/pre-onboaring-details/pre-onboaring-details.component').then((m) => m.PreOnboaringDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Pre-Onboarding Details.view' } },
            { path: 'onboarding-details', loadComponent: () => import('./job/onboarding-details/onboarding-details.component').then((m) => m.OnboardingDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Onboarding Details.view' } },
            { path: 'employmentType', loadComponent: () => import('./job/offboarding-details/offboarding-details.component').then((m) => m.OffboardingDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Offboarding Details.view' } },
            { path: 'desk-details', loadComponent: () => import('./job/desk/desk.component').then((m) => m.DeskComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Desk Details.view' } },
            { path: 'assets-details', loadComponent: () => import('./job/assets/assets.component').then((m) => m.AssetsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Asset Details.view' }},
            { path: 'past-experiences', loadComponent: () => import('./job/previous-experince/previous-experince.component').then((m) => m.PreviousExperinceComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Previous Experience Details.view' } },
            { path: 'certifications', loadComponent: () => import('./job/certification/certification.component').then((m) => m.CertificationComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Certification Details.view' }},
            { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Job Details.view' }},
            { path: 'compensation-details', loadComponent: () => import('./job/compensation/compensation.component').then((m) => m.CompensationComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Compensation Details.view' } },
            { path: 'no-due-clearance-details', loadComponent: () => import('./job/nodue-details/nodue-details.component').then((m) => m.NodueDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info No Due Clearance Details.view' }},
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Probation Details.view' }},
            { path: 'separation-details', loadComponent: () => import('./job/separation-details/separation-details.component').then((m) => m.SeparationDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Separation Request Details.view' } },
        ]
    },
    {
        path: 'team-members', component: TeamNumbersComponent,canActivate: [PermissionsGuard], data: { permission: 'My Info Reporting Managers Tab.view' }
    },
    // {
    //     path: 'team',
    //     children: [
    //       ///  { path: '', redirectTo: 'team-members', pathMatch: 'full' },
    //         { path: 'team-members', loadComponent: () => import('./team-numbers/team-numbers.component').then((m) => m.TeamNumbersComponent) ,canActivate: [PermissionsGuard], data: { permission: 'My Info Team Managers Tab.view' }},
    //         {
    //             path: 'team-manger-members', loadComponent: () => import('./team-numbers/team-manger-member/team-manger-member.component').then((m) => m.TeamMangerMemberComponent),canActivate: [PermissionsGuard], data: { permission: 'My Info Team Managers Tab.view' },
    //         }
    //     ]
    // },
    {
        path: 'onboarding-request', component: OnboardingRequestComponent,canActivate: [PermissionsGuard], data: { permission: 'My Info Onboard Request Tab.view' }
    },
    { path: 'documents', component: DocumentsComponent,canActivate: [PermissionsGuard], data: { permission: 'My Info Documents Tab.view' } },


] as Route[];
