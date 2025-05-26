import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { PendingApprovalsTabsComponent } from "../../shared/time-off-module-tabs/pending-approvals-tabs/pending-approvals-tabs.component";
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, PendingApprovalsTabsComponent, TranslateModule, ModuleInformationComponent],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class PendingApprovalsComponent implements OnInit {
  moduleinfo : string = '';
  constructor(public router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/pending-approvals': MODULE_INFOS.TIME_OFF_PENDING_APPROVAL_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  navigate(){
    this.router.navigate(['/time-off/pending-approvals/probation-request']);
  }

}