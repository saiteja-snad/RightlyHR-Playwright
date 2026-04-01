import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
import { HelpdeskManagementConfigTabsComponent } from '../helpdesk-management-config-tabs/helpdesk-management-config-tabs.component';
import { ModuleInfoIconComponent } from "../../../icons/module-info-icon/module-info-icon.component";
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule, Location } from '@angular/common';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
@Component({
  selector: 'app-helpdesk-management-config-layout',
  imports: [CommonModule, RouterOutlet, HelpdeskManagementConfigTabsComponent, NgbPopoverModule, SettingsHeaderComponent, ModuleInfoIconComponent, TranslateModule, ModuleInformationComponent],
  templateUrl: './helpdesk-management-config-layout.component.html',
  styleUrl: './helpdesk-management-config-layout.component.scss'
})
export class HelpdeskManagementConfigLayoutComponent {
popContent:any;
  moduleName: string = '';
  componentName: string = '';
  navigationname: string = '';
  moduleinfo: string = '';
  subscription!: Subscription;
  jobid: any;
  jobSummary: any = {};
  jobSequenceId!: string;
  destroy$ = new Subject<void>();
  routeToInfoMap!: { [key: string]: string };
  constructor(public router: Router, public rbac: RbacService, private route: ActivatedRoute, private http: HttpService, private location: Location) { }


 ngOnInit(): void {
  this.ComponentnameDisplay();
   this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
}

ComponentnameDisplay() {

  const allNavLinks = [
    { label: 'Category', route: '/settings/helpdesk-management-config/categeory' },
    { label: 'Subcategory', route: '/settings/helpdesk-management-config/subcategeory' },
  ];

  // Set default
  this.componentName = 'Category';

  this.router.events
    .pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe(() => {

      const currentUrl = this.router.url;

      const matchedRoute = allNavLinks.find(link =>
        currentUrl.includes(link.route)
      );

      this.componentName = matchedRoute ? matchedRoute.label : 'Category';

    });
  }
 navigateToSettings() {
    this.router.navigate(['/settings'])
  }
 // update the module info
  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/helpdesk-management-config/categeory': MODULE_INFOS.CATEGEORY_MODULE_INFO,
      '/settings/helpdesk-management-config/subcategeory': MODULE_INFOS.SUBCATEGORY_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  // update the module info end
}
