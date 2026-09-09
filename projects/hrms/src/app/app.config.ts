import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideDaterangepickerLocale } from "ngx-daterangepicker-bootstrap";
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import { microsoftAuthConfig } from './auth/auth.config';
import { TokeninterceptorsInterceptor } from './auth/interceptor/tokeninterceptor.interceptor';
import { GoogleLoginProvider, SocialAuthServiceConfig, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/language/', '.json');
}

function initializeAuth() {
  const oauthService = inject(OAuthService);
  oauthService.configure(microsoftAuthConfig);
  return oauthService.loadDiscoveryDocumentAndTryLogin();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // AuthGuard,
    // AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    // provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura, // Set the default theme
        options: {
          prefix: 'p', // Optional: Prefix for CSS classes
          darkModeSelector: '[data-theme="dark"]', // Enable PrimeNG Aura dark mode when data-theme="dark"
          cssLayer: false, // Optional: Disable CSS layers
        },
      },
    }),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        },
        defaultLanguage: 'english'
      }),
      BrowserModule,
    ]),
    provideNoopAnimations(),
    provideOAuthClient(),
    provideAppInitializer(() => initializeAuth()),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId, {
              oneTapEnabled: false,
              scopes: 'email profile'
            })
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokeninterceptorsInterceptor,
      multi: true,
    },
    provideDaterangepickerLocale({
      separator: ' - ',
      applyLabel: 'Apply'
    })
  ],
};