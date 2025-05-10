import { Route } from "@angular/router";
import { PastEventsComponent } from "./past-events/past-events.component";
import { UpcomingEventsComponent } from "./upcoming-events/upcoming-events.component";
import { PublishedeventsComponent } from "./publishedevents/publishedevents.component";

export default [
    { path: '', redirectTo: '/events/upcoming', pathMatch: 'full' },
    { path: 'upcoming', component: UpcomingEventsComponent },
    { path: 'past', component: PastEventsComponent },
    { path: 'published', component: PublishedeventsComponent },
] as Route[];