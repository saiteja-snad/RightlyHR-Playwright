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
    if (url.includes('/settings/timeoff-configurations/loadentitlements/load-entitlement-create')) {
      this.progress = 1;   // 33%
    } else if (url.includes('/settings/timeoff-configurations/loadentitlements/load-entitlement-preview')) {
      this.progress = 2;   // 66%
    } else if (url.includes('/settings/timeoff-configurations/loadentitlements/load-entitlement-execution')) {
      this.progress = 3;   // 100%
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
