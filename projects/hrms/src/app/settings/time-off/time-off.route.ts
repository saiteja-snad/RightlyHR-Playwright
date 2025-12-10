import { Route } from "@angular/router";
import { FlexibleLeaveAllocationComponent } from "./flexible-leave-allocation/flexible-leave-allocation.component";
import { LeaveAlloctaionComponent } from "./leave-alloctaion/leave-alloctaion.component";
import { LoadEntitlementsComponent } from "./load-entitlements/load-entitlements.component";
import { LoadEntilementsAlloctionComponent } from "./load-entilements-alloction/load-entilements-alloction.component";
import { LoadEntitlementsCarryForwardComponent } from "./load-entilements-alloction/load-entitlements-carry-forward/load-entitlements-carry-forward.component";
import { IntialLoadEntitlementComponent } from "./load-entilements-alloction/intial-load-entitlement/intial-load-entitlement.component";
import { CarryForwardLeaveEntitlementComponent } from "./load-entilements-alloction/carry-forward-leave-entitlement/carry-forward-leave-entitlement.component";

export default [
    // { path: '', redirectTo: '/settings/timeoff-configurations/leave-categoery', pathMatch: 'full' },
    {
        path: 'leave-categoery',
        children: [
            { path: 'pendingleavecategory', loadComponent: () => import('./leave-categoery/pending-leavecategory/pending-leavecategory.component').then((m) => m.PendingLeavecategoryComponent) },
            { path: 'publishedleavecategory', loadComponent: () => import('./leave-categoery/published-leavecategory/published-leavecategory.component').then((m) => m.PublishedLeavecategoryComponent) },
        ]
    },
    { path: 'leave-allocation', component: LeaveAlloctaionComponent },
    { path: 'load-entitlements', component: LoadEntitlementsComponent },
    { path: 'flexible-leave-allocation', component: FlexibleLeaveAllocationComponent },

    { path: 'initial-load-entitlements', component: IntialLoadEntitlementComponent },
    { path: 'carry-forward', component: CarryForwardLeaveEntitlementComponent },
    {path:'jobview',component:LoadEntilementsAlloctionComponent},
    {
        path: 'load-entitlements', component: LoadEntitlementsCarryForwardComponent,
        children: [
            { path: 'load-entitlement-create', loadComponent: () => import('./load-entilements-alloction/load-entitlements-carry-forward/load-entitlement-create/load-entitlement-create.component').then((m) => m.LoadEntitlementCreateComponent) },
            { path: 'load-entitlement-preview', loadComponent: () => import('./load-entilements-alloction/load-entitlements-carry-forward/load-entitlemetpreview/load-entitlemetpreview.component').then((m) => m.LoadEntitlemetpreviewComponent) },
            { path: 'load-entitlement-map-categoery', loadComponent: () => import('./load-entilements-alloction/load-entitlements-carry-forward/load-entilements-map-categoery/load-entilements-map-categoery.component').then((m) => m.LoadEntilementsMapCategoeryComponent) },
            { path: 'load-entitlement-execution', loadComponent: () => import('./load-entilements-alloction/load-entitlements-carry-forward/load-entitlemetexecution/load-entitlemetexecution.component').then((m) => m.LoadEntitlemetexecutionComponent) }
        ]
    },
    {
        path: 'eligibility-criterias', children: [
            // { path: '', redirectTo: 'comp-off', pathMatch: 'full' },
            { path: 'comp-off', loadComponent: () => import('./attendance-eligibility-criteria/comp-off-entitlement-criteria/comp-off-entitlement-criteria.component').then((m) => m.CompOffEntitlementCriteriaComponent) },
            { path: 'wfh', loadComponent: () => import('./attendance-eligibility-criteria/wfh-entitlemen-criteria/wfh-entitlemen-criteria.component').then((m) => m.WFHEntitlemenCriteriaComponent) },
            { path: 'permissions', loadComponent: () => import('./attendance-eligibility-criteria/permissions/permissions.component').then((m) => m.PermissionsComponent) },
            { path: 'permissions-eligibility-criteria', loadComponent: () => import('./attendance-eligibility-criteria/permission-eligibility-criteria/permission-eligibility-criteria.component').then((m) => m.PermissionEligibilityCriteriaComponent) },
            { path: 'global-permissions', loadComponent: () => import('./attendance-eligibility-criteria/global-permissions/global-permissions.component').then((m) => m.GlobalPermissionsComponent) },
            { path: 'attendance-regularization-types', loadComponent: () => import('./attendance-eligibility-criteria/attendance-regularization-types/attendance-regularization-types.component').then((m) => m.AttendanceRegularizationTypesComponent) },
            { path: 'attendance-regularization-eligibility-criteria', loadComponent: () => import('./attendance-eligibility-criteria/attendance-regularization-eligibility-criteria/attendance-regularization-eligibility-criteria.component').then((m) => m.AttendanceRegularizationEligibilityCriteriaComponent) },
            { path: 'remote-login-eligibility-criteria', loadComponent: () => import('./attendance-eligibility-criteria/remote-login-eligibility-criteria/remote-login-eligibility-criteria.component').then((m) => m.RemoteLoginEligibilityCriteriaComponent) },
            { path: 'late-login-alert-configuration', loadComponent: () => import('./attendance-eligibility-criteria/late-login-alert-configuration/late-login-alert-configuration.component').then((m) => m.LateLoginAlertConfigurationComponent) },
            { path: 'extra-hours-configuration', loadComponent: () => import('./attendance-eligibility-criteria/extra-hours-configuration/extra-hours-configuration.component').then((m) => m.ExtraHoursConfigurationComponent) },
            { path: 'flexible-workhours-configuration', loadComponent: () => import('./attendance-eligibility-criteria/flexible-workhours-configuration/flexible-workhours-configuration.component').then((m) => m.FlexibleWorkhoursConfigurationComponent) },
        ]
    },
    { path: 'addleavecategory', loadComponent: () => import('./leave-categoery/add-leavecategory/add-leavecategory.component').then((m) => m.AddLeavecategoryComponent) },
    { path: 'updateleavecategory', loadComponent: () => import('./leave-categoery/update-leavecategory/update-leavecategory.component').then((m) => m.UpdateLeavecategoryComponent) },
    { path: 'cloneleavecategory', loadComponent: () => import('./leave-categoery/clone-leavecategory/clone-leavecategory.component').then((m) => m.CloneLeavecategoryComponent) },
    { path: 'viewleavecategory', loadComponent: () => import('./leave-categoery/view-leavecategory/view-leavecategory.component').then((m) => m.ViewLeavecategoryComponent) },
    {
        path: 'flexible-wfh-allocation', children: [
            { path: '', redirectTo: 'wfh-allocation', pathMatch: 'full' },
            { path: 'wfh-allocation', loadComponent: () => import('./flexible-wfh-allocation/wfh-allocation/wfh-allocation.component').then((m) => m.WfhAllocationComponent) },
            { path: 'wfh-allocation-view', loadComponent: () => import('./flexible-wfh-allocation/wfh-allocation-view/wfh-allocation-view.component').then((m) => m.WfhAllocationViewComponent) },
        ]
    },
    {
        path: 'flexible-workhours-allocation', children: [
            { path: '', redirectTo: 'workhours-allocation', pathMatch: 'full' },
            { path: 'workhours-allocation', loadComponent: () => import('./flexible-hours-allocation/hours-allocation/hours-allocation.component').then((m) => m.HoursAllocationComponent) },
            { path: 'workhours-allocation-view', loadComponent: () => import('./flexible-hours-allocation/hours-allocation-view/hours-allocation-view.component').then((m) => m.HoursAllocationViewComponent) },
        ]
    },
] as Route[];