import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './active-interns-modules';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { FormsModule } from '@angular/forms';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-active-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe, FormsModule, DataLoaderContentComponent, NoDataFoundComponent, ModuleInformationComponent],
  templateUrl: './active-interns.component.html',
  styleUrl: './active-interns.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class ActiveInternsComponent implements OnInit,OnDestroy {
  moduleinfo : string = '';
  searchValue: any;
  subscription!: Subscription;
  emp = {} as any;
  TraineeActive = [] as any;
  loader = false;

  constructor(private router: Router, private http: HttpService,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata('Trainee Active');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/admin/active-interns': MODULE_INFOS.ACTIVE_TRAINEES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
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