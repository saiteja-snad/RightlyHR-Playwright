import { Route } from "@angular/router";
import { HolidaysComponent } from "./holidays/holidays.component";


export default [
    {
        path: '', redirectTo: '/calendar/calendarview', pathMatch: 'full'
    },
    {
        path: 'calendarview',
        children: [
            { path: '', loadComponent: () => import('./calendar-view/calendar-view.component').then((m) => m.CalendarViewComponent) },
        ]
    },

    {
        path: 'holiday',
        component: HolidaysComponent,
        children: [
            { path: '', redirectTo: 'public-holidays', pathMatch: 'full' },
            { path: 'optional-holidays', loadComponent: () => import('./optionalholidays/optionalholidays.component').then((m) => m.OptionalholidaysComponent) },
            { path: 'public-holidays', loadComponent: () => import('./publicholidays/publicholidays.component').then((m) => m.PublicholidaysComponent) }

        ]
    }
] as Route[];