import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Iprobationapproval } from '../../../Interfaces/pendingapprovalsmodel';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { ProbationdetailsPipe } from "../../../pipes/probationdetails.pipe";
import { Ipersonal } from '../../../Interfaces/personal-modal';

@Component({
  selector: 'app-probation-pending-approvals',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, ProbationdetailsPipe],
  templateUrl: './probation-pending-approvals.component.html',
  styleUrl: './probation-pending-approvals.component.scss'
})
export class ProbationPendingApprovalsComponent {
    subscription!: Subscription;
    probationDetails = new BehaviorSubject<Iprobationapproval[]>([]);
    probationExtensionDuration!: number;
    searchValue: any;
    LOGIN: any;
    totalRecords = 100
    first: any = 0;
    rows: any = 10;
    options = [
      { label: 10, value: 10 },
      { label: 15, value: 15 },
      { label: 20, value: 20 },
      { label: 25, value: 25 }
    ];
    constructor(private modalService: NgbModal, private http: HttpService) {}
  
    openModal(content: any) {
      this.modalService.open(content, {centered: true,backdrop: 'static' });
    }
    onRowsChange() {
      this.first = 0;
  
    }
    onPageChange(event: PaginatorState) {
      this.first = event.first;
      this.rows = event.rows;
  
    }

    ngOnInit(): void {
      this.LOGIN = JSON.parse(localStorage.getItem('fusionuser') || '{}');
      //console.log(this.isformsubmit);
      this.getProbationExtendDays();
      this.getAllPendingApprovals();
    }

    getAllPendingApprovals() {
      // let loggedInUser = this.authService.getToken();
      let EmployeeId = parseInt(this.LOGIN.employeeId);
      console.log(EmployeeId);
      this.subscription = this.http
        .getData(
          `PendingApproval/employee/${EmployeeId}?moduleId=20&approvedType=EMP`
        )
        .subscribe({
          next: (data: any) => {
            console.log(data.data);
            this.probationDetails = data.data.filter(
              (item: any) =>
                item.approvalHeader.status != 'Processed' &&
                item.approvalHeader.status != 'Rejected'
            );
            // this.filterPendingApprovalsByModule();
          },
          error: (reason) => console.log(reason),
        });
    }


    requesthandler = {} as any;
    selectedData = {} as any;
    selectedPrRequestDataforheader = {} as any;
    handleData(request: Iprobationapproval) {
      this.requesthandler = request;
      this.selectedData = request.entity;
      this.selectedPrRequestDataforheader = request.approvalHeader;
      console.log(this.selectedData);
    }


    myApproverComments = [] as any;
    approverComments(value: any) {
      const modalElement = document.getElementById('CommentsPopup');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
      }
      this.myApproverComments = value.map((ele: any) => {
        // Parse the metaData and assign it to metadata property
        const parsedMetaData = JSON.parse(ele.meta);
        return {
          ...ele, // Copy other properties from ele
          metadata: parsedMetaData, // Assign parsed metaData to metadata property
        };
      });
      console.log(this.myApproverComments);
    }


    closeModel() {
      const modalElement = document.getElementById('CommentsPopup');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
      }
    }

    openview() {
      this.closeModel();
      const modalElement = document.getElementById('rolereq');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
      }
    }

    setformView(employeeId: number, responseId: number) {
      this.http.communicationService.next({ employeeId, responseId });
    }
     

  handleRequests(request: Iprobationapproval) {
    this.requesthandler = request;
    this.selectedData = request.entity;
    this.selectedPrRequestDataforheader = request.approvalHeader;
    console.log(this.selectedData);
    this.getEmployeedatabyid(this.selectedData);
  }
  
  empdata = {} as Ipersonal;
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
          alert('Insertion of data faild');
        },
      });
  }

  getComments(value: any) {
    this.myApproverComments = value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.meta);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData, // Assign parsed metaData to metadata property
      };
    });
    console.log(this.myApproverComments);
  }
  setData(value: any) {
    localStorage.setItem('formdata', JSON.stringify(value) || '{}');
  }
    getProbationExtendDays() {
    const ProbationExtensionId: number = 2;
    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfiggetall`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let duration = data.find((ele: any) => {
            return ele.configValueId === ProbationExtensionId;
          });
          console.log(duration);
          this.probationExtensionDuration = duration.noOfDays;
        },
      });
  }
  
}
