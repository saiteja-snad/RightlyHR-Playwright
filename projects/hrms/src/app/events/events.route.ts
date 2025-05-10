import { Route } from "@angular/router";
import { PastEventsComponent } from "./past-events/past-events.component";
import { UpcomingEventsComponent } from "./upcoming-events/upcoming-events.component";
import { PublishedeventsComponent } from "./publishedevents/publishedevents.component";
import { PermissionsGuard } from "../guards/permissions.guard";
export default [
    // { path: '', redirectTo: '/events/upcoming', pathMatch: 'full' },
    { path: 'upcoming', component: UpcomingEventsComponent, canActivate: [PermissionsGuard], data: { permission: 'Events(Upcoming Events).view' } },
    { path: 'past', component: PastEventsComponent,  canActivate: [PermissionsGuard], data: { permission: 'Events(Past Events).view' }},
    { path: 'published', component: PublishedeventsComponent },
] as Route[];