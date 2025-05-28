import { Component, OnInit , ViewEncapsulation } from '@angular/core';
import { ExpenesHeaderTabsComponent } from "../../shared/claimsandexpenses-tabs/expenes-header-tabs/expenes-header-tabs.component";
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-claimsandexpenses',
  imports: [ExpenesHeaderTabsComponent, RouterModule, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './claimsandexpenses.component.html',
  styleUrl: './claimsandexpenses.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClaimsandexpensesComponent implements OnInit {
  moduleinfo : string = '';
  constructor( public router:Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  navigatetoAddExpenses(){
    this.router.navigate(['/claimsandexpenses/addexpense'])
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/claimsandexpenses/expenses': MODULE_INFOS.EXPENSES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}
