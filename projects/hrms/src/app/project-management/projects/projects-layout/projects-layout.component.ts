import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

@Component({
  selector: 'app-projects-layout',
  imports: [RouterModule, CommonModule],
  template: '<div class="w-100"><router-outlet /></div>',
})
export class ProjectsLayoutComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly accessNav: AccessNavigationService,
    private readonly menuOrderService: MenuOrderService
  ) { }

  ngOnInit(): void {
    void this.redirectIfNeeded();
  }

  private async redirectIfNeeded(): Promise<void> {
    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/project-management/projects') return;

    await this.menuOrderService.ensureLoaded();
    const preferredRoute = this.accessNav.navigateToAccessedRoute('/project-management/projects');

    if (!preferredRoute) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    if (preferredRoute === currentPath) return;
    this.router.navigate([preferredRoute], { queryParamsHandling: 'preserve' });
  }
}
