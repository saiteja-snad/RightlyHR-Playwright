import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import {
  AttendanceRequest,
  ICategoryDetails,
} from '../../../Interfaces/timoff-model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';

@Component({
  selector: 'app-wfh-for-you-requset',
  imports: [
    CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './wfh-for-you-requset.component.html',
  styleUrl: './wfh-for-you-requset.component.scss',
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
  leaves = [] as AttendanceRequest[];
  approverComments = [] as any[];
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
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

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=EMP`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.leaves = response.data as AttendanceRequest[];
          console.log(this.leaves);
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

  openApproveModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
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
            this.sharedModalService.openSuccessModal(
              'Request Approved Successfully'
            );
            this.approveForm.reset();
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
