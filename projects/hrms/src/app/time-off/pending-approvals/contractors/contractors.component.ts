import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContractorsRequestTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/contractors-request-tabs/contractors-request-tabs.component";

@Component({
  selector: 'app-contractors',
  imports: [CommonModule, RouterModule, ContractorsRequestTabsComponent],
  templateUrl: './contractors.component.html',
  styleUrl: './contractors.component.scss'
})
export class ContractorsComponent {

}
