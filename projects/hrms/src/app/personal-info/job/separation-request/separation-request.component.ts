import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Ipersonal, } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { OpenModalService } from '../../../services/open-modal.service';
import { ISeparation } from './separation-request';
import { environment } from '../../../../environments/environment';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-separation-request',
  imports: [CommonModule, TranslateModule, NgbPopoverModule, ReactiveFormsModule, FormsModule, PaginatorModule, 
    DropdownModule, DateformatPipe, NgxDocViewerModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './separation-request.component.html',
  styleUrl: './separation-request.component.scss'
})

export class SeparationRequestComponent implements OnInit, OnDestroy {
  getSeparationDetails = new BehaviorSubject<ISeparation[]>([]);
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  substatus: any;
  status: any;
  recallbuttonConditions = false;
  recallandearlyrelievingbuttonConditions = false;
  isLastWorkingDatePassed = false;
  showSaperationDots = true;
  decription_Storing_Variable: any;
  selectRecallrequest = {} as any;
  postEarlyRelievingRequest = {} as any;
  appover_comments = {} as any;
  recallreason!: FormGroup;
  earlyReleivingform!: FormGroup;
  isLoading = false;
  profileForm!: FormGroup;
  isDataLoaded = false;
  constructor(private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService,
     private modalService: NgbModal) {
    // Initialize any required services or dependencies here
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.getEmployeeId();
    this.formInitialization();
    // Simulate fetching separation details
    this.fetchSeparationDetails();
    this.getonboardPeriodData() ;
    this.getNodueClearance();
  }

  formInitialization() {
    this.recallreason = this.fb.group({
      recallReason: [null, [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]],
    });
    this.earlyReleivingform = this.fb.group({
      earlyReleivingDate: [null, [Validators.required]],
      earlyReleivingReason: [null, [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]],
    });
    this.profileForm = this.fb.group({
      emails: ['', [Validators.required, Validators.email]],
      noduerequestedemails: this.fb.array([]),
    });
  }

  //function to open the modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop : 'static'});
  }

  removeSection(index: number) {
    this.formemailsfornodue.removeAt(index);
  }

  get formemailsfornodue() {
    return this.profileForm.get('noduerequestedemails') as FormArray;
  }

  // Convenience getter for the emails field
  get emails() {
    return this.profileForm.get('emails');
  }

  addAlias() {
    this.formemailsfornodue.push(
      this.fb.control('', [Validators.required, Validators.email])
    );
  }

  requestNoDue(f: FormGroup) {
    this.isLoading = true;
    const noduereq = {
      requestedBy: this.empdata.employeeId,
      raisedFor: this.empdata.employeeId,
      requiredEmails: `${this.profileForm.value.emails}, ${this.profileForm.value.noduerequestedemails.join(', ')}`,
    };
    this.subscription = this.http.postdata('NoDueClearanceForm', noduereq).subscribe({
      next: (data: any) => {
        this.profileForm.reset();
        this.formemailsfornodue.clear();
        this.modalService.dismissAll();
        this.getNodueClearance();
        this.conformationPopup.openSuccessModal('No Due Request Raised Successfully');
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('reason.error.Message');
        const modalElement = document.getElementById('errorhide');
      },
    });
  }

  //function to get the notice period duration
  nodueDuration: any;
  getonboardPeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        let noduevalue = res.find((ele: any) => {
          return (
            ele.servingPeriodType?.toLowerCase() == 'button before no due'
          );
        });
        this.nodueDuration = noduevalue.duration;
      },
    });
  }

  //function to get the nodue list
 

  //funtion to check the valudation

  
  //function to get employee by id
  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data as Ipersonal;
        console.log(this.empdata);
        // this.isLastWorkingDate(this.empdata.lastworkingday);
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Insertion of data faild');
      },
    });
  }
  nodueclearancedetails = [] as any;
  getNodueClearance() {
    let employeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        
        this.nodueclearancedetails = data;
      }
    })
  }
  shouldShowButton(date:string): boolean {
    let lastworkingdate=date;
    const shouldShow = (this.isLastWorkingDate(lastworkingdate)) ;
    return shouldShow;
  }

  isLastWorkingDate(lastWorkingDate: string): boolean {
    if (lastWorkingDate) {
      const endDate = new Date(lastWorkingDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(endDate.getDate() - parseInt(this.nodueDuration));
      const currentDate = new Date();
      console.log(this.nodueDuration);
  
      // Check if the current date is between buttonEnabledDate and endDate
      const isComplete = currentDate >= buttonEnabledDate && currentDate <= endDate;
      console.log(isComplete)
      // Check if the current date is past the last working date
      const isPastLastWorkingDate = currentDate > endDate;
      console.log(isPastLastWorkingDate);
      
      // Return true if either condition is met
      return isComplete || isPastLastWorkingDate;
      
    }
    return false;
  }

  //function to get the separation details of the employee
  fetchSeparationDetails(): void {
    this.isDataLoaded=true;
    const EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`SeparationRequests/getbyemployeeId?Id=${EmployeeId}`).subscribe({
      next: (data: any) => {
        if(data){
          this.isDataLoaded=false;
       
        this.getSeparationDetails.next(data);
        this.substatus = this.getSeparationDetails.value.map(
          (application: { status: any }) => application.status.toLowerCase()
        );
        const seperationStatus1 = [
          'waiting for approval', 'approved', 'processed',
          'early relieving processed', 'extended',
        ];
        this.status = seperationStatus1.some((value) =>
          this.substatus.includes(value)
        );
        this.checkStatus();
        data.forEach((ele: any) => {
          if ((ele?.status?.toLowerCase() == 'waiting for approval' || ele?.status?.toLowerCase() == 'approved') &&
            ele.recallStatus?.toLowerCase() == 'earlyrelieving') {
            this.recallandearlyrelievingbuttonConditions = true;
          }
          if ((ele?.status?.toLowerCase() == 'recalled' || ele?.status?.toLowerCase() == 'approved') &&
            ele.recallStatus?.toLowerCase() == 'recalled') {
            this.recallbuttonConditions = true;
          }
        });
        const current = this.formatDate(moment());
    if (this.formatDate(this.empdata.lastworkingday < current)) {
      this.isLastWorkingDatePassed = true;
    }
      }

      },
      error: (err: any) => {
        this.isDataLoaded=false;
        this.getSeparationDetails.next([]);
      },


    });
  
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
  approverCommentsFunction(Value: any, content: any) {
    this.modalService.open(content, { centered: true , size:'xl', backdrop:'static'});
    this.appover_comments = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    });
  }

  //function to store the disaciption values
  decription(value: any, content: any) {
    this.modalService.open(content, { centered: true });
    this.decription_Storing_Variable = value;
  }

  //function to select data of perticular record to  recall the request
  recallRequest(data: any, content: any) {
    this.modalService.open(content, { centered: true, backdrop : 'static' });
    this.selectRecallrequest = JSON.parse(JSON.stringify(data));
  }

  //function to select the data of early relieving request
  earlyReleivingdata(data: any, content: any) {
    this.modalService.open(content, { centered: true, backdrop : 'static' });
    this.postEarlyRelievingRequest = data;
    console.log(this.postEarlyRelievingRequest.appliedDate);
  }

  get formattedAppliedDate(): string {
    const date = this.postEarlyRelievingRequest?.appliedDate;
    console.log(date);
    const dt = this.formatDate(date)
    console.log(dt);
    return dt;
  }

  closepopup(content:any){
    this.modalService.open(content,{centered: true,backdrop: 'static'})
  }
  popupclose(){
    this.profileForm.reset();
    this.recallreason.reset();
    this.earlyReleivingform.reset();
    this.modalService.dismissAll();
    
  }
  //function to recall the request
  postRecallRequest() {
    this.isLoading = true;
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
    this.subscription = this.http.postdata(`SeparationRequests`, payLoad).subscribe({
      next: (res: any) => {
        if (res) {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.recallreason.reset();
          this.conformationPopup.openSuccessModal('Recalled Request Raised successfully');
          this.fetchSeparationDetails();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(err.error.message)
      },
    });
  }

  difference = 0
  getBlockedFutureDate(lastWorkingDate: string): string {
    let earlyrelievingdate = this.earlyReleivingform.get('earlyReleivingDate')?.value;
    if (earlyrelievingdate && this.postEarlyRelievingRequest.appliedDate) {
      const d1 = moment(this.postEarlyRelievingRequest.appliedDate);
      const d2 = moment(earlyrelievingdate);
      this.difference = d2.diff(d1, 'days') + 1;
    } else {
      this.difference = 0;
    }
    const formattedDate = moment(lastWorkingDate).startOf('day').format('YYYY-MM-DD');
    return formattedDate;
  }

  //function to raise the early relieving request
  postEarlyrelieving() {
    this.isLoading = true;
    let currentDate = moment()
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
      reasonForEarlyRelieving: this.earlyReleivingform.get('earlyReleivingReason')?.value,
      moduleId: environment.SeparationrequestmoduleId
    }
    this.subscription = this.http.postdata(`SeparationRequests`, payLoad).subscribe({
      next: (res: any) => {
        if (res) {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.earlyReleivingform.reset();
          this.conformationPopup.openSuccessModal('Early Relieving Request Raised successfully');
          this.fetchSeparationDetails();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
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