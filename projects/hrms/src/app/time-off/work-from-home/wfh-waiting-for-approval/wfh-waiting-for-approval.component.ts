 import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Select } from 'primeng/select';
import moment from 'moment';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { SignalsService } from '../../../services/signals.service';
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';

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
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  cancelForm!: FormGroup;
  isLoading = false;

  constructor(
    private http: HttpService,
    private signalService: SignalsService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    private fb: FormBuilder,
    public formsValidation:FormValidationsService
  ) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh || this.http.wfhTriggerSignal()) {
        this.getWFHRequests();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          wfh: false,
        }));
        this.http.wfhTriggerSignal.set(false);
      } else {
        this.getWFHRequests();
      }
    });
  }

  ngOnInit(): void {
    this.http.selectedEmployeeIdWFH$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee WFH ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getWFHEMPRequests();
      } else {
        this.empinfo = JSON.parse(
          localStorage.getItem('rightlyHrUser') ?? '{}'
        );
        console.log(this.empinfo);
        this.getWFHRequests();
      }
    });

    this.formInializer();
  }
  formInializer() {
    this.cancelForm = this.fb.group({
      cancelReason: [null, [Validators.required,Validators.minLength(10), Validators.maxLength(250)]],
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
    console.log(empId);
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalWFHs = response.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
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
    console.log(this.selectedFields);
    this.modalService.open(content, { centered: true });
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
    this.subscription = this.http
      .putData(`v2/PendingApproval/multiapprovals`, requestBody)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          if (res) {
            this.cancelForm.reset();
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Work form home cancelled successfully'
            );
            this.getWFHRequests();
          }
          this.http.wfhTriggerSignal.set(true);
        },
        error: (err: any) => {
          console.log(err);
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
    console.log(empId);
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalWFHs = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
