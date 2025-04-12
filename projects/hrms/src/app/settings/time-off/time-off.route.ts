import { Route } from "@angular/router";
import { LeaveCategoeryComponent } from "./leave-categoery/leave-categoery.component";
import { FlexibleLeaveAllocationComponent } from "./flexible-leave-allocation/flexible-leave-allocation.component";

export default [
    { path: '', redirectTo: '/settings/time-off/flexible-leave-allocation', pathMatch: 'full' },
    { path: 'leave-categoery', component: LeaveCategoeryComponent },
    { path: 'flexible-leave-allocation', component: FlexibleLeaveAllocationComponent },
] as Route[];