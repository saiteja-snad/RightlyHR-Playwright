import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeActionService } from '../theme-action.service';

@Component({
  selector: 'app-theme-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './theme-layout.component.html',
  styleUrl: './theme-layout.component.scss'
})
export class ThemeLayoutComponent {
  navLinks = [
    { label: 'Color Themes', route: '/theme/selection', icon: '/time-off-icon/leaves-icon.png' },
    { label: 'Side Menus', route: '/menus/personalization', icon: '/time-off-icon/WFH-icon.png' },
  ];

  constructor(public router: Router, public themeAction: ThemeActionService) {}

  isColorThemesActive(): boolean {
    return this.router.url.startsWith('/theme/selection');
  }

  isMenusActive(): boolean {
    return this.router.url.startsWith('/menus/');
  }
}
