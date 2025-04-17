import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-holidays',
  imports: [RouterModule,TranslateModule],
  templateUrl: './manage-holidays.component.html',
  styleUrl: './manage-holidays.component.scss'
})
export class ManageHolidaysComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }
}
