import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { UserValidationComponent } from "./user-validation/user-validation.component";
import { UnauthorizedLoginComponent } from "./unauthorized-login/unauthorized-login.component";


export default [
    { path: 'login', component: LoginComponent },
    { path: 'user-validation', component: UserValidationComponent },
    { path: 'unauthorized', component: UnauthorizedLoginComponent },
] as Route[];