import { Component } from '@angular/core';
import { OnBeHalfOfApprovalTabsComponent } from "../../shared/on-be-half-of-approval-tabs/on-be-half-of-approval-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-on-be-half-of',
  imports: [OnBeHalfOfApprovalTabsComponent,RouterModule],
  templateUrl: './on-be-half-of.component.html',
  styleUrl: './on-be-half-of.component.scss'
})
export class OnBeHalfOfComponent {

}
