import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SeparationRequestTabsComponent } from "../../shared/pending-approvals-tabs/separation-request-tabs/separation-request-tabs.component";



@Component({
  selector: 'app-separation-request',
  imports: [RouterModule, SeparationRequestTabsComponent],
  templateUrl: './separation-request.component.html',
  styleUrl: './separation-request.component.scss'
})
export class SeparationRequestComponent {

}
