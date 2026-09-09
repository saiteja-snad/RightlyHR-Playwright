import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PredefinedThemesService } from '../../services/theme-service/predefined-themes.service';
import { FormsModule } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeActionService } from '../theme-action.service';
import { UserPreferenceService } from '../../services/user-preference.service';

@Component({
  selector: 'app-predefined-theme-selection',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './predefined-theme-selection.component.html',
  styleUrl: './predefined-theme-selection.component.scss'
})
export class PredefinedThemeSelectionComponent implements OnInit, OnDestroy {
  selectedAppearance: 'light' | 'dark' | 'system' = 'light';
  confirmedAppearance: 'light' | 'dark' | 'system' | '' = '';
  appearances: { name: string; value: 'light' | 'dark' | 'system'; class: string; icon: string }[] = [
    { name: 'Light', value: 'light', class: 'appearance-light', icon: 'bi-sun' },
    { name: 'Dark', value: 'dark', class: 'appearance-dark', icon: 'bi-moon-stars' },
    { name: 'System', value: 'system', class: 'appearance-system', icon: 'bi-display' }
  ];
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
  confirmedTheme: string = '';
  fonts = [
    { name: 'Roboto Flex', value: 'Roboto-flex' },
    { name: 'DM Sans', value: 'DM-SANS' },
    { name: 'DM Sans Italics', value: 'DM-SANS-italics' },
    { name: 'Lexend', value: 'LEXEND' },
  ];
  selectedFont: string = 'Roboto-flex';
  confirmedFont: string = '';
  empinfo: any;
  subscription!: Subscription;
  private subs: Subscription[] = [];

  constructor(
    private predefinedThemesService: PredefinedThemesService,
    private openModalService: OpenModalService,
    private http: HttpService,
    private themeAction: ThemeActionService,
    private userPrefService: UserPreferenceService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getThemeData();
    this.subs.push(
      this.themeAction.applyAppearance$.subscribe(() => this.onAppearanceChange()),
      this.themeAction.applyTheme$.subscribe(() => this.onThemeChange()),
      this.themeAction.applyFont$.subscribe(() => this.applyFont())
    );
  }

  async getThemeData(forceRefresh = false) {
    try {
      const isManual = localStorage.getItem('RHR_WEB_Appearance_Manual') === 'true';
      const cachedAppearance = (localStorage.getItem('RHR_WEB_Appearance') as any) || 'system';
      this.selectedAppearance = isManual ? cachedAppearance : 'system';
      this.predefinedThemesService.setAppearance(this.selectedAppearance, false);

      const data = await this.userPrefService.getPreferences(forceRefresh);
      if (data) {
        if (isManual && data['RHR_WEB_Appearance']) {
          this.selectedAppearance = data['RHR_WEB_Appearance'] as any;
        }
        this.selectedTheme = data['RHR_WEB_Theme'] || 'default-theme';
        this.selectedFont = data['RHR_WEB_Font'] || 'Roboto-flex';
        this.predefinedThemesService.setAppearance(this.selectedAppearance, false);
        this.predefinedThemesService.setTheme(this.selectedTheme);
        this.predefinedThemesService.setFont(this.selectedFont);
      }
    } catch (error) {
      this.predefinedThemesService.setAppearance(this.selectedAppearance || 'system', false);
      this.predefinedThemesService.setTheme('default-theme');
      this.predefinedThemesService.setFont('Roboto-flex');
    }
  }

  selectedAppearanceMode(mode: string) {
    this.confirmedAppearance = mode as 'light' | 'dark' | 'system';
    this.themeAction.canApplyAppearance.set(this.confirmedAppearance !== this.selectedAppearance);
  }

  onAppearanceChange(): void {
    if (!this.confirmedAppearance || this.selectedAppearance === this.confirmedAppearance) return;
    this.selectedAppearance = this.confirmedAppearance;
    const payload = { employeeId: this.empinfo?.employeeId || 0, key: 'RHR_WEB_Appearance', value: this.selectedAppearance };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.predefinedThemesService.setAppearance(this.selectedAppearance, true);
        this.themeAction.canApplyAppearance.set(false);
        this.openModalService.openSuccessModal('Appearance Applied Successfully');
        this.getThemeData(true);
      },
      error: (err) => {
        console.error('Error saving appearance preference:', err);
        // Fallback: apply client-side so user is never blocked
        this.predefinedThemesService.setAppearance(this.selectedAppearance, true);
        this.themeAction.canApplyAppearance.set(false);
        this.openModalService.openSuccessModal('Appearance Applied Successfully');
      }
    });
  }

  selectedThemeColor(theme: string) {
    this.confirmedTheme = theme;
    this.themeAction.canApplyTheme.set(this.confirmedTheme !== this.selectedTheme);
  }

  onThemeChange(): void {
    if (!this.confirmedTheme || this.selectedTheme === this.confirmedTheme) return;
    this.selectedTheme = this.confirmedTheme;
    const payload = { employeeId: this.empinfo?.employeeId || 0, key: 'RHR_WEB_Theme', value: this.selectedTheme };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.predefinedThemesService.setTheme(this.selectedTheme);
        this.themeAction.canApplyTheme.set(false);
        this.openModalService.openSuccessModal('Theme Applied Successfully');
        this.getThemeData(true);
      },
      error: (err) => {
        console.error('Error saving theme preference:', err);
        // Fallback: apply client-side so user is never blocked
        this.predefinedThemesService.setTheme(this.selectedTheme);
        this.themeAction.canApplyTheme.set(false);
        this.openModalService.openSuccessModal('Theme Applied Successfully');
      }
    });
  }

  selectedFontFamily(font: string) {
    this.confirmedFont = font;
    this.themeAction.canApplyFont.set(this.confirmedFont !== this.selectedFont);
  }

  applyFont(): void {
    if (!this.confirmedFont || this.selectedFont === this.confirmedFont) return;
    this.selectedFont = this.confirmedFont;
    const payload = { employeeId: this.empinfo?.employeeId || 0, key: 'RHR_WEB_Font', value: this.selectedFont };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.predefinedThemesService.setFont(this.selectedFont);
        this.themeAction.canApplyFont.set(false);
        this.openModalService.openSuccessModal('Font Applied Successfully');
        this.getThemeData(true);
      },
      error: (err) => {
        console.error('Error saving font preference:', err);
        this.openModalService.openErrorModal('Failed to apply font');
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.themeAction.canApplyAppearance.set(false);
    this.themeAction.canApplyTheme.set(false);
    this.themeAction.canApplyFont.set(false);
  }
}