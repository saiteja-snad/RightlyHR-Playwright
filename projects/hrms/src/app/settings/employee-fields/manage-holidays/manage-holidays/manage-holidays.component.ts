import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-holidays',
  imports: [RouterModule,],
  templateUrl: './manage-holidays.component.html',
  styleUrl: './manage-holidays.component.scss'
})
export class ManageHolidaysComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }
}
