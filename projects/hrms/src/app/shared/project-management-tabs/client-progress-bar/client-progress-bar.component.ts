import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-client-progress-bar',
  imports: [CommonModule],
  templateUrl: './client-progress-bar.component.html',
  styleUrl: './client-progress-bar.component.scss'
})

export class ClientProgressBarComponent {
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
    if (url.includes('/project-management/clients/add/info')) {
      this.progress = 1;   // 33%
    } else if (url.includes('/project-management/clients/add/contact-info')) {
      this.progress = 2;   // 66%
    } else if (url.includes('/project-management/clients/add/documents')) {
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