import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LogoService } from './logo.service';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  private themeColorsKey = 'themeColors';
  private defaultThemeKey = 'defaultTheme';
  private savedThemesKey = 'savedThemes';
  private logoKey = 'selectedLogo';
  private defaultLogoKey = 'defaultLogo';
  private themeColors: any;
  private editingThemeSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private selectedLogo: string | null = null;
  private defaultLogo: string = './assets/logo/logo@2x.png';

  constructor(private logoService: LogoService) {
    // Load default theme from localStorage or set it if not present
    this.themeColors = this.getStoredDefaultTheme() || this.getDefaultTheme();
    this.selectedLogo = this.getStoredDefaultLogo() || this.getDefaultLogo();
    this.logoService.setSelectedLogo(this.selectedLogo);
  }

  getThemeColors(): any {
    return this.themeColors;
  }

  getSelectedLogo(): string | null {
    return this.selectedLogo;
  }

  getDefaultLogo(): string {
    return this.defaultLogo;
  }

  private updateLocalStorage(): void {
    localStorage.setItem(this.themeColorsKey, JSON.stringify(this.themeColors));
    localStorage.setItem(this.logoKey, JSON.stringify(this.selectedLogo));
  }

  // Default theme definition
  private getDefaultTheme(): any {
    return {
      selectedFont: 'Inter',
      primaryColor: '#0573d6',
      primaryColorHover: '#0573d6',
      secondaryColor: '#979797',
      secondaryColorHover: '#979797',
      textPrimaryColor: '#ffffff',
      textSecondaryColor: '#ffffff',
      primaryColorLink: '#0573d6',
      primaryColorLinkHover: '#0573d6',
      //button color ends
      headerBackgroundColor: '#212121',
      //header color ends
      imagePrimaryColor: '#0573d6',
      imageSecondaryColor: '#05b0d6',
      navItemColor: '#ffffff',
      navActiveBgColor: '#e9f4ff',
      navActiveColor: '#000000',
      //side bar color ends
      breadCrumBgColor: 'rgba(0, 0, 0, 0.24)',
      breadCrumTextColor: '#ffffff',
      bodyPrimaryColor: '#346d9f',
      bodySecondaryColor: '#a4d4ff',
      bodyTertiaryColor: '#69b6fc',
      //body color ends
      brandColor: '#ffffff',
      footerBgColor: 'rgba(0, 0, 0, 0.24)',
      //footer color ends
      usertopBg: '#212121',
      userBottomBg: '#ffffff',
      userBottomFont: '#595f69',
      profileBg: '#0573d6',
      logoutFont: '#0573d6',
      //use profile colors
      headerBgColor: '#0573d6',
      headerTextColor: '#ffffff',
      moduleBgColor: '#0573d6',
      topTextColor: '#ffffff',
      dropBtnBgColor: '#063f6f',
      selectedLogo: this.defaultLogo,
    };
  }

  getDefaultThemes(): any {
    return this.getDefaultTheme();
  }

  private getStoredDefaultTheme(): any {
    const storedDefaultTheme = localStorage.getItem(this.defaultThemeKey);
    return storedDefaultTheme ? JSON.parse(storedDefaultTheme) : null;
  }

  private getStoredDefaultLogo(): string | null {
    const storedDefaultLogo = localStorage.getItem(this.defaultLogoKey);
    return storedDefaultLogo ? JSON.parse(storedDefaultLogo) : null;
  }

  applyDefaultTheme(): void {
    const defaultTheme = this.getDefaultTheme();
    this.applyStoredThemeColors(defaultTheme);
  }

  storeThemeColors(themeColors: any): void {
    this.themeColors = { ...themeColors };
    this.updateLocalStorage();
  }

  getStoredThemeColors(): any {
    const storedThemeColors = localStorage.getItem(this.themeColorsKey);
    return storedThemeColors ? JSON.parse(storedThemeColors) : null;
  }

  storeThemeWithLayoutName(themeData: any): void {
    const savedThemes = this.getSavedThemes();
    savedThemes.push(themeData);
    localStorage.setItem(this.savedThemesKey, JSON.stringify(savedThemes));
  }

  getSavedThemes(): any[] {
    const savedThemes = localStorage.getItem(this.savedThemesKey);
    return savedThemes ? JSON.parse(savedThemes) : [];
  }

  applyStoredThemeColors(theme: any): void {
    const fontFamilyName = theme.selectedFont.split('-')[1] || theme.selectedFont;
    // Update the root level CSS variables for colors
    //button colors
    document.documentElement.style.setProperty('--btn-primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--btn-secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--btn-primary-hover-color', theme.primaryColorHover);
    document.documentElement.style.setProperty('--btn-secondary-hover-color', theme.secondaryColorHover);
    document.documentElement.style.setProperty('--btn-color-tp', theme.textPrimaryColor);
    document.documentElement.style.setProperty('--btn-color-ts', theme.textSecondaryColor);
    document.documentElement.style.setProperty('--btn-primary-link-color', theme.primaryColorLink);
    document.documentElement.style.setProperty('--btn-primary-link-hover-color', theme.primaryColorLinkHover);
    //button colors ends
    document.documentElement.style.setProperty('--header-background-color', theme.headerBackgroundColor);
    //header color ends
    document.documentElement.style.setProperty('--image-primary-color', theme.imagePrimaryColor);
    document.documentElement.style.setProperty('--image-secondary-color', theme.imageSecondaryColor);
    document.documentElement.style.setProperty('--nav-color', theme.navItemColor);
    document.documentElement.style.setProperty('--nav-bg-color', theme.navActiveBgColor);
    document.documentElement.style.setProperty('--nav-active-color', theme.navActiveColor);
    //sidebar colors ends
    document.documentElement.style.setProperty('--bread-crum-color', theme.breadCrumBgColor);
    document.documentElement.style.setProperty('--bread-text-color', theme.breadCrumTextColor);
    document.documentElement.style.setProperty('--body-primary-color', theme.bodyPrimaryColor);
    document.documentElement.style.setProperty('--body-light-blue-color', theme.bodySecondaryColor);
    document.documentElement.style.setProperty('--body-accent-blue-color', theme.bodyTertiaryColor);
    //body color ends
    document.documentElement.style.setProperty('--brand-color', theme.brandColor);
    document.documentElement.style.setProperty('--footer-bg-color', theme.footerBgColor);
    // footer color ends
    document.documentElement.style.setProperty('--user-top-bg-color', theme.usertopBg);
    document.documentElement.style.setProperty('--user-bottom-bg-color', theme.userBottomBg);
    document.documentElement.style.setProperty('--user-bottom-text-color', theme.userBottomFont);
    document.documentElement.style.setProperty('--profile-bg-color', theme.profileBg);
    document.documentElement.style.setProperty('--logout-font-color', theme.logoutFont);
    // profile color ends
    document.documentElement.style.setProperty('--btn-header-color', theme.headerBgColor);
    document.documentElement.style.setProperty('--btn-header-text-color', theme.headerTextColor);
    document.documentElement.style.setProperty('--moduleBg-Color', theme.moduleBgColor);
    document.documentElement.style.setProperty('--topText-Color', theme.topTextColor);
    document.documentElement.style.setProperty('--dropBtnBg-Color', theme.dropBtnBgColor);
    //unused colors ends
    document.documentElement.style.setProperty('--font-family', `'${fontFamilyName}'`);
    document.documentElement.style.setProperty('--font-regular', `'Regular-${fontFamilyName}'`);
    document.documentElement.style.setProperty('--font-medium', `'Medium-${fontFamilyName}'`);
    document.documentElement.style.setProperty('--font-bold', `'Bold-${fontFamilyName}'`);
    // Save theme colors with layout name
    this.selectedLogo = theme.selectedLogo || this.getDefaultLogo();
    this.logoService.setSelectedLogo(this.selectedLogo!);
    this.storeThemeColors(theme);
  }

  getThemeByName(name: string): any {
    const savedThemes = this.getSavedThemes();
    return savedThemes.find(theme => theme.layoutName === name);
  }

  updateSavedTheme(updatedTheme: any): void {
    const savedThemes = this.getSavedThemes();
    const index = savedThemes.findIndex(theme => theme.layoutName === updatedTheme.layoutName);
    if (index !== -1) {
      savedThemes[index] = updatedTheme;
      this.storeSavedThemes(savedThemes);
    }
  }

  getEditingTheme(): Observable<any | null> {
    return this.editingThemeSubject.asObservable();
  }

  getEditingThemeValue(): any | null {
    return this.editingThemeSubject.getValue();
  }

  setEditingTheme(theme: any | null): void {
    this.editingThemeSubject.next(theme);
  }

  private storeSavedThemes(savedThemes: any[]): void {
    localStorage.setItem(this.savedThemesKey, JSON.stringify(savedThemes));
  }
}