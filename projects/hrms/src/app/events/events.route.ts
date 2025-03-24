import { Route } from "@angular/router";
import { PastEventsComponent } from "./past-events/past-events.component";
import { UpcomingEventsComponent } from "./upcoming-events/upcoming-events.component";

export default [
    { path: '', redirectTo: '/events/upcoming', pathMatch: 'full' },
    { path: 'upcoming', component: UpcomingEventsComponent },
    { path: 'past', component: PastEventsComponent },
] as Route[];