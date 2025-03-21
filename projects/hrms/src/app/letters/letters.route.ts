import { Route } from "@angular/router";
import { OfferLetterComponent } from "./offer-letter/offer-letter.component";
import { AppointmentLetterComponent } from "./appointment-letter/appointment-letter.component";


export default [
    { path: '', redirectTo: '/letters/offer-letter', pathMatch: 'full' },
    { path: 'offer-letter', component: OfferLetterComponent },
    { path: 'appointment-letter', component: AppointmentLetterComponent },
] as Route[];