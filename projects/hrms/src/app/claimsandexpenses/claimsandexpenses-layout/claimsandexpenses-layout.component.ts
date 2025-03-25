import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-claimsandexpenses-layout',
  imports: [RouterModule],
  templateUrl: './claimsandexpenses-layout.component.html',
  styleUrl: './claimsandexpenses-layout.component.scss'
})
export class ClaimsandexpensesLayoutComponent {
  constructor( public router:Router) { }
  navigatetoAddExpenses(){
    this.router.navigate(['/addexpense'])
  }
}
