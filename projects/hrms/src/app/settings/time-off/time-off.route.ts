import { Route } from "@angular/router";
import { LeaveCategoeryComponent } from "./leave-categoery/leave-categoery.component";
import { FlexibleLeaveAllocationComponent } from "./flexible-leave-allocation/flexible-leave-allocation.component";
import { LeaveAlloctaionComponent } from "./leave-alloctaion/leave-alloctaion.component";
import { LoadEntitlementsComponent } from "./load-entitlements/load-entitlements.component";

import { AttendanceEligibilityCriteriaComponent } from "./attendance-eligibility-criteria/attendance-eligibility-criteria.component";

export default [
    { path: '', redirectTo: '/settings/timeoff-configurations/flexible-leave-allocation', pathMatch: 'full' },
    { path: 'leave-categoery', component: LeaveCategoeryComponent },
    { path: 'leave-allocation', component: LeaveAlloctaionComponent },
    { path: 'load-entitlements', component: LoadEntitlementsComponent },
    { path: 'flexible-leave-allocation', component: FlexibleLeaveAllocationComponent },
    {
        path: 'eligibility-criterias',
        component: AttendanceEligibilityCriteriaComponent,
        children: [
            { path: '', redirectTo: 'comp-off', pathMatch: 'full' },
            { path: 'comp-off', loadComponent: () => import('./attendance-eligibility-criteria/comp-off-entitlement-criteria/comp-off-entitlement-criteria.component').then((m) => m.CompOffEntitlementCriteriaComponent) },
            { path: 'wfh', loadComponent: () => import('./attendance-eligibility-criteria/wfh-entitlemen-criteria/wfh-entitlemen-criteria.component').then((m) => m.WFHEntitlemenCriteriaComponent) },
            { path: 'permissions', loadComponent: () => import('./attendance-eligibility-criteria/permissions/permissions.component').then((m) => m.PermissionsComponent) },
        ]
    }



] as Route[];


