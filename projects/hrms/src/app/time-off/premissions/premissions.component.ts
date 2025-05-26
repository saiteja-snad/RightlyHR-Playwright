import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IJob } from '../../Interfaces/letters-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { OrgHolidayHeader, OrgWeekendHeader } from '../comp-off/compoff.modal';
import { Subject, takeUntil,Subscription, filter } from 'rxjs';
import { IEAV, LeaveType } from '../../Interfaces/timoff-model';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../services/rbac.service';
import { PremissionsTabsComponent } from "../../shared/time-off-module-tabs/premissions-tabs/premissions-tabs.component";
import { environment } from '../../../environments/environment';
import { FormValidationsService } from '../../services/form-validations.service';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-premissions',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    PremissionsTabsComponent, TranslateModule,
    ModuleInformationComponent
],
  templateUrl: './premissions.component.html',
  styleUrl: './premissions.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class PremissionsComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  subscription!: Subscription;
  permissiondata = {} as any;
  empinfo = {} as IJob;
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaveTypes: LeaveType[] = [] as LeaveType[];
  permissionsValue: IEAV[] = [] as IEAV[];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth() + 1;
  firstDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
  lastDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth, 0);
  firstDayOfCurrentMonthString = this.formatDate(this.firstDayOfCurrentMonth);
  lastDayOfCurrentMonthString = this.formatDate(this.lastDayOfCurrentMonth);
  permissionHours: number[] = [0.5, 1, 1.5, 2];
    ApprovedCount = 0;
  rejectedCount = 0;
  ProcessedCount = 0;
  pendingCount = 0;
  permissions: any[] = [];
  permissionForm!: FormGroup;
  premissionType = [
    { name: 'Short Break', value: 'short-break' },
    { name: 'Half Day', value: 'half-day' },
    { name: 'Full Day', value: 'full-day' },
    { name: 'Work From Home', value: 'work-from-home' },
  ];
  duration = [
    { name: 0.5, value: 0.5 },
    { name: 1, value: 1 },
    { name: 1.5, value: 1.5 },
    { name: 2, value: 2 },
  ];
  spinnerLoader = false;
  pastDatesAllowed!:number;
  futureDatesAllowed!:number;
  getEmployeeInfo: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formsValidation:FormValidationsService,
    public readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
    // this.getDuration();
    this.getPermissionTypes();
    this.formintions();
    this.getEAVData();
    this.getTeamManagersDetails();
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
      '/time-off/premissions': MODULE_INFOS.ATTENDANCE_PERMISSION_REPORTS_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
 // function to get the data of employees by hierarchy
  
   getTeamManagersDetails() {
   const EmployeeId = this.empinfo.employeeId;
   this.subscription = this.http
     .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
     .subscribe({
       next: (response: any) => {
         console.log('getEmployeesByhierarchy', response);
         if (response && response.length) {
           // No filter
           this.getEmployeeInfo = response.map((employee: any) => ({
             ...employee,
             fullName: `${
               employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
             }${employee.firstName} ${
               employee.middleName ? employee.middleName + ' ' : ''
             }${employee.lastName}`,
           }));
           console.log('getEmployeeInfo', this.getEmployeeInfo);
         }
       },
     });
 }


 
  cleardata() {
    this.modalService.dismissAll();
    this.permissionForm.reset();
  }
 
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formintions() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    this.firstDayOfCurrentMonthString = firstDayOfMonth
      .toISOString()
      .split('T')[0];
    this.lastDayOfCurrentMonthString = lastDayOfMonth
      .toISOString()
      .split('T')[0];
    this.permissionForm = this.fb.group({
      permissionDate: [null, Validators.required],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [null, [Validators.required,Validators.minLength(10), Validators.maxLength(250)]],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  
  getPastDate(): string {
    const days = Number(this.pastDatesAllowed ?? 0);
  
    if (isNaN(days)) {
      console.error('Invalid pastDatesAllowed:', this.pastDatesAllowed);
      return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
  
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - days); // subtract days for past
    return pastDate.toISOString().split('T')[0];
  }
  
  
 
  getFutureDate(): string {
    const days = Number(this.futureDatesAllowed ?? 0);
  
    if (isNaN(days)) {
      console.error('Invalid futureDatesAllowed:', this.futureDatesAllowed);
      return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
  
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + days);
    return futureDate.toISOString().split('T')[0];
  }

  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(`orgHolidays/getOrgHoliday/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.holidaysData = data;
          console.log("Holidays Data",this.holidaysData);
        },
      });
  }

  getDuration() {
    this.http
      .getData(`PermissionTypes`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaveTypes = response;
        },
      });
  }

  getEmployeeeWeekends() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.weekendsData = data;
          console.log("Weekends Data",this.weekendsData);
        },
      });
  }

  getPermissionTypes() {
    this.http
      .getData(`PermissionTypes?type=${'Permissions'}`)
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaveTypes = response as LeaveType[];
       
        },
        error(err: any) {
          console.log('errors', err);
        },
      });
  }

  getEAVData() {
    const params = 'Permissions';
    const param = [
      'maxHoursPerDay',
      'maxHoursPerMonth',
      'pastDatesAllowed',
      'allowedPerDay',
      'futureDatesAllowed'
    ];
    this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.permissionsValue = data as IEAV[];
          this.futureDatesAllowed = parseInt(
            this.permissionsValue?.find((item: any) => item.attribute === 'futureDatesAllowed')?.value ?? '0',
            10
          );
          
          this.pastDatesAllowed = parseInt(
            this.permissionsValue?.find((item: any) => item.attribute === 'pastDatesAllowed')?.value ?? '0',
            10
          );
        },
        error(err) {
          console.log('errors', err);
        },
      });
  }
  disaplyapplybutton=true;
  onCheckemployee(employeedId:any){
    this.http.setEmployeeIdPermission(employeedId);
    this.ProcessedCount=0;
    this.rejectedCount=0;
    this.ApprovedCount=0;
    this.pendingCount=0;
    this.permissions = [];
    if(employeedId){
      this.disaplyapplybutton=false;
      this.getDataPermissions(employeedId);
    }else{
      this.disaplyapplybutton=true;
      this.getDataPermissions(this.empinfo.employeeId);
    }
  }
  getDataPermissions(EmployeeId?: number) {
    let empId =EmployeeId
    this.subscription = this.http.getData(`RegularizationRequests/${empId}`).subscribe({
      next: (response: any) => {
        console.log(response);

        this.permissions = response
        console.log(this.permissions);
        this.permissions.forEach((element: { status: string }) => {
          if (element.status === 'Waiting for Approval') {
            this.pendingCount++;
          }
          if (element.status === 'Approved') {
            this.ApprovedCount++
          }

          if (element.status === 'Rejected') {
            this.rejectedCount++
          }
          if (element.status === 'Processed') {
            this.ProcessedCount++
          }
        });
      },
      error: (reason: any) =>{
        console.log(reason)
      } 
    })
  }


  applyPermission(permissionForm: FormGroup) {
    if (permissionForm.valid) {
      const formData = permissionForm.value;
      const payLoad = {
        raisedFor: this.empinfo.employeeId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: formData.permissionDate,
        createdDate: new Date().toISOString(), // current date
        type: formData.leaveType.name,
        status: 'Waiting for Approval',
        referenceTypeId: formData.leaveType.id,
        duration: formData.duration.value.toString(),
        notes: formData.reason,
        processedComment: formData.processedComment,
        moduleId: environment.permissionsModuleId,
      };
      this.spinnerLoader = true;
      this.http
        .postData('RegularizationRequests/create', payLoad, {
          responseType: 'text',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            // this.getCompOffRequest();
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request submitted successfully'
            );
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              permission: true,
            }));
            this.http.permissionTriggerSignal.set(true);
            this.permissionForm.reset();
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            console.error(err);
            const errorMessage =
              typeof err.error === 'string'
                ? err.error
                : err.error?.message || 'An error occurred';

            this.sharedModalService.openErrorModal(errorMessage);
          },
          complete: () => {
            this.spinnerLoader = false;
            this.permissionForm.reset();
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}