import { Route, } from '@angular/router';
import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
    {
        path: 'personal', children: [
            { path: 'basic-info', loadComponent: () => import('../employee-fields-update-configuration/Personal/basic-info/basic-info.component').then(m => m.BasicInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Basic Info.view' } },
            { path: 'contact-info', loadComponent: () => import('../employee-fields-update-configuration/Personal/contact-info/contact-info.component').then(m => m.ContactInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Contact Info.view' } },
            { path: 'addresses', loadComponent: () => import('../employee-fields-update-configuration/Personal/addresses/addresses.component').then(m => m.AddressesComponent), canActivate: [PermissionsGuard], data: { permission: 'Addresses.view' } },
            { path: 'emergency-contacts', loadComponent: () => import('../employee-fields-update-configuration/Personal/emergency-contacts/emergency-contacts.component').then(m => m.EmergencyContactsComponent), canActivate: [PermissionsGuard], data: { permission: 'Emergency Contacts.view' } },            
            { path: 'identity-info', loadComponent: () => import('../employee-fields-update-configuration/Personal/identity-info/identity-info.component').then(m => m.IdentityInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Identity Info.view' } },
            { path: 'bank-info', loadComponent: () => import('../employee-fields-update-configuration/Personal/bank-info/bank-info.component').then(m => m.BankInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Bank Info.view' } },
            { path: 'academics', loadComponent: () => import('../employee-fields-update-configuration/Personal/academics/academics.component').then(m => m.AcademicsComponent), canActivate: [PermissionsGuard], data: { permission: 'Academics.view' } },
            // { path: 'family-members', loadComponent: () => import('../employee-fields-update-configuration/Personal/family-members/family-members.component').then(m => m.FamilyMembersComponent), canActivate: [PermissionsGuard],data: { permission: 'Identity Info.view' } },
        ]
    },
    {
        path: 'job', children: [
            { path: 'certifications', loadComponent: () => import('../employee-fields-update-configuration/job/certifications/certifications.component').then(m => m.CertificationsComponent), canActivate: [PermissionsGuard], data: { permission: 'Certifications.view' } },
            { path: 'employment-history', loadComponent: () => import('../employee-fields-update-configuration/job/employment-history/employment-history.component').then(m => m.EmploymentHistoryComponent), canActivate: [PermissionsGuard], data: { permission: 'Employment History.view' } },

            // { path: 'job-info', loadComponent: () => import('../employee-fields-update-configuration/job/job-info/job-info.component').then(m => m.JobInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'assigned-tasks', loadComponent: () => import('../employee-fields-update-configuration/job/assigned-tasks/assigned-tasks.component').then(m => m.AssignedTasksComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'compensations', loadComponent: () => import('../employee-fields-update-configuration/job/compensations/compensations.component').then(m => m.CompensationsComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'contract-info', loadComponent: () => import('../employee-fields-update-configuration/job/contract-info/contract-info.component').then(m => m.ContractInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'desk-info', loadComponent: () => import('../employee-fields-update-configuration/job/desk-info/desk-info.component').then(m => m.DeskInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'no-due-clearance-info', loadComponent: () => import('../employee-fields-update-configuration/job/no-due-clearance-info/no-due-clearance-info.component').then(m => m.NoDueClearanceInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'onboarding-info', loadComponent: () => import('../employee-fields-update-configuration/job/onboarding-info/onboarding-info.component').then(m => m.OnboardingInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'pre-onboarding-info', loadComponent: () => import('../employee-fields-update-configuration/job/pre-onboarding-info/pre-onboarding-info.component').then(m => m.PreOnboardingInfoComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'separation-request', loadComponent: () => import('../employee-fields-update-configuration/job/separation-request/separation-request.component').then(m => m.SeparationRequestComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
            // { path: 'team-members', loadComponent: () => import('../employee-fields-update-configuration/job/team-members/team-members.component').then(m => m.TeamMembersComponent), canActivate: [PermissionsGuard], data: { permission: 'Salutation.view' } },
        ]
    },
] as Route[];