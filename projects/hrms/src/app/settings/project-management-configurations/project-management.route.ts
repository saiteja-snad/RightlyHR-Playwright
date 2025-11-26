import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
    { path: '', redirectTo: '/settings/project-management-config/project-type', pathMatch: 'full' },
    {
        path: 'project-type', loadComponent: () => import('./project-management/project-type/project-type.component').then(m => m.ProjectTypeComponent), canActivate: [PermissionsGuard], data: { permission: 'Project Type.view' },
    },
    {
        path: 'industry-type', loadComponent: () => import('./project-management/industry-type/industry-type.component').then(m => m.IndustryTypeComponent), canActivate: [PermissionsGuard], data: { permission: 'Industry Type.view' },
    },
    {
        path: 'client-document-type', loadComponent: () => import('./project-management/client-document-types/client-document-types.component').then(m => m.ClientDocumentTypesComponent), canActivate: [PermissionsGuard], data: { permission: 'Client Document Type.view' },
    },
    {
        path: 'project-document-type', loadComponent: () => import('./project-management/project-document-types/project-document-types.component').then(m => m.ProjectDocumentTypesComponent), canActivate: [PermissionsGuard], data: { permission: 'Project Document Type.view' },
    },
    {
        path: 'letter-type', loadComponent: () => import('./project-management/letter-type/letter-type.component').then(m => m.LetterTypeComponent), canActivate: [PermissionsGuard], data: { permission: 'Letter Configurations.view' },
    },
    {
        path: 'signature-authority', loadComponent: () => import('./project-management/signature-authority/signature-authority.component').then(m => m.SignatureAuthorityComponent), canActivate: [PermissionsGuard], data: { permission: 'Project Management Authority.view' },
    },
    {
        path: 'letter-frequency', loadComponent: () => import('./project-management/letter-frequency/letter-frequency.component').then(m => m.LetterFrequencyComponent), canActivate: [PermissionsGuard], data: { permission: 'Letter Frequency Configurations.view' },
    },
    {
        path: 'project-role', loadComponent: () => import('./project-management/project-role/project-role.component').then(m => m.ProjectRoleComponent), canActivate: [PermissionsGuard], data: { permission: 'Project Role.view' },
    },
     {
        path: 'task', loadComponent: () => import('./project-management/task/task.component').then(m => m.TaskComponent), canActivate: [PermissionsGuard], data: { permission: 'Task.view' },
    }
]
