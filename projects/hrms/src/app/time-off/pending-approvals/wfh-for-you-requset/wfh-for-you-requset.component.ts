import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-wfh-for-you-requset',
  imports: [CommonModule,RouterModule],
  templateUrl: './wfh-for-you-requset.component.html',
  styleUrl: './wfh-for-you-requset.component.scss'
})
export class WfhForYouRequsetComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}
