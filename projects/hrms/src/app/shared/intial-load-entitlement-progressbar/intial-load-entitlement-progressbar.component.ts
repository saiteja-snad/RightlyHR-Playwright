import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intial-load-entitlement-progressbar',
  imports: [CommonModule, NgbPopoverModule],
  templateUrl: './intial-load-entitlement-progressbar.component.html',
  styleUrl: './intial-load-entitlement-progressbar.component.scss'
})
export class IntialLoadEntitlementProgressbarComponent implements OnInit, OnDestroy {
  progress = 0;
  isContentVisible = false;
  progressWidth = 33.3;
  scopeData: any = {};
  subscription: any;

  constructor(public router: Router, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setProgress(this.router.url);
    this.loadScopeData();
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setProgress(event.urlAfterRedirects);
        this.loadScopeData();
      }
    });
  }

  setProgress(url: string) {
    if (url.includes('intial-load-entitlement-create')) {
      this.progress = 1;
    } else if (url.includes('intial-load-entitlement-breakdown')) {
      this.progress = 2;
    } else if (url.includes('intial-load-entitlement-preview')) {
      this.progress = 3;
    } else {
      this.progress = 0;
    }
  }

  loadScopeData(): void {
    const stored = localStorage.getItem('intialloadEntitlement');
    if (stored) {
      const data = JSON.parse(stored);
      this.scopeData = {
        year: data?.year,
        locationName: data?.location?.jobLocationName,
        subLocationName: data?.subLocation?.jobSubLocationName,
        shiftName: data?.shift?.shiftName,
        frequencyType: data?.frequencyType,
        cycleHandling: data?.cycleHandling,
      };
    }
  }

  formatLabel(value: string): string {
    if (!value) return '';
    return value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  getStepClass(step: number): string {
    if (this.progress > step) return 'step-completed';
    if (this.progress === step) return 'step-current';
    return 'step-upcoming';
  }

  getCircleClass(step: number): string {
    if (this.progress > step) return 'circle-completed';
    if (this.progress === step) return 'circle-current';
    return 'circle-upcoming';
  }

  getTextClass(step: number): string {
    if (this.progress > step) return 'text-completed';
    if (this.progress === step) return 'text-current';
    return 'text-upcoming';
  }

  toggleContent(event: Event): void {
    event.stopPropagation();
    this.isContentVisible = !this.isContentVisible;
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isContentVisible = false;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
