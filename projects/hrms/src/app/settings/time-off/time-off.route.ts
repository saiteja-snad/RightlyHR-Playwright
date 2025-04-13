import { Route } from "@angular/router";
import { LeaveCategoeryComponent } from "./leave-categoery/leave-categoery.component";
import { FlexibleLeaveAllocationComponent } from "./flexible-leave-allocation/flexible-leave-allocation.component";
import { LeaveAlloctaionComponent } from "./leave-alloctaion/leave-alloctaion.component";
import { LoadEntitlementsComponent } from "./load-entitlements/load-entitlements.component";

export default [
    { path: '', redirectTo: '/settings/timeoff-configurations/flexible-leave-allocation', pathMatch: 'full' },
    { path: 'leave-categoery', component: LeaveCategoeryComponent },
    { path: 'leave-allocation', component: LeaveAlloctaionComponent },
    { path: 'load-entitlements', component: LoadEntitlementsComponent },
    { path: 'flexible-leave-allocation', component: FlexibleLeaveAllocationComponent },
] as Route[];