import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeActionService } from '../theme-action.service';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { TranslateModule } from '@ngx-translate/core';
import { MODULE_INFOS } from '../../shared/modules-info';

@Component({
  selector: 'app-theme-layout',
  imports: [CommonModule, RouterModule, NgbPopoverModule, ModuleInfoIconComponent, ModuleInformationComponent, TranslateModule],
  templateUrl: './theme-layout.component.html',
  styleUrl: './theme-layout.component.scss'
})
export class ThemeLayoutComponent {
  navLinks = [
    { label: 'Theme Personalization', route: '/theme/selection', icon: '/personalization/Color Theme.png' },
    { label: 'Menu Personalization', route: '/menus/personalization', icon: '/personalization/Menu Icon.png' },
  ];

  constructor(public router: Router, public themeAction: ThemeActionService) {}

  isColorThemesActive(): boolean {
    return this.router.url.startsWith('/theme/selection');
  }

  isMenusActive(): boolean {
    return this.router.url.startsWith('/menus/');
  }

  getActiveTabLabel(): string {
    return this.isColorThemesActive() ? 'Theme Personalization' : 'Menu Personalization';
  }

  getModuleInfo(): string {
    return this.isColorThemesActive()
      ? MODULE_INFOS.THEME_PERSONALIZATION_MODULE_INFO
      : MODULE_INFOS.MENU_PERSONALIZATION_MODULE_INFO;
  }
}
