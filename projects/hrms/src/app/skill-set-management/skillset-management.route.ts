import { Route } from "@angular/router";
import { SkillsetDashboardComponent } from "./skillset-dashboard/skillset-dashboard.component";
import { SkillDirectoryManagementComponent } from "./skill-directory-management/skill-directory-management.component";

export default [
    { path: 'dashboard', component: SkillsetDashboardComponent },
    { path: 'directory', component: SkillDirectoryManagementComponent },
] as Route[];