
import { Route } from "@angular/router";
import { AddClaimsandexpensesComponent } from "./add-claimsandexpenses/add-claimsandexpenses.component";
import { ClaimsandexpensesComponent } from "./claimsandexpenses/claimsandexpenses.component";
import { DraftsExpensesComponent } from "./claimsandexpenses/drafts-expenses/drafts-expenses.component";
import { PendingExpensesComponent } from "./claimsandexpenses/pending-expenses/pending-expenses.component";
import { ApprovedExpensesComponent } from "./claimsandexpenses/approved-expenses/approved-expenses.component";
import { ProcessedExpensesComponent } from "./claimsandexpenses/processed-expenses/processed-expenses.component";
import { RejectedExpensesComponent } from "./claimsandexpenses/rejected-expenses/rejected-expenses.component";
import { ExpenesHeaderTabsComponent } from "../shared/claimsandexpenses-tabs/expenes-header-tabs/expenes-header-tabs.component";




export default [
    { path: 'addexpense', component: AddClaimsandexpensesComponent },

    { path: '', redirectTo: '/claimsandexpenses/expenses', pathMatch: 'full' },
    {
        path: 'expenses', component: ClaimsandexpensesComponent,
        children: [
            { path: 'draft', component: DraftsExpensesComponent },
            { path: 'approved', component: ApprovedExpensesComponent },
            { path: 'pending', component: PendingExpensesComponent },
            { path: 'processed', component: ProcessedExpensesComponent },
            { path: 'rejected', component: RejectedExpensesComponent },
            { path: '', component: ExpenesHeaderTabsComponent},
        ]
    }


] as Route[];