import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeamPerformanceTabsComponent } from "../../shared/pms-module-tabs/team-performance-tabs/team-performance-tabs.component";

@Component({
  selector: 'app-team-performance-review',
  imports: [RouterOutlet, TeamPerformanceTabsComponent],
  templateUrl: './team-performance-review.component.html',
  styleUrl: './team-performance-review.component.scss'
})
export class TeamPerformanceReviewComponent {

}
