import { Component } from '@angular/core';
import { MODULE_INFOS } from '../../modules-info';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../module-information/module-information.component";
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-project-management-module-info',
  imports: [CommonModule, ModuleInformationComponent, NgbPopoverModule, ModuleInfoIconComponent,TranslateModule],
  templateUrl: './project-management-module-info.component.html',
  styleUrl: './project-management-module-info.component.scss'
})

export class ProjectManagementModuleInfoComponent {
  moduleinfo: string = '';
  componentname: string = '';
  employename: any;
  clientID: any;
  clientName: any;
  clients: any = {};
  subscription!: Subscription;
  lastUrl: string = ''
  currentUrl: string = '';
  routeToInfoMap!: { [key: string]: string };
  destroy$: Subject<boolean> = new Subject<boolean>();
  resourceDataids = {} as any;
  clientColor: any;
  projectsDetails: any;
  projectname: any;
  projectColor: any;
  projectId: any;
  storeclientId: any;
  constructor(private router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');
    const clientProjectId = localStorage.getItem('clientProjectId');
    const projectProjectId = localStorage.getItem('projectProjectId');
    if (clientProjectId) {
      this.getClientsData(clientProjectId);
      this.clientID = clientProjectId;
    }
    if (projectProjectId) {
      this.getProjects(projectProjectId)
      this.projectId = projectProjectId;
    }
    this.http.request$.pipe(takeUntil(this.destroy$)).subscribe(request => {
      const currentUrl = this.router.url.split('?')[0];
      // Always read localStorage first (default)
      this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');
      // Determine employeeId
      const employeeId = request?.resourceId || this.resourceDataids?.employeeId;
      // If both dateRange and resourceId are in request$, use request's data
      if (request && request.dateRange && request.resourceId) {
        this.resourceDataids = {
          ...this.resourceDataids, // keep existing keys like clientId, projectId
          employeeId: request.resourceId
        };
      }
      // If we are on the correct route and have an employeeId, load employee name
      if ((currentUrl === '/project-management/projects/details/timesheet/resource-summary' ||
        currentUrl === '/project-management/clients/details/timesheet/resource-summary') && employeeId) {
        this.getEmployeeId(employeeId, currentUrl);
      }
    });
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.clients = res?.data || {};
        this.clientName = this.clients.clientName;
        this.clientColor = this.clients?.meta?.graphData?.color;
      },
      error: (err) => {
        this.clients = {};
        console.error('Error fetching clients:', err);
      }
    });
  }

  getProjects(projectId: any) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDetails = res?.data ?? [];

        this.projectname = this.projectsDetails[0]?.projectName;
        // this.storeclientId =  this.projectsDetails[0]?.client?.clientId;

        this.getClientsData(this.projectsDetails[0]?.client?.clientId);
        this.storeclientId = this.projectsDetails[0]?.client?.clientId;
        this.projectColor = this.projectsDetails[0]?.meta?.graphData?.color;
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectname = [];
      },
    });
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/project-management/clients/active': MODULE_INFOS.CLIENT_INFO,
      '/project-management/clients/inactive': MODULE_INFOS.CLIENT_INFO_Inactive,
      '/project-management/projects/active': MODULE_INFOS.PROJECT_Info,
      '/project-management/projects/inactive': MODULE_INFOS.PROJECT_Info_Inactive,
      '/project-management/projects/hold': MODULE_INFOS.PROJECT_INFO_On_Hold,
      '/project-management/clients/details/hold': MODULE_INFOS.PROJECT_INFO_On_Hold,
      '/project-management/time-sheet': MODULE_INFOS.TIME_SHEET_INFO,
      '/project-management/clients/details': MODULE_INFOS.CLIENT_INFORMATION_INFO,
      '/project-management/clients/details/info': MODULE_INFOS.CLIENT_INFORMATION_INFO,
      '/project-management/clients/details/contact-info': MODULE_INFOS.CLIENT_CONATACTDETAILES_INFO,
      '/project-management/clients/details/projects': MODULE_INFOS.CLIENT_Projects_INFO,
      '/project-management/clients/details/inactiveprojects': MODULE_INFOS.CLIENT_Projects_INFO,
      '/project-management/clients/details/resources': MODULE_INFOS.CLIENT_Resource_INFO,
      '/project-management/clients/details/inactive-resources': MODULE_INFOS.CLIENT_Resource_Inactive,
      '/project-management/projects/details/information': MODULE_INFOS.Project_Details_INFO,
      '/project-management/projects/details/contact-info': MODULE_INFOS.Contacts_Related_to_Projects,
      '/project-management/projects/details/documents': MODULE_INFOS.Documents_Project,
      '/project-management/clients/details/documents': MODULE_INFOS.CLIENT_Documents_INFO,
      '/project-management/projects/details/resources': MODULE_INFOS.Resources_Project,
      '/project-management/projects/details/inactive-resources': MODULE_INFOS.Inactive_Resources,
      '/project-management/projects/details/timesheet/summary': MODULE_INFOS.PROJECT_Time_sheet_SUMMARY_VIEW,
      '/project-management/projects/details/timesheet/detailed': MODULE_INFOS.PROJECT_Detalied_view,
      '/project-management/projects/details/inactivedocuments': MODULE_INFOS.Inactive_Documents_Project,
      '/project-management/clients/details/inactivedocuments': MODULE_INFOS.Inactive_CLIENT_Documents_INFO,
      '/project-management/timesheet/mytimesheet': MODULE_INFOS.My_Timesheet_MODULE_INFO,
      '/project-management/timesheet/teamtimesheet': MODULE_INFOS.Team_Timesheet_MODULE_INFO,
      '/project-management/timesheet/mysummary': MODULE_INFOS.My_Timesheet_Summary_view,
      '/project-management/timesheet/summary': MODULE_INFOS.Team_Timesheet_Summary_view,
      '/project-management/clients/details/timesheet/summary': MODULE_INFOS.CLIENT_Summary_view,
      '/project-management/clients/details/timesheet/detailed': MODULE_INFOS.CLIENT_Detalied_view,
      '/project-management/projects/details/timesheet/resource-summary': MODULE_INFOS.Resource_Summary,
      '/project-management/clients/details/timesheet/resource-summary': MODULE_INFOS.Resource_Summary,
      '/project-management/clients/details/timesheet/phases': MODULE_INFOS.Resource_Summary,
      '/project-management/projects/details/phases': MODULE_INFOS.PROJECT_PHASE_MODULE_INFO,
      '/project-management/projects/details/inactive-phases': MODULE_INFOS.PROJECT_PHASE_MODULE_INFO_Inactive,
      '/project-management/projects/details/hold-phases': MODULE_INFOS.PROJECT_PHASE_MODULE_INFO_Hold
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  ComponentnameDisplay() {
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl === '/project-management/clients/active') {
      this.componentname = 'Active Clients';
    }
    else if (currentUrl === '/project-management/clients/inactive') {
      this.componentname = 'Inactive Clients';
    }
    else if (currentUrl === '/project-management/clients/add/info') {
      this.componentname = 'Add Client';
    }
    else if (currentUrl === '/project-management/clients/add/contact-info') {
      this.componentname = 'Add Client';
    }
    else if (currentUrl === '/project-management/clients/add/documents') {
      this.componentname = 'Add Client';
    }
    else if (currentUrl === '/project-management/clients/add/nda') {
      this.componentname = 'Add Client';
    }
    else if (currentUrl === '/project-management/clients/add/msa') {
      this.componentname = 'Add Client';
    }
    else if (currentUrl === '/project-management/clients/details/info') {
      this.componentname = 'Client Information';
    }
    else if (currentUrl === '/project-management/clients/details/contact-info') {
      this.componentname = 'Contact Information';
    }
    else if (currentUrl === '/project-management/clients/details/projects') {
      this.componentname = 'Active Projects';
    }

    else if (currentUrl === '/project-management/clients/details/inactiveprojects') {
      this.componentname = 'Inactive Projects';
    }
    else if (currentUrl === '/project-management/clients/details/hold') {
      this.componentname = 'On Hold Projects';
    }
    else if (currentUrl === '/project-management/clients/details/resources') {
      this.componentname = 'Active Resources';
    }
    else if (currentUrl === '/project-management/clients/details/inactive-resources') {
      this.componentname = 'Inactive Resources';
    }
    else if (currentUrl === '/project-management/clients/details/timesheet/summary' || currentUrl === '/project-management/clients/details/timesheet/detailed') {
      this.componentname = 'Timesheets';
    }
    else if (currentUrl === '/project-management/clients/details/documents') {
      this.componentname = 'Active Documents';
    }
    else if (currentUrl === '/project-management/clients/details/inactivedocuments') {
      this.componentname = 'Archived Documents';
    }
    else if (currentUrl === '/project-management/projects/active') {
      this.componentname = 'Active Projects';
    }
    else if (currentUrl === '/project-management/projects/inactive') {
      this.componentname = 'Inactive Projects';
    }
    else if (currentUrl === '/project-management/projects/hold') {
      this.componentname = 'On Hold Projects';
    }
    else if (currentUrl === '/project-management/projects/details/information') {
      this.componentname = 'Project Information';
    }
    else if (currentUrl === '/project-management/projects/details/contact-info') {
      this.componentname = 'Contact Information';
    }
    else if (currentUrl === '/project-management/projects/details/resources') {
      this.componentname = 'Active Resources';
    }
    else if (currentUrl === '/project-management/projects/details/inactive-resources') {
      this.componentname = 'Inactive Resources';
    }
    else if (currentUrl === '/project-management/projects/details/timesheet/summary' || currentUrl === '/project-management/projects/details/timesheet/detailed') {
      this.componentname = 'Timesheets';
    }
    else if (currentUrl === '/project-management/projects/details/documents') {
      this.componentname = 'Active Documents';
    }
    else if (currentUrl === '/project-management/projects/details/inactivedocuments') {
      this.componentname = 'Archived Documents';
    }
    else if (currentUrl === '/project-management/timesheet/mytimesheet') {
      this.componentname = 'My Timesheets';
    }
    else if (currentUrl === '/project-management/timesheet/teamtimesheet') {
      this.componentname = 'Team Timesheets';
    }
    else if (currentUrl === '/project-management/timesheet/summary') {
      this.componentname = 'Timesheet Summary';
    }
    else if (currentUrl === '/project-management/timesheet/mysummary') {
      this.componentname = 'My Timesheet Summary';
    }
    else if (currentUrl === '/project-management/projects/details/phases') {
      this.componentname = 'Active Phases / Milestones';
    }
    else if (currentUrl === '/project-management/projects/details/inactive-phases') {
      this.componentname = 'Inactive Phases / Milestones';
    }
    else if (currentUrl === '/project-management/projects/details/hold-phases') {
      this.componentname = ' On Hold Phases / Milestones';
    }
    else if (currentUrl === '/project-management/clients/details/timesheet/resource-summary' ||
      '/project-management/projects/details/timesheet/resource-summary') {
      this.resourceDataids = JSON.parse(localStorage.getItem('resourceData') || '{}');
      const employeeId = this.resourceDataids?.employeeId;
      if (employeeId) {
        this.getEmployeeId(employeeId, currentUrl);
      }
    }
  }

  getEmployeeId(employeeId: any, currentUrl: string) {
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employename = data;
        const fullName = `${this.employename.firstName || ''} ${this.employename.middleName || ''} ${this.employename.lastName || ''}`.trim();
        if (currentUrl === '/project-management/projects/details/timesheet/resource-summary' ||
          currentUrl === '/project-management/clients/details/timesheet/resource-summary') {
          this.componentname = fullName || 'Employee';
        }
      },
      error: (reason) => {
        console.error(reason);
      },
    });
  }

  isShowClientRoute(): boolean {
    const showPaths = [
      '/project-management/clients/details',


    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowProjectRoute(): boolean {
    const showPaths = [
      '/project-management/projects/details',

    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetforteamRoute(): boolean {
    const showPaths = [
      '/project-management/timesheet/summary',
    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetformyRoute(): boolean {
    const showPaths = [
      '/project-management/timesheet/mysummary',
    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetforresourceclient(): boolean {
    const showPaths = [
      '/project-management/clients/details/timesheet/resource-summary',
    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetforresourceproject() {
    const showPaths = [
      '/project-management/projects/details/timesheet/resource-summary',
    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isHideInfo(): boolean {
    const hidePaths = [
      '/project-management/clients/add'
    ];
    return hidePaths.some(path => this.router.url.startsWith(path));
  }

  navigateClient() {
    this.router.navigate(['project-management/clients/active']);
    localStorage.removeItem('clientProjectId');
    localStorage.removeItem('projectProjectId');
  }



  navigatetoteam() {
    this.router.navigate(['project-management/timesheet/teamtimesheet']);
  }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  navigatetodetaliedtoclicent() {
    const clientProjectId = localStorage.getItem('clientProjectId');
    this.router.navigate(['project-management/clients/details/timesheet/detailed'], { queryParams: { id: clientProjectId } });
    localStorage.removeItem('clientProjectId');
    localStorage.removeItem('projectProjectId');
  }

  navigatetodetaliedtoproject() {
    this.router.navigate(['/project-management/projects/details/timesheet/detailed'], { queryParams: { id: this.resourceDataids?.projectId } });
    localStorage.removeItem('projectProjectId');
  }

  navigationtoclientinfo() {
    this.router.navigate(['/project-management/clients/details/info'], { queryParams: { id:  this.storeclientId } });
  }
  navigateProject() {
    const clientProjectId = localStorage.getItem('clientProjectId');
    if (clientProjectId) {
      // Navigate to the client project details route with the stored id
      this.router.navigate([`project-management/clients/details/projects`], { queryParams: { id: clientProjectId } });
      // localStorage.removeItem('clientProjectId'); // Optional: clear after navigation
    } else {
      // Default navigation
      this.router.navigate(['project-management/projects/active']);
      localStorage.removeItem('projectProjectId');
    }
  }
}
