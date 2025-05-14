
import { Route } from "@angular/router";
import { AddClaimsandexpensesComponent } from "./add-claimsandexpenses/add-claimsandexpenses.component";
import { ClaimsandexpensesComponent } from "./claimsandexpenses/claimsandexpenses.component";
import { DraftsExpensesComponent } from "./claimsandexpenses/drafts-expenses/drafts-expenses.component";
import { PendingExpensesComponent } from "./claimsandexpenses/pending-expenses/pending-expenses.component";
import { ApprovedExpensesComponent } from "./claimsandexpenses/approved-expenses/approved-expenses.component";
import { ProcessedExpensesComponent } from "./claimsandexpenses/processed-expenses/processed-expenses.component";
import { RejectedExpensesComponent } from "./claimsandexpenses/rejected-expenses/rejected-expenses.component";
import { PermissionsGuard } from "../guards/permissions.guard";




export default [
    { path: 'addexpense', component: AddClaimsandexpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Expenses Module.create' } },

    // { path: '', redirectTo: '/claimsandexpenses/expenses', pathMatch: 'full' },
    {
        path: 'expenses', component: ClaimsandexpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Expenses Module.view' },
        children: [
            { path: 'draft', component: DraftsExpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Draft Tab.view' } },
            { path: 'approved', component: ApprovedExpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Approved Tab.view' } },
            { path: 'pending', component: PendingExpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Pending Tab.view' } },
            { path: 'processed', component: ProcessedExpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Processed Tab.view' } },
            { path: 'rejected', component: RejectedExpensesComponent, canActivate: [PermissionsGuard], data: { permission: 'Rejected Tab.view' } },
            // { path: '', redirectTo: 'draft', pathMatch: 'full' },
        ]
    }


] as Route[];