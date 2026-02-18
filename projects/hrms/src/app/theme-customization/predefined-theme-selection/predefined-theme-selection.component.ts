import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PredefinedThemesService } from '../../services/theme-service/predefined-themes.service';
import { FormsModule } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-predefined-theme-selection',
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './predefined-theme-selection.component.html',
  styleUrl: './predefined-theme-selection.component.scss'
})

export class PredefinedThemeSelectionComponent {
  selectedTheme: string = localStorage.getItem('selected-theme') || 'default-theme';
  themes = [
    { name: 'Default', value: 'default-theme', class: 'default-preview' },
    { name: 'Lavender', value: 'lavendar-theme', class: 'lavendar-preview' },
    { name: 'Navy Blue', value: 'navy-blue-theme', class: 'navy-blue-preview' },
    { name: 'Teal', value: 'teal-theme', class: 'teal-preview' },
    { name: 'Blue', value: 'blue-theme', class: 'blue-preview' },
    { name: 'Copper Wood', value: 'copper-wood-theme', class: 'copper-wood-preview' },
    { name: 'Royal Blue', value: 'royal-blue-theme', class: 'royal-blue-preview' },
    { name: 'Black', value: 'black-theme', class: 'black-preview' },
    { name: 'Enchanted Wine', value: 'enchanted-wine-theme', class: 'enchanted-wine-preview' },
    { name: 'Flare Red', value: 'flare-red-theme', class: 'flare-red-preview' },
    { name: 'Dark Slate Blue', value: 'dark-slate-theme', class: 'dark-slate-preview' },
    { name: 'Warm Brown', value: 'warm-brown-theme', class: 'warm-brown-preview' },
  ];
  confirmedTheme: string = "";
  //Fonts
  fonts = [
    { name: 'Roboto Flex', value: 'Roboto-flex' },
    { name: 'DM Sans', value: 'DM-SANS' },
    { name: 'DM Sans Italics', value: 'DM-SANS-italics' },
    { name: 'Lexend', value: 'LEXEND' },
  ];
  selectedFont: string = localStorage.getItem('selected-font') || 'Roboto-flex';
  confirmedFont: string = "";

  constructor(private predefinedThemesService: PredefinedThemesService, private openModalService: OpenModalService) { }

  ngOnInit(): void {
    this.predefinedThemesService.initTheme();
  }

  selectedThemeColor(theme: string) {
    this.confirmedTheme = theme;
  }

  onThemeChange(): void {
    this.selectedTheme = this.confirmedTheme;
    setTimeout(() => {
      this.openModalService.openSuccessModal("Theme Applied Successfully");
      this.predefinedThemesService.setTheme(this.selectedTheme);
    }, 500);
  }

  selectedFontFamily(font: string) {
    this.confirmedFont = font;
  }

  applyFont(): void {
    this.selectedFont = this.confirmedFont;
    setTimeout(() => {
      this.openModalService.openSuccessModal("Font Applied Successfully");
      this.predefinedThemesService.setFont(this.selectedFont);
    }, 500);
  }
}