import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PredefinedThemesService } from '../../services/theme-service/predefined-themes.service';
import { FormsModule } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-predefined-theme-selection',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './predefined-theme-selection.component.html',
  styleUrl: './predefined-theme-selection.component.scss'
})

export class PredefinedThemeSelectionComponent {
  selectedTheme: string = 'default-theme';
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
  selectedFont: string = 'Roboto-flex';
  confirmedFont: string = "";
  empinfo: any;
  subscription!: Subscription;
  ThemeData: any;

  constructor(private predefinedThemesService: PredefinedThemesService, private openModalService: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getThemeData();
  }

  getThemeData() {
    this.subscription = this.http.getData(`Employeedata/get-user-preference/${this.empinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        this.selectedTheme = data?.data?.['RHR_WEB_Theme'] || 'default-theme';
        this.selectedFont = data?.data?.['RHR_WEB_Font'] || 'Roboto-flex';
        this.predefinedThemesService.setTheme(this.selectedTheme);
        this.predefinedThemesService.setFont(this.selectedFont);
      },
      error: (reason) => {
        this.predefinedThemesService.setTheme('default-theme');
        this.predefinedThemesService.setFont('Roboto-flex');
      },
    });
  }

  selectedThemeColor(theme: string) {
    this.confirmedTheme = theme;
  }

  onThemeChange(): void {
    this.selectedTheme = this.confirmedTheme;
    const payload = {
      employeeId: this.empinfo?.employeeId || 0,
      key: 'RHR_WEB_Theme',
      value: this.selectedTheme
    };

    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.predefinedThemesService.setTheme(this.selectedTheme);
        this.openModalService.openSuccessModal("Theme Applied Successfully");
      },
      error: (err) => {
        console.error('Error saving theme preference:', err);
        this.openModalService.openErrorModal("Failed to apply theme");
      }
    });
  }

  selectedFontFamily(font: string) {
    this.confirmedFont = font;
  }

  applyFont(): void {
    this.selectedFont = this.confirmedFont;
    const payload = {
      employeeId: this.empinfo?.employeeId || 0,
      key: 'RHR_WEB_Font',
      value: this.selectedFont
    };

    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.predefinedThemesService.setFont(this.selectedFont);
        this.openModalService.openSuccessModal("Font Applied Successfully");
      },
      error: (err) => {
        console.error('Error saving font preference:', err);
        this.openModalService.openErrorModal("Failed to apply font");
      }
    });
  }
}