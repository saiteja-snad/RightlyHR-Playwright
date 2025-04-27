import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
@Component({
  selector: 'app-comp-off-entitlement',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, 
    NoDataFoundComponent, DateformatPipe, ReactiveFormsModule, TranslateModule],
  templateUrl: './comp-off-entitlement.component.html',
  styleUrl: './comp-off-entitlement.component.scss'
})

export class CompOffEntitlementComponent {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaves = [] as AttendanceRequest[];
  approverComments = [] as any[];
  selectedLeaveData = {} as AttendanceRequest;
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;

  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private sharedModalService: OpenModalService, 
    public rbac: RbacService,
    public formValidation:FormValidationService
  ) {
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.leaves = [];
        }
        this.http.resetTriggerSignal(); // Reset after handling
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovals();
    } else {
      this.leaves = [];
    }
    this.intializeApproveForm();
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${environment.compoffModuleId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.leaves = response.data as AttendanceRequest[];
      },
      error: (reason) => console.log(reason),
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openApproveModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.selectedLeaveData = request;
  }

  openRejectModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  handleProcess(request: AttendanceRequest): void {
    const requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
    };
    this.sharedModalService.openLoaderModal('Processing Request, Please wait...');

    this.http.putData(`PendingApproval/process/${request.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.sharedModalService.openSuccessModal('Request Processed Successfully');
      },
      error: (reason: any) => {
        this.sharedModalService.openErrorModal(reason.error.Message);
      },
      complete: () => {
        this.http.triggerActionSignal();
        this.getAllPendingApprovals();
      },
    });
  }

  handleAccept(approveForm: FormGroup): void {
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId?.toString(),
      };
      this.sharedModalService.openLoaderModal('Accepting Request, Please wait...');
      this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Request Approved Successfully');
          this.http.triggerActionSignal();
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

  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      const requestBody = {
        status: 'Rejected',
        comments: formData.comments,
      };
      this.sharedModalService.openLoaderModal('Rejecting Request, Please wait...');

      this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Request Rejcted Successfully');
          this.rejectForm.reset();
          this.selectedLeaveData = {} as AttendanceRequest;
          this.http.triggerActionSignal();
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
    this.modalService.open(commentspopup, {centered: true, backdrop: 'static', size: 'lg'});
    this.approverComments = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}