import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyPerformanceTabsComponent } from "../../shared/pms-module-tabs/my-performance-tabs/my-performance-tabs.component";

@Component({
  selector: 'app-my-performance-review',
  imports: [RouterOutlet, MyPerformanceTabsComponent],
  templateUrl: './my-performance-review.component.html',
  styleUrl: './my-performance-review.component.scss'
})
export class MyPerformanceReviewComponent {

}
