import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PremissionsRequestTabsComponent } from "../../../shared/pending-approvals-tabs/premissions-request-tabs/premissions-request-tabs.component";

@Component({
  selector: 'app-premission-request',
  imports: [RouterModule, PremissionsRequestTabsComponent],
  templateUrl: './premission-request.component.html',
  styleUrl: './premission-request.component.scss'
})
export class PremissionRequestComponent {

}
