import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Iprobationapproval } from '../../../interfaces/pendingapprovalsmodel';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { ProbationdetailsPipe } from "../../../pipes/probationdetails.pipe";
import { Ipersonal } from '../../../interfaces/personal-modal';
import moment from 'moment';


@Component({
  selector: 'app-probation-pending-approvals',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule,NgbPopoverModule, PaginatorModule, DropdownModule, NoDataFoundComponent, ProbationdetailsPipe],
  templateUrl: './probation-pending-approvals.component.html',
  styleUrl: './probation-pending-approvals.component.scss'
})
export class ProbationPendingApprovalsComponent {
    subscription!: Subscription;
    probationDetails = [] as any;
    probationExtensionDuration!: number;
    searchValue: any;
    LOGIN: any;
    totalRecords = 100
    first: any = 0;
    rows: any = 10;
    isempeffectivevaild: boolean = true;
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
            console.log(this.probationDetails);
            
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

  onclickproceevalue(value: any) {
    let ProcessedRequest = this.myApproverComments.find((ele: any) => {
      return ele.approverRole === value;
    });
    this.selectedData.responseId = ProcessedRequest.metadata.responseId;
    this.selectedData.overAllRating = ProcessedRequest.metadata.Overallrating;
  }

  discontinue: boolean = false;
  extend: boolean = false;
  approve: boolean = false;
  buttondisable: boolean = false;
  // Function to handle toggling Early Relieving option
  toggleApprove() {
    if (!this.approve) {
      this.discontinue = false;
      this.extend = false;
      this.approve = true;
      this.buttondisable = true;
      this.selectedData.requestSelectedType = 'Approve';
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    }
    //  else {
    //   // Toggle off Early Relieving
    //   this.approve = false;
    //   this.clearApproveData();
    // }
  }
  toggleExtend() {
    this.discontinue = false;
    this.approve = false;
    this.extend = true;
    this.buttondisable = true;
    this.selectedData.requestSelectedType = 'Extend';
    // Clear data related to approve Relieving and Discontinue
    this.clearApproveData();
    this.clearDiscontinueData();
  }

  // Function to handle toggling Discontinue option
  toggleDiscontinue() {
    this.extend = false;
    this.approve = false;
    this.discontinue = true;
    this.buttondisable = true;
    this.selectedData.requestSelectedType = 'Reject';
    // Clear data related to Early Relieving and Extend
    this.clearApproveData();
    this.clearExtendData();
  }
  clearApproveData() {
    this.selectedData.comments = '';
  }

  // Function to clear data related to Extend
  clearExtendData() {
    this.selectedData.extenddate = null;
    this.selectedData.comments = ''; // Assuming comments is used for Extend
    this.selectedData.reasonForExtend = '';
  }

  // Function to clear data related to Discontinue
  clearDiscontinueData() {
    this.selectedData.comments = '';
    this.selectedData.rejectedReason = '';
  }

  issubmitdiable: boolean = false;
  ifreasonnull(Value: any) {
    console.log(Value);
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }

  getBlockedFutureDate(lastWorkingDate: string): string {
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day'); // Set time to start of day (midnight)
    // Format the date as "YYYY-MM-DD"
    const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');
    return formattedDate;
  }

  getBlockedFutureDateupto(startDate: string, duration: number): string {
    const startDateObj = moment(startDate).startOf('day'); // Set time to start of day (midnight)
    // Add the duration (e.g., 90 days) to the start date
    const futureDate = startDateObj.add(duration, 'days');
    // Format the future date as "YYYY-MM-DD"
    const formattedFutureDate = futureDate.format('YYYY-MM-DD');
    return formattedFutureDate;
  }

  jsonData = {} as any;
  handleProcess(f: NgForm) {
    if (this.selectedData.requestSelectedType == 'Approve') {
      this.jsonData = JSON.stringify({
        status: 'Processed',
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
    }
    if (this.selectedData.requestSelectedType == 'Reject') {
      this.jsonData = JSON.stringify({
        status: 'Rejected',
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
    }
    if (this.selectedData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        status: 'Extended',
        PrExtendedDate: this.selectedData.extenddate,
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
    }
    let requestBody = {
      status: 'Processed',
      comments: this.selectedData.comments,
      probationExtendedDate: this.selectedData.extenddate,
      meta: this.jsonData,
      responseId: this.selectedData.responseId,
      approvedBy: this.LOGIN.employeeId.toString(),
    };
    if (this.selectedData.requestSelectedType == 'Approve') {
      requestBody.status = 'Processed';
      requestBody.comments = this.selectedData.comments;
    }
    if (this.selectedData.requestSelectedType == 'Reject') {
      requestBody.status = 'Rejected';
      requestBody.comments = this.selectedData.rejectedReason;
    }
    if (this.selectedData.requestSelectedType == 'Extend') {
      requestBody.probationExtendedDate = this.selectedData.extenddate;
      requestBody.status = 'Processed';
      requestBody.comments = this.selectedData.comments;
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          //alert("Request Processed Successfully")
          //this.dataSuccessMsg('Probation Request Processed Successfully');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (reason: any) => {
          //this.dataFailureMsg(reason.error.message);
        },
        complete: () => {},
      });
  }


  reset() {
    this.clearApproveData();
    this.clearExtendData();
    this.clearDiscontinueData();
    this.discontinue = false;
    this.extend = false;
    this.approve = false;
    this.selectedData.proccesoption = '';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
