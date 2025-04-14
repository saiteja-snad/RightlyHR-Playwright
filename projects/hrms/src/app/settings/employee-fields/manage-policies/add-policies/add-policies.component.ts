import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-policies',
  imports: [Select,CommonModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent {
  constructor( public router:Router) { }
  salaryHoldDetails = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]
 

  navigation(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }
}
