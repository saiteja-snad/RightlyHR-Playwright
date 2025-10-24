import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-wfh-allocation-tabs',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule,],
  templateUrl: './wfh-allocation-tabs.component.html',
  styleUrl: './wfh-allocation-tabs.component.scss'
})
export class WfhAllocationTabsComponent {
navTabs = [
    { label: 'Active Allocations', icon: '/desk-icon/details-icon.png', route: '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation', },
    { label: 'Allocation History', icon: '/desk-icon/History-icon.png', route: '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation-view', },
  ];
}
