import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-pms-settings-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './pms-settings-tabs.component.html',
  styleUrl: './pms-settings-tabs.component.scss'
})
export class PmsSettingsTabsComponent {
  navTabs: any[] = [
    { label: 'Increment Percentage', link: '/pmsconfiguration/increment' },
    { label: 'Assessor Configuration', link: '/pmsconfiguration/assessor' },
  ];
}
