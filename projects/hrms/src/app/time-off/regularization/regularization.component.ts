import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegularizationTabsComponent } from "../../shared/regularization-tabs/regularization-tabs.component";

@Component({
  selector: 'app-regularization',
  imports: [ RouterModule, RegularizationTabsComponent],
  templateUrl: './regularization.component.html',
  styleUrl: './regularization.component.scss'
})
export class RegularizationComponent {

}
