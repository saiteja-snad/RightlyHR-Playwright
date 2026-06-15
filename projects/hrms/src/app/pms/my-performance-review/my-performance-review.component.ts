import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MyPerformanceTabsComponent } from "../../shared/pms-module-tabs/my-performance-tabs/my-performance-tabs.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { PerformaceReviewTabsComponent } from "../../shared/pms-module-tabs/performace-review-tabs/performace-review-tabs.component";
import { ApplicablePoliciesTriggerComponent } from '../../shared/policies/applicable-policies-trigger/applicable-policies-trigger.component';
import { APPLICABLE_POLICIES_KEYS } from '../../shared/policies/policy-visibility.catalog';

@Component({
  selector: 'app-my-performance-review',
  imports: [RouterOutlet, MyPerformanceTabsComponent, TranslateModule, ModuleInformationComponent, NgbPopoverModule,
    ModuleInfoIconComponent, PerformaceReviewTabsComponent, ApplicablePoliciesTriggerComponent],
  templateUrl: './my-performance-review.component.html',
  styleUrl: './my-performance-review.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class MyPerformanceReviewComponent implements OnInit {
  applicablePolicies = APPLICABLE_POLICIES_KEYS.PMS_PERFORMANCE_REVIEW;
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
      '/pms/performace-review/myPerformance': MODULE_INFOS.PMS_MY_PERFORMACE_REVIEW_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}
