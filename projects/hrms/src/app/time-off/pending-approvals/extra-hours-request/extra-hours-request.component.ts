import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ExtraHoursApprovalsTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/extra-hours-approvals-tabs/extra-hours-approvals-tabs.component";

@Component({
  selector: 'app-extra-hours-request',
  imports: [RouterModule, ExtraHoursApprovalsTabsComponent],
  templateUrl: './extra-hours-request.component.html',
  styleUrl: './extra-hours-request.component.scss'
})
export class ExtraHoursRequestComponent {

}
