import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { HttpService } from '../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-team-members-tabs',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './team-members-tabs.component.html',
  styleUrl: './team-members-tabs.component.scss'
})

export class TeamMembersTabsComponent {
  filteredTabs: any[] = [];
  empinfo: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    { label: 'Reports to you', link: '/personalinfo/job/my-team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'Employee Info My Team Members Tab', action: 'view' }, count: 0 },
    { label: 'Works with you', link: '/personalinfo/job/team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'Employee Info Team Members Tab', action: 'view' }, count: 0 },
  ];

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService, private http: HttpService) { }

  ngOnInit(): void {
    // this.filterTabsByRbac();
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
    this.getEmpInfoFromRoute();
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getResourceDetails();
      this.getAllTeammembersList();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getResourceDetails();
      this.getAllTeammembersList();
    }
  }
  myteamcount: any;
  updateTabCount(label: string, count: number) {
    const tab = this.navTabs.find(t => t.label === label);
    if (tab) tab.count = count;
  }
  getResourceDetails(): void {

    let url = `v2/Employeedata/GetReporteesAndTeamMembersReportees/${this.empinfo.employeeId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const count = Array.isArray(res) ? res.length : 0;
        this.updateTabCount('Reports to you', count);
      },
      error: (err: any) => {

      }
    });
  }

  getAllTeammembersList() {
    let url = `Employeedata/getEmployeesByhierarchy/${this.empinfo.employeeId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const count = Array.isArray(res) ? res.length : 0;
        this.updateTabCount('Works with you', count);
      },
      error: (err: any) => {

      }
    });
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}