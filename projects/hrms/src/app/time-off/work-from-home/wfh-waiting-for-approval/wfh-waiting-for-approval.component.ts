import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { SignalsService } from '../../../services/signals.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
@Component({
  selector: 'app-wfh-waiting-for-approval',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    InfoIconComponent,
    ConfirmationIconComponent
  ],
  templateUrl: './wfh-waiting-for-approval.component.html',
  styleUrl: './wfh-waiting-for-approval.component.scss',
})

export class WfhWaitingForApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  waitingForApprovalWFHs: ICompOff[] = [];
  subscription!: Subscription;
  compOff = [] as any;
  waitingForApprovalWFHCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  permissionForLoggedInUser: boolean = true;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  cancelForm!: FormGroup;
  isLoading = false;
  selectedYear: any;
  selectedWFHData: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;



  @ViewChild('leaveSummary') leaveSummary: any;

  spinnerLoader = false;
  selectedLeaveStatus: any;
  requestSummary: any;
  approverComments: any[] = [];

  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  constructor(private http: HttpService, private signalService: SignalsService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public rbac: RbacService, private fb: FormBuilder,
    public formsValidation: FormValidationsService, private TimeoffYearFilterService: TimeoffYearFilterService
  ) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh || this.http.wfhTriggerSignal()) {
        this.getWFHRequests();
        // this.http.tirggerCountSignal.update((status) => ({
        //   ...status,
        //   wfh: false,
        // }));
        // this.http.wfhTriggerSignal.set(false);
      } else {
        this.getWFHRequests();
      }
    });
  }

  ngOnInit(): void {

    this.initializeApproveForm();
    this.initializeRejectForm();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdWFH$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getWFHEMPRequests();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getWFHRequests();
          }
        });
      }
    });
    this.formInializer();
  }

  initializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  formInializer() {
    this.cancelForm = this.fb.group({
      cancelReason: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(250)]],
    });
  }

  isBeforeToday(date: string | Date): boolean {
    return moment().isSameOrBefore(moment(date), 'day');
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
    this.cancelForm.reset();
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getWFHRequests() {
    let empId = this.empinfo.employeeId;
    this.dataload = true;
    this.permissionForLoggedInUser = true;
    this.subscription = this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalWFHs = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.waitingForApprovalWFHCount = this.waitingForApprovalWFHs.length;
      },
      error: (error) => {
        this.dataload = false;
        console.error('Error fetching data:', error);
        this.waitingForApprovalWFHs = [];
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  selectedFields = {} as any;
  onClick(data: any, content: any) {
    this.selectedFields = data;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  //function to cancle the leave
  cancelWFHSubmit() {
    this.isLoading = true;
    const currentDate = moment();
    let approvedBy = this.empinfo.employeeId.toString();
    let requestBody = {
      requestProcessedBy: approvedBy,
      status: 'Cancelled',
      comments: this.cancelForm.get('cancelReason')?.value,
      moduleId: this.selectedFields.requestedCategory,
      headerRequests: [
        {
          headerID: this.selectedFields.id,
        },
      ],
    };
    this.subscription = this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).subscribe({
      next: (res: any) => {
        if (res) {
          this.cancelForm.reset();
          this.modalService.dismissAll();
          if (res.data.failureRecords.length > 0) {
            this.conformationPopup.openErrorModal(res.data.failureRecords[0].message);
          } else {
            this.conformationPopup.openSuccessModal('WFH cancelled successfully');
          }
          this.getWFHRequests();
        }
        this.http.wfhTriggerSignal.set(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cancelForm.reset();
        this.modalService.dismissAll();
        this.getWFHRequests();
        this.http.wfhTriggerSignal.set(true);
        this.conformationPopup.openErrorModal(err.error.message);
      },
      complete: () => {
        this.isLoading = false;
        this.getWFHRequests();
      },
    });
  }

  getWFHEMPRequests() {
    let empId = this.selectempid;
    this.dataload = true;
    this.permissionForLoggedInUser = false;
    this.subscription = this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalWFHs = this.compOff.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.waitingForApprovalWFHCount = this.waitingForApprovalWFHs.length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.waitingForApprovalWFHs = [];
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  approveWFH(approvalPopup: any, item: any) {
    this.selectedWFHData = item;
    this.initializeApproveForm();

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectWFH(rejectPopup: any, item: any) {
    this.selectedWFHData = item;
    this.initializeRejectForm();

    this.modalService.open(rejectPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    } else if (status === 'planned') {
      this.approveForm.get('comments')?.setValue('Planned Wfh');
    } else if (status === 'unplanned') {
      this.approveForm.get('comments')?.setValue('Unplanned Wfh');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    } else if (status === 'planned') {
      this.rejectForm.get('comments')?.setValue('Planned Wfh');
    } else if (status === 'unplanned') {
      this.rejectForm.get('comments')?.setValue('Unplanned Wfh');
    }
  }

  handleAccept(form: FormGroup) {
    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Approved',
      comments: this.approveForm.get('comments')?.value,
      moduleId: 2,
      headerRequests: [
        {
          headerID: this.selectedWFHData.pendingApprovalsHeader?.id,
          currentStage:
            this.selectedWFHData.pendingApprovalsHeader?.currentapprovalStage
        }
      ]
    };

    this.http.putData('v2/PendingApproval/multiapprovals', payload)
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();

          this.requestSummary = response.data;

          this.modalService.open(this.leaveSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 5000);

          this.waitingForApprovalWFHs =
            this.waitingForApprovalWFHs.filter(
              x => x.id !== this.selectedWFHData.id
            );

          this.waitingForApprovalWFHCount =
            this.waitingForApprovalWFHs.length;
        }
      });
  }

  handleReject(form: FormGroup) {
    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Rejected',
      comments: this.rejectForm.get('comments')?.value,
      moduleId: 2,
      headerRequests: [
        {
          headerID: this.selectedWFHData.pendingApprovalsHeader?.id,
          currentStage:
            this.selectedWFHData.pendingApprovalsHeader?.currentapprovalStage
        }
      ]
    };

    this.http.putData('v2/PendingApproval/multiapprovals', payload)
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();

          this.requestSummary = response.data;

          this.modalService.open(this.leaveSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 5000);

          this.waitingForApprovalWFHs =
            this.waitingForApprovalWFHs.filter(
              x => x.id !== this.selectedWFHData.id
            );

          this.waitingForApprovalWFHCount =
            this.waitingForApprovalWFHs.length;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}