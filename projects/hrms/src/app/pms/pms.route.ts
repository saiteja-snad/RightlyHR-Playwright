import { Route } from "@angular/router";
import { ReviewCycleListComponent } from "./review-cycle-list/review-cycle-list.component";
import { AssessmentFormComponent } from "./assessment-form/assessment-form.component";
import { MyPerformanceReviewComponent } from "./my-performance-review/my-performance-review.component";
import { TeamPerformanceReviewComponent } from "./team-performance-review/team-performance-review.component";
import { ApprisalListComponent } from "./apprisal-list/apprisal-list.component";
import { UpdateComponent } from "./review-cycle-list/update/update.component";
import { CreateComponent } from "./review-cycle-list/create/create.component";
import { ViewComponent } from "./review-cycle-list/view/view.component";

export default [
    { path: '', redirectTo: '/pms/review-cycle', pathMatch: 'full' },
    { path: 'review-cycle', component: ReviewCycleListComponent },
    { path: 'review-cycle/create', component: CreateComponent }, 
    { path: 'review-cycle/update', component: UpdateComponent }, 
    { path: 'review-cycle/view', component: ViewComponent }, 
    { path: 'apprisal', component: ApprisalListComponent,
    },
    { path: 'assessment-form', component: AssessmentFormComponent},
    { path: 'myPerformance', component: MyPerformanceReviewComponent},
    { path: 'team-performance', component: TeamPerformanceReviewComponent},
] as Route[];