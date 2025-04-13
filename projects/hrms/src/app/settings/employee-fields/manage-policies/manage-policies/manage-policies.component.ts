import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-policies',
  imports: [RouterModule],
  templateUrl: './manage-policies.component.html',
  styleUrl: './manage-policies.component.scss'
})
export class ManagePoliciesComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }
}
