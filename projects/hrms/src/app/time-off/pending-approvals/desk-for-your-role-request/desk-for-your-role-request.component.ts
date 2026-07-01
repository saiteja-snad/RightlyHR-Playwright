import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { SearchfilterPipe } from "../../../pipes/searchfilter.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { SignalsService } from '../../../services/signals.service';
import { SearchfordeskPipe } from "../../../Pipes/searchfordesk.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";

import { CheckboxModule } from 'primeng/checkbox';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';


@Component({
  selector: 'app-desk-for-your-role-request',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule,FormsModule, TranslateModule, DateformatPipe, SearchfilterPipe, SearchfordeskPipe, DataLoaderContentComponent, DocumentViewIconComponent, TableModule, CheckboxModule],
  templateUrl: './desk-for-your-role-request.component.html',
  styleUrl: './desk-for-your-role-request.component.scss'
})

export class DeskForYourRoleRequestComponent implements OnInit, OnDestroy {
  @ViewChild('deskTable') deskTable!: Table;
  employdata: any;
  deskiteam: any;
  updataid: any;
  assiginemploye: any;
  deskheaderpending: any[] = [];
  originalDeskData = [] as any[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  deskid: any;
  selectedexpenesid: any;
  loading: boolean = false;
  subscription!: Subscription;
  rejectForm!: FormGroup;
  searchValue: any
  selectedLeaveStatus: any;
  totalCount: any;
  selectedDeskItems: any[] = [];
  multiSelect: boolean = true;
  requestBody: any = {};
  requestSummary: any;
  approveLoader: boolean = false;
  rejectLoader: boolean = false;

  approveForm!: FormGroup;
  spinnerLoader: boolean = false;
  constructor(private http: HttpService, private readonly modalService: NgbModal, public conformationPopup: OpenModalService, public rbac: RbacService,
    private fb: FormBuilder, public formValidation: FormValidationService,
    private signalService: SignalsService,) { }


  ngOnInit(): void {
    this.employdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensespendingforyou();
    this.intializeRejectForm();
    this.initializeApproveForm();
  }
  // onStatusApproveSelect(status: string) {
  //   this.selectedLeaveStatus = status;

  //   if (status === 'approved') {
  //     this.approveForm.get('comments')?.setValue('Approved');
  //   }
  // }

  initializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [
        Validators.required,
        Validators.maxLength(250)
      ]]
    });
  }

  handleAccept(form: FormGroup) {
    this.approveLoader = true;
    if (!form.valid) return;

    this.requestBody = {
      requestProcessedBy: this.employdata.employeeId.toString(),
      status: 'Approved',
      comments: this.approveForm.get('comments')?.value,
      moduleId: environment.deskAllocationModuleId,
      headerRequests: this.selectedDeskItems.map((item: any) => ({
        headerID: item.approvalHeader.id,
        currentStage: item.approvalHeader.currentapprovalStage
      }))
    };

    console.log('Approve Payload', this.requestBody); // ADD HERE

    this.http.putData(
      `v2/PendingApproval/multiapprovals`,
      this.requestBody
    ).subscribe({
      next: (res: any) => {
        console.log('Approve Response', res);

        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(
          'Desk requests approved successfully'
        );
      },
      error: (err: any) => {
        this.approveLoader = false;
        this.conformationPopup.openErrorModal(err.error.Message);
      },
      complete: () => {
        this.selectedDeskItems = [];
        this.getexpensespendingforyou();
        this.getApprovalStatusCounts();
      }
    });
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  }
  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
    this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
  }

  getexpensespendingforyou(): void {
    this.loading = true;
    this.http.getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=ROLE`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.deskheaderpending = (data.data as any[]).filter(
          item =>
            item.approvalHeader.status !== 'Processed' &&
            item.approvalHeader.status !== 'Rejected' &&
            item.approvalHeader.status !== 'Approved'
        );
        this.originalDeskData = [...this.deskheaderpending]; // Store original data
        // this.filterPendingExpenses()
      }, error: (err) => {
        this.loading = false;
        console.log("expensesheadererror")
      },
    });
  }

  openconformationPopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  };

  expapprovalsdata: any;
  openModal(content: any, data: any) {
    this.expapprovalsdata = data;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  process(expid: any, exp: any): void {
    this.assiginemploye = exp.deskAllocatedTo
    this.deskid = expid
    const userStatus: any = {
      id: this.deskid,
      status: 'Processed',
      approvedBy: this.employdata.employeeId.toString(),
      currentStage: parseInt(exp.approvalHeader.currentStage),
    };
    this.http.putData(`PendingApproval/process/${this.deskid}`, userStatus).subscribe({
      next: (res: any) => {
        this.conformationPopup.openSuccessModal('Desk allocation request processed successfully');
        this.getexpensespendingforyou();
        this.getApprovalStatusCounts();
        this.signalService.deskForRoleTriggerSignal.set(true);
        this.updatedeskitem();
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
        console.error("Error fetching desk allocation item:", err);
        this.deskiteam = null;
      },
    });
  }

  Rejected(formdata: FormGroup) {
     this.rejectLoader = true;
    if (!formdata.valid) return;

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
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(
          'Desk requests rejected successfully'
        );
      },
      error: (err: any) => {
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

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    }
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
  getFilteredAndSortedDesk(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let desks = this.deskheaderpending ?? [];

    if (search) {
      desks = desks.filter(item =>
        item.entity?.deskallocatedtoname?.toLowerCase().includes(search) ||
        item.entity?.deskname?.toLowerCase().includes(search) ||
        item.entity?.deskType?.toLowerCase().includes(search) ||
        item.entity?.locationName?.toLowerCase().includes(search) ||
        item.entity?.sublocationName?.toLowerCase().includes(search) ||
        item.entity?.shiftName?.toLowerCase().includes(search)
      );
    }

    return desks;
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.deskheaderpending = [...this.originalDeskData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.deskTable) {
          this.deskTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle specific field mappings
      switch (field) {
        case 'deskallocatedtoname':
          val1 = a.entity?.deskallocatedtoname;
          val2 = b.entity?.deskallocatedtoname;
          break;
        case 'deskname':
          val1 = a.entity?.deskname;
          val2 = b.entity?.deskname;
          break;
        case 'deskType':
          val1 = a.entity?.deskType;
          val2 = b.entity?.deskType;
          break;
        case 'locationName':
          val1 = a.entity?.locationName;
          val2 = b.entity?.locationName;
          break;
        case 'sublocationName':
          val1 = a.entity?.sublocationName;
          val2 = b.entity?.sublocationName;
          break;
        case 'shiftName':
          val1 = a.entity?.shiftName;
          val2 = b.entity?.shiftName;
          break;
        case 'allocatedDate':
          val1 = a.entity?.allocatedDate;
          val2 = b.entity?.allocatedDate;
          break;
        case 'approvalStatus':
          val1 = a.entity?.approvalStatus;
          val2 = b.entity?.approvalStatus;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (field === 'allocatedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}