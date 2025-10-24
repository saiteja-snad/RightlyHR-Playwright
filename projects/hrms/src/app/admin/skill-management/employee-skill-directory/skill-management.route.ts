import { Route } from "@angular/router";
import { SkillDirectoryManagementComponent } from "./skill-directory-management/skill-directory-management.component";


const routes: Route[] = [
  {
    path: 'skill-directory',
    component: SkillDirectoryManagementComponent
  }
];

export default routes;