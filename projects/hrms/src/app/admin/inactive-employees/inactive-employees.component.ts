import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iinactive } from './inactive-model';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InactiveEmployeePipe } from '../../Pipes/inactive-employee.pipe';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-inactive-employees',
  imports: [CommonModule, RouterModule, InactiveEmployeePipe, TranslateModule, FormsModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-employees.component.html',
  styleUrl: './inactive-employees.component.scss'
})

export class InactiveEmployeesComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  InActive = [] as any;
  emp = {} as any;
  searchValue: any;
  loader = false;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
  }

  //function for inactive employees
  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/InactiveEmployees`).subscribe({
      next: (data: any) => {
        this.InActive = data as Iinactive[];
        this.loader = false;
      },
      error: (reason: any) => console.log(reason)
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    // this.router.navigate(['/personalinfo']);
    this.goToAccessibleRoute('/personalinfo');
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}