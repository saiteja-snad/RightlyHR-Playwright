import { Component } from '@angular/core';
import { CompOffApprovalTabsComponent } from "../../shared/comp-off-approval-tabs/comp-off-approval-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-comp-off',
  imports: [CompOffApprovalTabsComponent,RouterModule],
  templateUrl: './comp-off.component.html',
  styleUrl: './comp-off.component.scss'
})
export class CompOffComponent {

}
