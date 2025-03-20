import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ActiveEmployeesComponent } from "./active-employees/active-employees.component";
import { InactiveEmployeesComponent } from "./inactive-employees/inactive-employees.component";
import { ProspectiveInternsComponent } from "./prospective-interns/prospective-interns.component";
import { ProspectiveEmployeesComponent } from "./prospective-employees/prospective-employees.component";
import { ProbationEmployeesComponent } from "./probation-employees/probation-employees.component";
import { ActiveInternsComponent } from "./active-interns/active-interns.component";
import { InactiveInternsComponent } from "./inactive-interns/inactive-interns.component";

export default [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'prospective-employees', component: ProspectiveEmployeesComponent },
    { path: 'active-employees', component: ActiveEmployeesComponent },
    { path: 'inactive-employees', component: InactiveEmployeesComponent },
    { path: 'prospective-interns', component: ProspectiveInternsComponent },
    { path: 'active-interns', component: ActiveInternsComponent },
    { path: 'inactive-interns', component: InactiveInternsComponent },
    { path: 'probation-employees', component: ProbationEmployeesComponent },
] as Route[];