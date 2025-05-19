import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import {
  LeaveApproval,
  LeaveApproverComment,
} from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffsearchPipe } from '../../../../Pipes/timeoffsearch.pipe';
import { TableModule } from 'primeng/table';
import { ICategoryDetails } from '../../../../Interfaces/timoff-model';
import moment from 'moment';
import { environment } from '../../../../../environments/environment';
import { SignalsService } from '../../../../services/signals.service';
@Component({
  selector: 'app-time-off-for-your-role-request',
  imports: [
   CommonModule,
      NgbPopoverModule,
      FormsModule,
      PaginatorModule,
      TranslateModule,
      DropdownModule,
      DateformatPipe,
      NoDataFoundComponent,
      TimeoffsearchPipe,
      TableModule,
  ],
  templateUrl: './time-off-for-your-role-request.component.html',
  styleUrl: './time-off-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TimeOffForYourRoleRequestComponent implements OnInit,OnDestroy {
  totalRecords = 100;
    first: any = 0;
    rows: any = 10;
    LOGIN: any;
    subscription!: Subscription;
    searchValue: any;
    leaves = new BehaviorSubject<LeaveApproval[]>([]);
    approverComments = [] as LeaveApproverComment[];
    leaveEntitlementsList = {} as ICategoryDetails;
    selectedLeaveData = {} as any;
    leavesselect!: LeaveApproval[];
    selectedProducts!: LeaveApproval[];
    @ViewChild('commentspopup') modalContent: any;
    spinnerLoader = false;
    multiSelect=false;
    destroy$: Subject<boolean> = new Subject<boolean>();
    options = [
      { label: 10, value: 10 },
      { label: 15, value: 15 },
      { label: 20, value: 20 },
      { label: 25, value: 25 },
    ];
    onRowsChange() {
      this.first = 0;
    }
  
    onPageChange(event: PaginatorState) {
      this.first = event.first;
      this.rows = event.rows;
    }
  
    constructor(
      private http: HttpService,
      private modalService: NgbModal,
      private conformationPopup: OpenModalService,
      public rbac: RbacService,private signalService:SignalsService
    ) {}
  
    ngOnInit(): void {
      this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getAllPendingApprovals();
      
    }
    selectCheck(Value:any){
      console.log(Value)
    this.multiSelect = Array.isArray(Value) && Value.length > 0;
    console.log(this.multiSelect)
    }
    getAllPendingApprovals() {
      let EmployeeId = parseInt(this.LOGIN.employeeId);
      let moduleId=environment.leavesModuleId;
      this.subscription = this.http
        .getData(
          `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`
        )
        .subscribe({
          next: (response: any) => {
            this.leaves.next(response.data);
            this.leavesselect = response.data;
          },
          error: (reason) => console.log(reason),
        });
    }
  
    checkLeaveBalance(Value: any, checkbalancepopup: any) {
      this.modalService.open(checkbalancepopup, {
        centered: true,
        backdrop: 'static',
      });
      let employeeId = Value.entity.leaveempId;
      this.subscription = this.http
        .getData(`LeaveEntitlements/employee/${employeeId}`)
        .subscribe({
          next: (res: any) => {
            // Find the category based on leaveCategoryId
            this.leaveEntitlementsList = res.data.find(
              (ele: any) => ele.category.id === Value.entity.leaveCategoryId
            );
            // Check if isProbationAllowed is explicitly true or null
            const isProbationAllowed =
              this.leaveEntitlementsList?.category?.isProbationAllowed;
            if (isProbationAllowed) {
              this.calculateProbationLeaves();
            } else {
              // Optionally, handle the case where probation is not allowed
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    }
  
    calculateProbationLeaves() {
      if (this.LOGIN.probationEndDate) {
        // Check if the employee is still on probation
        let currentDate = moment();
        let probationEndDate = moment(this.LOGIN.probationEndDate);
        // Create new Moment objects without time information
        let currentDateWithoutTime = currentDate.startOf('day');
        let probationEndDateWithoutTime = probationEndDate.startOf('day');
  
        if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
          // The employee is still on probation
          // Calculate the number of probation days
          let dateOfJoining = moment(this.LOGIN.dateOfJoining);
          let probationDays = currentDate.diff(dateOfJoining, 'days');
          // Divide by 30 and round down to the nearest 0.5 or whole number
          let months = Math.floor(probationDays / 30);
          this.leaveEntitlementsList.probationLeaves =
            months * this.leaveEntitlementsList.category.probationDays;
          if (
            this.leaveEntitlementsList.probationLeaves >=
            this.leaveEntitlementsList.allowedDays
          ) {
            this.leaveEntitlementsList.probationLeaves =
              this.leaveEntitlementsList.allowedDays;
          }
        } else {
          console.log('Employee is no longer on probation.');
        }
      } else {
        console.log('No probation end date provided.');
      }
    }
  
    comments(value: any, commentspopup: any) {
      this.modalService.open(commentspopup, {
        centered: true,
        backdrop: 'static',
      });
      this.approverComments = value;
    }
  
    issubmitdiable: boolean = false;
    ifreasonnull(Value: any) {
      if (!Value || !Value.trim()) {
        this.issubmitdiable = true;
      } else {
        this.issubmitdiable = false;
      }
    }
   canBulkApprove(): boolean {
      return this.selectedProducts?.every(
        (item) =>
          item.approvalHeader.currentapprovalStage !==
            item.approvalHeader.finalapprovalStage 
          
      );
    }
    canBulkProcess(): boolean {
      return this.selectedProducts?.every(
        (item) =>
          item.approvalHeader.currentapprovalStage ===
            item.approvalHeader.finalapprovalStage
      );
    }
    rejectleave(rejectPopup: any, selecteddata: any) {
      this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
      this.selectedProducts=[selecteddata];
    }
  bulkapprove(approverPopup: any){
   this.modalService.open(approverPopup, {
        centered: true,
        backdrop: 'static',
      });
  }
  bulkReject(rejectPopup: any){
   this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
  }
  bulkProcess(){
   this.handleProcess();
  }
    approveleave(approverPopup: any, selecteddata: any) {
      this.modalService.open(approverPopup, {
        centered: true,
        backdrop: 'static',
      });
      this.selectedProducts=[selecteddata];
    }
  
    processleave(selecteddata: any) {
      this.selectedProducts=[selecteddata];
  
       setTimeout(() => {
      this.handleProcess();
         }, 500);
    }
  
    handleAccept(data: LeaveApproval) {
      this.spinnerLoader = true;
      // let requestBody = {
      //   status: "Approved",
      //   comments: this.selectedLeaveData.comments,
      //   approvedBy: this.LOGIN.employeeId.toString()
      // }
      let approvedBy = this.LOGIN.employeeId.toString();
      let comments = this.selectedLeaveData?.comments || '';
  
      let requestBody = {
    requestProcessedBy:approvedBy,
    status: "Approved",
    comments: comments,
    moduleId: environment.leavesModuleId,
    isPlannedLeave: this.selectedLeaveData.isPlannedLeave,
    headerRequests: this.selectedProducts.map((item) => ({
        headerID: item.approvalHeader.id,
        currentStage:item.approvalHeader.currentapprovalStage
        // id: item.approvalHeader.id,
        // status: 'Approved',
        // comments: comments,
        // approvedBy: approvedBy,
        // currentapprovalStage:item.approvalHeader.currentapprovalStage
      }))
    }
      this.subscription = this.http
        .putData(`v2/PendingApproval/multiapprovals`, requestBody)
        .subscribe({
          next: (respone: any) => {
              this.selectedProducts=[];
              console.log(respone)
               if(respone&&respone.data.failureRecords.length<=0){
               this.conformationPopup.openSuccessModal(
              'Request Approved Successfully'
            );
            }
            else if(respone.data.failureRecords.length>0){
              this.conformationPopup.openSuccessModal(`Toatal Records Approved: ${respone.data.totalRecordCount}
                 Faild:${respone.data.failureRecordsCount} ${respone.data.failureRecords[0].message?respone.data.failureRecords[0].message:''} Successed:${respone.data.successRecordsCount}`)
            }
            setTimeout(() => {
              this.modalService.dismissAll();
              this.getAllPendingApprovals();
            }, 5000);
          },
          error: (reason: any) => {
                if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else{
            this.conformationPopup.openErrorModal('Request Approval Failed');
            }
            this.spinnerLoader = false;
          },
          complete: () => {
            this.spinnerLoader = false;
           this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          },
        });
    }
  
    handleReject() {
      this.spinnerLoader = true;
      let approvedBy = this.LOGIN.employeeId.toString();
      let comments = this.selectedLeaveData?.comments || '';
    let requestBody = {
      requestProcessedBy: approvedBy,
       status: 'Rejected',
       comments: comments,
       isPlannedLeave: false,
        moduleId: environment.leavesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
        headerID: item.approvalHeader.id,
        currentStage:item.approvalHeader.currentapprovalStage
      }))
    }
  
        // id: item.approvalHeader.id,
        // status: 'Rejected',
        // comments: comments,
        // approvedBy: approvedBy,
        // currentapprovalStage:item.approvalHeader.currentapprovalStage
      this.subscription = this.http
        .putData(`v2/PendingApproval/multiapprovals`, requestBody)
        .subscribe({
          next: (respone: any) => {
              this.selectedProducts=[];
             if(respone &&respone.data.failureRecords.length<=0){
               this.conformationPopup.openSuccessModal(
              'Request Rejected Successfully'
            )
            }
             else if(respone.data.failureRecords.length>0){
              this.conformationPopup.openSuccessModal(`Toatal Records Rejected: ${respone.data.totalRecordCount}
                 Faild:${respone.data.failureRecordsCount} ${respone.data.failureRecords[0].message?respone.data.failureRecords[0].message:''} Successed:${respone.data.successRecordsCount}`)
            }
            setTimeout(() => {
              this.modalService.dismissAll();
              this.getAllPendingApprovals();
            }, 2000);
          },
          error: (reason: any) => {
              if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else{
            this.conformationPopup.openErrorModal('Request Rejected Failed');
            }
            this.spinnerLoader = false;
          },
          complete: () => {
            this.spinnerLoader = false;
           this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          },
        });
    }
  
    handleProcess() { 
      let approvedBy = this.LOGIN.employeeId.toString();
      let requestBody = {
      requestProcessedBy: approvedBy,
       status: 'Processed',
        moduleId: environment.leavesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
        headerID: item.approvalHeader.id,
        currentStage:item.approvalHeader.currentapprovalStage
      }))
    }
  
      // let requestBody = {
      //   status: 'Processed',
      //   approvedBy: this.LOGIN.employeeId.toString(),
      // };
      console.log(requestBody);
      this.subscription = this.http
        .putData(`v2/PendingApproval/multiapprovals`, requestBody)
        .subscribe({
          next: (respone: any) => {
           // console.log(respone);
            this.selectedProducts=[];
               if(respone&&respone.data.failureRecords.length<=0){
                this.conformationPopup.openSuccessModal(
              'Request Processed Successfully'
            );
            }
             else if(respone.data.failureRecords.length>0){
              this.conformationPopup.openSuccessModal(`Toatal Records Processed: ${respone.data.totalRecordCount}
                 Faild:${respone.data.failureRecordsCount} ${respone.data.failureRecords[0].message?respone.data.failureRecords[0].message:''} Successed:${respone.data.successRecordsCount}`)
            }
            setTimeout(() => {
              this.modalService.dismissAll();
              this.getAllPendingApprovals();
            }, 2000);
          },
          error: (reason: any) => {
            console.log(reason);
            if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else if(reason.error.statusCode==400){
              this.conformationPopup.openErrorModal(reason.error.message)
            }
            else{
            this.conformationPopup.openErrorModal('Request Processed Failed');
            }
  
          },
          complete: () => {
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          },
        });
    }
  
    ngOnDestroy(): void {
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
    }
}
