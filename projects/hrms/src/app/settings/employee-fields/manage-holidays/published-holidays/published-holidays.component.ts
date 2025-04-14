import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-published-holidays',
  imports: [RouterModule],
  templateUrl: './published-holidays.component.html',
  styleUrl: './published-holidays.component.scss'
})
export class PublishedHolidaysComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }
}
