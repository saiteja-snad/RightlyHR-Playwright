import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-skill-set-main-tabs',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule],
  templateUrl: './skill-set-main-tabs.component.html',
  styleUrl: './skill-set-main-tabs.component.scss'
})

export class SkillSetMainTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Dashboard', link: '/skill-management/dashboard', icon: 'main-menu-icons/skill-dashboard.png',
      permission: { feature: 'Skills Dashboard', action: 'view' } },
    { label: 'Directory', link: '/skill-management/directory', icon: 'main-menu-icons/skill-directory.png',
      permission: { feature: 'Skills Directory', action: 'view' } },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}