import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-holidays',
  imports: [],
  templateUrl: './pending-holidays.component.html',
  styleUrl: './pending-holidays.component.scss'
})
export class PendingHolidaysComponent {
  constructor( public router:Router) { }


  nagvition(){
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }
}
