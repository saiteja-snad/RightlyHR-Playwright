import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { GlobalpermissionsPipe } from "../../Pipes/globalpermissions.pipe";
import { Iglobalpermissions } from './globalpermissions-modal';
import { AddGlobalPermissionsComponent } from './add-global-permissions/add-global-permissions.component';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../shared/modules-info';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { IDepartment } from '../../Interfaces/job-model';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../environments/environment';
import dayjs from 'dayjs';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-global-permissions',
  imports: [CommonModule, NgbPopoverModule, FormsModule,Select,NgxDaterangepickerBootstrapDirective, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, GlobalpermissionsPipe, ModuleInformationComponent],
  templateUrl: './global-permissions.component.html',
  styleUrl: './global-permissions.component.scss'
})

export class GlobalPermissionsComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  totalRecords = 100
  first: any = 1;
  rows: any = 10;
  empinfo = {} as any;
  subscription!: Subscription;
  searchValue: any;
  globalpermissions = [] as Iglobalpermissions[];
  jobLocationDropDownData: any[] = [];
  subLocationsDropdown: any[] = [];
  departmentDetails: IDepartment[] = [];
  teamDetails: any[] = [];
  @ViewChild('commentspopup') modalContent: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
locationId!: number;
subLocationId!:number;
departmentId!: number;
teamId!: number;
  ranges: any = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };

  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl 
  };
 dateRange!: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs; };
  constructor(private http: HttpService, private modalService: NgbModal, public rbac: RbacService, public readonly router: Router) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.tirggerCountSignal().global) {
        this.getAllGlobalPermissions();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }
    })
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllGlobalPermissions();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getjobLocationList();
    this.getDepartment();
  }
  
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data
      },
    });
  }
  //function to get sublocation by id
getSubLocationByid(sublocationId: number) {
  const ValuesForSublocation=sublocationId
  console.log(ValuesForSublocation);
  this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation} `).subscribe({
    next: (data: any) => {
      console.log(data);
      this.subLocationsDropdown = data.jobSubLocations
      console.log(this.subLocationsDropdown);
    },
    error:(err:any)=>{
      this.subLocationsDropdown=[];
    }
  })
}
//function to get the location data
getDepartment(){
this.subscription = this.http.getData("Department").subscribe({
  next: (data: any) => {
    console.log(data);
    this.departmentDetails = data as IDepartment[];
    //this.allDepartments = this.departmentDetails.map(item => item.departmentName)
  },
  error:(err:any)=>{
    console.log(err)
  },
})
}
//function to get the subdepartment data
getTeamData(teamId: number) {
const value=teamId;
this.subscription = this.http.getData(`Subdepartments/Getnames/V2/${value}`).subscribe({
  next: (data: any) => {
    this.teamDetails = data;
  },
  error:(err:any)=>{
    console.log(err)
    this.teamDetails=[];
  },
})

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
      '/time-off/global-permissions': MODULE_INFOS.TIME_OFF_GLOBAL_PERMISSION_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  openAdd() {
    this.modalService.open(AddGlobalPermissionsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  //function to get the globalpermissions details
  getAllGlobalPermissions() {
  let params = new HttpParams();

  // Helper function to conditionally add parameters
  const addParamIfExists = (
    params: HttpParams,
    key: string,
    value: any
  ): HttpParams => {
    return value !== null && value !== undefined && value !== ''
      ? params.set(key, value)
      : params;
  };

  // Add only if the value exists
  params = addParamIfExists(params, 'location', this.locationId);
  params = addParamIfExists(params, 'sublocation', this.subLocationId);
  params = addParamIfExists(params, 'department', this.departmentId);
  params = addParamIfExists(params, 'subdepartment', this.teamId);
  // params = addParamIfExists(params, 'fromDate', '2025-05-01');
  // params = addParamIfExists(params, 'toDate', '2025-05-30'); 
  // params = addParamIfExists(params, 'pageNumber', this.first);
  // params = addParamIfExists(params, 'pageSize', this.rows);

    this.subscription = this.http.getData(`v2/GlobalPermissions/getGlobalPermissions?${params}`).subscribe({
      next: (response: any) => {
        this.globalpermissions = response.data.requestedBy as Iglobalpermissions[];
        this.totalRecords = response.totalRecords;
      }, error(err: any) {
        console.log("errors", err);
      },
    })
  }
  
  //function to get the values 
  getEmployeeNames(employeeIds: any[]): string {
    return employeeIds.map(emp => `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''} 
      ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''}`.trim()).join(',\n'); // Join with line breaks for each employee
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}