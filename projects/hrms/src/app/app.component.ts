import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme-service/theme.service';
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  title = 'hrms';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    const storedTheme = this.themeService.getStoredThemeColors();
    if (storedTheme) {
      this.themeService.applyStoredThemeColors(storedTheme);
    }
  }
}