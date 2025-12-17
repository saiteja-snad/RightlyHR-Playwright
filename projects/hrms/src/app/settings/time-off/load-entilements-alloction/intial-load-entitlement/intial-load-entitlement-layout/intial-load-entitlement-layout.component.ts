import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { IntialLoadEntitlementProgressbarComponent } from "../../../../../shared/intial-load-entitlement-progressbar/intial-load-entitlement-progressbar.component";

@Component({
  selector: 'app-intial-load-entitlement-layout',
  imports: [RouterOutlet, IntialLoadEntitlementProgressbarComponent],
  templateUrl: './intial-load-entitlement-layout.component.html',
  styleUrl: './intial-load-entitlement-layout.component.scss'
})
export class IntialLoadEntitlementLayoutComponent  implements OnDestroy{


  ngOnDestroy(): void {
    localStorage.removeItem('intialloadEntitlement')
    localStorage.removeItem('carryForwardJobId')
  }
}
