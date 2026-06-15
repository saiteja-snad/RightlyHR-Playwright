import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ItsupportCompomentTabsComponent } from "../../shared/itsupport-compoment-tabs/itsupport-compoment-tabs.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ItsuporrtHeaderTabsComponent } from "../../shared/itsuporrt-header-tabs/itsuporrt-header-tabs.component";
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';

import { TranslateModule } from '@ngx-translate/core';
import { ApplicablePoliciesTriggerComponent } from '../../shared/policies/applicable-policies-trigger/applicable-policies-trigger.component';
import { APPLICABLE_POLICIES_KEYS } from '../../shared/policies/policy-visibility.catalog';
@Component({
  selector: 'app-team-tickets',
  imports: [RouterModule, ItsupportCompomentTabsComponent, NgbPopoverModule, ModuleInformationComponent, ItsuporrtHeaderTabsComponent,ModuleInfoIconComponent,TranslateModule,ApplicablePoliciesTriggerComponent],
  templateUrl: './team-tickets.component.html',
  styleUrl: './team-tickets.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class TeamTicketsComponent implements OnInit {
  applicablePolicies = APPLICABLE_POLICIES_KEYS.IT_SUPORRT_TICKETS;
  moduleinfo: string = '';
  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/it-support/team-tickets': MODULE_INFOS.IT_SUPPORT_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}
