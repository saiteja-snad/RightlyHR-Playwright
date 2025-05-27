import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { UserValidationComponent } from "./user-validation/user-validation.component";
import { UnauthorizedLoginComponent } from "./unauthorized-login/unauthorized-login.component";
import { MsalGuard } from "@azure/msal-angular";

export default [
    { path: 'login', component: LoginComponent },
    { path: 'uservalidation', component: UserValidationComponent, canActivate:[MsalGuard] },
    { path: 'unauthorized', component: UnauthorizedLoginComponent },
] as Route[];