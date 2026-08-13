import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Entity } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { RbacService } from '../../../services/rbac.service';
import { SearchfilterPipe } from "../../../pipes/searchfilter.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { SignalsService } from '../../../services/signals.service';
import { SearchfordeskPipe } from "../../../Pipes/searchfordesk.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Table } from 'primeng/table';

import { environment } from '../../../../environments/environment';

import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import moment from 'moment';

import { DateformatPipe } from '../../../pipes/dateformat.pipe';


@Component({
  selector: 'app-desk-for-you-request',
  imports: [CommonModule, NoDataFoundComponent, FormsModule, DateformatPipe, ReactiveFormsModule, TranslateModule,
    SearchfilterPipe, SearchfordeskPipe, DataLoaderContentComponent, DocumentViewIconComponent, TableModule, CheckboxModule],
  templateUrl: './desk-for-you-request.component.html',
  styleUrl: './desk-for-you-request.component.scss'
})

export class DeskForYouRequestComponent implements OnInit, OnDestroy {
  employdata: any
  deskiteam: any
  updataid: any
  loading: boolean = false;
  assiginemploye: any
  deskheaderpending: Entity[] = [];
  deskid: any;
  selectedexpenesid: any
  subscription!: Subscription
  rejectForm!: FormGroup;
  approveForm!: FormGroup;
  spinnerLoader: boolean = false;
  searchValue: any;
  selectedLeaveStatus: any;
  totalCount: any;
  selectedDeskItems: any[] = [];
  multiSelect: boolean = true;
  requestBody: any = {};
  requestSummary: any;
  approveLoader = false;
  rejectLoader = false;
  @ViewChild('leaveSummary') leaveSummary: any;
  responseSummary: any;
  originalData: any[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
  @ViewChild('dt') table!: any;

  constructor(private http: HttpService, private readonly modalService: NgbModal, private signalService: SignalsService,
    public conformationPopup: OpenModalService, private fb: FormBuilder, public rbac: RbacService, public formValidation: FormValidationService) { }

  ngOnInit(): void {
    this.employdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensespendingforyou();
    this.intializeRejectForm();
    this.initializeApproveForm();
  }

  initializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [
        Validators.required,
        Validators.maxLength(250),
        noWhitespaceValidator
      ]]
    });

    this.approveForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]],
    });
    this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
  }

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    }
  }

  // onStatusApproveSelect(status: string) {
  //   this.selectedLeaveStatus = status;

  //   if (status === 'approved') {
  //     this.approveForm.get('comments')?.setValue('Approved');
  //   }
  // }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  }

  handleAccept(form: FormGroup) {

    if (form.invalid) return;

    this.approveLoader = true;

    const payload = {
      requestProcessedBy: this.employdata.employeeId.toString(),
      status: 'Approved',
      comments: this.approveForm.get('comments')?.value,
      moduleId: 23,
      headerRequests: this.selectedDeskItems.map((item: any) => ({
        headerID: item.approvalHeader.id,
        currentStage: item.approvalHeader.currentapprovalStage
      }))
    };

    this.http.putData(
      'v2/PendingApproval/multiapprovals',
      payload
    )
      .subscribe({
        next: (res: any) => {

          this.approveLoader = false;

          this.selectedDeskItems = [];
          this.approveForm.reset();

          this.modalService.dismissAll();

          this.getexpensespendingforyou();
          this.getApprovalStatusCounts();

          this.signalService.deskForYouTriggerSignal.set(true);

          this.responseSummary = res.data;

          this.modalService.open(this.leaveSummary, {
            centered: true,
            backdrop: 'static',
            size: 'xl'
          });
        },
        error: (err) => {

          this.approveLoader = false;

          this.conformationPopup.openErrorModal(
            err.error?.message || 'An error occurred'
          );
        }
      });
  }

  getexpensespendingforyou(): void {
    this.loading = true;
    this.http.getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=EMP`).subscribe({
      next: (data: any) => {

        console.log('FULL API RESPONSE', data);
        console.log('DATA ARRAY', data?.data);

        if (data?.data) {
          console.log(
            'Statuses',
            data.data.map((x: any) => ({
              id: x.approvalHeader?.id,
              status: x.approvalHeader?.status
            }))
          );
        }


        this.loading = false;
        this.deskheaderpending = (data.data as Entity[]).filter(
          item =>
            item.approvalHeader.status !== 'Processed' &&
            item.approvalHeader.status !== 'Rejected'
        );
        console.log(this.deskheaderpending);
        this.originalData = [...this.deskheaderpending];
      }, error: (err) => {
        this.loading = false;
        console.log("expensesheadererror");
      },
    });
  }

  expapprovalsdata: any;
  openModal(content: any, data: any) {
    this.expapprovalsdata = data;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openconformationPopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  };

  process(expid: any, exp: any): void {
    this.assiginemploye = exp.deskAllocatedTo
    this.deskid = expid
    const userStatus: any = {
      id: this.deskid,
      status: 'Processed',
      approvedBy: this.employdata.employeeId.toString(),
      currentStage: parseInt(exp.approvalHeader.currentapprovalStage),
    };
    this.http.putData(`PendingApproval/process/${this.deskid}`, userStatus).subscribe({
      next: (res: any) => {
        this.conformationPopup.openSuccessModal("Desk allocation request Processed successfully")
        this.getexpensespendingforyou();
        this.getApprovalStatusCounts();
        this.signalService.deskForYouTriggerSignal.set(true);
        this.updatedeskitem()
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.message || 'An error occurred')
        console.error('Error response from API:', error);
      }
    });
  }

  updatedeskitem() {
    const payload = {
      deskAllocationHeaderId: this.deskiteam.deskAllocationHeaderId,
      deskAllocationItemId: this.deskiteam.deskAllocationItemId,
      type: 'Reallocated',
      reallocatedTo: this.assiginemploye,
      status: 'Released',
      releavedDate: new Date(),
    }
    this.http.putData(`DeskAllocationItem/${this.deskiteam.deskAllocationItemId}`, payload).subscribe({
      next: (res) => {
      },
      error: (error) => {
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred during assignment.');
      }
    });
  }

  openmodal(content: any) {
    this.modalService.open(content, { size: 'xl', backdrop: 'static', centered: true });
  }

  viewdeskitem(deskid: any) {
    this.updataid = deskid;
    this.subscription = this.http.getData(`DeskAllocationItem/getRecordpending?deskAllocationItemId=${this.updataid}`).subscribe({
      next: (data: any) => {
        this.deskiteam = data;
      },
      error: (err: any) => {
        this.deskiteam = null;
      },
    });
  }

  Rejected(formdata: FormGroup) {

    if (!formdata.valid) return;
    this.rejectLoader = true;
    this.requestBody = {
      requestProcessedBy: this.employdata.employeeId.toString(),
      status: 'Rejected',
      comments: this.rejectForm.get('comments')?.value,
      moduleId: environment.deskAllocationModuleId,
      headerRequests: this.selectedDeskItems.map((item: any) => ({
        headerID: item.approvalHeader.id,
        currentStage: item.approvalHeader.currentapprovalStage
      }))
    };

    console.log('Reject Payload', this.requestBody);
    this.http.putData(
      `v2/PendingApproval/multiapprovals`,
      this.requestBody
    ).subscribe({
      next: (res: any) => {
        this.rejectLoader = false;
        this.modalService.dismissAll();
        this.responseSummary = res.data;

        this.modalService.open(this.leaveSummary, {
          centered: true,
          backdrop: 'static',
          size: 'xl'
        });
      },
      error: (err: any) => {
        this.rejectLoader = false;
        this.conformationPopup.openErrorModal(err.error.Message);
      },
      complete: () => {
        this.selectedDeskItems = [];
        this.rejectForm.reset();
        this.getexpensespendingforyou();
        this.getApprovalStatusCounts();
        this.signalService.deskForYouTriggerSignal.set(true);
      }
    });
  }

  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.deskAllocationModuleId}&EmployeeId=${this.employdata.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
      this.http.updatePendingApprovalCounts(this.totalCount);
      //Map counts to tabs
    });
  }

  cleardata() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }

  bulkapprove(modal: any) {
    this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
  }

  bulkReject(modal: any) {
    this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
  }

  onSelectionChange() {

    const selectedIds = this.selectedDeskItems.map(
      x => x.approvalHeader.id
    );

    this.deskheaderpending.sort((a, b) => {

      const aSelected = selectedIds.includes(a.approvalHeader.id);
      const bSelected = selectedIds.includes(b.approvalHeader.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return 0;
    });
  }

  customSort(event: any): void {
    const field = event.field;
    // Check if all values in the column are the same
    const allValues = event.data.map((item: any) => {
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        return fieldParts.reduce((obj: any, key: string) => obj?.[key], item);
      } else {
        return item.entity?.[field];
      }
    });

    // For date fields, normalize to date-only strings for comparison
    if (field.includes('allocatedDate') || field.includes('allocatedDate')) {
      const normalizedValues = allValues.map((val: any) => {
        if (!val) return null;
        return moment(val).format('YYYY-MM-DD');
      });

      const allSame = normalizedValues.every((val: any) => val === normalizedValues[0]);
      if (allSame) {
        // Reset sort state and prevent sorting
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) this.table.reset();
        return;
      }
    } else {
      // For non-date fields, check if all values are the same
      const allSame = allValues.every((val: any) => val === allValues[0]);
      if (allSame) {
        // Reset sort state and prevent sorting
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) this.table.reset();
        return;
      }
    }

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.deskheaderpending = [...this.originalData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) this.table.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field.includes('.')) {
        const fieldParts = field.split('.');
        val1 = fieldParts.reduce((obj: any, key: string) => obj?.[key], a);
        val2 = fieldParts.reduce((obj: any, key: string) => obj?.[key], b);
      } else {
        val1 = a.entity?.[field];
        val2 = b.entity?.[field];
      }

      // Handle date fields using moment (date only, ignoring time)
      if (field.includes('Date') || field.includes('date')) {
        const date1 = moment(val1);
        const date2 = moment(val2);

        return event.order * date1.diff(date2);
      }

      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return event.order * (val1 - val2);
      }

      return event.order * String(val1 ?? '').trim().localeCompare(String(val2 ?? '').trim(), undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
