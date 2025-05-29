import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import {withInterceptorsFromDi,HTTP_INTERCEPTORS,withFetch,} from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
//import {IPublicClientApplication,PublicClientApplication,InteractionType,BrowserCacheLocation,LogLevel,} from '@azure/msal-browser';
// import {MsalInterceptor,MSAL_INSTANCE,MsalInterceptorConfiguration,MsalGuardConfiguration,MSAL_GUARD_CONFIG,MSAL_INTERCEPTOR_CONFIG,
//         MsalService,MsalGuard,MsalBroadcastService,ProtectedResourceScopes,} from '@azure/msal-angular';
// import { protectedResources } from './azure/auth-config';
// import { environment } from '../environments/environment';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalInterceptor, MsalService } from '@azure/msal-angular';
import { MSALGuardConfigFactory, MSALInstanceFactory, MSALInterceptorConfigFactory } from './azure/msal-config';
import { provideDaterangepickerLocale } from "ngx-daterangepicker-bootstrap";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/language/', '.json');
}

// export function loggerCallback(logLevel: LogLevel, message: string) {
//   console.log(message);
// }
// export const protectedResourceMap: any = [
//   ['https://graph.microsoft.com/beta/', ['user.read'], environment.ApiUrl, environment.scopeUri]

// ];
// export function MSALInstanceFactory(): IPublicClientApplication {
//   return new PublicClientApplication({
//     auth: {
//       clientId: environment.clientId,
//       authority: environment.authority,
//       redirectUri: environment.redirectUrl,
//       postLogoutRedirectUri: '/'
//     },
//     cache: {
//       cacheLocation: BrowserCacheLocation.LocalStorage,
//     },
//     system: {
//       allowRedirectInIframe: true,
//       loggerOptions: {
//         loggerCallback,
//         logLevel: LogLevel.Info,
//         piiLoggingEnabled: false
//       }
//     }
//   });
// }
// export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
//   const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes> | null>();
//   protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);
//   protectedResourceMap.set(`${environment.ApiUrl}`, [...protectedResources.getAllEmployees.scopes.read]);
//   return {
//     interactionType: InteractionType.Redirect,
//     protectedResourceMap
//   };
// }
// export function MSALGuardConfigFactory(): MsalGuardConfiguration {
//   return {
//     interactionType: InteractionType.Redirect,
//     authRequest: {
//       scopes: ['user.read']
//     },
//     loginFailedRoute: '/'
//   };
// }
// const msalConfig = {
//   auth: {
//     clientId: environment.clientId,
//     authority: environment.authority
//   }
// }
// export class Msal {
//   constructor(private msalservices: MsalService) {
//   }
//   getActive() {
//     return this.msalservices.instance.getAllAccounts()[0]
//   }
// }
// const pca = new PublicClientApplication(msalConfig);
// export function getAccessToken(): Promise<string> {
//   const accounts = pca.getAllAccounts();
//   if (accounts.length > 0) {
//     pca.setActiveAccount(accounts[0]);
//   }
//   return pca.acquireTokenSilent({
//     scopes: environment.scopeUri,
//     authority: environment.authority
//   }).then((response:any) => {
//     return response.accessToken;
//   }).catch((error:any) => {
//     console.log(error);
//     return '';
//   });
// }

export const appConfig: ApplicationConfig = {
  providers: [
    AuthGuard,
    AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        },
        defaultLanguage: 'en'
      }),
      BrowserModule,
    ]),
    provideNoopAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    provideDaterangepickerLocale({
      separator: ' - ',
      applyLabel: 'Apply'
    })
  ],
};