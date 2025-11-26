import { Route, } from '@angular/router';
import { PermissionsGuard } from '../../guards/permissions.guard';

export default [
   { path: '', redirectTo: '/settings/it-configuration/itsupport-category', pathMatch: 'full' },
   {path: 'itsupport-category', loadComponent: () => import('../it-configuration/itsupport-add-category/itsupport-add-category.component').then((m) => m.ItsupportAddCategoryComponent), canActivate: [PermissionsGuard], data: { permission: 'IT Support Category.view' } },
   {path: 'itsupport-sub-category', loadComponent: () => import('./itsupport-add-subcategory/itsupport-add-subcategory.component').then((m) => m.ItsupportAddSubcategoryComponent), canActivate: [PermissionsGuard], data: { permission: 'IT Support Sub-Category.view' } },



] as Route[];
