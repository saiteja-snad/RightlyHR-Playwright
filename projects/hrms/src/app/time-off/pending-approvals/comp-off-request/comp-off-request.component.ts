import { Component } from '@angular/core';
import { CompOffRequestTabsComponent } from "../../../shared/pending-approvals-tabs/comp-off-request-tabs/comp-off-request-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-comp-off-request',
  imports: [CompOffRequestTabsComponent,RouterModule],
  templateUrl: './comp-off-request.component.html',
  styleUrl: './comp-off-request.component.scss'
})
export class CompOffRequestComponent {

}
