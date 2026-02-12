import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpService } from '../http.service';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class PredefinedThemesService {
  private renderer: Renderer2;
  private currentTheme = 'default-theme';
  private currentFont = 'Roboto-flex';

  constructor(rendererFactory: RendererFactory2, private http: HttpService) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTheme(themeName: string): void {
    const body = document.body;
    this.renderer.removeClass(body, this.currentTheme);
    this.renderer.addClass(body, themeName);
    this.currentTheme = themeName;
  }

  async initTheme(): Promise<void> {
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) {
        this.setTheme('default-theme');
        return;
      }
      const response: any = await firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      );
      const theme = response?.data?.['CLAIM_GENIUS_WEB_Theme'] || 'default-theme';
      this.setTheme(theme);
    } catch (error) {
      console.error('Error loading theme:', error);
      this.setTheme('default-theme');
    }
  }

  // FONTS
  setFont(fontName: string): void {
    const body = document.body;
    this.renderer.removeClass(body, this.currentFont);
    this.renderer.addClass(body, fontName);
    this.currentFont = fontName;
  }

  async initFont(): Promise<void> {
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) {
        this.setFont('Roboto-flex');
        return;
      }
      const response: any = await firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      );
      const font = response?.data?.['CLAIM_GENIUS_WEB_Font'] || 'Roboto-flex';
      this.setFont(font);
    } catch (error) {
      console.error('Error loading font:', error);
      this.setFont('Roboto-flex');
    }
  }
}