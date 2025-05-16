import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { AccessNavigationService } from '../../services/access-navigation.service';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})

export class SidenavComponent {
  @ViewChild('logoutpopup') logoutpopup: any;
  spinnerLoader = false;
  constructor(private authService: AuthService, private modalservie: NgbModal, public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) {
  }

  onLogout() {
    this.authService.removeToken()
    localStorage.clear()
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout"
  }

  clearPersonalInfoStorage() {
    if (localStorage.getItem('personaldata')) {
      this.refreshRoute('/personalinfo/personal/basic-info');
      localStorage.removeItem('personaldata');
    }
   
    this.goToAccessibleRoute('/personalinfo');
    localStorage.getItem('rightlyHrUser')

  }

  refreshRoute(route: string) {
    // Navigate to a dummy route and then back to the desired route
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([route]);
    });
  }

  hasPersonalData(): boolean {
    const data = localStorage.getItem('personaldata');
    return data !== null && data.trim() !== '';
  }

  close() {
    this.modalservie.dismissAll();
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true });
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  isActiveRoutePms(): boolean {
    const currentUrl = this.router.url;
    return (
      currentUrl === '/pms/review-cycle' ||
      currentUrl === '/pms/apprisal' || currentUrl === '/pms/myPerformance/pending-review' ||
      currentUrl === '/pms/myPerformance/completed-review' || currentUrl === '/pms/team-performance/pending-review' ||
      currentUrl === '/pms/team-performance/completed-review' || currentUrl === '/pms/assessment-form'
    );
  }

}
