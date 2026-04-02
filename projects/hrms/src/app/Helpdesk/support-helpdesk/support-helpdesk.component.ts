import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule,ActivatedRoute } from '@angular/router';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { HelpdeskHeaderTabsComponent } from '../../shared/helpdesk-header-tabs/helpdesk-header-tabs.component';
import { HelpdeskComponentTabsComponent } from '../../shared/helpdesk-component-tabs/helpdesk-component-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-support-helpdesk',
imports: [RouterModule, NgbPopoverModule,TranslateModule,CommonModule, ModuleInformationComponent,ModuleInfoIconComponent,HelpdeskHeaderTabsComponent,HelpdeskComponentTabsComponent],
  templateUrl: './support-helpdesk.component.html',
  styleUrl: './support-helpdesk.component.scss'
})
export class SupportHelpdeskComponent {
 moduleinfo: string = '';
  hideTabs: any;
  showLeftTabs: any;
  constructor(public readonly router: Router, private route: ActivatedRoute ) { }

  ngOnInit(): void {
   this.checkChildRoute();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkChildRoute();
      });
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }
checkChildRoute() {
    const child = this.route.firstChild;
    const childPath = child?.snapshot.url[0]?.path;

    // Hide only for teamqueries route
    this.hideTabs = childPath === 'teamqueries';
  }
  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/help-desk/support-desk': MODULE_INFOS.HELP_DESK_TEAM_QUERIES
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}