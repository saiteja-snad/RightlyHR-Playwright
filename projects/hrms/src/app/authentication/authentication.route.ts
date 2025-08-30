import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { UserValidationComponent } from "./user-validation/user-validation.component";
import { UnauthorizedLoginComponent } from "./unauthorized-login/unauthorized-login.component";
import { authGuard } from "../auth/auth-guard/auth.guard";

export default [
    { path: 'login', component: LoginComponent },
    { path: 'uservalidation', component: UserValidationComponent, canActivate:[authGuard] },
    { path: 'unauthorized', component: UnauthorizedLoginComponent },
] as Route[];