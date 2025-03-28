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

@Component({
  selector: 'app-time-off-for-your-role-request',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe],
  templateUrl: './time-off-for-your-role-request.component.html',
  styleUrl: './time-off-for-your-role-request.component.scss'
})
export class TimeOffForYourRoleRequestComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  subscription!: Subscription;
  leaves = [] as LeaveApproval[];
  approverComments = [] as LeaveApproverComment[];
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
    openModal(commentspopup: any) {
      this.modalService.open(commentspopup, {centered: true,backdrop: 'static'});
    }
    getAllPendingApprovals() {
      let EmployeeId = parseInt(this.LOGIN.employeeId);
      console.log(EmployeeId);
      this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`).subscribe({
        next: (response: any) => {
          console.log(response);
          this.leaves = response.data as LeaveApproval[];
          console.log(this.leaves);
        },
        error: (reason) => console.log(reason),
      });
    }
  
    comments(value: any){
      this.approverComments = value;
      console.log(this.approverComments);
    }
}
