import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { IJob } from '../../../Interfaces/letters-model';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { WfhsearchfilterPipe } from "../../../Pipes/wfhsearchfilter.pipe";
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { SignalsService } from '../../../services/signals.service';
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';

@Component({
  selector: 'app-wfh-for-you-requset',
  imports: [
    CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    WfhsearchfilterPipe,
    DataLoaderContentComponent,
    TableModule,
],
  templateUrl: './wfh-for-you-requset.component.html',
  styleUrl: './wfh-for-you-requset.component.scss',
   encapsulation: ViewEncapsulation.None,
})
export class WfhForYouRequsetComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaves = new BehaviorSubject<AttendanceRequest[]>([]);
  approverComments = [] as any[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  searchValue: any;
  dataload = false;
  wfhsselect!: LeaveApproval[];
  selectedProducts!: LeaveApproval[];
  multiSelect=false;
  requestBody={} as any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalService:SignalsService
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }
selectCheck(Value:any){
  this.multiSelect = Array.isArray(Value) && Value.length > 0;
  console.log(this.multiSelect)
  }
  bulkapprove(approverPopup: any){
   this.intializeApproveForm()
   this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
}
bulkReject(rejectPopup: any){
  this.intializeRejectForm();
 this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
}
bulkProcess(){
 this.handleProcess(this.wfhsselect);
}
 canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage !==
          item.approvalHeader.finalapprovalStage &&
        this.rbac.allowedToAccess('Timeoff Tab.update')
    );
  }
  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage ===
          item.approvalHeader.finalapprovalStage &&
        this.rbac.allowedToAccess('Timeoff Tab.update')
    );
  }
  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.dataload = true;
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=EMP`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.leaves.next(response.data);
           this.wfhsselect = response.data;
        },
        error: (reason) => console.log(reason),
        complete: ()  =>{
          this.dataload = false;
        },
      });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openApproveModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }

  openRejectModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  handleAccept(approveForm: FormGroup): void {
    this.spinnerLoader = true;
    if (approveForm.valid) {
      const formData = approveForm.value;
      if(this.selectedProducts &&this.selectedProducts.length>0){
         let approvedBy =this.empinfo.employeeId.toString()
         let comments = formData.comments
        this.requestBody = this.selectedProducts.map((item) => ({
         id: item.approvalHeader.id,
        status: 'Approved',
        comments: comments,
        approvedBy: approvedBy,
        }));
      }else{
         this.requestBody = [{
           id: this.selectedLeaveData.approvalHeader.id,
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
      }];
      }
    
      this.sharedModalService.openLoaderModal(
        'Approving Request, Please wait...');
      this.http
        .putData(
          `PendingApproval/multiapprovereject`,
          this.requestBody
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.selectedProducts=[];
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Approved Successfully'
            );
            this.approveForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.signalService.wfhForYouTriggerSignal.set(true);
            this.signalService.wfhSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.getAllPendingApprovals();
            this.spinnerLoader = false;
          },
        });
    }
  }

  handleReject(rejectForm: FormGroup): void {
    this.spinnerLoader = true;
    this.spinnerLoader = true;
    if (rejectForm.valid) {
      const formData = rejectForm.value;
        if(this.selectedProducts &&this.selectedProducts.length>0){
         let approvedBy =this.empinfo.employeeId.toString()
         let comments = formData.comments
        this.requestBody = this.selectedProducts.map((item) => ({
         id: item.approvalHeader.id,
        status: 'Rejected',
        comments: comments,
        approvedBy: approvedBy,
        }));
      }else{
         this.requestBody = [{
          id: this.selectedLeaveData.approvalHeader.id,
         status: 'Rejected',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
      }];
      }
      this.sharedModalService.openLoaderModal(
        'Rejecting Request, Please wait...');
      this.http
        .putData(
          `PendingApproval/multiapprovereject`,
          this.requestBody
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.selectedProducts=[];
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Rejected Successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.signalService.wfhForYouTriggerSignal.set(true);
            this.signalService.wfhSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.getAllPendingApprovals();
            this.spinnerLoader = false;

          },
        });
    }
  }

  handleProcess(request: any) {
    this.selectedLeaveData=request;
      if(this.selectedProducts &&this.selectedProducts.length>0){
         let approvedBy =this.empinfo.employeeId.toString()
        this.requestBody = this.selectedProducts.map((item) => ({
         id: item.approvalHeader.id,
        status: 'Processed',
        approvedBy: approvedBy,
        }));
      }else{
         this.requestBody =[ {
        id: this.selectedLeaveData.approvalHeader.id,
        status: 'Processed',
        approvedBy: this.empinfo.employeeId.toString(),
      }];
      }
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...');
    this.http
      .putData(
        `PendingApproval/multiprocess`,
        this.requestBody
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.selectedProducts=[];
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request Processed Successfully'
          );
          this.signalService.wfhForYouTriggerSignal.set(true);
          this.signalService.wfhSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(
            reason.error.Message
          );
        },
        complete: () => {
          this.getAllPendingApprovals();
        },
      });
  }
  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.approverComments = value;
    console.log(this.approverComments);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
