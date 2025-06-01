import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ItsupportCompomentTabsComponent } from "../../shared/itsupport-compoment-tabs/itsupport-compoment-tabs.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ItsuporrtHeaderTabsComponent } from "../../shared/itsuporrt-header-tabs/itsuporrt-header-tabs.component";
@Component({
  selector: 'app-team-tickets',
  imports: [RouterModule, ItsupportCompomentTabsComponent, NgbPopoverModule, ModuleInformationComponent, ItsuporrtHeaderTabsComponent],
  templateUrl: './team-tickets.component.html',
  styleUrl: './team-tickets.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class TeamTicketsComponent implements OnInit {
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