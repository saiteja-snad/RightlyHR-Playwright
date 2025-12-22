import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme-service/theme.service';
import { PredefinedThemesService } from './services/theme-service/predefined-themes.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  title = 'hrms';

  constructor(private themeService: ThemeService,private translate: TranslateService, private predefinedThemesService: PredefinedThemesService) {
   
   }

  ngOnInit(): void {
    this.predefinedThemesService.initTheme();
    // const storedTheme = this.themeService.getStoredThemeColors();
    // if (storedTheme) {
    //  this.themeService.applyStoredThemeColors(storedTheme);
    // }
    const savedLang = localStorage.getItem('lang') || 'english';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }
}