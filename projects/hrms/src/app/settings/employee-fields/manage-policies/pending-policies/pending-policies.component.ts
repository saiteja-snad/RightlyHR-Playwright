import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pending-policies',
  imports: [RouterOutlet],
  templateUrl: './pending-policies.component.html',
  styleUrl: './pending-policies.component.scss'
})
export class PendingPoliciesComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }
}
