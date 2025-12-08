import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { LeaveEntitlementSideBarComponent } from "../../../shared/leave-entitlement-side-bar/leave-entitlement-side-bar.component";

@Component({
  selector: 'app-load-entilements-alloction',
  imports: [ RouterModule, LeaveEntitlementSideBarComponent],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss'
})
export class LoadEntilementsAlloctionComponent {

}
