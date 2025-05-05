import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-expenes-configurtions-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './settings-expenes-configurtions-tabs.component.html',
  styleUrl: './settings-expenes-configurtions-tabs.component.scss'
})
export class SettingsExpenesConfigurtionsTabsComponent {
  navTabs: any[] = [
    { label: 'Expenses Configuartion', route: '/settings/employee-fields/expenes/configuartion' },
    { label: 'Expenses Allowed Days', route: '/settings/employee-fields/expenes/allowed-days' },

  ]


  
}
