import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  private themeColorsKey = 'themeColors';
  private defaultThemeKey = 'defaultTheme';
  private savedThemesKey = 'savedThemes';
  private themeColors: any;
  private editingThemeSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);

  constructor() {
    // Load default theme from localStorage or set it if not present
    this.themeColors = this.getStoredDefaultTheme() || this.getDefaultTheme();
  }

  getThemeColors(): any {
    return this.themeColors;
  }

  private updateLocalStorage(): void {
    localStorage.setItem(this.themeColorsKey, JSON.stringify(this.themeColors));
  }

  // Default theme definition
  private getDefaultTheme(): any {
    return {
      // font family
      selectedFont: 'Roboto-flex',
      // header 
      headerBackgroundColor: '#FFFFFF',
      //sidenav
      sidebarBackgroundColor: '#0B3A83',
      sidebarNavItemColor: '#EAEAEA',
      sidebarNavItemActiveColor: '#0B3A83',
      sidebarNavItemActiveBackgroundColor: '#FFFFFF4D',
      //Body
      bodyBackgroundColor: '#ECF1F5',
      // button and links
      primaryButtonColor: '#0B3A83',
      secondaryButtonColor: '#FFFFFF',
      primaryButtonTextColor: '#FFFFFF',
      secondaryButtonTextColor: '#0B3A83',
      buttonBorderColor: '#0B3A83',
    };
  }

  getDefaultThemes(): any {
    return this.getDefaultTheme();
  }

  private getStoredDefaultTheme(): any {
    const storedDefaultTheme = localStorage.getItem(this.defaultThemeKey);
    return storedDefaultTheme ? JSON.parse(storedDefaultTheme) : null;
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
    // font family
    document.documentElement.style.setProperty('--font-family', theme.selectedFont);
    // Update the root level CSS variables for colors
    // header
    document.documentElement.style.setProperty('--header-background-color', theme.headerBackgroundColor);
    //sidenav
    document.documentElement.style.setProperty('--side-nav-background-color', theme.sidebarBackgroundColor);
    document.documentElement.style.setProperty('--side-nav-item-color', theme.sidebarNavItemColor);
    document.documentElement.style.setProperty('--side-nav-item-active-color', theme.sidebarNavItemActiveColor);
    document.documentElement.style.setProperty('--side-nav-active-bg-color', theme.sidebarNavItemActiveBackgroundColor);
    //Body
    document.documentElement.style.setProperty('--body-bg-color', theme.bodyBackgroundColor);
    // button and links
    document.documentElement.style.setProperty('--btn-primary-color', theme.primaryButtonColor);
    document.documentElement.style.setProperty('--btn-secondary-color', theme.secondaryButtonColor);
    document.documentElement.style.setProperty('--btn-color-tp', theme.primaryButtonTextColor);
    document.documentElement.style.setProperty('--btn-color-ts', theme.secondaryButtonTextColor);
    document.documentElement.style.setProperty('--btn-border-color', theme.buttonBorderColor);
    //button colors    
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