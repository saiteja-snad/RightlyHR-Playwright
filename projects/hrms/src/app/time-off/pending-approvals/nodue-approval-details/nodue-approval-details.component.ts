import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { InoDuepending } from './nodue-approval-details';
import { NodueDetailsPipe } from '../../../Pipes/nodue-details.pipe';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-nodue-approval-details',
  imports: [CommonModule, TranslateModule, NgbPopoverModule, ReactiveFormsModule, FormsModule,
    PaginatorModule, NoDataFoundComponent, NodueDetailsPipe, DateformatPipe, DataLoaderContentComponent],
  templateUrl: './nodue-approval-details.component.html',
  styleUrl: './nodue-approval-details.component.scss',
})
export class NodueApprovalDetailsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue: any;
  LOGIN: any;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  loading=false
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

  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService, private signalService:SignalsService, private http: HttpService, 
    private authService: AuthService, private fb: FormBuilder, public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.formInializer();
    this.getAllPendingApprovalsNoDue();
  }

  //function to initalize the form
  formInializer() {
    this.AcceptForm = this.fb.group({
      AcceptReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.pattern(/^(?!\s).*$/),
        ],
      ],
    });
    this.rejectForm = this.fb.group({
      notes: [
        null,
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.pattern(/^(?!\s).*$/),
        ],
      ],
    });
  }

  getAllPendingApprovalsNoDue() {
    this.loading=true
    let loggedInuser = this.authService.getToken();
    const EmployeeId = loggedInuser.employeeId;
    this.subscription = this.http.getData(`NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`).subscribe({
      next: (data: any) => {
      this.loading=false
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

    resetForm(){
    this.AcceptForm.reset();
    this.modalService.dismissAll();
  }

  close(){
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
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${loggedInuser.middleName ?? ''} ${loggedInuser.lastName ?? ''}`;
    this.selectedNoDueData.comments = this.AcceptForm.get('AcceptReason')?.value;
    this.subscription = this.http.postdata(`NoDueClearanceForm/pendingApprovalsUpdate`, this.selectedNoDueData).subscribe({
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
        this.conformationPopup.openSuccessModal('No Due Request Approved Successfully');
        this.getAllPendingApprovalsNoDue();
      },
      error: (reason: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  //function to reject the nodue
  rejectNodue() {
    this.isLoading = true;
    const date = moment();
    let loggedInuser = this.authService.getToken();
    (this.selectedNoDueData.status = 'Rejected'),
      (this.selectedNoDueData.processedBy = loggedInuser.employeeId),
      (this.selectedNoDueData.processdByFusionEmpId = loggedInuser.fusionEmpId);
    this.selectedNoDueData.processedDate = date;
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${loggedInuser.middleName ?? ''} ${loggedInuser.lastName ?? ''}`;
    this.selectedNoDueData.comments = this.AcceptForm.get('notes')?.value;
    this.subscription = this.http.postdata(`NoDueClearanceForm/pendingApprovalsUpdate`, this.selectedNoDueData).subscribe({
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
        this.conformationPopup.openSuccessModal('No Due Request rejected successfully');
        this.getAllPendingApprovalsNoDue();
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