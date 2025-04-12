import { Route } from "@angular/router";
import { CompanypoliciesComponent } from "./companypolicies/companypolicies.component";


export default [
    { path: '', redirectTo: '/policies/companypolicies', pathMatch: 'full' },
    {
        path: 'companypolicies', component: CompanypoliciesComponent,
    }
    
 
] as Route[];