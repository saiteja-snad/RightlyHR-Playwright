import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
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
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';

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
  ],
  templateUrl: './premissions-waiting-for-approval.component.html',
  styleUrl: './premissions-waiting-for-approval.component.scss',
})
export class PremissionsWaitingForApprovalComponent
  implements OnInit, OnDestroy
{
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
      if (this.http.permissionTriggerSignal()) {
        this.getDataPermissions();
        this.http.permissionTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.http.selectedEmployeeIdPermission$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getDataEMPPermissions();
      } else {
        this.empinfo = JSON.parse(
          localStorage.getItem('rightlyHrUser') ?? '{}'
        );
        this.getDataPermissions();
      }
    });
    this.formInializer();
  }
  formInializer() {
    this.cancelForm = this.fb.group({
      cancelReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
        ],
      ],
    });
  }
  isBeforeToday(date: string | Date): boolean {
    return moment().isSameOrBefore(moment(date), 'day');
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
    this.http
      .getData(`RegularizationRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.permissions = response as RegularizationRequest[];
          this.waitingForApprovalPerimisions = this.permissions.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
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
    console.log(this.selectedFields);
    this.modalService.open(content, { centered: true });
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
    this.http
      .putData(`v2/PendingApproval/multiapprovals`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log(res);
          if (res) {
            this.cancelForm.reset();
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Permission cancelled successfully'
            );
            this.http.permissionTriggerSignal.set(true);
            this.getDataPermissions();
          }
          this.signalService.timecountTriggerSignal.set(true);
        },
        error: (err: any) => {
          console.log(err);
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
    this.http
      .getData(`RegularizationRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.permissions = response as RegularizationRequest[];
          this.waitingForApprovalPerimisions = this.permissions.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}