import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-intial-load-entitlement-progressbar',
  imports: [CommonModule],
  templateUrl: './intial-load-entitlement-progressbar.component.html',
  styleUrl: './intial-load-entitlement-progressbar.component.scss'
})
export class IntialLoadEntitlementProgressbarComponent {
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
    if (url.includes('/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-create')) {
      this.progress = 1;   // 25%
    } else if (url.includes('/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-preview')) {
      this.progress = 2;   // 50%
    } else if (url.includes('/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-execution')) {
      this.progress = 3;   // 75%
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
