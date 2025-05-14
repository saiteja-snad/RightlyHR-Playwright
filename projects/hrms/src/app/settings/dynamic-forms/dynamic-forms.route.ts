import { Route } from "@angular/router";
import { ActiveFormsComponent } from "./active-forms/active-forms.component";
import { InactiveFormsComponent } from "./inactive-forms/inactive-forms.component";
import { DraftFormsComponent } from "./draft-forms/draft-forms.component";
import { FormSettingsComponent } from "./form-settings/form-settings.component";
import { ViewFormComponent } from "./view-form/view-form.component";
import { UpdateFormComponent } from "./update-form/update-form.component";
import { CreateFormComponent } from "./create-form/create-form.component";
import { PermissionsGuard } from "../../guards/permissions.guard";


export default [
    // { path: '', redirectTo: '/settings/dynamic-forms/active-forms', pathMatch: 'full' },
    { path: 'active-forms', component: ActiveFormsComponent, canActivate: [PermissionsGuard], data: { permission: 'Active Forms.view' } },
    { path: 'inactive-forms', component: InactiveFormsComponent, canActivate: [PermissionsGuard], data: { permission: 'Inactive Forms.view' } },
    { path: 'draft-forms', component: DraftFormsComponent, canActivate: [PermissionsGuard], data: { permission: 'Draft Forms.view' } },
    { path: 'form-settings', component: FormSettingsComponent, canActivate: [PermissionsGuard], data: { permission: 'Form Settings.view' } },
    { path: 'update-form', component: UpdateFormComponent},
    { path: 'view-form', component: ViewFormComponent},
    { path: 'create-form', component: CreateFormComponent},

] as Route[];