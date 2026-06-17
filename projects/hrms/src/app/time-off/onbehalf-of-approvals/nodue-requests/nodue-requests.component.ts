import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription, BehaviorSubject } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NodueDetailsPipe } from '../../../Pipes/nodue-details.pipe';
import { AuthService } from '../../../services/auth.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { InoDuepending } from '../../pending-approvals/nodue-approval-details/nodue-approval-details';

@Component({
  selector: 'app-nodue-requests',
    imports: [
    CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    NoDataFoundComponent,
    NodueDetailsPipe,
    DateformatPipe,
    DataLoaderContentComponent,
    InfoIconComponent
  ],
  templateUrl: './nodue-requests.component.html',
  styleUrl: './nodue-requests.component.scss'
})
export class NodueRequestsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue: any;
  LOGIN: any;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  loading = false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  nodue_Request_data = new BehaviorSubject<InoDuepending[]>([]);
  AcceptForm!: FormGroup;
  rejectForm!: FormGroup;
  isLoading = false;
  selectedNoDueData = {} as any;
  selectedLeaveStatus: any;
  totalCount: any;

  constructor(
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    private signalService: SignalsService,
    private http: HttpService,
    private authService: AuthService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
  ) {
     // React to trigger signal from shared service
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovalsNoDue();
        } else {
          this.nodue_Request_data.next([]);
        }
        this.http.resetTriggerSignal();
      }
    });
  }

  ngOnInit(): void {
    this.formInializer();
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovalsNoDue();
    } else {
      this.nodue_Request_data.next([]);;
    }
  }
onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
    this.AcceptForm.get('AcceptReason')?.setValue('Approved');
  }
}

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectForm.get('notes')?.setValue('Rejected');
    }
  }
  //function to initalize the form
  formInializer() {
    this.AcceptForm = this.fb.group({
      AcceptReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
          
        ],
      ],
    });
     this.AcceptForm.get('AcceptReason')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
    this.rejectForm = this.fb.group({
      notes: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
          
        ],
      ],
    });
     this.rejectForm.get('notes')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  }

  getAllPendingApprovalsNoDue() {
    this.loading = true;
    // let loggedInuser = this.authService.getToken();
    // const EmployeeId = loggedInuser.employeeId;
     let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.subscription = this.http
      .getData(
        `NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`
      )
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.nodue_Request_data.next(data);
        },
      });
  }

  openModal(Values: any, content: any) {
    this.selectedNoDueData = Values;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModals(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  resetForm() {
    this.AcceptForm.reset();
    this.modalService.dismissAll();
  }

  close() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }
  //function to accept the nodue
  handleAccept() {
    this.isLoading = true;
    const date = moment();
    let loggedInuser = this.authService.getToken();
    (this.selectedNoDueData.status = 'Approved'),
      (this.selectedNoDueData.processedBy = loggedInuser.employeeId),
      (this.selectedNoDueData.processdByFusionEmpId = loggedInuser.fusionEmpId);
    this.selectedNoDueData.processedDate = date;
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${
      loggedInuser.middleName ?? ''
    } ${loggedInuser.lastName ?? ''}`;
    this.selectedNoDueData.comments =
      this.AcceptForm.get('AcceptReason')?.value;
    this.selectedNoDueData.onBehalfOfApproval = true;
    this.selectedNoDueData.approvedPersonaType = 'onBehalfOf';
    this.subscription = this.http
      .postdata(
        `NoDueClearanceForm/pendingApprovalsUpdate`,
        this.selectedNoDueData
      )
      .subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.AcceptForm.reset();
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
          this.conformationPopup.openSuccessModal(
            'No Due request approved successfully'
          );
          this.getAllPendingApprovalsNoDue();
          this.getApprovalStatusCounts();
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
      });
  }
 getApprovalStatusCounts() {
      let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  //function to reject the nodue
  rejectNodue() {

    this.isLoading = true;
    const date = moment();
    let loggedInuser = this.authService.getToken();
    (this.selectedNoDueData.status = 'Rejected'),
      (this.selectedNoDueData.processedBy = loggedInuser.employeeId),
      (this.selectedNoDueData.comments = this.rejectForm.get('notes')?.value),
      (this.selectedNoDueData.processdByFusionEmpId = loggedInuser.fusionEmpId);
    this.selectedNoDueData.processedDate = date;
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${
      loggedInuser.middleName ?? ''
    } ${loggedInuser.lastName ?? ''}`;
    // this.selectedNoDueData.comments = this.AcceptForm.get('notes')?.value;
    this.selectedNoDueData.onBehalfOfApproval = true;
    this.selectedNoDueData.approvedPersonaType = 'onBehalfOf';
    this.subscription = this.http
      .postdata(
        `NoDueClearanceForm/pendingApprovalsUpdate`,
        this.selectedNoDueData
      )
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.rejectForm.reset();
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);

          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
          this.conformationPopup.openSuccessModal(
            'No Due request rejected successfully'
          );
          this.getAllPendingApprovalsNoDue();
           this.getApprovalStatusCounts();
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openSuccessModal(reason.error.message);
        },
      });
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}