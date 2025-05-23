import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme-service/theme.service';

@Component({
  selector: 'app-theme-selection',
  imports: [CommonModule,FormsModule],
  templateUrl: './theme-selection.component.html',
  styleUrl: './theme-selection.component.scss'
})

export class ThemeSelectionComponent {
  savedThemes: any[] = [];
  selectedTheme: any;
  defaultTheme: any;

  constructor(private router: Router,private themeService: ThemeService) { }
  
  //navigation function
  navigateNewTheme() {
    this.router.navigate(['/theme/creation']);
  }

  ngOnInit() {
    this.savedThemes = this.themeService.getSavedThemes();
    this.defaultTheme = this.themeService.getDefaultThemes();
  }

  applyTheme(): void {
    if (this.selectedTheme) {
      this.themeService.applyStoredThemeColors(this.selectedTheme);
      localStorage.setItem('appliedTheme', JSON.stringify(this.selectedTheme));
    } else if (this.defaultTheme) {
      this.themeService.applyStoredThemeColors(this.defaultTheme);
      localStorage.removeItem('appliedTheme'); // Remove the applied theme from localStorage if using the default theme
    }
  }
  
  selectTheme(theme: any): void {
    if (this.savedThemes.length > 0 || theme !== this.defaultTheme) {
      this.selectedTheme = theme;
    }
  }
  
  editSelectedTheme(): void {
    if (this.selectedTheme) {
      this.themeService.setEditingTheme(this.selectedTheme);
      this.router.navigate(['/theme/creation']);
    } else {
      console.warn('Please select a theme before editing.');
    }
  }

  isThemeApplied(theme: any): boolean {
    const appliedTheme = JSON.parse(localStorage.getItem('appliedTheme') as string);
    return appliedTheme && appliedTheme.layoutName === theme.layoutName;
  }
}