import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { PermissionRequestResponse, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-regularization-for-you-request',
  imports: [  CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule],
  templateUrl: './regularization-for-you-request.component.html',
  styleUrl: './regularization-for-you-request.component.scss'
})
export class RegularizationForYouRequestComponent implements OnInit,OnDestroy {
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
  regularization = [] as PermissionRequestResponse[];
  approverComments = [] as any[];
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  selectedLeaveData = {} as PermissionRequestResponse;
  approveForm!: FormGroup;
  rejectForm!:FormGroup;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  intializeRejectForm() {  
    this.rejectForm = this.fb.group({
      comments: ['',[Validators.required,Validators.maxLength(250)]],
    }); 

  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    let moduleId=environment.attendanceRegularizationModuleId;
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.regularization = response.data as PermissionRequestResponse[];
          console.log(this.regularization);
        },
        error: (reason) => console.log(reason),
      });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  openApproveModal(content: any, request: PermissionRequestResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }
  openRejectModal(content: any, request: PermissionRequestResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  handleAccept(approveForm: FormGroup): void {
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
      };

      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        )
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Approved Successfully'
            );
            this.approveForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              permission: true,
            }));
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {

            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleProcess(request: PermissionRequestResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
    };
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...');
    this.http
      .putData(
        `PendingApproval/process/${request.approvalHeader.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request Processed Successfully'
          );
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            permission: true,
          }));
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


  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      const requestBody = {
        status: 'Rejected',
        comments: formData.comments,
      };

      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        )
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Rejcted Successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData  = {} as PermissionRequestResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              permission: true,
            }));
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
          },
        });
    }
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
