import { Route, } from '@angular/router';
import { BasicInfoComponent } from './personal/basic-info/basic-info.component';
import { DocumentsComponent } from './documents/documents.component';

export default [
    // { path: '', redirectTo: '/personalinfo/personal/basic-info', pathMatch: 'full' },
    {
        path: 'personal', children: [
            // { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
            { path: 'basic-info', component: BasicInfoComponent, },
            { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then(m => m.AddressInfoComponent), },
            { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then(m => m.FamilyDetailsComponent), },
            { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then(m => m.IdentityDetailsComponent), },
            { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then(m => m.EducationDetailsComponent), },
            { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then(m => m.BankDetailsComponent), },
            { path: 'visa-details', loadComponent: () => import('./personal/visa-details/visa-details.component').then(m => m.VisaDetailsComponent), },
            { path: 'contact-details', loadComponent: () => import('./personal/contact-details/contact-details.component').then(m => m.ContactDetailsComponent), },
            { path: 'emergency-contact-details', loadComponent: () => import('./personal/emergency-contact-details/emergency-contact-details.component').then(m => m.EmergencyContactDetailsComponent), },
        ]
    },
    {
        path: 'job', children: [
            // { path: '', redirectTo: 'pre-onboarding-details', pathMatch: 'full' },
            { path: 'pre-onboarding-details', loadComponent: () => import('./job/pre-onboaring-details/pre-onboaring-details.component').then((m) => m.PreOnboaringDetailsComponent), data: { permission: 'Employee Info Pre-Onboarding Details.view' } },
            { path: 'onboarding-details', loadComponent: () => import('./job/onboarding-details/onboarding-details.component').then((m) => m.OnboardingDetailsComponent), data: { permission: 'Employee Info Onboarding Details.view' } },
            { path: 'employmentType', loadComponent: () => import('./job/offboarding-details/offboarding-details.component').then((m) => m.OffboardingDetailsComponent), data: { permission: 'Employee Info Offboarding Details.view' } },
            { path: 'desk-details', loadComponent: () => import('./job/desk/desk.component').then((m) => m.DeskComponent), data: { permission: 'Employee Info Desk Details.view' } },
            { path: 'assets-details', loadComponent: () => import('./job/assets/assets.component').then((m) => m.AssetsComponent), data: { permission: 'Employee Info Asset Details.view' } },
            { path: 'past-experiences', loadComponent: () => import('./job/previous-experince/previous-experince.component').then((m) => m.PreviousExperinceComponent), data: { permission: 'Employee Info Previous Experience Details.view' } },
            { path: 'certifications', loadComponent: () => import('./job/certification/certification.component').then((m) => m.CertificationComponent), data: { permission: 'Employee Info Certification Details.view' } },
            { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent), data: { permission: 'Employee Info Job Details.view' } },
            { path: 'compensation-details', loadComponent: () => import('./job/compensation/compensation.component').then((m) => m.CompensationComponent), data: { permission: 'Employee Info Compensation Details.view' } },
            { path: 'no-due-clearance-details', loadComponent: () => import('./job/no-due-clearance/no-due-clearance.component').then((m) => m.NoDueClearanceComponent), data: { permission: 'Employee Info No Due Clearance Details.view' } },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent), data: { permission: 'Employee Info Probation Details.view' } },
            { path: 'separation-details', loadComponent: () => import('./job/separation-request/separation-request.component').then((m) => m.SeparationRequestComponent), data: { permission: 'Employee Info Separation Request Details.view' } },
            { path: 'employee-off-boarding', loadComponent: () => import('./job/employe-off-boarding/employe-off-boarding.component').then((m) => m.EmployeOffBoardingComponent), data: { permission: 'Employee Info Offboarding Details.view' } },
            { path: 'tranee-onboarding-requests', loadComponent: () => import('./job/onboarding-requests/onboarding-requests.component').then((m) => m.OnboardingRequestsComponent), data: { permission: 'Employee Info Onboarding Request Details.view' } },
            { path: 'team-members', loadComponent: () => import('./personal/team-members/team-members.component').then(m => m.TeamMembersComponent), },
            { path: 'onboarding-verification', loadComponent: () => import('./personal/onboarding-request/onboarding-request.component').then(m => m.OnboardingRequestComponent), },
        ]
    },
    {
        path: 'documents', component: DocumentsComponent, data: { permission: 'Employee Info Documents Tab.view' }
    },
] as Route[];