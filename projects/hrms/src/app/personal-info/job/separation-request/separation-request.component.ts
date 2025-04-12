import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Ipersonal,} from '../../../interfaces/personal-modal';
import moment from 'moment';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { OpenModalService } from '../../../services/open-modal.service';
import { ISeparation } from './separation-request';
import { environment } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-separation-request',
  imports: [CommonModule, TranslateModule, NgbPopoverModule, ReactiveFormsModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NgxDocViewerModule, NoDataFoundComponent],
  templateUrl: './separation-request.component.html',
  styleUrl: './separation-request.component.scss'
})
export class SeparationRequestComponent implements OnInit, OnDestroy {
  getSeparationDetails= new BehaviorSubject<ISeparation[]>([]);
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  empdata={} as Ipersonal;
  substatus: any;
  status: any;
  recallbuttonConditions = false;
  recallandearlyrelievingbuttonConditions = false;
  isLastWorkingDatePassed = false;
  showSaperationDots= true;
  decription_Storing_Variable: any;
  selectRecallrequest = {} as any;
  postEarlyRelievingRequest={} as any;
  appover_comments = {} as any;
  recallreason!:FormGroup;
  earlyReleivingform!:FormGroup;
  isLoading=false;
  constructor(private authService: AuthService,private fb: FormBuilder,private http: HttpService,private router: Router,
    private conformationPopup: OpenModalService,private modalService: NgbModal,) {
    // Initialize any required services or dependencies here
  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.formInitialization();
    // Simulate fetching separation details
    this.fetchSeparationDetails();
  }
  formInitialization(){
    this.recallreason = this.fb.group({
      recallReason: [null,[Validators.required,Validators.maxLength(250)]],
    });
    this.earlyReleivingform = this.fb.group({
      earlyReleivingDate: [null,[Validators.required]],
      earlyReleivingReason: [null,[Validators.required,Validators.maxLength(250)]],
    });
  }
  //function to get employee by id
  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    console.log(this.empinfo);

    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
          this.conformationPopup.openErrorModal ('Insertion of data faild');
        },
      });
  }
 
//function to get the separation details of the employee
  fetchSeparationDetails(): void {
    const EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`SeparationRequests/getbyemployeeId?Id=${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.getSeparationDetails.next(data);
          this.substatus = this.getSeparationDetails.value.map(
            (application: { status: any }) => application.status.toLowerCase()
          );
          const seperationStatus1 = [
            'waiting for approval',
            'approved',
            'processed',
            'early relieving processed',
            'extended',
          ];
          this.status = seperationStatus1.some((value) =>
            this.substatus.includes(value)
          );
          this.checkStatus();
          data.forEach((ele: any) => {
            if (
              (ele?.status?.toLowerCase() == 'waiting for approval' ||
                ele?.status?.toLowerCase() == 'approved') &&
              ele.recallStatus?.toLowerCase() == 'earlyrelieving'
            ) {
              this.recallandearlyrelievingbuttonConditions = true;
            }
            if (
              (ele?.status?.toLowerCase() == 'recalled' ||
                ele?.status?.toLowerCase() == 'approved') &&
              ele.recallStatus?.toLowerCase() == 'recalled'
            ) {
              this.recallbuttonConditions = true;
            }
          });
        },
      });
    const current = this.formatDate(moment());
    if (this.formatDate(this.empdata.lastworkingday < current)) {
      this.isLastWorkingDatePassed = true;
    }
    console.log(current);
  }
  //function to check the status of the request
  checkStatus() {
    if (this.status) {
      this.showSaperationDots = false;
    }
  }
  //function to format the data
  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }
//function to open the modal for the comments
  approverCommentsFunction(Value: any,content: any) {
    this.modalService.open(content, { centered: true });
    console.log(Value);
    this.appover_comments = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    });
  }
//function to store the disaciption values
  decription(value: any,content:any) {
    this.modalService.open(content, { centered: true });
    this.decription_Storing_Variable= value;
  }
    //function to select data of perticular record to  recall the request
    recallRequest(data: any,content: any) {
      this.modalService.open(content, { centered: true });
      this.selectRecallrequest = JSON.parse(JSON.stringify(data));
      console.log(this.selectRecallrequest);
    }
    //function to select the data of early relieving request
    earlyReleivingdata(data: any,content: any) {
      this.modalService.open(content, { centered: true });
      this.postEarlyRelievingRequest = data;
      console.log(this.postEarlyRelievingRequest);
    }
     //function to recall the request
   postRecallRequest() {
    this.isLoading=true;
    let currentDate = new Date();
    let payLoad = {
      // id: this.selectRecallrequest.id,
      employeeId: this.selectRecallrequest.employeeId,
      appliedDate: currentDate,
      description: this.recallreason.get('recallReason')?.value,
      lastWorkingDate: this.selectRecallrequest.lastWorkingDate,
      noticePeriodDuration: 0,
      status: 'Recalled',
      recallStatus: 'Recalled',
      requestType: this.selectRecallrequest.requestType,
      comments: this.selectRecallrequest.comments,
      recallReason: this.recallreason.get('recallReason')?.value,
      isDeleted: false,
      jobId: this.selectRecallrequest.jobId,
      currentApprover: this.selectRecallrequest.currentApprover,
      isEarlyRelieving: this.selectRecallrequest.isEarlyRelieving,
      isAcceptEarlyRelieving: this.selectRecallrequest.isAcceptEarlyRelieving,
      earlyRelievingDate: this.selectRecallrequest.earlyRelievingDate,
      parentId: this.selectRecallrequest.id,
      moduleId: environment.RecallrequestmoduleId,
    };
    console.log(payLoad);

    this.subscription = this.http
      .postdata(`SeparationRequests`, payLoad)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          if (res) {
            this.isLoading=false;
            this.modalService.dismissAll();
            this.recallreason.reset();
            this.conformationPopup.openSuccessModal('Recalled Request Raised successfully');
            this.fetchSeparationDetails();
          }
        },
        error: (err: any) => {
          this.isLoading=false;
          console.log(err);
          this.conformationPopup.openErrorModal(err.error.message)
        },
      });
  }
  difference = 0
  getBlockedFutureDate(lastWorkingDate: string): string {
    let earlyrelievingdate=this.earlyReleivingform.get('earlyReleivingDate')?.value;
    if (earlyrelievingdate && this.postEarlyRelievingRequest.appliedDate) {
      const d1 = moment(this.postEarlyRelievingRequest.appliedDate);
      const d2 = moment(earlyrelievingdate);
      this.difference = d2.diff(d1, 'days') + 1;
    } else {
      this.difference = 0;
    }
  console.log('Difference in days:', this.difference);
    const formattedDate = moment(lastWorkingDate).startOf('day').format('YYYY-MM-DD');
    console.log('Formatted date:', formattedDate);
    return formattedDate;
  }
  //function to raise the early relieving request
  postEarlyrelieving() {
    this.isLoading=true;
    let currentDate =moment()
    let payLoad = {
      // id: this.selectRecallrequest.id,
      employeeId: this.postEarlyRelievingRequest.employeeId,
      appliedDate: currentDate,
      description: this.earlyReleivingform.get('earlyReleivingReason')?.value,
      lastWorkingDate: this.earlyReleivingform.get('earlyReleivingDate')?.value,
      noticePeriodDuration: Math.round(this.difference),
      status: 'Waiting for Approval',
      recallStatus: 'EarlyRelieving',
      comments: this.postEarlyRelievingRequest.comments,
      recallReason: this.postEarlyRelievingRequest.recallReason,
      isDeleted: false,
      jobId: this.postEarlyRelievingRequest.jobId,
      currentApprover: this.postEarlyRelievingRequest.currentApprover,
      isEarlyRelieving: true,
      isAcceptEarlyRelieving: this.postEarlyRelievingRequest.isAcceptEarlyRelieving,
      earlyRelievingDate: this.earlyReleivingform.get('earlyReleivingDate')?.value,
      parentId: this.postEarlyRelievingRequest.id,
      reasonForEarlyRelieving: this.postEarlyRelievingRequest.reason,
      moduleId: environment.SeparationrequestmoduleId
    }
    console.log(payLoad);

    this.subscription = this.http.postdata(`SeparationRequests`, payLoad).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res) {
          this.isLoading=false;
          this.modalService.dismissAll();
          this.earlyReleivingform.reset();
        this.conformationPopup.openSuccessModal('Early Relieving Request Raised successfully');
          this.fetchSeparationDetails();
        }
      },
      error: (err: any) => {
        this.isLoading=false;
        this.conformationPopup.openErrorModal(err.error.message);
      }
    })
  }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 

