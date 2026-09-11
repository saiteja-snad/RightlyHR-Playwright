import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpService } from '../http.service';
import { firstValueFrom } from 'rxjs';
import { UserPreferenceService } from '../user-preference.service';

export type AppearanceMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class PredefinedThemesService {
  private renderer: Renderer2;
  private currentTheme = 'default-theme';
  private currentFont = 'Roboto-flex';
  private currentAppearance: AppearanceMode = 'system';
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;
  private mediaQuery?: MediaQueryList;

  constructor(rendererFactory: RendererFactory2, private http: HttpService, private userPrefService: UserPreferenceService) {
    this.renderer = rendererFactory.createRenderer(null, null);
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  // APPEARANCE (Light, Dark, System)
  getAppearance(): AppearanceMode {
    return this.currentAppearance;
  }

  setAppearance(mode: AppearanceMode, isUserAction = false): void {
    this.currentAppearance = mode;
    if (isUserAction) {
      try {
        localStorage.setItem('RHR_WEB_Appearance', mode);
        localStorage.setItem('RHR_WEB_Appearance_Manual', 'true');
      } catch (e) {}
    }

    // Clean up any existing media query listener
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = undefined;
    }

    if (mode === 'system' && this.mediaQuery) {
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        this.applyEffectiveAppearance(e.matches ? 'dark' : 'light');
      };
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
      this.applyEffectiveAppearance(this.mediaQuery.matches ? 'dark' : 'light');
    } else {
      this.applyEffectiveAppearance(mode === 'dark' ? 'dark' : 'light');
    }
  }

  private applyEffectiveAppearance(effective: 'light' | 'dark'): void {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', effective);
    root.setAttribute('data-bs-theme', effective);
    body.setAttribute('data-theme', effective);
    body.setAttribute('data-bs-theme', effective);

    if (effective === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    }

    this.updateChartTheme(effective === 'dark');
  }

  private updateChartTheme(isDark: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      import('chart.js').then(({ Chart }) => {
        if (Chart && Chart.defaults) {
          Chart.defaults.color = isDark ? '#cbd5e1' : '#64748b';
          Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';
          if (Chart.defaults.plugins) {
            if (Chart.defaults.plugins.legend?.labels) {
              Chart.defaults.plugins.legend.labels.color = isDark ? '#cbd5e1' : '#64748b';
            }
            if (Chart.defaults.plugins.tooltip) {
              Chart.defaults.plugins.tooltip.backgroundColor = isDark ? '#0f172a' : '#ffffff';
              Chart.defaults.plugins.tooltip.titleColor = isDark ? '#f8fafc' : '#1e293b';
              Chart.defaults.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#475569';
              Chart.defaults.plugins.tooltip.borderColor = isDark ? '#334155' : '#cbd5e1';
              Chart.defaults.plugins.tooltip.borderWidth = 1;
            }
          }
          if (Chart.defaults.scales) {
            ['category', 'linear', 'time', 'radialLinear'].forEach(scaleType => {
              const scale = (Chart.defaults.scales as any)[scaleType];
              if (scale) {
                if (scale.ticks) scale.ticks.color = isDark ? '#cbd5e1' : '#64748b';
                if (scale.grid) scale.grid.color = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
              }
            });
          }
        }
      }).catch(() => {});
    } catch (e) {}
  }

  async initAppearance(): Promise<void> {
    // 1. Check if user explicitly set a manual appearance preference
    try {
      const isManual = localStorage.getItem('RHR_WEB_Appearance_Manual') === 'true';
      const cached = localStorage.getItem('RHR_WEB_Appearance') as AppearanceMode | null;
      if (isManual && cached && (cached === 'light' || cached === 'dark' || cached === 'system')) {
        this.setAppearance(cached, false);
      } else {
        // Default out-of-the-box behavior: follow browser / system theme automatically
        this.setAppearance('system', false);
      }
    } catch (e) {
      this.setAppearance('system', false);
    }

    // 2. Then load from user preferences API if available
    try {
      const isManual = localStorage.getItem('RHR_WEB_Appearance_Manual') === 'true';
      if (isManual) {
        const data = await this.userPrefService.getPreferences();
        const serverAppearance = data?.['RHR_WEB_Appearance'] as AppearanceMode | undefined;
        if (serverAppearance && serverAppearance !== this.currentAppearance) {
          this.setAppearance(serverAppearance, false);
        }
      }
    } catch (error) {
      console.error('Error loading appearance preference:', error);
    }
  }

  private readonly allThemes = [
    'default-theme', 'lavendar-theme', 'navy-blue-theme', 'teal-theme',
    'blue-theme', 'copper-wood-theme', 'royal-blue-theme', 'black-theme',
    'enchanted-wine-theme', 'flare-red-theme', 'dark-slate-theme', 'warm-brown-theme'
  ];

  // THEMES (Accent Color)
  setTheme(themeName: string): void {
    const body = document.body;
    this.allThemes.forEach(t => this.renderer.removeClass(body, t));
    this.renderer.addClass(body, themeName);
    this.currentTheme = themeName;
    try {
      localStorage.setItem('RHR_WEB_Theme', themeName);
    } catch (e) {}
  }

  async initTheme(): Promise<void> {
    try {
      const cached = localStorage.getItem('RHR_WEB_Theme');
      if (cached) {
        this.setTheme(cached);
      }
    } catch (e) {}

    try {
      const data = await this.userPrefService.getPreferences();
      const theme = data?.['RHR_WEB_Theme'] || localStorage.getItem('RHR_WEB_Theme') || 'default-theme';
      this.setTheme(theme);
    } catch (error) {
      console.error('Error loading theme:', error);
      if (!this.currentTheme) {
        this.setTheme('default-theme');
      }
    }
  }

  // FONTS
  setFont(fontName: string): void {
    const body = document.body;
    this.renderer.removeClass(body, this.currentFont);
    this.renderer.addClass(body, fontName);
    this.currentFont = fontName;
    try {
      localStorage.setItem('RHR_WEB_Font', fontName);
    } catch (e) {}
  }

  async initFont(): Promise<void> {
    try {
      const cached = localStorage.getItem('RHR_WEB_Font');
      if (cached) {
        this.setFont(cached);
      }
    } catch (e) {}

    try {
      const data = await this.userPrefService.getPreferences();
      const font = data?.['RHR_WEB_Font'] || 'Roboto-flex';
      this.setFont(font);
    } catch (error) {
      console.error('Error loading font:', error);
      if (!this.currentFont) {
        this.setFont('Roboto-flex');
      }
    }
  }
}