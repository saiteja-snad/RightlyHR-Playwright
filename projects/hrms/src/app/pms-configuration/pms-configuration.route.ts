import { Route } from "@angular/router";
import { IncrementPercentageComponent } from "./increment-percentage/increment-percentage.component";
import { AssessorConfigurationComponent } from "./assessor-configuration/assessor-configuration.component";

export default [
    { path: '', redirectTo: '/pmsconfiguration/increment', pathMatch: 'full' },
    { path: 'increment', component: IncrementPercentageComponent},
    { path: 'assessor', component: AssessorConfigurationComponent},
] as Route[];