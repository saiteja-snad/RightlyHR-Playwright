import { Route, } from '@angular/router';
import { BasicInfoComponent } from './personal/basic-info/basic-info.component';
import { TeamNumbersComponent } from './team-numbers/team-numbers.component';

export default [
    { path: '', redirectTo: '/personalinfo/personal/basic-info', pathMatch: 'full' },
    {
        path: 'personal', children: [
            { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
            { path: 'basic-info', component: BasicInfoComponent },
            { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then(m => m.AddressInfoComponent) },
            { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then(m => m.FamilyDetailsComponent) },
            { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then(m => m.IdentityDetailsComponent) },
            { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then(m => m.EducationDetailsComponent) },
            { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then(m => m.BankDetailsComponent) },
            { path: 'contact-details', loadComponent: () => import('./personal/contact-details/contact-details.component').then(m => m.ContactDetailsComponent) },
            { path: 'onboarding-documents', loadComponent: () => import('./personal/onboarding-documents/onboarding-documents.component').then(m => m.OnboardingDocumentsComponent) },
            { path: 'onboarding-verification', loadComponent: () => import('./personal/onboarding-request/onboarding-request.component').then(m => m.OnboardingRequestComponent) },
            { path: 'emergency-contact-details', loadComponent: () => import('./personal/emergency-contact-details/emergency-contact-details.component').then(m => m.EmergencyContactDetailsComponent) }
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
            { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent ) },
            { path: 'compensation-details', loadComponent: () => import('./job/compensation/compensation.component').then((m) => m.CompensationComponent ) },
            { path: 'no-due-clearance-details', loadComponent: () => import('./job/no-due-clearance/no-due-clearance.component').then((m) => m.NoDueClearanceComponent ) },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent ) },
            { path: 'separation-details', loadComponent: () => import('./job/separation-request/separation-request.component').then((m) => m.SeparationRequestComponent ) },
        ]   
    },
    {
        path:'team-members', component: TeamNumbersComponent
    },

] as Route[];


// export const myInfoRoutes: Routes = [

//     {
//         path: '', redirectTo: '/myinfo/personal/basic-info', pathMatch: 'full'
//     },
//     {
//         path: 'personal', children: [
//             { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
//             { path: 'basic-info',component:BasicInfoComponent },
//             // { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then((m) => m.AddressInfoComponent) },
//             // { path: 'emergency-contact-details', loadComponent: () => import('./personal/contact-details-info/contact-details-info.component').then((m) => m.ContactDetailsInfoComponent) },
//             // { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then((m) => m.FamilyDetailsComponent) },
//             // { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then((m) => m.IdentityDetailsComponent) },
//             // { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then((m) => m.EducationDetailsComponent) },
//             // { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then((m) => m.BankDetailsComponent) },
//             // { path: 'seperation-request', loadComponent: () => import('./personal/seperation-request/seperation-request.component').then((m) => m.SeperationRequestComponent) },
//         ]
//     },
//     // {
//     //     path: 'job', children: [
//     //         { path: '', redirectTo: 'pre-onboarding-details', pathMatch: 'full' },
//     //         { path: 'pre-onboarding-details', loadComponent: () => import('./job/pre-onboarding-details/pre-onboarding-details.component').then((m) => m.PreOnboardingDetailsComponent) },
//     //         { path: 'onboarding-details', loadComponent: () => import('./job/onboarding-details/onboarding-details.component').then((m) => m.OnboardingDetailsComponent) },
//     //         { path: 'employmentType', loadComponent: () => import('./job/employment-type/employment-type.component').then((m) => m.EmploymentTypeComponent) },
//     //         { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent) },
//     //         { path: 'assets', loadComponent: () => import('./job/assets/assets.component').then((m) => m.AssetsComponent) },
//     //         { path: 'past-experiences', loadComponent: () => import('./job/past-experience/past-experience.component').then((m) => m.PastExperienceComponent) },
//     //         { path: 'certifications', loadComponent: () => import('./job/certifications/certifications.component').then((m) => m.CertificationsComponent) },
//     //     ]
//     // },

//     // {
//     //     path: 'documents', children: [
//     //         { path: '', redirectTo: 'employee-documents', pathMatch: 'full' },
//     //         { path: 'employee-documents', loadComponent: () => import('./documents/employee-documents/employee-documents.component').then((m) => m.EmployeeDocumentsComponent) },
//     //         { path: 'organization-policy', loadComponent: () => import('./documents/organization-policy/organization-policy.component').then((m) => m.OrganizationPolicyComponent) },
//     //     ]
//     // }



// ];