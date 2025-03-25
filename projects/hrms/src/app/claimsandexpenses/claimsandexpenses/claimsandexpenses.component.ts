import { Component } from '@angular/core';
import { ExpenesHeaderTabsComponent } from "../../shared/claimsandexpenses-tabs/expenes-header-tabs/expenes-header-tabs.component";
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-claimsandexpenses',
  imports: [ExpenesHeaderTabsComponent,RouterModule],
  templateUrl: './claimsandexpenses.component.html',
  styleUrl: './claimsandexpenses.component.scss'
})
export class ClaimsandexpensesComponent {
  constructor( public router:Router) { }
  navigatetoAddExpenses(){
    this.router.navigate(['/claimsandexpenses/addexpense'])
  }
}
