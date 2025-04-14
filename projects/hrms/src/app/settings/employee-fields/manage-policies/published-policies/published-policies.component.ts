import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-published-policies',
  imports: [RouterOutlet],
  templateUrl: './published-policies.component.html',
  styleUrl: './published-policies.component.scss'
})
export class PublishedPoliciesComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }
}
