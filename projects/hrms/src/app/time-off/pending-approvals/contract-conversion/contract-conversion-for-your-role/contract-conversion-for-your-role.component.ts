import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { TraineeApprovalsTabsComponent } from '../../../../shared/time-off-module-tabs/pending-approvals-tabs/trainee-approvals-tabs/trainee-approvals-tabs.component';
import { Subscription, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { AuthService } from '../../../../services/auth.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';

import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { ContractsearchfilterPipe } from '../../../../Pipes/contractsearchfilter.pipe';
import { Icontractapproval } from '../../../../Interfaces/contract-module';

@Component({
  selector: 'app-contract-conversion-for-your-role',
  imports: [DateformatPipe, CommonModule, ReactiveFormsModule, NgbPopoverModule, PaginatorModule, FormsModule, TranslateModule,
      NoDataFoundComponent, DataLoaderContentComponent, ContractsearchfilterPipe, InfoIconComponent, TableModule],
  templateUrl: './contract-conversion-for-your-role.component.html',
  styleUrl: './contract-conversion-for-your-role.component.scss'
})
export class ContractConversionForYourRoleComponent {
@ViewChild('contractConversionRoleTable') contractConversionRoleTable!: Table;
isLoading = false;
  private customsetup: any;
  private datePipe: DatePipe;
  selectedContractData: any = {
    extend: false,
    discontinue: false,
    extenddate: null,
    trcomments: '',
    rejectedReason: '',
  };
  subscription!: Subscription;
  requesthandler = {} as any;
  empdata = {} as Ipersonal;
  Contractors = new BehaviorSubject<Icontractapproval[]>([]);
  originalContractors: Icontractapproval[] = []; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  myApproverComments = {} as any;
  discontinue: any;
  extend: any;
  loading: boolean = false;
  isempeffectivevaild: boolean = true;
  rejectForm!: FormGroup;
  rejectSeparationForm!: FormGroup;
  Status!: any;
  comments = [] as any;
  noRecalllength = [] as any;
  aprovalsearch: any;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedLeaveStatus: any;
  totalCount:any;
  constructor(private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder, private modalService: NgbModal,
    private authService: AuthService, public rbac: RbacService,public formsValidation: FormValidationsService,private signalService: SignalsService) {
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }

  ngOnInit(): void {
    this.getAllPendingApprovals();
  }

  initaializeextendForm() {
    this.rejectForm = this.fb.group({
      extenddate: ['', Validators.required],
      trcomments: ['', Validators.required],
      rejectedReason: ['', Validators.required]
    });
    this.rejectForm.get('trcomments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; 
      this.selectedContractData.trcomments = null;
       this.selectedContractData.rejectedReason = null;// remove chip highlight if cleared
    }
     });
    this.rejectForm.valueChanges.subscribe((val) => {
      this.selectedContractData.extenddate = val.extenddate;
      this.selectedContractData.trcomments = val.trcomments;
      this.selectedContractData.rejectedReason = val.rejectedReason;
    });
  }
onCommentChange(value: string) {
  // Reset highlight only when the textarea becomes completely empty
  if (!value || value.trim() === '') {
    this.selectedLeaveStatus = null;
    this.selectedContractData.trcomments = null;
    this.selectedContractData.rejectedReason = null;
  }
}
 onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
     this.selectedContractData.trcomments = 'Approved';
  }
}

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.selectedContractData.rejectedReason = 'Rejected';
    }
  }
  blockLeadingSpace(event: Event, value: string) {
    const inputElement = event.target as HTMLTextAreaElement;
    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
      // Trigger model update
      const nativeEvent = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(nativeEvent);
    }
  }

  transform(value: any, ...args: unknown[]): unknown {
    if (value) {
      return this.datePipe.transform(value, this.customsetup);
    }
    return null;
  }

  reload(acceptForm: NgForm): void {
    acceptForm.resetForm();
    this.discontinue = false;
    this.extend = false;
    this.selectedContractData = {};
    this.modalService.dismissAll();
  }

  appover_comments = {} as any;
  commentsFunction(value: any, content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false
    });

    const roleOrder: { [key: string]: number } = {
      RM: 1,
      TM: 2,
      EM: 3, // 'EM' is displayed as HR in the UI
    };

    this.appover_comments = value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData || '{}');
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    }).sort((a: any, b: any) => {
      const roleA = a.approverRole?.toUpperCase() || '';
      const roleB = b.approverRole?.toUpperCase() || '';
      return (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
    });
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  toggleExtend() {
    this.discontinue = false;
    this.extend = true;
    this.selectedContractData.reasonForDiscontinue = '';
    this.selectedContractData.rejectedReason = '';
  }

  toggleDiscontinue() {
    this.discontinue = true;
    this.extend = false;
    // If Discontinue is selected, clear Extend and related values
    this.selectedContractData.extenddate = null;
    this.selectedContractData.reasonForExtend = '';
    this.selectedContractData.trcomments = '';
  }

  minExtendDate: any;
  updateExtendDateValidity(): void {
    if (this.empdata.trainingEndDate > this.selectedContractData.extenddate) {
      this.isempeffectivevaild = false;
    } else {
      this.isempeffectivevaild = true;
    }
  }

  selectedSpRequestDataforheader = {} as any;
  selectedProcessedData : any;
  handleRequests(request: Icontractapproval) {
    this.requesthandler = request;
    this.selectedContractData = request.entity;
    this.selectedSpRequestDataforheader = request.approvalHeader;
    this.minExtendDate = this.empdata.trainingEndDate;
    this.selectedProcessedData = request;

    this.getEmployeedatabyid(this.selectedContractData);
  }

  handleAccept(f: NgForm) {
    let loggedInUser = this.authService.getToken();
    this.isLoading = true;
    let requestBody = {
      status: 'Approved',
      approvedBy: loggedInUser.employeeId.toString(),
      comments: this.selectedContractData.trcomments,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };

    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Request has been approved successfully');
        this.signalService.contractConversionForYouRoleTriggerSignal.set(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (reason: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
      complete: () => {
        this.isLoading = false;
        f.reset();
        this.getAllPendingApprovals();
        this.getApprovalStatusCounts();
        this.selectedContractData.trcomments = '';
        this.signalService.contractForyouTriggerSignal.set(true);
      },
    });
  }

  //function to send the rejected status and comments
  handleReject(f: NgForm) {
    let loggedInUser = this.authService.getToken();
    this.isLoading = true;
    let requestBody = {
      status: 'Rejected',
      comments: this.selectedContractData.rejectedReason,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
      approvedBy: loggedInUser.employeeId.toString(),
    };
    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Request rejected successfully');
        this.signalService.contractConversionForYouRoleTriggerSignal.set(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (reason: any) => {
        this.isLoading = false
        this.conformationPopup.openErrorModal(reason.error.message)
      },
      complete: () => {
        this.isLoading = false;
        this.getAllPendingApprovals();
        this.getApprovalStatusCounts();
        this.selectedContractData = {};
      },
    });
  }

  //function to send the processed status
  handleProcess(f:NgForm) {
    let loggedInUser = this.authService.getToken();
    let requestBody = {
      status: 'Processed',
      currentStage: parseInt(this.selectedProcessedData.approvalHeader.currentapprovalStage),
      approvedBy: loggedInUser.employeeId.toString(),
      comments : this.selectedContractData.rejectedReason
    };
    this.subscription = this.http.putData(`PendingApproval/process/${this.selectedProcessedData.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Request processed successfully');
        this.signalService.contractConversionForYouRoleTriggerSignal.set(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message)
      },
      complete: () => {
        this.getAllPendingApprovals();
        this.getApprovalStatusCounts();
        this.signalService.contractForyouTriggerSignal.set(true);
      },
    });
  }
 getApprovalStatusCounts() {
      let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.contractEmployeeConversionModuleId}&EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  //function to get the employeedata
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  issubmitdiable: boolean = false;
  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  initializeForm(): void {
    this.rejectSeparationForm = this.fb.group({
      // extenddate: [this.selectedContractData.extenddate, [Validators.required, this.extendDateValidator.bind(this)]],
      trcomments: [this.selectedContractData.trcomments, [Validators.required]]
    });
  }

  getAllPendingApprovals() {
    this.loading = true;
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId
    const moduleId=environment.contractEmployeeConversionModuleId
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`).subscribe({
      next: (data: any) => {
        this.loading = false;
        const contractorsData = data.data as Icontractapproval[];
        this.Contractors.next(contractorsData);
        this.originalContractors = [...contractorsData]; // Store original data for reset
        //this.noRecalllength = this.Contractors;
      },
      error: (reason) => {
        console.log(reason)
        this.loading = false;
      },
    });
  }

  initializationrejectForm() {
    this.rejectForm = new FormGroup({
      flexRadioDefault: new FormControl('', Validators.required), // for the radio button selection
      extenddate: new FormControl({ value: '', disabled: !this.extend }, [
        Validators.required,
        // this.dateValidator.bind(this),
      ]),
      Extendreason: new FormControl('', Validators.required),
      Descriptiondetails: new FormControl('', Validators.required),
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
        this.Contractors.next([...this.originalContractors]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.contractConversionRoleTable) {
          this.contractConversionRoleTable.reset();
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

      switch (field) {
        case 'employeeId':
          val1 = a.entity?.fusionEmpId;
          val2 = b.entity?.fusionEmpId;
          break;
        case 'employeeName':
          val1 = a.entity?.employeeName;
          val2 = b.entity?.employeeName;
          break;
        case 'contractStartDate':
          val1 = a.entity?.contractStartDate;
          val2 = b.entity?.contractStartDate;
          break;
        case 'contractEndDate':
          val1 = a.entity?.contractEndDate;
          val2 = b.entity?.contractEndDate;
          break;
        case 'contractType':
          val1 = a.entity?.contractType;
          val2 = b.entity?.contractType;
          break;
        default:
          val1 = a.entity?.[field];
          val2 = b.entity?.[field];
          break;
      }

      // Handle date fields
      if (['contractStartDate', 'contractEndDate'].includes(field)) {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Employee ID sorting with alphanumeric
      if (field === 'employeeId') {
        return event.order * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });

    // Update the BehaviorSubject with sorted data
    this.Contractors.next([...event.data]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
