import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-main-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './settings-main-header-tabs.component.html',
  styleUrl: './settings-main-header-tabs.component.scss'
})

export class SettingsMainHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Employee Fields', link: '/settings/employee-fields' },
    { label: 'Roles', link: '/settings/roles-permissions' },

    { label: 'Asset Configuration',link:'/settings/assets-configuration' },
    { label: 'Dynamic Forms', link: '/settings/dynamic-forms' }

  ];
}