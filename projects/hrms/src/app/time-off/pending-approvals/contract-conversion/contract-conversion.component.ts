import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContractConversionRequestTabsComponent } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/contract-conversion-request-tabs/contract-conversion-request-tabs.component';

@Component({
  selector: 'app-contract-conversion',
  imports: [CommonModule, RouterModule, ContractConversionRequestTabsComponent],
  templateUrl: './contract-conversion.component.html',
  styleUrl: './contract-conversion.component.scss'
})
export class ContractConversionComponent {

}
