import { Component } from '@angular/core';
import { LoadentilledmentprogressbarComponent } from "../../../../shared/loadentilledmentprogressbar/loadentilledmentprogressbar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-load-entitlements-carry-forward',
  imports: [LoadentilledmentprogressbarComponent, RouterModule],
  templateUrl: './load-entitlements-carry-forward.component.html',
  styleUrl: './load-entitlements-carry-forward.component.scss'
})
export class LoadEntitlementsCarryForwardComponent {

}
