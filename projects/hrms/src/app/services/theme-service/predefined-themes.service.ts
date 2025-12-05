import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PredefinedThemesService {
  private renderer: Renderer2;
  private currentTheme = 'default-theme';
  private currentFont = 'Roboto-flex';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
    this.initFont();
  }

  setTheme(themeName: string): void {
    const body = document.body;
    this.renderer.removeClass(body, this.currentTheme);
    this.renderer.addClass(body, themeName);
    this.currentTheme = themeName;
    localStorage.setItem('selected-theme', themeName);
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem('selected-theme') || 'default-theme';
    this.setTheme(savedTheme);
  }

  // FONTS
  setFont(fontName: string): void {
    const body = document.body;
    this.renderer.removeClass(body, this.currentFont);
    this.renderer.addClass(body, fontName);
    this.currentFont = fontName;
    localStorage.setItem('selected-font', fontName);
  }

  initFont(): void {
    const savedFont = localStorage.getItem('selected-font') || 'Roboto-flex';
    this.setFont(savedFont);
  }
}