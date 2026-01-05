import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { HttpService } from '../../../services/http.service';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-myinfo-separation-sub-tabs',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './myinfo-separation-sub-tabs.component.html',
  styleUrl: './myinfo-separation-sub-tabs.component.scss'
})
export class MyinfoSeparationSubTabsComponent {
 filteredTabs: any[] = [];
  empinfo: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    { label: 'separation-requests', link: '/myinfo/job/separation-details/separation-requests', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'My Info Separation Request Details', action: 'view' }, count: 0 },
    { label: 'exit-feedback-details', link: '/myinfo/job/separation-details/exit-feedback-details', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'My Info Exit Feedback Details', action: 'view' }, count: 0 },
  ];
  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService, private http: HttpService) { }

  ngOnInit(): void {
     console.log(this.navTabs);
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
    console.log(this.navTabs);
    
   
  }
}
