import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
    { path: '', redirectTo: '/settings/helpdesk-management-config/categeory', pathMatch: 'full' },
    {
        path: 'categeory', loadComponent: () => import('./helpdesk-management/categeory/categeory.component').then(m => m.CategeoryComponent), canActivate: [PermissionsGuard], data: { permission: 'Category.view' },
    },
    {
        path: 'subcategeory', loadComponent: () => import('./helpdesk-management/subcategeory/subcategeory.component').then(m => m.SubcategeoryComponent), canActivate: [PermissionsGuard], data: { permission: 'Subcategory.view' },
    }
]
