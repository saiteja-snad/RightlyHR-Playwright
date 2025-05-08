import { Route } from "@angular/router";
import { ActiveFormsComponent } from "./active-forms/active-forms.component";
import { InactiveFormsComponent } from "./inactive-forms/inactive-forms.component";
import { DraftFormsComponent } from "./draft-forms/draft-forms.component";
import { FormSettingsComponent } from "./form-settings/form-settings.component";
import { ViewFormComponent } from "./view-form/view-form.component";
import { UpdateFormComponent } from "./update-form/update-form.component";
import { CreateFormComponent } from "./create-form/create-form.component";


export default [
    // { path: '', redirectTo: '/settings/dynamic-forms/active-forms', pathMatch: 'full' },
    { path: 'active-forms', component: ActiveFormsComponent },
    { path: 'inactive-forms', component: InactiveFormsComponent },
    { path: 'draft-forms', component: DraftFormsComponent },
    { path: 'form-settings', component: FormSettingsComponent },
    { path: 'update-form', component: UpdateFormComponent },
    { path: 'view-form', component: ViewFormComponent },
    { path: 'create-form', component: CreateFormComponent },

] as Route[];