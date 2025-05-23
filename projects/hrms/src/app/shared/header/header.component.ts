import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  empinfo: any;
  imageUrl: any;
  subscription!: Subscription;

  constructor(public readonly router: Router, private http: HttpService, private sanitizer: DomSanitizer,
    public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.imageUrl = this.empinfo.profileUrl;
    this.onSelectprofilePicDownload(this.empinfo);
    this.http.profliepicadd$.subscribe(() => {
      this.imageUrl = this.empinfo.profileUrl;
    this.onSelectprofilePicDownload(this.empinfo);
    });
  }

  onSelectprofilePicDownload(employee: any) {
    if (employee.profileUrl) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl).subscribe({
        next: (res: any) => {
          let blob = new Blob([res['body']], { type: 'image/png' });
          let objectURL = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: (reason) => {
          //console.log(reason),
        }
      });
    }
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  showPmsTabs(): boolean {
    const includeRoutes = [
      '/pms/review-cycle',
      '/pms/review-cycle/create',
      '/pms/review-cycle/update',
      '/pms/review-cycle/view',
      '/pms/apprisal',
      '/pms/myPerformance/pending-review',
      '/pms/myPerformance/completed-review',
      '/pms/team-performance/pending-review',
      '/pms/team-performance/completed-review',
    ];
    return includeRoutes.includes(this.router.url);
  }

  showPmsConfigurationTabs(): boolean {
    const includeRoutes = [
      '/pmsconfiguration/assessor',
      '/pmsconfiguration/increment',
    ];
    return includeRoutes.includes(this.router.url);
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedHeaderRoute(route);
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