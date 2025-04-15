import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-holidays',
  imports: [Select],
  templateUrl: './add-holidays.component.html',
  styleUrl: './add-holidays.component.scss'
})
export class AddHolidaysComponent {

  salaryHoldDetails = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }
}
