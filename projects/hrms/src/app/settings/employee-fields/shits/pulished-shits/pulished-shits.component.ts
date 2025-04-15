import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-pulished-shits',
  imports: [NoDataFoundComponent],
  templateUrl: './pulished-shits.component.html',
  styleUrl: './pulished-shits.component.scss'
})
export class PulishedShitsComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
