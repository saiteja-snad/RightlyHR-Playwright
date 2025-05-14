import { Route } from "@angular/router";
import { ReviewCycleListComponent } from "./review-cycle-list/review-cycle-list.component";
import { AssessmentFormComponent } from "./assessment-form/assessment-form.component";
import { MyPerformanceReviewComponent } from "./my-performance-review/my-performance-review.component";
import { TeamPerformanceReviewComponent } from "./team-performance-review/team-performance-review.component";
import { ApprisalListComponent } from "./apprisal-list/apprisal-list.component";
import { PendingReviewsComponent } from "./my-performance-review/pending-reviews/pending-reviews.component";
import { CompleteReviewsComponent } from "./my-performance-review/complete-reviews/complete-reviews.component";
import { TeamPendingReviewsComponent } from "./team-performance-review/team-pending-reviews/team-pending-reviews.component";
import { TeamCompleteReviewsComponent } from "./team-performance-review/team-complete-reviews/team-complete-reviews.component";
import { UpdateComponent } from "./review-cycle-list/update/update.component";
import { CreateComponent } from "./review-cycle-list/create/create.component";
import { ViewComponent } from "./review-cycle-list/view/view.component";
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    { path: '', redirectTo: '/pms/review-cycle', pathMatch: 'full' },
    { path: 'review-cycle', component: ReviewCycleListComponent, canActivate: [PermissionsGuard], data: { permission: 'Review Cycle List.view' }  },
    { path: 'review-cycle/create', component: CreateComponent, canActivate: [PermissionsGuard], data: { permission: 'Create Review Cycle.view' }  }, 
    { path: 'review-cycle/update', component: UpdateComponent, canActivate: [PermissionsGuard], data: { permission: 'Update.view' }  }, 
    { path: 'review-cycle/view', component: ViewComponent, canActivate: [PermissionsGuard], data: { permission: 'View.view' }  }, 
    { path: 'apprisal', component: ApprisalListComponent, canActivate: [PermissionsGuard], data: { permission: 'Review Cycle Employee List.view' } },
    { path: 'assessment-form', component: AssessmentFormComponent},
    { path: 'myPerformance', component: MyPerformanceReviewComponent,
        children: [
              { path: '', redirectTo: 'pending-review', pathMatch: 'full' },
              { path: 'pending-review', component: PendingReviewsComponent, canActivate: [PermissionsGuard], data: { permission: 'Pending Reviews.view' }  },
              { path: 'completed-review', component: CompleteReviewsComponent, canActivate: [PermissionsGuard], data: { permission: 'Completed Reviews.view' }  },
        ]
    },
    { path: 'team-performance', component: TeamPerformanceReviewComponent,
        children: [
            { path: '', redirectTo: 'pending-review', pathMatch: 'full' },
            { path: 'pending-review', component: TeamPendingReviewsComponent, canActivate: [PermissionsGuard], data: { permission: 'Team Pending Reviews.view' }  },
            { path: 'completed-review', component: TeamCompleteReviewsComponent, canActivate: [PermissionsGuard], data: { permission: 'Team Completed Reviews.view' }  },
      ]
    },
] as Route[];