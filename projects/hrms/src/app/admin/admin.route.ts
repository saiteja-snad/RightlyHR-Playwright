import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { NodueFormDetailsComponent } from "./nodue-form-details/nodue-form-details.component";

export default [
    { path: 'dashboard', component: DashboardComponent ,},
    { path: 'nodue-form-details',component:NodueFormDetailsComponent,},
] as Route[];