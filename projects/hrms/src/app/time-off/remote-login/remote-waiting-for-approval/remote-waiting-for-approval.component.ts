import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { NgbModal, NgbPopoverModule, } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormValidationsService } from '../../../services/form-validations.service';

@Component({
  selector: 'app-remote-waiting-for-approval',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './remote-waiting-for-approval.component.html',
  styleUrl: './remote-waiting-for-approval.component.scss'
})
export class RemoteWaitingForApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvedRemotes: ICompOff[] = [];
  remoteLogin = [] as any;
  approvedRemotesCount = 0;
  empinfo = {} as IJob;
  dataLoad = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectempid: any;
  selectedYear: any;
  selectedRemoteData: any;
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
    public rbac: RbacService,
    private signalService: SignalsService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService
  ) {
    effect(() => {
      if (this.signalService.remoteLoginRequestTriggerSignal()) {
        this.getRemoteRequests();
        this.signalService.remoteLoginRequestTriggerSignal.set(false);
      }

    })
  }

  ngOnInit(): void {
    this.initializeApproveForm();
    this.initializeRejectForm();

    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRemoteLogin$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getRemoteLoginEMPRequests();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getRemoteRequests();
          }
        });
      }
    });
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

  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getRemoteRequests() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http
      .getFilterRemoteLoginDataByID(
        empId,
        this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.remoteLogin = response;
          this.dataLoad = false;
          this.approvedRemotes = this.remoteLogin?.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          this.dataLoad = false;
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
        },
      });
  }

  getRemoteLoginEMPRequests() {
    let empId = this.selectempid;
    this.http
      .getFilterRemoteLoginDataByID(
        empId, this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.remoteLogin = response;
          this.approvedRemotes = this.remoteLogin.filter(
            (element: { status: string }) => element.status === 'Waiting for Approval'
          );
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
        },
      });
  }

  approveRemote(approvalPopup: any, item: any) {
    this.selectedRemoteData = item;

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectRemote(rejectPopup: any, item: any) {
    this.selectedRemoteData = item;

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
        status: 'Approved',
        comments: form.value.comments,
        moduleId: environment.remoteLoginModuleId,
        headerRequests: [
          {
            headerID: this.selectedRemoteData.pendingApprovalsHeader.id,
            currentStage: this.selectedRemoteData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          // Remove approved/rejected record immediately
          this.approvedRemotes = this.approvedRemotes.filter(
            x => x.id !== this.selectedRemoteData.id
          );

          // Update count immediately
          this.approvedRemotesCount = this.approvedRemotes.length;

          this.requestSummary = response.data;

          // Open summary popup
          this.openModal(this.leaveSummary);

          // Auto close summary popup after 3 sec
          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.getRemoteRequests();
        }
      });
    }
  }

  handleReject(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: environment.remoteLoginModuleId,
        headerRequests: [
          {
            headerID: this.selectedRemoteData.pendingApprovalsHeader.id,
            currentStage: this.selectedRemoteData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          // Remove record immediately
          this.approvedRemotes =
            this.approvedRemotes.filter(
              x => x.id !== this.selectedRemoteData.id
            );

          // Update count immediately
          this.approvedRemotesCount = this.approvedRemotes.length;

          this.requestSummary = response.data;

          // Open summary popup
          this.openModal(this.leaveSummary);

          // Auto close summary popup after 3 seconds
          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

          this.rejectForm.reset();
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.getRemoteRequests();
        }
      });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
