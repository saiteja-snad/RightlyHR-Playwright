import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterOutlet, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { ModuleInfoIconComponent } from '../../../../icons/module-info-icon/module-info-icon.component';
import { AccessForEmployeeinfoService } from '../../../../services/access-for-employeeinfo.service';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';
import { OffboardingChecklistService } from '../../../../services/offboarding-checklist.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { ModuleInformationComponent } from '../../../../shared/module-information/module-information.component';
import { ProfileInfoDetailsComponent } from '../../../../shared/profile-info-details/profile-info-details.component';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-initate-offboarding',
  imports: [CommonModule, RouterOutlet, ProfileInfoDetailsComponent, FormsModule, ReactiveFormsModule,
    TranslateModule, MultiSelectModule, ModuleInformationComponent, NgbPopoverModule, ConfirmationIconComponent,
    RouterModule, ModuleInfoIconComponent],
  templateUrl: './initate-offboarding.component.html',
  styleUrl: './initate-offboarding.component.scss'
})
export class InitateOffboardingComponent {
   approvalHistoryData: any = null;
  offboardingData!:any;
  iniateoffboardingDetails=[]as any;
  spinnerLoader=false;
  emppersonalinfo={} as any;
  loginEmployee={} as any;
  subscription!:Subscription;
  isreportes=[] as any;
  WFHRemoteMangers=[] as any;
  constructor(private http: HttpService, private authService: AuthService, private router: Router,
    public rbac: RbacService, private modalService: NgbModal, private fb: FormBuilder,
    private conformationPopup: OpenModalService, private route: ActivatedRoute,
    public fieldpremission: AccessForEmployeeinfoService, private accessNav: AccessNavigationService,
    private offboardingChecklistService: OffboardingChecklistService) {
      // Initialize with default checklist items
      this.initializeChecklistItems();
     }
     
  ngOnInit(): void {
    this.loginEmployee = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.emppersonalinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getreportesdata();
     this.getRemoteLoginManagers();
    this.getWorkfromhomeManager();
    // Subscribe to checklist items changes
    this.offboardingChecklistService.checklistItems$.subscribe(items => {
      if (items.length > 0) {
        this.offboardingData = items;
      }
    });
  }
  getWorkfromhomeManager() {
     const managerType = 'WFH'
    const url = `v2/Employeedata/GetEmployeesDataBasedonManager?EmployeeId=${this.emppersonalinfo.employeeId}&managerType=${managerType}`;
    this.subscription = this.http
      .getData(url)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // Assuming IWfh is your interface/model for the Manager data
          this.WFHRemoteMangers = data;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }

  getRemoteLoginManagers() {
    const managerType = 'Remote Login'
    const url = `v2/Employeedata/GetEmployeesDataBasedonManager?EmployeeId=${this.emppersonalinfo.employeeId}&managerType=${managerType}`;
    this.subscription = this.http.getData(url).subscribe({
      next: (data: any) => {
        this.WFHRemoteMangers = data;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }
  private initializeChecklistItems(): void {
    // Get default checklist items from the service
    const defaultItems = this.offboardingChecklistService.getDefaultChecklistItems();
    this.offboardingChecklistService.setChecklistItems(defaultItems);
  }
  // Get reportees data for the logged-in employee
  getreportesdata() {
    this.subscription = this.http.getData(`Employeedata/v1/getreportessdata?employeeId=${this.emppersonalinfo.employeeId}`).subscribe({
      next: (data: any) => {
        console.log('Offboarding data:', data);
        this.isreportes = data;
      },
      error: (err: any) => { }
    });
  }
modalOpen(content:any){
   // Get checklist items from the service
   this.offboardingData = this.offboardingChecklistService.getChecklistItems();
   // If no items in service, use default items from service
   if (!this.offboardingData || this.offboardingData.length === 0) {
     this.offboardingData = this.offboardingChecklistService.getDefaultChecklistItems();
     this.offboardingChecklistService.setChecklistItems(this.offboardingData);
   }
  this.modalService.open(content, { centered: true, backdrop: 'static' });
}

    navigationtoinitate(){
    this.spinnerLoader=true;
    let payload = [];
    
    // Get checklist items from service first, then fallback to storage, then default
    this.offboardingData = this.offboardingChecklistService.getChecklistItems();
    if (!this.offboardingData || this.offboardingData.length === 0) {
      this.offboardingData = this.offboardingChecklistService.getChecklistItemsFromStorage();
    }
    if (!this.offboardingData || this.offboardingData.length === 0) {
      this.offboardingData = this.offboardingChecklistService.getDefaultChecklistItems();
    }
    
    if (this.offboardingData && this.offboardingData.length > 0) {
      // Use checklist items
      payload = this.offboardingData.map((item: any, index: number) => ({
        employeeId: parseInt(this.emppersonalinfo.employeeId),
        startedBy: parseInt(this.loginEmployee.employeeId),
        moduleId: item.moduleId || null,
        stageType: 'Emp'
      }));
    } else {
      // Final fallback to default payload
      payload = [{
        employeeId: parseInt(this.emppersonalinfo.employeeId),
        startedBy: parseInt(this.loginEmployee.employeeId),
        moduleId: null,
      }];
    }
    
    if( this.offboardingData && this.offboardingData.length > 0 && (this.isreportes.length>0||this.WFHRemoteMangers?.length>0)){
      let reportesPayload = this.offboardingData.map((item: any) => ({
        employeeId: parseInt(this.emppersonalinfo.employeeId),
        startedBy: parseInt(this.loginEmployee.employeeId),
        moduleId: item.moduleId || null,
        stageType: 'Manager',
        reportingManagerId:parseInt(this.emppersonalinfo.employeeId),
      }));
      payload.push(...reportesPayload);
    }
    console.log('Final payload:', payload);

    this.subscription = this.http.postdata(`OffboardingTracker/start-offboarding`, payload).subscribe({
      next: (data: any) => {
        if(data){
          this.spinnerLoader=false;
          this.conformationPopup.openSuccessModal('Offboarding process initiated successfully');
          this.modalService.dismissAll();
          this.checkOffboardingCondition('/personalinfo/job/employmentType/initate-offboarding/leave-approvals');
          // Clear the stored checklist items after successful initiation
          this.offboardingChecklistService.clearChecklistItems();
          // this.router.navigate(['/personalinfo/job/employmentType/initate-offboarding/leave-approvals']);
        }
      },
      error: (err: any) => {
        this.spinnerLoader=false;
        console.log(err);
      },
    });
  }
  checkOffboardingCondition(link: string): void {
      this.subscription = this.http.getData(`OffboardingTracker/employee/${this.emppersonalinfo.employeeId}`).subscribe({
        next: (data: any) => {
          console.log('Offboarding data:', data);
          if (data?.data.length <= 0) {
            this.router.navigateByUrl(link);
          }
          else if(data?.data?.length >0){
            let employeedata = JSON.parse(localStorage.getItem("personaldata") || '{}');
            const inProgressItem = data?.data?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
            console.log('In-progress item:', inProgressItem);
            if (inProgressItem) {
            if(employeedata?.empstatus !='Inactive') {
            const moduleId = inProgressItem?.moduleId;
            this.navigateToModuleRoute(moduleId);
            console.log('lastestmoduleId',moduleId);}}
            else{
              this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen');
            }
            //this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding');
          }
           else {
            // Navigate to alternative route or show message
            this.router.navigateByUrl('/personalinfo/job/employmentType/offboarding-details');
          }
        },
        error: (err: any) => {
          console.log(err);
          // Handle error case - maybe navigate to error page or show message
          this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding-landingscreen');
        }
      });
    }
     // Navigate to route based on moduleId
    private navigateToModuleRoute(moduleId: number): void {
      const moduleRoutes: { [key: number]: string } = {
        [environment.leavesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/leave-approvals',
        [environment.wfhModuleId]: '/personalinfo/job/employmentType/initate-offboarding/wfh-approvals',
        [environment.remoteLoginModuleId]: '/personalinfo/job/employmentType/initate-offboarding/remote-login-approvals',
        [environment.compoffModuleId]: '/personalinfo/job/employmentType/initate-offboarding/compoff-approvals',
        [environment.permissionsModuleId]: '/personalinfo/job/employmentType/initate-offboarding/permissions-approvals',
        [environment.extraHoursModuleId]: '/personalinfo/job/employmentType/initate-offboarding/extrahours-approvals',
        [environment.attendanceRegularizationModuleId]: '/personalinfo/job/employmentType/initate-offboarding/regularization-approvals',
        [environment.expensesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/expenses-approvals',
        [environment.timesheetModuleId]: '/personalinfo/job/employmentType/initate-offboarding/timesheet-approvals',
      };

      const targetRoute = moduleRoutes[moduleId];
      if (targetRoute) {
        this.router.navigate([targetRoute]);
      }else{
        this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen');
      }
    }
}
