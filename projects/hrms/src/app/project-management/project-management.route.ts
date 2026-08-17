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
import { ClientTimesheetSummaryComponent } from './clients/client-time-sheets/client-timesheet-summary/client-timesheet-summary.component';
import { ClientTimesheetDetailedComponent } from './clients/client-time-sheets/client-timesheet-detailed/client-timesheet-detailed.component';
import { ProjectTimesheetSummaryComponent } from './projects/project-timesheets/project-timesheet-summary/project-timesheet-summary.component';
import { ProjectTimesheetDetailedComponent } from './projects/project-timesheets/project-timesheet-detailed/project-timesheet-detailed.component';
import { TimesheetsLayoutComponent } from './time-sheets/timesheets-layout/timesheets-layout.component';
import { TeamTimesheetsComponent } from './time-sheets/team-timesheets/team-timesheets.component';
import { TimesheetsSummaryViewComponent } from './time-sheets/timesheets-summary-view/timesheets-summary-view.component';
import { ResourceViewSummaryComponent } from './shared-project-management-componenets/resource-view-summary/resource-view-summary.component';
import { ProjectPhasesComponent } from './projects/project-phases/project-phases.component';
import { HoldClientsComponent } from './clients/hold-clients/hold-clients.component';
import { HoldProjectsComponent } from './projects/hold-projects/hold-projects.component';
import { TimesheetsResourceSummaryComponent } from './time-sheets/timesheets-resource-summary/timesheets-resource-summary.component';
import { TimesheetsResourceTabsComponent } from './time-sheets/timesheets-resource-tabs/timesheets-resource-tabs.component';
import { PhasesHoldComponent } from './projects/phases-hold/phases-hold.component';
import { InactivePhasesProjectComponent } from './projects/inactive-phases-project/inactive-phases-project.component';
import { ProjectInactiveResourcesComponent } from './projects/project-inactive-resources/project-inactive-resources.component';
import { ClientResourceInactiveComponent } from './clients/client-resource-inactive/client-resource-inactive.component';
import { BulkExportComponent } from './time-sheets/bulk-export/bulk-export.component';
import { BulkImportComponent } from './time-sheets/bulk-import/bulk-import.component';
import { HistoryLogComponent } from './time-sheets/history-log/history-log.component';
import { ExportHistoryComponent } from './time-sheets/export-history/export-history.component';
import { ResourceCreationComponent } from './shared-project-management-componenets/resource-creation/resource-creation.component';
import { ProjectsLayoutComponent } from './projects/projects-layout/projects-layout.component';
import { ClientResourcesWaitingForApprovalComponent } from './clients/client-resources-waiting-for-approval/client-resources-waiting-for-approval.component';
import { ProjectWaitingForApprovalResourcesComponent } from './projects/project-waiting-for-approval-resources/project-waiting-for-approval-resources.component';

export default [
    { path: '', redirectTo: 'clients', pathMatch: 'full' },
    {
        path: 'clients',
        children: [
            { path: '', redirectTo: 'active', pathMatch: 'full' },
            { path: 'active', component: ActiveClientsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Active Clients' } },
            { path: 'inactive', component: InactiveClientsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Inactive Clients' } },
            { path: 'hold', component: HoldClientsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Held Clients' } },
            { path: 'add-resources', component: ResourceCreationComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Add Resources' } },
            {
                path: 'details', component: ClientViewComponent,
                children: [
                    { path: 'info', component: ClientInformationComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Information' } },
                    { path: 'contact-info', component: ClientContactInformationComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Contact Information' } },
                    { path: 'projects', component: ActiveProjectsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Active Projects' } },
                    { path: 'inactiveprojects', component: InacitveProjectsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Inactive Projects' } },
                    { path: 'hold', component: HoldProjectsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Held Projects' } },
                    { path: 'resources', component: ClientResourcesComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Resources' } },
                    { path: 'inactive-resources', component: ClientResourceInactiveComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Inactive Resources' } },
                    { path: 'waiting-for-approval-resources', component: ClientResourcesWaitingForApprovalComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Waiting for Approval Resources' } },
                    {
                        path: 'timesheet', component: ClientTimeSheetsComponent,
                        children: [
                            { path: '', redirectTo: 'summary', pathMatch: 'full' },
                            { path: 'summary', component: ClientTimesheetSummaryComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Timesheet Summary' } },
                            { path: 'detailed', component: ClientTimesheetDetailedComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Timesheet Detailed' } },
                            { path: 'resource-summary', component: ResourceViewSummaryComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Resource Summary' } },
                        ],
                    },
                    { path: 'documents', component: ClientDocumentsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Client Documents' } },
                    { path: 'inactivedocuments', component: InactiveClientDocumentsComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Inactive Documents' } }
                ],
            },
            {
                path: 'add', component: AddClientLayoutComponent,
                children: [
                    { path: '', redirectTo: 'info', pathMatch: 'full' },
                    { path: 'info', component: AddClientInfoComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Add Client Information' } },
                    { path: 'contact-info', component: AddClientContactInfoComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Add Client Contact Information' } },
                    { path: 'documents', component: AddClientDocComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'Add Client Documents' } },
                    { path: 'nda', component: NdaComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'NDA' } },
                    { path: 'msa', component: MsaComponent, data: { auditModule: 'Project Management >> Clients', auditPage: 'MSA' } },
                ],
            },
        ],
    },
    {
        path: 'projects', component: ProjectsLayoutComponent,
        children: [
            { path: 'active', component: ActiveProjectsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Active Projects' } },
            { path: 'inactive', component: InacitveProjectsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Inactive Projects' } },
            { path: 'hold', component: HoldProjectsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Hold Projects' } },
            { path: 'add-resources', component: ResourceCreationComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Add Resources' } },
            {
                path: 'details', component: ProjectViewComponent,
                children: [
                    { path: '', redirectTo: 'information', pathMatch: 'full' },
                    { path: 'information', component: ProjectDetailesComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Information' } },
                    { path: 'contact-info', component: ProjectContactsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Contact Information' } },
                    { path: 'resources', component: ProjectResourcesComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Resources' } },
                    { path: 'inactive-resources', component: ProjectInactiveResourcesComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Inactive Resources' } },
                    { path: 'waiting-for-approval-resources', component: ProjectWaitingForApprovalResourcesComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Waiting for Approval Resources' } },
                    {
                        path: 'timesheet', component: ProjectTimesheetsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Timesheets' },
                        children: [
                            { path: '', redirectTo: 'timesheet/summary', pathMatch: 'full', data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Timesheet Summary' } },
                            { path: 'summary', component: ProjectTimesheetSummaryComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Timesheet Summary' } },
                            { path: 'detailed', component: ProjectTimesheetDetailedComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Timesheet Detailed' } },
                            { path: 'resource-summary', component: ResourceViewSummaryComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Resource Summary' } },
                        ],
                    },
                    { path: 'documents', component: ProjectDocumentsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Documents' } },
                    { path: 'inactivedocuments', component: InactiveProjectDocumentsComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Inactive Project Documents' } },
                    { path: 'phases', component: ProjectPhasesComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Project Phases' } },
                    { path: 'inactive-phases', component: InactivePhasesProjectComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Inactive Project Phases' } },
                    { path: 'hold-phases', component: PhasesHoldComponent, data: { auditModule: 'Project Management >> Projects', auditPage: 'Hold Project Phases' } }
                ],
            }
        ],
    },
    {
        path: 'timesheet', component: TimesheetsLayoutComponent,
        children: [
            { path: '', component: TimeSheetViewComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'My Timesheet' } },
            { path: 'mytimesheet', component: TimeSheetViewComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'My Timesheet' } },
            { path: 'teamtimesheet', component: TeamTimesheetsComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Team Timesheet' } },
            { path: 'summary', component: TimesheetsSummaryViewComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Timesheet Summary' } },
            { path: 'mysummary', component: TimesheetsSummaryViewComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'My Timesheet Summary' } },
            { path: 'resourcesummary', component: TimesheetsResourceSummaryComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Resource Summary' } },
            { path: 'bulk-upload', component: BulkImportComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Bulk Import/Upload' } },
            { path: 'bulk-export', component: BulkExportComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Bulk Export' } },
            { path: 'historylog', component: HistoryLogComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'History Log' } },
            { path: 'export-history', component: ExportHistoryComponent, data: { auditModule: 'Project Management >> Timesheets', auditPage: 'Export History' } },
        ],
    },
] as Route[];