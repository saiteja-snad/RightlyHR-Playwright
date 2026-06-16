import { Route } from "@angular/router";
import { ActiveEmployeesComponent } from "./active-employees/active-employees.component";
import { InactiveEmployeesComponent } from "./inactive-employees/inactive-employees.component";
import { ProspectiveInternsComponent } from "./prospective-interns/prospective-interns.component";
import { ProspectiveEmployeesComponent } from "./prospective-employees/prospective-employees.component";
import { ProbationEmployeesComponent } from "./probation-employees/probation-employees.component";
import { ActiveInternsComponent } from "./active-interns/active-interns.component";
import { InactiveInternsComponent } from "./inactive-interns/inactive-interns.component";
import { AllemployeesComponent } from "./allemployees/allemployees.component";
import { InactiveContractEmployeesComponent } from "./inactive-contract-employees/inactive-contract-employees.component";
import { ContractEmployeeComponent } from "./contract-employee/contract-employee.component";
import { ActiveContractEmployeesComponent } from "./active-contract-employees/active-contract-employees.component";
import { EmployeeManagementHomeRedirectComponent, employeeManagementHomeActivate } from "./employee-management-layout/employee-management-layout.component";

export default [
    { path: '', pathMatch: 'full', component: EmployeeManagementHomeRedirectComponent, canActivate: [employeeManagementHomeActivate] },
    {
        path: 'active',
        children: [
            { path: '', redirectTo: 'employees', pathMatch: 'full' },
            { path: 'employees', component: ActiveEmployeesComponent, },
            { path: 'contract', component: ActiveContractEmployeesComponent },
            { path: 'interns', component: ActiveInternsComponent, },
        ],
    },
    {
        path: 'prospective',
        children: [
            { path: '', redirectTo: 'employees', pathMatch: 'full' },
            { path: 'employees', component: ProspectiveEmployeesComponent, },
            { path: 'contract', component: ContractEmployeeComponent },
            { path: 'interns', component: ProspectiveInternsComponent, },
        ],
    },
    {
        path: 'inactive',
        children: [
            { path: '', redirectTo: 'employees', pathMatch: 'full' },
            { path: 'employees', component: InactiveEmployeesComponent, },
            { path: 'contract', component: InactiveContractEmployeesComponent },
            { path: 'interns', component: InactiveInternsComponent, },
        ],
    },
    {
        path: 'probation',
        children: [
            { path: '', redirectTo: 'employees', pathMatch: 'full' },
            { path: 'employees', component: ProbationEmployeesComponent, },
        ],
    },
] as Route[];
