import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { AuthService } from '../../../../services/auth.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { Router } from '@angular/router';
import { OffboardingReloadService } from '../../../../services/offboarding-reload.service';

@Component({
  selector: 'app-regularization-approvals',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    TableModule,
    DataLoaderContentComponent,
    InfoIconComponent, ConfirmationIconComponent],
  templateUrl: './regularization-approvals.component.html',
  styleUrl: './regularization-approvals.component.scss'
})
export class RegularizationApprovalsComponent {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  searchValue: any | null;
  spinnerLoader = false;
  multiSelect = false;
  issubmitdiable = false;
  dataLoad = false;
  isSelectAll: boolean = false;
  regularizations = new BehaviorSubject<any[]>([]);
  selectedregularizationData = {} as any;
  selectedSandwichItem: any = null;
  regularizationsselect=[] as any;
  selectedProducts= [] as any[];
  responseSummary!: any;
  requestBody = {} as any;
  @ViewChild('regularizationSummary') regularizationSummary: any;
  @ViewChild('dt') table!: Table;
 selectedregularizationStatus: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
dataforprocess:any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  totalCount: any;

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
checklistdata:any;
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public formsValidation: FormValidationsService,
    public rbac: RbacService, private signalService: SignalsService,
    private auth:AuthService,public router: Router,private reloadService: OffboardingReloadService
  ) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getinitateoffboardingdata()
    this.getAllPendingApprovals();
  }
 getinitateoffboardingdata(){
  this.http.getData(`OffboardingTracker/employee/${this.LOGIN.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    this.checklistdata = data.data ||[];
    },
    error:(err:any)=>{
      console.log(err)
    }
  });

}
onStatusRejectSelect(status: string) {
  this.selectedregularizationStatus = status;
  if (status === 'reject') {
    this.selectedregularizationData.comments = 'Rejected';
  }
  // else if (status === 'planned') {
  //   this.selectedregularizationData.comments = 'Planned regularization';
  // } else if (status === 'unplanned') {
  //   this.selectedregularizationData.comments = 'Unplanned regularization';
  // }
}
//select check
  hasSelectedAllOnce = false;
  selectCheck(value: any) {
    this.multiSelect = Array.isArray(value) && value.length > 0;

    if (!value || value.length === 0) {
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      return;
    }

    const stageMap: { [stage: string]: any[] } = {};

    value.forEach((item: any) => {
      const stage = item.approvalHeader?.currentapprovalStage;
      if (!stageMap[stage]) {
        stageMap[stage] = [];
      }
      stageMap[stage].push(item);
    });

    const stages = Object.keys(stageMap);
    const totalAvailable = this.regularizations?.getValue().length || 0;
    const totalSelected = value.length;
    const isBulkSelect = totalSelected === totalAvailable;

    if (isBulkSelect && stages.length > 1) {
      if (this.hasSelectedAllOnce) {
        this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
      }

      this.hasSelectedAllOnce = true;

      let dominantStage = stages[0];
      let maxCount = stageMap[dominantStage].length;

      for (const stage of stages) {
        const count = stageMap[stage].length;
        if (count > maxCount || (count === maxCount && stage === '1')) {
          dominantStage = stage;
          maxCount = count;
        }
      }

      const dominantItems = stageMap[dominantStage];
      this.selectedProducts = [...dominantItems];
      setTimeout(() => this.updateTableSelectionState(dominantItems));
      return;
    }

    if (!isBulkSelect && stages.length > 1) {
      this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
      const validStage = this.selectedProducts[0]?.approvalHeader?.currentapprovalStage;
      const newSelection = value.filter(
        (item: { approvalHeader: { currentapprovalStage: string; }; }) => item.approvalHeader?.currentapprovalStage === validStage
      );
      this.selectedProducts = [...newSelection];
      setTimeout(() => this.updateTableSelectionState(newSelection));
      return;
    }

    this.selectedProducts = [...value];
  }


  private updateTableSelectionState(selectedItems: any[]) {
    this.selectedProducts = [...selectedItems];

    if (this.table) {
      this.table.selection = null;
      setTimeout(() => {
        this.table.selection = selectedItems;
      });
    }
  }

  previousSearchValue: string = '';
  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue;
      this.multiSelect = false;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedregularizations(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let regularizations = this.regularizationsselect ?? [];

    if (search) {
      regularizations = regularizations.filter((item: any) =>
        item.fusionEmpId?.toLowerCase().includes(search) ||
        item.employeeName?.toLowerCase().includes(search) ||
        item.duration?.toString().toLowerCase().includes(search) ||
        item.type?.toLowerCase().includes(search)
      );
    }

    // Sort (preserve original sorting logic)
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      this.regularizations.next(regularizations);
      return this.regularizations.getValue();
    }

    const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
    const selected = regularizations.filter((item:any) => selectedIds.has(item.approvalHeader?.id));
    const unselected = regularizations.filter((item:any) => !selectedIds.has(item.approvalHeader?.id));
    this.regularizations.next([...selected, ...unselected]);
    return this.regularizations.getValue();
  }

//get all pending approvals
  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    let moduleId = environment.attendanceRegularizationModuleId;
    this.dataLoad = true;
     let url:any;
    if(this.isActive('/approval-requests')){
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}&reportingManagerId=${EmployeeId}`;
      }else{
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}`;
      }
    this.http.getData(url).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.regularizations.next(response?.modules[0].data);
          console.log(response?.modules);

          this.regularizationsselect = response?.modules[0].data;
        },
        error: (reason) => {
          this.dataLoad = false;
        },
        complete: () => {
          this.dataLoad = false;
        }
      });
  }

  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
       this.selectedregularizationStatus = null;
    } else {
      this.issubmitdiable = false;
    }
  }

  canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage !==
        item.approvalHeader?.finalapprovalStage

    );
  }

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage ===
        item.approvalHeader?.finalapprovalStage
    );
  }

  rejectregularization(rejectPopup: any, selecteddata: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
    this.selectedregularizationData = selecteddata;
  }

  bulkapprove(approverPopup: any) {
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
  }
processpopup(approverPopup: any, selecteddata?: any) {
  this.dataforprocess=selecteddata;
  console.log(this.dataforprocess);

this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
}
  bulkReject(rejectPopup: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
  }

  bulkProcess() {
    this.handleProcess(this.regularizations);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }
//reject regularization
  handleReject(form: any) {
    let loggedinuser= this.auth.getToken()
    this.spinnerLoader = true;
    let approvedBy =loggedinuser.employeeId.toString();
    let comments = this.selectedregularizationData?.comments || '';
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedregularization: false,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      }
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedregularization: false,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: [
          {
            headerID: this.selectedregularizationData.pendingApprovalsHeader?.id,
            currentStage: this.selectedregularizationData.pendingApprovalsHeader?.currentapprovalStage,
          },
        ],
      };
    }
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.updateStageStatus();
          this.responseSummary = response.data;
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected regularization requests rejected successfully');
            } else{
            this.signalService.handleResponse(this.responseSummary, 'regularization request rejected successfully');
            }
          } else {
            this.openModal(this.regularizationSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('regularization Request Rejected Failed');
          }
          this.spinnerLoader = false;
          form.resetForm();
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect = false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  handleProcess(selecteddata: any) {
    let loggedinuser= this.auth.getToken()
    this.selectedregularizationData = selecteddata;
    let approvedBy = loggedinuser.employeeId.toString();
    let message = null;
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      }
      message = 'Processing Selected regularization Requests...';
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: [
          {
            headerID: this.selectedregularizationData.pendingApprovalsHeader?.id,
            currentStage: this.selectedregularizationData.pendingApprovalsHeader?.currentapprovalStage,
          },
        ],
      };
      message = 'Processing Selected regularization Requests...';
    }
    this.conformationPopup.openLoaderModal(message);
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.updateStageStatus();
          this.responseSummary = response.data;
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected regularization requests processed successfully');
            }else{
            this.signalService.handleResponse(this.responseSummary, 'regularization request processed successfully');
            }
          } else {
            this.openModal(this.regularizationSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('regularization Request Processed Failed');
          }
        },
        complete: () => {
          this.multiSelect = false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  closeSummary() {
    this.modalService.dismissAll();
    this.responseSummary = null;
  }
//funtion to update the stage status of the leave request
  updateStageStatus() {
    let data= this.checklistdata;
    let id = data.find((item: any) => item.moduleId === environment.attendanceRegularizationModuleId).id;
    let paylod={
      id:id,
      employeeId: this.LOGIN.employeeId,
      moduleId: environment.attendanceRegularizationModuleId,
      reportingManagerId:this.LOGIN.employeeId
    }
    this.http.putData(`OffboardingTracker/${id}`, paylod).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
         // Trigger layout reload
          this.reloadService.triggerReload();
          this.signalService.offboardingReloadTriggerSignal.set(true);
        },
        error: (reason: any) => { },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }
}
