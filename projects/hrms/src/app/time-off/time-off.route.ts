import { Route } from "@angular/router";
import { LeavesComponent } from "./leaves/leaves.component";


export default [
    { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
    { path: 'leaves', component: LeavesComponent },
] as Route[];