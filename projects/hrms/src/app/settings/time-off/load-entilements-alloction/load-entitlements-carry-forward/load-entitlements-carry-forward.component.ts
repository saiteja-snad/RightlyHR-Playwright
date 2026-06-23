import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarryForwardEntitlementProgressbarComponent } from '../../../../shared/carry-forward-entitlement-progressbar/carry-forward-entitlement-progressbar.component';

@Component({
  selector: 'app-load-entitlements-carry-forward',
  imports: [CarryForwardEntitlementProgressbarComponent, RouterModule],
  templateUrl: './load-entitlements-carry-forward.component.html',
  styleUrl: './load-entitlements-carry-forward.component.scss'
})
export class LoadEntitlementsCarryForwardComponent implements OnDestroy {
  ngOnDestroy(): void {
    localStorage.removeItem('loadEntitlement');
    localStorage.removeItem('carryForwardJobId');
  }
}