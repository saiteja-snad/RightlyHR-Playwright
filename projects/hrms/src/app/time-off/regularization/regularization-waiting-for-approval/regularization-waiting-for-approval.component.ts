import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IJob } from '../../../Interfaces/job-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-regularization-waiting-for-approval',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './regularization-waiting-for-approval.component.html',
  styleUrl: './regularization-waiting-for-approval.component.scss',
})

export class RegularizationWaitingForApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  waitingForApprovalPerimisions: RegularizationRequest[] =
    [] as RegularizationRequest[];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  dataLoad = false;
  selectedYear: any;
  selectedRegularizationData: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  showActions = false;

  spinnerLoader = false;
  selectedLeaveStatus: any;
  responseSummary: any;
  requestBody: any = {};
  approverComments: any[] = [];

  @ViewChild('leaveSummary') leaveSummary: any;

  constructor(private http: HttpService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal,
    private fb: FormBuilder) {
    effect(() => {
      if (this.http.tirggerCountSignal().permission) {
        this.getDataPermissions();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          permission: false,
        }));
      }
    });
  }

  ngOnInit(): void {


    this.initializeApproveForm();
    this.initializeRejectForm();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
          if (id) {
            this.selectempid = id;
            this.showActions = true;
            this.getDataEMPPermissions();
          } else {
            this.showActions = false;
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getDataPermissions();
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

  approveRegularization(approvalPopup: any, item: any) {
    this.selectedRegularizationData = item;

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectRegularization(rejectPopup: any, item: any) {
    this.selectedRegularizationData = item;

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

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
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
    this.dataLoad = true;
    this.http.getFilterRegularizationDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.waitingForApprovalPerimisions = []; // Set to empty array on error
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http.getFilterRegularizationDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.waitingForApprovalPerimisions = []; // Set to empty array on error
      },
    });
  }

  handleAccept(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: form.value.comments,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: [
          {
            headerID: this.selectedRegularizationData.pendingApprovalsHeader.id,
            currentStage: this.selectedRegularizationData.pendingApprovalsHeader.currentapprovalStage
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
              x => x.id !== this.selectedRegularizationData.id
            );

          this.responseSummary = response.data;

          this.openModal(this.leaveSummary);

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

          this.approveForm.reset();
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          this.spinnerLoader = false;
        }
      });
    }
  }

  handleReject(form: FormGroup): void {

    console.log('Form Valid:', form.valid);
    console.log('Selected Data:', this.selectedRegularizationData);
    this.spinnerLoader = true;

    if (form.valid) {

      console.log('Approval Header:', this.selectedRegularizationData?.approvalHeader);


      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: [
          {
            headerID: this.selectedRegularizationData.pendingApprovalsHeader.id,
            currentStage: this.selectedRegularizationData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      console.log('Reject Payload:', this.requestBody);

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          this.waitingForApprovalPerimisions =
            this.waitingForApprovalPerimisions.filter(
              x => x.id !== this.selectedRegularizationData.id
            );

          this.responseSummary = response.data;

          this.openModal(this.leaveSummary);

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
        }
      });
    }
  }

  removeLeadingWhitespace(control: any) {
    if (control?.value) {
      control.setValue(control.value.replace(/^\s+/, ''), {
        emitEvent: false
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}