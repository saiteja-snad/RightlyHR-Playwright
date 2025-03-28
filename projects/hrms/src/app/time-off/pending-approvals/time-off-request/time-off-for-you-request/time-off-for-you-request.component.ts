import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IPendingApprovals, LeaveApproval, LeaveApproverComment } from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";
import moment from 'moment';
import { ICategoryDetails } from '../../../../Interfaces/timoff-model';

@Component({
  selector: 'app-time-off-for-you-request',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe],
  templateUrl: './time-off-for-you-request.component.html',
  styleUrl: './time-off-for-you-request.component.scss'
})
export class TimeOffForYouRequestComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  subscription!: Subscription;
  leaves = [] as LeaveApproval[];
  approverComments = [] as LeaveApproverComment[];
  leaveEntitlementsList ={} as ICategoryDetails;
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
  constructor(private http: HttpService,private modalService: NgbModal) {  
  }
  
  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovals();
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
  checkLeaveBalance(Value: any,checkbalancepopup: any) {
    console.log('method called');
   // this.openModals(this.modalContent);
    this.modalService.open(checkbalancepopup, {centered: true,backdrop: 'static'});
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
}
