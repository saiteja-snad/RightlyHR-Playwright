import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-skillset-management-layout',
  imports: [RouterModule, CommonModule, ModuleInformationComponent, TranslateModule,NgbPopoverModule],
  templateUrl: './skillset-management-layout.component.html',
  styleUrl: './skillset-management-layout.component.scss'
})

export class SkillsetManagementLayoutComponent {
  constructor(private router: Router, public rbac: RbacService) { }
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  componentname: string = '';


    ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/skill-management/directory': MODULE_INFOS.SKILLSET_MANAGEMENT_DIRECTORY_MODULE_INFO,
      '/skill-management/dashboard': MODULE_INFOS.SKILLSET_MANAGEMENT_DASHBOARD_MODULE_INFO,
      
    };
    const matchedEntry = Object.entries(this.routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  ComponentnameDisplay() {
  
    
    if (this.router.url === '/skill-management/dashboard') {
      this.componentname = 'Skill Set Dashboard';
    }
    else if (this.router.url === '/skill-management/directory') {
      this.componentname = 'Skill Set Directory';
    }

  }
}