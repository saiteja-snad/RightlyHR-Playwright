import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-personalinfo-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './personalinfo-header-tabs.component.html',
  styleUrl: './personalinfo-header-tabs.component.scss'
})
export class PersonalinfoHeaderTabsComponent implements OnInit {
  navTabs: any[] = [
    { label: 'Personal', link: '/personalinfo/personal',permission: { feature: 'Employee Info Personal Tab', action: 'view' },},
    { label: 'Job', link: '/personalinfo/job',permission: { feature: 'Employee Info Job Tab', action: 'view' },},
    { label: 'Documents', link: '/personalinfo/documents',permission: { feature: 'Employee Info Documents Tab', action: 'view' },},
    { label: 'Team Members', link: '/personalinfo/team-members',permission: { feature: 'Employee Info Team Members Tab', action: 'view' } },
   
  ];

  constructor(private rbac: RbacService) {}
  
    ngOnInit(): void {
      this.navTabs = this.navTabs.filter(
        (tab) =>
          tab.permission &&
          tab.permission.feature &&
          tab.permission.action &&
          this.rbac.allowedToAccess(
            `${tab.permission.feature}.${tab.permission.action}`
          )
      );
    }
}
