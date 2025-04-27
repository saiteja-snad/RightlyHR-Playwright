import { Route } from "@angular/router";
import { LeaveCategoeryComponent } from "./leave-categoery/leave-categoery.component";
import { FlexibleLeaveAllocationComponent } from "./flexible-leave-allocation/flexible-leave-allocation.component";
import { LeaveAlloctaionComponent } from "./leave-alloctaion/leave-alloctaion.component";
import { LoadEntitlementsComponent } from "./load-entitlements/load-entitlements.component";

export default [
    { path: '', redirectTo: '/settings/timeoff-configurations/leave-categoery', pathMatch: 'full' },
    { path: 'leave-categoery', component: LeaveCategoeryComponent },
    { path: 'leave-allocation', component: LeaveAlloctaionComponent },
    { path: 'load-entitlements', component: LoadEntitlementsComponent },
    { path: 'flexible-leave-allocation', component: FlexibleLeaveAllocationComponent },
    {
        path: 'eligibility-criterias', children: [
            { path: '', redirectTo: 'comp-off', pathMatch: 'full' },
            { path: 'comp-off', loadComponent: () => import('./attendance-eligibility-criteria/comp-off-entitlement-criteria/comp-off-entitlement-criteria.component').then((m) => m.CompOffEntitlementCriteriaComponent) },
            { path: 'wfh', loadComponent: () => import('./attendance-eligibility-criteria/wfh-entitlemen-criteria/wfh-entitlemen-criteria.component').then((m) => m.WFHEntitlemenCriteriaComponent) },
            { path: 'permissions', loadComponent: () => import('./attendance-eligibility-criteria/permissions/permissions.component').then((m) => m.PermissionsComponent) },
            { path: 'permissions-eligibility-criteria', loadComponent: () => import('./attendance-eligibility-criteria/permission-eligibility-criteria/permission-eligibility-criteria.component').then((m) => m.PermissionEligibilityCriteriaComponent) },
            { path: 'global-permissions', loadComponent: () => import('./attendance-eligibility-criteria/global-permissions/global-permissions.component').then((m) => m.GlobalPermissionsComponent)},
            { path: 'attendance-regularization-types', loadComponent: () => import('./attendance-eligibility-criteria/attendance-regularization-types/attendance-regularization-types.component').then((m) => m.AttendanceRegularizationTypesComponent)},
            { path: 'attendance-regularization-eligibility-criteria', loadComponent: () => import('./attendance-eligibility-criteria/attendance-regularization-eligibility-criteria/attendance-regularization-eligibility-criteria.component').then((m) => m.AttendanceRegularizationEligibilityCriteriaComponent)},
        ]
    },
    { path: 'addleavecategory', loadComponent: () => import('./leave-categoery/add-leavecategory/add-leavecategory.component').then((m) => m.AddLeavecategoryComponent) },
    { path: 'updateleavecategory', loadComponent: () => import('./leave-categoery/update-leavecategory/update-leavecategory.component').then((m) => m.UpdateLeavecategoryComponent) },
    { path: 'cloneleavecategory', loadComponent: () => import('./leave-categoery/clone-leavecategory/clone-leavecategory.component').then((m) => m.CloneLeavecategoryComponent) },
    { path: 'viewleavecategory', loadComponent: () => import('./leave-categoery/view-leavecategory/view-leavecategory.component').then((m) => m.ViewLeavecategoryComponent) },
    {
        path: 'leave-categoery',
        children: [
            { path: '', redirectTo: 'pendingleavecategory', pathMatch: 'full' },
            { path: 'pendingleavecategory', loadComponent: () => import('./leave-categoery/pending-leavecategory/pending-leavecategory.component').then((m) => m.PendingLeavecategoryComponent) },
            { path: 'publishedleavecategory', loadComponent: () => import('./leave-categoery/published-leavecategory/published-leavecategory.component').then((m) => m.PublishedLeavecategoryComponent) },
        ]
    },
] as Route[];