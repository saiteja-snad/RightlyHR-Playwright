import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveInternComponent } from './add-prospective-intern/add-prospective-intern.component';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './Prospective-interns-modules';
import { FormsModule } from '@angular/forms';
import { ActiveEmployeePipe } from '../../Pipes/active-employee.pipe';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { IServe } from '../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe, FormsModule, DataLoaderContentComponent, NoDataFoundComponent, ModuleInformationComponent],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})

export class ProspectiveInternsComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  subscription!: Subscription;
  searchValue: any;
  Trainee = [] as any;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  Prospective = [] as any;
  JobroleDetails = [] as any;
  AllJobRoles: any;
  serveDetails = [] as IServe[];
  singleValue: IServe | null = null;
  gradeIdValue: any;
  selectedValueJobRoledrop: string = '';
  optionsFound: boolean = true;
  filteredTabs: any[] = [];
  loader = false;

  constructor(private router: Router, private http: HttpService, 
    private modalService: NgbModal, public rbac: RbacService,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
    this.getJobrole();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe((selectedObj) => {
      this.empdata();
    });
    this.getservingperiod();
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
      '/admin/prospective-interns': MODULE_INFOS.PROSPECTIVE_TRAINEES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  
  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        this.Trainee = data as ITrainee[];
        this.loader = false;
      },
      error: (reason: any) => console.log(reason)
    });
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data;
      },
    });
  }

  openAddProspective() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
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
  filterByDuration(duration: string) {
    this.serveDetails = this.serveDetails.filter((item: any) => item.servingPeriodType === 'Trainee Duration Period');
  }

  getJobrole() {
    this.subscription = this.http.getData("DesignationGradeMapper").subscribe({
      next: (data: any) => {
        this.JobroleDetails = data;
        this.AllJobRoles = this.JobroleDetails.map((item: { designationName: any; }) => item.designationName)
      }
    });
  }

  getservingperiod() {
    this.subscription = this.http.getData("ServingPeriods").subscribe({
      next: (data: any) => {
        this.serveDetails = data as IServe[]
        const filteredServeDetails = this.serveDetails.filter((serve: IServe) => {
          return serve.servingPeriodType === 'Trainee Duration Period';
        });
        this.singleValue = filteredServeDetails.length > 0 ? filteredServeDetails[0] : null;
      }
    })
  }

  buttondisable = false;
  disablebutton: boolean = false;
  initialLocationId: any;
  subLocationsDropdown = {} as any;
  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}