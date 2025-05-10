import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs'; // Adjust the import path if necessary
import { RouterModule } from '@angular/router';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-events-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './events-tabs.component.html',
  styleUrl: './events-tabs.component.scss'
})

export class EventsTabsComponent {

  filteredTabs: any[] = [];
  constructor(public rbac: RbacService) { }
  
  navTabs: any[] = [
    { label: 'Upcoming Events', link: '/events/upcoming', permission: { feature: 'Events(Upcoming Events)', action: 'view' } },
    { label: 'past Events', link: '/events/past', permission: { feature: 'Events(Past Events)', action: 'view' } },
    { label: 'Published Events', link: '/events/published' },
  ];

  ngOnInit(): void {
    this.filterTabsByRbac();
  }
  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      const value = this.rbac.allowedToAccess(permissionString);
      console.log(value);
      return value;
    });
  }
}
