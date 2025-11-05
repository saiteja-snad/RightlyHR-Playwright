import { Route } from '@angular/router';
import { ActiveClientsComponent } from './clients/active-clients/active-clients.component';
import { InactiveClientsComponent } from './clients/inactive-clients/inactive-clients.component';
import { ClientViewComponent } from './clients/client-view/client-view.component';
import { TimeSheetViewComponent } from './time-sheets/time-sheet-view/time-sheet-view.component';
import { ActiveProjectsComponent } from './projects/active-projects/active-projects.component';
import { InacitveProjectsComponent } from './projects/inacitve-projects/inacitve-projects.component';
import { ClientInformationComponent } from './clients/client-information/client-information.component';
import { ClientContactInformationComponent } from './clients/client-contact-information/client-contact-information.component';
import { ClientResourcesComponent } from './clients/client-resources/client-resources.component';
import { ClientTimeSheetsComponent } from './clients/client-time-sheets/client-time-sheets.component';
import { ClientDocumentsComponent } from './clients/client-documents/client-documents.component';
import { AddClientLayoutComponent } from './clients/add-client/add-client-layout/add-client-layout.component';
import { AddClientInfoComponent } from './clients/add-client/add-client-info/add-client-info.component';
import { AddClientContactInfoComponent } from './clients/add-client/add-client-contact-info/add-client-contact-info.component';
import { AddClientDocComponent } from './clients/add-client/add-client-doc/add-client-doc.component';
import { NdaComponent } from './clients/add-client/nda/nda.component';
import { MsaComponent } from './clients/add-client/msa/msa.component';
import { ProjectContactsComponent } from './projects/project-contacts/project-contacts.component';
import { ProjectViewComponent } from './projects/project-view/project-view.component';
import { ProjectDocumentsComponent } from './projects/project-documents/project-documents.component';
import { ProjectTimesheetsComponent } from './projects/project-timesheets/project-timesheets.component';
import { ProjectResourcesComponent } from './projects/project-resources/project-resources.component';
import { ProjectDetailesComponent } from './projects/project-detailes/project-detailes.component';
import { InactiveClientDocumentsComponent } from './clients/inactive-client-documents/inactive-client-documents.component';
import { InactiveProjectDocumentsComponent } from './projects/inactive-project-documents/inactive-project-documents.component';
import { ProjectPhasesComponent } from './projects/project-phases/project-phases.component';

export default [
    { path: '', redirectTo: '/project-management/clients', pathMatch: 'full' },
    {
        path: 'clients',
        children: [
            { path: '', redirectTo: 'active', pathMatch: 'full' },
            { path: 'active', component: ActiveClientsComponent },
            { path: 'inactive', component: InactiveClientsComponent },
            {
                path: 'details', component: ClientViewComponent,
                children: [
                    { path: '', redirectTo: 'info', pathMatch: 'full' },
                    { path: 'info', component: ClientInformationComponent },
                    { path: 'contact-info', component: ClientContactInformationComponent },
                    { path: 'projects', component: ActiveProjectsComponent },
                    { path: 'inactiveprojects', component: InacitveProjectsComponent },
                    { path: 'resources', component: ClientResourcesComponent },
                    { path: 'timesheet', component: ClientTimeSheetsComponent },
                    { path: 'documents', component: ClientDocumentsComponent },
                    {path: 'inactivedocuments', component: InactiveClientDocumentsComponent}
                ],
            },
            {
                path: 'add', component: AddClientLayoutComponent,
                children: [
                    { path: '', redirectTo: 'info', pathMatch: 'full' },
                    { path: 'info', component: AddClientInfoComponent },
                    { path: 'contact-info', component: AddClientContactInfoComponent },
                    { path: 'documents', component: AddClientDocComponent },
                    { path: 'nda', component: NdaComponent },
                    { path: 'msa', component: MsaComponent },
                ],
            },
        ],
    },
    {
        path: 'projects',
        children: [
            { path: '', redirectTo: 'active', pathMatch: 'full' },
            { path: 'active', component: ActiveProjectsComponent },
            { path: 'inactive', component: InacitveProjectsComponent },
            {
                path: 'details', component: ProjectViewComponent,
                children: [
                    { path: '', redirectTo: 'information', pathMatch: 'full' },
                    { path: 'information', component: ProjectDetailesComponent },
                    { path: 'contact-info', component: ProjectContactsComponent },
                    { path: 'resources', component: ProjectResourcesComponent },
                    { path: 'timesheet', component: ProjectTimesheetsComponent },
                    { path: 'documents', component: ProjectDocumentsComponent },
                    { path: 'inactivedocuments', component: InactiveProjectDocumentsComponent },
                    { path: 'phases', component: ProjectPhasesComponent}
                ],
            }
        ],
    },
    { path: 'time-sheet', component: TimeSheetViewComponent },
] as Route[];