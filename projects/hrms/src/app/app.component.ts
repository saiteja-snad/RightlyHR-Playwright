import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PredefinedThemesService } from './services/theme-service/predefined-themes.service';
import { MenuOrderService } from './services/theme-service/menu-order.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'hrms';

  constructor(
    private translate: TranslateService,
    private predefinedThemesService: PredefinedThemesService,
    private menuOrderService: MenuOrderService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.predefinedThemesService.initAppearance();
    await this.predefinedThemesService.initTheme();
    await this.predefinedThemesService.initFont();
    await this.menuOrderService.initMenuOrder();
    const savedLang = localStorage.getItem('lang') || 'english';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }
}
