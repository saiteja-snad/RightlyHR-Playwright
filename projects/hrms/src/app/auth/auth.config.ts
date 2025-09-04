import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const microsoftAuthConfig: AuthConfig = {
  issuer: `${environment.auth.microsoft.authority}/${environment.auth.microsoft.tenant}/v2.0`,
  clientId: environment.auth.microsoft.clientId,
  redirectUri: environment.auth.microsoft.redirectUri,
  responseType: 'code',
  scope: environment.auth.microsoft.scope,
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};

export const googleAuthConfig: AuthConfig = {
  issuer: environment.auth.google.issuer,
  clientId: environment.auth.google.clientId,
  redirectUri: environment.auth.google.redirectUri,
  responseType: 'code',
  scope: environment.auth.google.scope,
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};