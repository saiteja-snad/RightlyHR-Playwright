import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TeamPerformanceTabsComponent } from "../../shared/pms-module-tabs/team-performance-tabs/team-performance-tabs.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';

@Component({
  selector: 'app-team-performance-review',
  imports: [RouterOutlet, TeamPerformanceTabsComponent, ModuleInformationComponent],
  templateUrl: './team-performance-review.component.html',
  styleUrl: './team-performance-review.component.scss'
})
export class TeamPerformanceReviewComponent implements OnInit {
  moduleinfo : string = '';

  constructor(public readonly router: Router){

  }

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
      '/pms/team-performance': MODULE_INFOS.PMS_MY_TEAM_PERFORMACE_REVIEW_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

}
