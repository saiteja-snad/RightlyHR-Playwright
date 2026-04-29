import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import { OffboardingEmployeeapprovalsTabsComponent } from '../../../../shared/offboarding-employeeapprovals-tabs/offboarding-employeeapprovals-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OffboardingReportessapprovalsTabsComponent } from "../../../../shared/offboarding-reportessapprovals-tabs/offboarding-reportessapprovals-tabs.component";
import { OffboardingReloadService } from '../../../../services/offboarding-reload.service';
import { SignalsService } from '../../../../services/signals.service';
import { ModuleNavigationService } from '../../../../services/module-navigation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { OpenModalService } from '../../../../services/open-modal.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-approvals-layout',
  imports: [CommonModule, RouterModule, RouterOutlet, OffboardingEmployeeapprovalsTabsComponent, TranslateModule, OffboardingReportessapprovalsTabsComponent, ConfirmationIconComponent],
  templateUrl: './approvals-layout.component.html',
  styleUrl: './approvals-layout.component.scss'
})
export class ApprovalsLayoutComponent {
  progress = 0;
  spinnerLoader=false;
  spinnerLoaderskip=false;
 subscription!: Subscription;
 empinfo={} as any;
 stagestatus!:boolean;
 steps: any[] = [];
showFullSteps = false;
checklistItems: any[] = [];
isreportes=[] as any;
isSkip:boolean=false;
  constructor(private http: HttpService, public router: Router, private reloadService: OffboardingReloadService, private signalsService: SignalsService, private moduleNavService: ModuleNavigationService,private modalService: NgbModal,private conformationPopup: OpenModalService,private authservice:AuthService) {
    // Listen for reload triggers
    this.reloadService.reloadTrigger$.subscribe(() => {
      this.reloadAndNavigate();
    });

    // Listen for signals service trigger using effect
    effect(() => {
      if (this.signalsService.offboardingReloadTriggerSignal()) {
        this.reloadAndNavigate();
        this.signalsService.offboardingReloadTriggerSignal.set(false);
      }
    });
   }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    // this.checkEmployeeStatusAndRedirect();

    this.setProgress(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setProgress(event.urlAfterRedirects);
      }
    });
    this.setSteps();
    this.getinitateoffboardingdata();

  }
  checkEmployeeStatusAndRedirect(): void {
    const status = this.empinfo?.empstatus?.toLowerCase();
    if (status === 'inactive' || status === 'trainee inactive') {
      this.router.navigate(['/personalinfo/job/employmentType/offboarding-details']);
    }

  }

setSteps() {
  this.subscription=this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}`).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    let filterItemsforManager = data.data.filter((item: any) => item.stageType === 'Manager');
     this.isreportes=filterItemsforManager;
    if (filterItemsforManager && filterItemsforManager?.length>0) {
    this.steps = [
      { id: 1, name: 'Pending Requests' },
      { id: 2, name: 'Pending Approvals' },
      { id: 3, name: 'RM/TM change' },
      { id: 4, name: 'Offboarding Details' }
    ];
  } else {
    this.steps = [
      { id: 1, name: 'Pending Requests' },
      { id: 2, name: 'Offboarding Details' }
    ];
  }
    },
    error:(err:any)=>{
      console.log(err);
    }
  });


}
  getinitateoffboardingdata(){
  this.subscription=this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}`).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    this.checklistItems = data.data ||[];
    let filterItemsforManager = this.checklistItems.filter((item: any) => item.stageType === 'Manager');
    let filterItemsforEmp = this.checklistItems.filter((item: any) => item.stageType === 'Emp');
    let empstagestatus=this.checklistItems.length > 0 &&filterItemsforEmp.some((item: any) => item.status === 'InProgress');
    let managerstagestatus=this.checklistItems.length > 0 && filterItemsforManager.some((item: any) => item.status === 'InProgress');
    console.log(empstagestatus);
    console.log(managerstagestatus);
    if(this.isActive('/approval-requests')){
     this.stagestatus=managerstagestatus;
    }else{
      this.stagestatus=empstagestatus;
    }
    this.autonavigation();
    },
    error:(err:any)=>{console.log(err)}
  });

}
 navigation(){
    if (this.isreportes && this.isreportes.length > 0 && this.isActive('/initate-offboarding') && !this.isActive('/personalinfo/job/employmentType/approval-requests/no-approvals-screen')) {
     let filterItemsforemp = this.checklistItems.filter((item: any) => item.stageType === 'Emp');
     const inProgressItem = filterItemsforemp?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
     if (inProgressItem) {
       this.moduleNavService.navigateToApprovalRoute(inProgressItem?.moduleId);
     }else if(this.isActive('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen')){
       this.router.navigateByUrl('/personalinfo/job/employmentType/approval-requests/no-approvals-screen');
     }
   }
  else if(this.isActive('/approval-requests')){
    this.router.navigate(['/personalinfo/job/employmentType/initate-offboarding/team-reporting-manager-change']);
  }
  else{
    this.router.navigate(['/personalinfo/job/employmentType/initate-offboarding/employee-off-boarding']);
   }
 }
  reloadAndNavigate(): void {
    // Reload the offboarding data
    this.getinitateoffboardingdata();
    //this.getreportesdata();
  }
  // Auto-navigation logic to determine where to navigate based on in-progress items
  autonavigation() {
    if(!this.isSkip){
    if(!this.isActive('/personalinfo/job/employmentType/initate-offboarding/team-reporting-manager-change')){
    if (this.isreportes && this.isreportes.length > 0 && this.isActive('/approval-requests')) {
      let filterItemsforManager = this.checklistItems.filter((item: any) => item.stageType === 'Manager');
      const inProgressItem = filterItemsforManager?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
      if (inProgressItem) {
        this.moduleNavService.navigateToOffboardingRoute(inProgressItem?.moduleId);
      }
      else {
        this.router.navigateByUrl('/personalinfo/job/employmentType/approval-requests/no-approvals-screen');
      }
    }
    else if (this.isreportes && this.isreportes.length > 0 && this.isActive('/initate-offboarding')) {
      let filterItemsforemp = this.checklistItems.filter((item: any) => item.stageType === 'Emp');
      const inProgressItem = filterItemsforemp?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
      if (inProgressItem) {
        this.moduleNavService.navigateToApprovalRoute(inProgressItem?.moduleId);
      }
      else{
        this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen');
      }
    }
     else if (this.isreportes.length <= 0 && this.isActive('/initate-offboarding')) {
      let filterItemsforemp = this.checklistItems.filter((item: any) => item.stageType === 'Emp');
      const inProgressItem = filterItemsforemp?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
      if (inProgressItem) {
        this.moduleNavService.navigateToApprovalRoute(inProgressItem?.moduleId);
      }
      else{
        this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen');
      }
    }
  }
}
  }
  navigationtoPrevious(){
    this.router.navigate(['/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen']);
  }
navigationforSkip(){
  this.isSkip=true;
  
  // Get moduleId based on current route
  const moduleId = this.getModuleIdFromCurrentRoute();
  if (moduleId) {
    this.updateStageStatus(moduleId);
  }
}

// Get moduleId based on current route
getModuleIdFromCurrentRoute(): number | null {
  const currentUrl = this.router.url;
  const routeModuleMap: { [key: string]: number } = {
    'leave-approvals': environment.leavesModuleId,
    'wfh-approvals': environment.wfhModuleId,
    'compoff-approvals': environment.compoffModuleId,
    'remote-login-approvals': environment.remoteLoginModuleId,
    'permissions-approvals': environment.permissionsModuleId,
    'extrahours-approvals': environment.extraHoursModuleId,
    'regularization-approvals': environment.attendanceRegularizationModuleId,
    'expenses-approvals': environment.expensesModuleId,
    'timesheet-approvals': environment.timesheetModuleId,
    'employee-info-approvals': environment.pendingapprovalemployeid,
  };
  
  for (const [route, moduleId] of Object.entries(routeModuleMap)) {
    if (currentUrl.includes(route)) {
      return moduleId;
    }
  }
  return null;
}
modelpopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
  }
//funtion to update the stage status of the leave request
  updateStageStatus(moduleId: number): void {
    let loggedInUserId = this.authservice.getToken();
    this.spinnerLoaderskip=true;
    let data=this.checklistItems;
    const itemToUpdate = data.find((item: any) => (item.moduleId === moduleId && item.status === 'InProgress'));
    
    if (!itemToUpdate) {
      this.spinnerLoaderskip=false;
      this.isSkip=false;
      return;
    }
    
    let id = itemToUpdate.id;
    let paylod={
      id:id,
      status:'Skipped',
      skippedBy: loggedInUserId.employeeId,
    }
  this.subscription=this.http.putData(`OffboardingTracker/update/${id}`, paylod).subscribe({
        next: (response: any) => {
           if(response){
           this.modalService.dismissAll();
           this.conformationPopup.openSuccessModal("This step has been skipped successfully");
           this.spinnerLoaderskip=false;
           
           setTimeout(() => {
             this.isSkip=false;
             this.reloadService.triggerReload();
             this.signalsService.offboardingReloadTriggerSignal.set(true);
           }, 300);
           }
        },
        error: (reason: any) => { 
          console.error('Error updating stage status:', reason);
          this.spinnerLoaderskip=false;
          this.isSkip=false;
        },
      });
  }
  setProgress(url: string) {
    if (url.includes('/initate-offboarding/team-reporting-manager-change')) {
      this.progress = 3;
    } else if (url.includes('/initate-offboarding/employee-off-boarding')) {
      this.progress = 4;
    } else if (url.includes('/approval-requests')) {
      this.progress = 2;
    } else if (url.includes('/initate-offboarding')) {
      this.progress = 1;
    } else {
      this.progress = 1;
    }
  }

  getStepState(index: number): string {
    const stepNum = index + 1;
    if (stepNum < this.progress) return 'completed';
    if (stepNum === this.progress) return 'active';
    return 'inactive';
  }

  getCompletedLineWidth(): string {
    if (this.steps.length <= 1) return '0%';
    const completedSegments = this.progress - 1;
    const totalSegments = this.steps.length - 1;
    const pct = Math.min((completedSegments / totalSegments) * 100, 100);
    return `${pct}%`;
  }

  getProgressWidth(): string {
    const maxSteps = 4;
    const pct = (this.steps.length / maxSteps) * 100;
    return `${pct}%`;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  //function to navigate the url based on the received status of the offboarding process
  navigateBasedOnStatus(): void {
    this.subscription=this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}`).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    },
    error:(err:any)=>{console.log(err)}
  });
  }

  // Check if user can proceed to next step
  canProceedToNext(): boolean {
    // If we're in approval requests, check if there are any in-progress items
    if (this.isActive('/approval-requests')) {
      let filterItemsforManager = this.checklistItems.filter((item: any) => item.stageType === 'Manager');
      const hasInProgressItems = filterItemsforManager.some((item: any) => item.status === 'InProgress');
      return !hasInProgressItems; // Can proceed only if no in-progress items
    }

    // For employee requests, check if there are any in-progress items
    let filterItemsforEmp = this.checklistItems.filter((item: any) => item.stageType === 'Emp');
    const hasInProgressItems = filterItemsforEmp.some((item: any) => item.status === 'InProgress');
    return !hasInProgressItems; // Can proceed only if no in-progress items
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
