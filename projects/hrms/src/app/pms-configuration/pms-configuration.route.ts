import { Route } from "@angular/router";
import { IncrementPercentageComponent } from "./increment-percentage/increment-percentage.component";
import { AssessorConfigurationComponent } from "./assessor-configuration/assessor-configuration.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    { path: '', redirectTo: '/pmsconfiguration/increment', pathMatch: 'full' },
    { path: 'increment', component: IncrementPercentageComponent, canActivate: [PermissionsGuard], data: { permission: 'Increment Percentage.view' } },
    { path: 'assessor', component: AssessorConfigurationComponent, canActivate: [PermissionsGuard], data: { permission: 'Assessor Configuration.view' } },
] as Route[];