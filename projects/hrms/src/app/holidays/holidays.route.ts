import { Route } from "@angular/router";
import { PublicholidaysComponent } from "./publicholidays/publicholidays.component";
import { OptionalholidaysComponent } from "./optionalholidays/optionalholidays.component";
export default [
     { path: '', redirectTo: '/holidays/public-holidays', pathMatch: 'full' },
       {
           path: 'public-holidays', component:PublicholidaysComponent,
          
       },
       {
        path: 'optional-holidays', component:OptionalholidaysComponent,
       }
] as Route[];