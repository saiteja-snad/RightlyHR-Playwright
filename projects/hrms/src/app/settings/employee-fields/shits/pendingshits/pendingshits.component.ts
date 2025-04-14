import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-pendingshits',
  imports: [NoDataFoundComponent],
  templateUrl: './pendingshits.component.html',
  styleUrl: './pendingshits.component.scss'
})
export class PendingshitsComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
