import { Component } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-policieslayout',
  imports: [RouterModule],
  templateUrl: './policieslayout.component.html',
  styleUrl: './policieslayout.component.scss'
})
export class PolicieslayoutComponent {
  constructor( public router:Router) { }
  navigatetoAddExpenses(){
    this.router.navigate(['/policies/companypolicies'])
  }
  
}
