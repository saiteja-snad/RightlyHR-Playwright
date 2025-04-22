import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-setting-dynamic-forms-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './setting-dynamic-forms-tabs.component.html',
  styleUrl: './setting-dynamic-forms-tabs.component.scss'
})
export class SettingDynamicFormsTabsComponent {
  navTabs: any[] = [
    { label: 'Active Forms', link: '/settings/dynamic-forms/active-forms' },
    { label: 'Inactive Forms', link: '/settings/dynamic-forms/inactive-forms' },
    { label: 'Draft Forms', link: '/settings/dynamic-forms/draft-forms' },
    { label: 'Form Settings', link: '/settings/dynamic-forms/form-settings' },
  ];

}
