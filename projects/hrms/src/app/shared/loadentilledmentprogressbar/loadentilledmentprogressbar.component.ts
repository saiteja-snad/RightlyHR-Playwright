import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-loadentilledmentprogressbar',
  imports: [CommonModule],
  templateUrl: './loadentilledmentprogressbar.component.html',
  styleUrl: './loadentilledmentprogressbar.component.scss'
})
export class LoadentilledmentprogressbarComponent {
  progress = 0;
  subscription: any;

  constructor(public router: Router) { }

  ngOnInit(): void {
    this.setProgress(this.router.url);
    // listen for route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setProgress(event.urlAfterRedirects);
      }
    });
  }

  setProgress(url: string) {
    if (url.includes('/settings/timeoff-configurations/load-entitlements/load-entitlement-create')) {
      this.progress = 1;   // 25%
    } else if (url.includes('/settings/timeoff-configurations/load-entitlements/load-entitlement-preview')) {
      this.progress = 2;   // 50%
    } else if (url.includes('/settings/timeoff-configurations/load-entitlements/load-entitlement-map-categoery')) {
      this.progress = 3;   // 75%
    } else if (url.includes('/settings/timeoff-configurations/load-entitlements/load-entitlement-execution')) {
      this.progress = 4;   // 100%
    } else {
      this.progress = 0;   // default
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
