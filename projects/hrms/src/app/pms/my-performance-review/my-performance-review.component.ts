import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MyPerformanceTabsComponent } from "../../shared/pms-module-tabs/my-performance-tabs/my-performance-tabs.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PmsTabsComponent } from "../../shared/pms-module-tabs/pms-tabs/pms-tabs.component";

@Component({
  selector: 'app-my-performance-review',
  imports: [RouterOutlet, MyPerformanceTabsComponent, TranslateModule, ModuleInformationComponent, NgbPopoverModule, PmsTabsComponent],
  templateUrl: './my-performance-review.component.html',
  styleUrl: './my-performance-review.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class MyPerformanceReviewComponent implements OnInit{
  moduleinfo : string = '';

  constructor(public readonly router: Router){}
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
      '/pms/myPerformance': MODULE_INFOS.PMS_MY_PERFORMACE_REVIEW_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

}
