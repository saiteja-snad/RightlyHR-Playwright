import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import moment from 'moment';
import { OpenModalService } from '../../../services/open-modal.service';
import { SignalsService } from '../../../services/signals.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
@Component({
  selector: 'app-premissions-waiting-for-approval',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    InfoIconComponent,
    ConfirmationIconComponent
  ],
  templateUrl: './premissions-waiting-for-approval.component.html',
  styleUrl: './premissions-waiting-for-approval.component.scss',
})

export class PremissionsWaitingForApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  permissions = [] as any;
  waitingForApprovalPerimisions: RegularizationRequest[] =
    [] as RegularizationRequest[];
  dataload = false;
  selectempid: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  cancelForm!: FormGroup;
  isLoading = false;
  permissionForLoggedInUser: boolean = true;
  selectedYear: any;
  selectedPermissionData: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;

  spinnerLoader = false;
  selectedLeaveStatus: any;
  requestSummary: any;
  requestBody: any = {};
  approverComments: any[] = [];

  @ViewChild('leaveSummary') leaveSummary: any;

  constructor(
    private http: HttpService,
    private signalService: SignalsService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) {
    effect(() => {
      if (this.http.permissionTriggerSignal()) {
        this.getDataPermissions();
        this.http.permissionTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.initializeApproveForm();
    this.initializeRejectForm();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdPermission$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getDataEMPPermissions();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getDataPermissions();
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
      cancelReason: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(250)
        ],
      ],
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

  getDataPermissions() {
    let empId = this.empinfo.employeeId;
    this.dataload = true;
    this.permissionForLoggedInUser = true;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.permissions = response as RegularizationRequest[];
        this.waitingForApprovalPerimisions = this.permissions.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.dataload = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.permissions = [];
        this.dataload = false; // Set to empty array on error
      },
    });
  }

  selectedFields = {} as any;
  onClick(data: any, content: any) {
    this.selectedFields = data;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.cancelForm.reset();
  }

  //function to cancle the leave
  cancelpermissionsSubmit() {
    this.isLoading = true;
    const currentDate = moment();
    let approvedBy = this.empinfo.employeeId.toString();
    let requestBody = {
      requestProcessedBy: approvedBy,
      status: 'Cancelled',
      comments: this.cancelForm.get('cancelReason')?.value,
      moduleId: environment.permissionsModuleId,
      headerRequests: [
        {
          headerID: this.selectedFields.id,
        },
      ],
    };
    this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res) {
          this.cancelForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Permission cancelled successfully');
          this.http.permissionTriggerSignal.set(true);
          this.getDataPermissions();
        }
        this.signalService.timecountTriggerSignal.set(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cancelForm.reset();
        this.modalService.dismissAll();
        this.getDataPermissions();
        this.http.permissionTriggerSignal.set(true);
        this.conformationPopup.openErrorModal(err.error.message);
      },
      complete: () => {
        this.isLoading = false;
        this.getDataPermissions();
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataload = true;
    this.permissionForLoggedInUser = false;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.permissions = response as RegularizationRequest[];
        this.waitingForApprovalPerimisions = this.permissions.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.dataload = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.permissions = [];
        this.dataload = false; // Set to empty array on error
      },
    });
  }

  approvePermission(approvalPopup: any, item: any) {
    this.selectedPermissionData = item;

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectPermission(rejectPopup: any, item: any) {
    this.selectedPermissionData = item;

    this.modalService.open(rejectPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  }


  handleAccept(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        comments: form.value.comments,
        moduleId: environment.permissionsModuleId,
        headerRequests: [
          {
            headerID: this.selectedPermissionData.pendingApprovalsHeader.id,
            currentStage: this.selectedPermissionData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          this.waitingForApprovalPerimisions =
            this.waitingForApprovalPerimisions.filter(
              x => x.id !== this.selectedPermissionData.id
            );

          this.requestSummary = response.data;

          this.modalService.open(this.leaveSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    }
  }

  handleReject(form: FormGroup): void {
    console.log('Selected Permission Data:', this.selectedPermissionData);
    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: environment.permissionsModuleId,
        headerRequests: [
          {
            headerID: this.selectedPermissionData.pendingApprovalsHeader.id,
            currentStage: this.selectedPermissionData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };
      console.log('Reject Payload:', this.requestBody);
      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {
          console.log('SUCCESS', response);

          this.modalService.dismissAll();

          this.waitingForApprovalPerimisions =
            this.waitingForApprovalPerimisions.filter(
              x => x.id !== this.selectedPermissionData.id
            );

          this.requestSummary = response.data;

          this.modalService.open(this.leaveSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          console.error(err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}