import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iactive } from './active-model';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-active-employees',
  imports: [CommonModule, RouterModule, ActiveEmployeePipe, TranslateModule, FormsModule, DataLoaderContentComponent, NoDataFoundComponent, ModuleInformationComponent],
  templateUrl: './active-employees.component.html',
  styleUrl: './active-employees.component.scss'
})

export class ActiveEmployeesComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  subscription!: Subscription;
  Active = [] as Iactive[];
  searchValue: any;
  emp = {} as any;
  loader = false;

  constructor(private router: Router, private http: HttpService, private modalService: NgbModal,public rbac:RbacService,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
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
      '/admin/active-employees': MODULE_INFOS.ACTIVE_EMPLOYEES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  //function for active Employees
  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/ActiveEmployeeswithJobDetails`).subscribe({
      next: (data: any) => {
        this.Active = data as Iactive[];
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