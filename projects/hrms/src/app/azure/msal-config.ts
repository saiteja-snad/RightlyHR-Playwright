import { MsalGuardConfiguration, MsalInterceptorConfiguration, MsalService, ProtectedResourceScopes } from "@azure/msal-angular";
import { BrowserCacheLocation, IPublicClientApplication, InteractionType, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { protectedResources } from "./auth-config";
import { environment } from "../../environments/environment.dev";


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