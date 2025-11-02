import { Component } from '@angular/core';
import { MODULE_INFOS } from '../../modules-info';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../module-information/module-information.component";
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
@Component({
  selector: 'app-project-management-module-info',
  imports: [CommonModule, ModuleInformationComponent, NgbPopoverModule, ModuleInfoIconComponent],
  templateUrl: './project-management-module-info.component.html',
  styleUrl: './project-management-module-info.component.scss'
})

export class ProjectManagementModuleInfoComponent {
  moduleinfo: string = '';
  componentname: string = '';
  clientID: any;
  clients: any = {};
  lastUrl: string = ''
  currentUrl: string = '';
  routeToInfoMap!: { [key: string]: string };
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    const clientProjectId = localStorage.getItem('clientProjectId');
    if (clientProjectId) {
      this.getClientsData(clientProjectId);
      this.clientID = clientProjectId;
    }
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
      },
      error: (err) => {
        this.clients = {};
        console.error('Error fetching clients:', err);
      }
    });
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/project-management/clients/active': MODULE_INFOS.CLIENT_INFO,
      '/project-management/clients/inactive': MODULE_INFOS.CLIENT_INFO,
      '/project-management/projects/active': MODULE_INFOS.PROJECT_Info,
      '/project-management/projects/inactive': MODULE_INFOS.PROJECT_Info,
      '/project-management/time-sheet': MODULE_INFOS.TIME_SHEET_INFO,
      '/project-management/clients/details': MODULE_INFOS.CLIENT_INFORMATION_INFO,
      '/project-management/clients/details/info': MODULE_INFOS.CLIENT_INFORMATION_INFO,
      '/project-management/clients/details/contact-info': MODULE_INFOS.CLIENT_CONATACTDETAILES_INFO,
      '/project-management/clients/details/projects': MODULE_INFOS.CLIENT_Projects_INFO,
      '/project-management/clients/details/inactiveprojects': MODULE_INFOS.CLIENT_Projects_INFO,
      '/project-management/clients/details/resources': MODULE_INFOS.CLIENT_Resource_INFO,
      '/project-management/projects/details/information': MODULE_INFOS.Project_Details_INFO,
      '/project-management/projects/details/contact-info': MODULE_INFOS.Contacts_Related_to_Projects,
      '/project-management/projects/details/documents': MODULE_INFOS.Documents_Project,
      '/project-management/clients/details/documents': MODULE_INFOS.CLIENT_Documents_INFO,
      '/project-management/projects/details/resources': MODULE_INFOS.Resources_Project,
      '/project-management/clients/details/timesheet/summary': MODULE_INFOS.CLIENT_Timesheet_INFO,
      '/project-management/clients/details/timesheet/detailed': MODULE_INFOS.CLIENT_Timesheet_INFO,
      '/project-management/projects/details/timesheet/summary': MODULE_INFOS.Project_Timesheet_INFO,
      '/project-management/projects/details/timesheet/detailed': MODULE_INFOS.Project_Timesheet_INFO,
      '/project-management/projects/details/inactivedocuments': MODULE_INFOS.Inactive_Documents_Project,
      '/project-management/clients/details/inactivedocuments': MODULE_INFOS.Inactive_CLIENT_Documents_INFO
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  ComponentnameDisplay() {
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl === '/project-management/clients/active' || currentUrl === '/project-management/clients/inactive') {
      this.componentname = 'Clients';
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
    else if (currentUrl === '/project-management/clients/details/projects' || currentUrl === '/project-management/clients/details/inactiveprojects') {
      this.componentname = 'Projects';
    }
    else if (currentUrl === '/project-management/clients/details/resources') {
      this.componentname = 'Resources';
    }
    else if (currentUrl === '/project-management/clients/details/timesheet/summary' || currentUrl === '/project-management/clients/details/timesheet/detailed') {
      this.componentname = 'Timesheets';
    }
    else if (currentUrl === '/project-management/clients/details/documents') {
      this.componentname = 'Documents';
    }
    else if (currentUrl === '/project-management/projects/active' || currentUrl === '/project-management/projects/inactive') {
      this.componentname = 'Projects';
    }
    else if (currentUrl === '/project-management/projects/details/information') {
      this.componentname = 'Project Information';
    }
    else if (currentUrl === '/project-management/projects/details/contact-info') {
      this.componentname = 'Contact Information';
    }
    else if (currentUrl === '/project-management/projects/details/resources') {
      this.componentname = 'Resources';
    }
    else if (currentUrl === '/project-management/projects/details/timesheet/summary' || currentUrl === '/project-management/projects/details/timesheet/detailed') {
      this.componentname = 'Timesheets';
    }
    else if (currentUrl === '/project-management/projects/details/documents') {
      this.componentname = 'Documents';
    }
    else if (currentUrl === '/project-management/timesheet/mytimesheet') {
      this.componentname = 'Timesheets';
    }

    else if (currentUrl === '/project-management/timesheet/teamtimesheet') {
      this.componentname = 'Team Timesheets';
    }
    else if (currentUrl === '/project-management/timesheet/summary') {
      this.componentname = 'Timesheet Summary';
    }
  }

  isShowClientRoute(): boolean {
    const showPaths = [
      '/project-management/clients/details',
      '/project-management/clients/add'
    ];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowProjectRoute(): boolean {
    const showPaths = [
      '/project-management/projects/details',
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
    }
  }
}