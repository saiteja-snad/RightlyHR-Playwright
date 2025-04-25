import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { LeaveApproval, LeaveApproverComment } from '../../../Interfaces/pendingapprovalsmodel';
import { ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { LeavesPendingapprovalsPipe } from '../../../Pipes/leaves-pendingapprovals.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-time-off',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, LeavesPendingapprovalsPipe,NoDataFoundComponent],
  templateUrl: './time-off.component.html',
  styleUrl: './time-off.component.scss'
})
export class TimeOffComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  subscription!: Subscription;
  searchValue :any;
  leaves = [] as LeaveApproval[];
  approverComments = [] as LeaveApproverComment[];
  leaveEntitlementsList ={} as ICategoryDetails;
  selectedLeaveData = {} as any;
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
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
  ) {  
    // Signal reaction for employee switch
  effect(() => {
    if (this.http.trigger()) {
      const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
      if (data && Object.keys(data).length > 0) {
        this.LOGIN = data;
        this.getAllPendingApprovals();
      } else {
        this.leaves = [];
      }

      this.http.resetTriggerSignal(); 
    }
  });
  }
  
  ngOnInit(): void {
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');

  if (storedEmployee && Object.keys(storedEmployee).length > 0) {
    this.LOGIN = storedEmployee;
    this.getAllPendingApprovals();
  } else {
    this.leaves = [];
  }
  }
  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=EMP`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.leaves = response.data as LeaveApproval[];
        console.log(this.leaves);
      },
      error: (reason) => console.log(reason),
    });
  }
  checkLeaveBalance(Value: any, checkbalancepopup: any) {
    this.modalService.open(checkbalancepopup, { centered: true, backdrop: 'static' });
    let employeeId = Value.entity.leaveempId;
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${employeeId}`).subscribe({
      next: (res: any) => {
        console.log(res.data);
        // Find the category based on leaveCategoryId
        this.leaveEntitlementsList = res.data.find((ele: any) => ele.category.id === Value.entity.leaveCategoryId);

        // Check if isProbationAllowed is explicitly true or null
        const isProbationAllowed = this.leaveEntitlementsList?.category?.isProbationAllowed;
        console.log('isProbationAllowed value:', isProbationAllowed);

        if (isProbationAllowed) {
          console.log('Probation is allowed. Proceeding to calculate probation leaves.');
          this.calculateProbationLeaves();
        } else {
          console.log('Probation is not allowed. Skipping calculation.');
          // Optionally, handle the case where probation is not allowed
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
  calculateProbationLeaves() {

    if (this.LOGIN.probationEndDate) {
      // Check if the employee is still on probation
      let currentDate = moment();
      console.log('Current Date:', currentDate);

      let probationEndDate = moment(this.LOGIN.probationEndDate);
      console.log('Probation End Date:', probationEndDate);

      // Create new Moment objects without time information
      let currentDateWithoutTime = currentDate.startOf('day');
      let probationEndDateWithoutTime = probationEndDate.startOf('day');

      if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
        // The employee is still on probation
        console.log('Employee is still on probation.');

        // Calculate the number of probation days
        let dateOfJoining = moment(this.LOGIN.dateOfJoining);
        console.log('Date of Joining:', dateOfJoining);

        let probationDays = currentDate.diff(dateOfJoining, 'days');
        console.log('Probation Days:', probationDays);

        // Divide by 30 and round down to the nearest 0.5 or whole number
        let months = Math.floor(probationDays / 30);
        console.log('month Leaves:', months);

        this.leaveEntitlementsList.probationLeaves = months * this.leaveEntitlementsList.category.probationDays;
        console.log('Probation Leaves:', this.leaveEntitlementsList.probationLeaves);


        if (this.leaveEntitlementsList.probationLeaves >= this.leaveEntitlementsList.allowedDays) {
          this.leaveEntitlementsList.probationLeaves = this.leaveEntitlementsList.allowedDays
        }
        console.log('Probation Leaves calculation complete.');
      } else {
        console.log('Employee is no longer on probation.');
      }
    } else {
      console.log('No probation end date provided.');
    }
  }
  comments(value: any, commentspopup: any){
    this.modalService.open(commentspopup, {centered: true,backdrop: 'static'});
    this.approverComments = value;
    console.log(this.approverComments);
  }

  issubmitdiable: boolean = false;
  ifreasonnull(Value: any) {
    console.log(Value)
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }


  

  rejectleave(rejectPopup : any, selecteddata : any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
    this.approveRequest(selecteddata);
   }
  approveleave(approverPopup : any, selecteddata : any) {
    this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    this.approveRequest(selecteddata);
   }
   processleave(selecteddata : any) {
    //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    this.approveRequest(selecteddata);
    this.handleProcess(selecteddata);
   }
   approveRequest(leaveRequest:LeaveApproval){
    //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    if(leaveRequest){
      
      this.subscription = this.http.getData(`Timeoff/getById/${leaveRequest.approvalHeader.referenceEntityId}`).subscribe({
        next:(response : any) =>{
          this.selectedLeaveData =  response
          this.selectedLeaveData.request = leaveRequest
          console.log(this.selectedLeaveData.request);
          
        },
        error:(err) =>{},
        complete:()=>{}
      })
    }
  }
   handleAccept(data: LeaveApproval) {
    let requestBody = {
      status: "Approved",
      comments: this.selectedLeaveData.comments,
      approvedBy: this.LOGIN.employeeId.toString()
    }
    console.log(data);
    console.log(data.request.approvalHeader.id);
    console.log(requestBody)
    this.subscription = this.http.putData(`PendingApproval/${data.request.approvalHeader.id}`, requestBody).subscribe({
      next: (respone: any) => {
        console.log(respone);
        this.conformationPopup.openSuccessModal(
          'Request Accepted Successfully');
          setTimeout( () => {
            this.modalService.dismissAll();
            window.location.reload();
          }, 2000);
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal(
          'Request Accepted Failed');
      },
      complete: () => {

      },


    })
  }

  handleReject(data: LeaveApproval) {
    let requestBody = {
      status: "Rejected",
      comments: this.selectedLeaveData.comments,
      approvedBy: this.LOGIN.employeeId.toString()
    }
    console.log(data);
    console.log(requestBody)
    this.subscription = this.http.putData(`PendingApproval/${data.request.approvalHeader.id}`, requestBody).subscribe({
      next: (respone: any) => {
        console.log(respone);
        this.conformationPopup.openSuccessModal(
          'Request Rejected Successfully');
          setTimeout( () => {
            this.modalService.dismissAll();
            window.location.reload();
          }, 2000);
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal(
          'Request Rejected Failed');
      },
      complete: () => {

      },


    })
  }

  handleProcess(data: LeaveApproval){
    let requestBody={
      status: "Processed",
      approvedBy:this.LOGIN.employeeId.toString()
    }
    console.log(data);
    console.log(data.approvalHeader.id);
    console.log(requestBody)
    this.subscription =  this.http.putData(`PendingApproval/process/${data.approvalHeader.id}`,requestBody).subscribe({
      next:(respone:any)=>{
        console.log(respone);
        this.conformationPopup.openSuccessModal(
          'Request Processed Successfully');
          setTimeout( () => {
            this.modalService.dismissAll();
            window.location.reload();
          }, 2000);
      },
      error:(reason:any)=>{
        console.log(reason);
        this.conformationPopup.openSuccessModal(
          'Request Processed Failed');
      },
      complete:()=>{
       },
    })
  }
}
