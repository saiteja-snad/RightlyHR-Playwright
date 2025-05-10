import { Route } from "@angular/router";
import { HolidaysComponent } from "./holidays/holidays.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    // { path: '', redirectTo: '/calendar/calendarview', pathMatch: 'full' },
    { path: 'calendarview', children: [{ path: '', loadComponent: () => import('./calendar-view/calendar-view.component').then((m) => m.CalendarViewComponent), canActivate: [PermissionsGuard], data: { permission: 'Calender Tab.view' } },] },
    { path: 'holiday', component: HolidaysComponent, canActivate: [PermissionsGuard], data: { permission: 'Holidays Tab.view' },
        children: [
            { path: '', redirectTo: 'public-holidays', pathMatch: 'full' },
            { path: 'optional-holidays', loadComponent: () => import('./optionalholidays/optionalholidays.component').then((m) => m.OptionalholidaysComponent), canActivate: [PermissionsGuard], data: { permission: 'Holidays(Optional).view' } },
            { path: 'public-holidays', loadComponent: () => import('./publicholidays/publicholidays.component').then((m) => m.PublicholidaysComponent), canActivate: [PermissionsGuard], data: { permission: 'Holidays(Public).view' } }
        ]
    }
] as Route[];