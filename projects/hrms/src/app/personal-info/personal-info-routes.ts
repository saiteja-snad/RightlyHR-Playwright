import { Route, } from '@angular/router';
import { BasicInfoComponent } from './personal/basic-info/basic-info.component';
import { TeamNumbersComponent } from './team-numbers/team-numbers.component';
import { DocumentsComponent } from './documents/documents.component';
import { PermissionsGuard } from '../guards/permissions.guard';

export default [
    // { path: '', redirectTo: '/personalinfo/personal/basic-info', pathMatch: 'full' },
    {
        path: 'personal', children: [
            // { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
            { path: 'basic-info', component: BasicInfoComponent,},
            { path: 'address-info', loadComponent: () => import('./personal/address-info/address-info.component').then(m => m.AddressInfoComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Address Details.view' } },
            { path: 'family-details', loadComponent: () => import('./personal/family-details/family-details.component').then(m => m.FamilyDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Family Details.view' } },
            { path: 'identity-details', loadComponent: () => import('./personal/identity-details/identity-details.component').then(m => m.IdentityDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Identity Details.view' } },
            { path: 'education-details', loadComponent: () => import('./personal/education-details/education-details.component').then(m => m.EducationDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Education Details.view' } },
            { path: 'bank-details', loadComponent: () => import('./personal/bank-details/bank-details.component').then(m => m.BankDetailsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'Employee Info Bank Details.view' }},
            { path: 'visa-details', loadComponent: () => import('./personal/visa-details/visa-details.component').then(m => m.VisaDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Visa Details.view' } },
            { path: 'contact-details', loadComponent: () => import('./personal/contact-details/contact-details.component').then(m => m.ContactDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Contact Details.view' } },
            { path: 'onboarding-documents', loadComponent: () => import('./personal/onboarding-documents/onboarding-documents.component').then(m => m.OnboardingDocumentsComponent) ,canActivate: [PermissionsGuard], data: { permission: 'Employee Info onboarding-verification.view' }},
            { path: 'onboarding-verification', loadComponent: () => import('./personal/onboarding-request/onboarding-request.component').then(m => m.OnboardingRequestComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Onboarding Details.view' } },
            { path: 'emergency-contact-details', loadComponent: () => import('./personal/emergency-contact-details/emergency-contact-details.component').then(m => m.EmergencyContactDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Emergency Contact Details.view' } }
        ]
    },
    {
        path: 'job', children: [
            // { path: '', redirectTo: 'pre-onboarding-details', pathMatch: 'full' },
            { path: 'pre-onboarding-details', loadComponent: () => import('./job/pre-onboaring-details/pre-onboaring-details.component').then((m) => m.PreOnboaringDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Pre-Onboarding Details.view' } },
            { path: 'onboarding-details', loadComponent: () => import('./job/onboarding-details/onboarding-details.component').then((m) => m.OnboardingDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Onboarding Details.view' } },
            { path: 'employmentType', loadComponent: () => import('./job/offboarding-details/offboarding-details.component').then((m) => m.OffboardingDetailsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Offboarding Details.view' } },
            { path: 'desk-details', loadComponent: () => import('./job/desk/desk.component').then((m) => m.DeskComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Desk Details.view' } },
            { path: 'assets-details', loadComponent: () => import('./job/assets/assets.component').then((m) => m.AssetsComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Asset Details.view' } },
            { path: 'past-experiences', loadComponent: () => import('./job/previous-experince/previous-experince.component').then((m) => m.PreviousExperinceComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Previous Experience Details.view' } },
            { path: 'certifications', loadComponent: () => import('./job/certification/certification.component').then((m) => m.CertificationComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Certification Details.view' } },
            { path: 'job-details', loadComponent: () => import('./job/job-details/job-details.component').then((m) => m.JobDetailsComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Job Details.view' } },
            { path: 'compensation-details', loadComponent: () => import('./job/compensation/compensation.component').then((m) => m.CompensationComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Compensation Details.view' } },
            { path: 'no-due-clearance-details', loadComponent: () => import('./job/no-due-clearance/no-due-clearance.component').then((m) => m.NoDueClearanceComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info No Due Clearance Details.view' } },
            { path: 'probation-details', loadComponent: () => import('./job/probation-details/probation-details.component').then((m) => m.ProbationDetailsComponent ) ,canActivate: [PermissionsGuard], data: { permission: 'Employee Info Probation Details.view' }},
            { path: 'separation-details', loadComponent: () => import('./job/separation-request/separation-request.component').then((m) => m.SeparationRequestComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Separation Request Details.view' } },
            { path: 'employee-off-boarding', loadComponent: () => import('./job/employe-off-boarding/employe-off-boarding.component').then((m) => m.EmployeOffBoardingComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Offboarding Details.view' } },
            { path: 'onboarding-requests', loadComponent: () => import('./job/onboarding-requests/onboarding-requests.component').then((m) => m.OnboardingRequestsComponent ),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Onboarding Details.view' } },


        ]   
    },
    {
        path: 'team',
        children: [
            // { path: '', redirectTo: 'team-members', pathMatch: 'full' },
            { path: 'team-members', loadComponent: () => import('./team-numbers/team-numbers.component').then((m) => m.TeamNumbersComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Reporting Manager Tab.view' } },
            {
                path: 'team-manger-members', loadComponent: () => import('./team-numbers/team-manger-members/team-manger-members.component').then((m) => m.TeamMangerMembersComponent),canActivate: [PermissionsGuard], data: { permission: 'Employee Info Team Manager Tab.view' },
            }
        ]
    },
    {
        path:'documents', component: DocumentsComponent,canActivate: [PermissionsGuard], data: { permission: 'Employee Info Documents Tab.view' }
    },

] as Route[];

