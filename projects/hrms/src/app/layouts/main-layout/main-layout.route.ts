import { Route } from "@angular/router";
import { AdminLayoutComponent } from "../../admin/admin-layout/admin-layout.component";

export default [
    {path: '', component: AdminLayoutComponent, loadChildren: () => import('../../admin/admin.route')},
] as Route[];