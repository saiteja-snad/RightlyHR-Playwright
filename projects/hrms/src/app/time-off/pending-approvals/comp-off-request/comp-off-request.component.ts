import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompOffRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/comp-off-request-tabs/comp-off-request-tabs.component";
@Component({
  selector: 'app-comp-off-request',
  imports: [RouterModule, CompOffRequestTabsComponent],
  templateUrl: './comp-off-request.component.html',
  styleUrl: './comp-off-request.component.scss'
})

export class CompOffRequestComponent {

}
