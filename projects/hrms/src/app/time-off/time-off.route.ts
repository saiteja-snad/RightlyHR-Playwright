import { Route } from "@angular/router";
import { LeavesComponent } from "./leaves/leaves.component";
import { WorkFromHomeComponent } from "./work-from-home/work-from-home.component";


export default [
    { path: '', redirectTo: '/time-off/leaves', pathMatch: 'full' },
    {
      path: 'leaves',component: LeavesComponent,
     
    },
    { path: 'wfh', component:  WorkFromHomeComponent},
] as Route[];