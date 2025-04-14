import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, AfterViewInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-employee-fields-module-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-employee-fields-module-tabs.component.html',
  styleUrl: './settings-employee-fields-module-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsEmployeeFieldsModuleTabsComponent implements AfterViewInit {
  navTabs: any[] = [
    { label: 'Personal', link: '/settings/employee-fields/personal' },
    { label: 'Job', link: '/settings/employee-fields/job' },
    { label: 'status', link: '/settings/employee-fields/job' },
    { label: 'Document', link: '/settings/employee-fields/job' },
    { label: 'Manage Shifts', link: '/settings/employee-fields/manage-shifts' },
    { label: 'Manage Policies', link: '/settings/employee-fields/manage-policies' },
    { label: 'Manage Holidays', link: '/settings/employee-fields/manage-holidays' },
    { label: 'Manage Weekends', link: '/settings/employee-fields/job' },
    { label: 'Expense Configurations', link: '/settings/employee-fields/job' },
    { label: 'Manage DST', link: '/settings/employee-fields/job' },
    { label: 'No Due Clearance', link: '/settings/employee-fields/job' }
  ];

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit() {
    // Apply styles directly to navigation elements
    setTimeout(() => {
      this.fixNavigationButtonStyles();
    }, 100);
  }

  private fixNavigationButtonStyles() {
    // Find all tab navigation buttons and apply styles directly
    const navButtons = document.querySelectorAll('.p-tabview-nav-prev, .p-tabview-nav-next, .p-tablist-prev-button, .p-tablist-next-button');

    navButtons.forEach(button => {
      this.renderer.setStyle(button, 'background-color', '#ffffff');

      // Apply styles to all child elements
      const children = button.querySelectorAll('*');
      children.forEach(child => {
        this.renderer.setStyle(child, 'background-color', '#ffffff');
      });
    });
  }
}