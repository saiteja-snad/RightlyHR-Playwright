import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
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
    TableModule,
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
  @ViewChild('permissionsWaitingTable') permissionsWaitingTable!: Table;
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
  originalWaitingForApprovalPerimisions = [] as RegularizationRequest[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

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
        this.originalWaitingForApprovalPerimisions = [...this.waitingForApprovalPerimisions];
        this.dataload = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.permissions = [];
        this.originalWaitingForApprovalPerimisions = [];
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
        this.originalWaitingForApprovalPerimisions = [...this.waitingForApprovalPerimisions];
        this.dataload = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.permissions = [];
        this.originalWaitingForApprovalPerimisions = [];
        this.dataload = false; // Set to empty array on error
      },
    });
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
        this.waitingForApprovalPerimisions = [...this.originalWaitingForApprovalPerimisions];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.permissionsWaitingTable) {
          this.permissionsWaitingTable.reset();
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

      // Handle direct fields
      val1 = a[field];
      val2 = b[field];

      // Handle date sorting
      if (field === 'createdDate' || field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for duration
      if (field === 'duration') {
        const num1 = Number(val1) || 0;
        const num2 = Number(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}