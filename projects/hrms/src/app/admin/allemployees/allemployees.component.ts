import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Iallemployees } from '../../Interfaces/allemployees.model';
import { AllEmployeesPipe } from '../../Pipes/all-employees.pipe';

@Component({
  selector: 'app-allemployees',
  imports: [DataLoaderContentComponent, NoDataFoundComponent, AllEmployeesPipe,TranslateModule,CommonModule,FormsModule],
  templateUrl: './allemployees.component.html',
  styleUrl: './allemployees.component.scss'
})
export class AllemployeesComponent {
  subscription!: Subscription;
  Allemployees = [] as any;
  searchValue: any;
  emp = {} as any;
  loader = false;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
  }

  //function for active Employees
  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/getallemployeesdetails`).subscribe({
      next: (data: any) => {
        this.Allemployees = data as Iallemployees[];
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
      this.subscription.unsubscribe();
    }
  }
}