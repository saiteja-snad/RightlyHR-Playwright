import { environment } from "../../environments/environment";


//const isIE = window.navigator.userAgent.indexOf("MSIE")> -1 || window.navigator.userAgent.indexOf("Trident/") > -1;
export const protectedResources = {
    getAllEmployees:{
        endpoint:environment.ApiUrl,
        scopes:{
            read:environment.scopeUri,
        }
    }
}
export const loginRequest ={
    scopes:[]
}