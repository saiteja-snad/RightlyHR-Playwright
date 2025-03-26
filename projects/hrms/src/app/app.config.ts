import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  withFetch,
} from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  ProtectedResourceScopes,
} from '@azure/msal-angular';

import { protectedResources } from './azure/auth-config';
import { environment } from '../environments/environment.dev';

export function loggerCallback(logLevel:LogLevel,message:string){
    console.log(message);
}


export const protectedResourceMap:any=[
    ['https://graph.microsoft.com/beta/',['user.read'],environment.ApiUrl,environment.scopeUri]

];

export function MSALInstanceFactory():IPublicClientApplication{
    return new PublicClientApplication({
        auth:{
            clientId: environment.clientId,
            authority: environment.authority,
            redirectUri:environment.redirectUrl,
            postLogoutRedirectUri:'/'
        },
        cache:{
            cacheLocation:BrowserCacheLocation.LocalStorage,
            
        },
        system:{
            allowRedirectInIframe:true,
            loggerOptions:{
                loggerCallback,
                logLevel:LogLevel.Info,
                piiLoggingEnabled:false
            }
        }
    });
}

export function MSALInterceptorConfigFactory():MsalInterceptorConfiguration{
    const protectedResourceMap= new Map<string, Array<string | ProtectedResourceScopes>|null>();
    protectedResourceMap.set('https://graph.microsoft.com/v1.0/me',['user.read']);

    protectedResourceMap.set(`${environment.ApiUrl}`,[...protectedResources.getAllEmployees.scopes.read]);
     return {
      interactionType: InteractionType.Redirect,
      protectedResourceMap
     };
}
export function MSALGuardConfigFactory():MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest:{
            scopes:['user.read']
        },
        loginFailedRoute:'/'
    };
}
const msalConfig={
    auth:{
        clientId:environment.clientId,
        authority:environment.authority
    }
}

export class Msal{
    constructor(private msalservices:MsalService){

    }

    getActive(){
        return this.msalservices.instance.getAllAccounts()[0]
    }
}
const pca = new PublicClientApplication(msalConfig);

export function getAccessToken(): Promise<string>{
    const accounts = pca.getAllAccounts();

    if(accounts.length>0){
        pca.setActiveAccount(accounts[0]);
    }
    return pca.acquireTokenSilent({
        scopes: environment.scopeUri,
        authority:environment.authority
    }).then((response)=>{
        return response.accessToken;
    }).catch((error)=>{
        console.log(error);
        return '';
        
    });
    
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
    ),
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
  ],
};