import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './active-interns-modules';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { FormsModule } from '@angular/forms';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-active-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe, FormsModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './active-interns.component.html',
  styleUrl: './active-interns.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class ActiveInternsComponent implements OnInit,OnDestroy {
  searchValue: any;
  subscription!: Subscription;
  emp = {} as any;
  TraineeActive = [] as any;
  loader = false;

  constructor(private router: Router, private http: HttpService,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata('Trainee Active');
  }

  //function for active Employees
  empdata(status: string) {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.TraineeActive = data as ITrainee[];
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
    }else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}