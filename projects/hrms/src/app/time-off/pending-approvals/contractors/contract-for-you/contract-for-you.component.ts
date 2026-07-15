import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { AuthService } from '../../../../services/auth.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { Icontractapproval } from '../../../../Interfaces/contract-module';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";


@Component({
  selector: 'app-contract-for-you',
  standalone: true,
  imports: [
    DateformatPipe, 
    CommonModule, 
    ReactiveFormsModule, 
    NgbPopoverModule, 
    TableModule, 
    FormsModule, 
    TranslateModule,
    NoDataFoundComponent, 
    DataLoaderContentComponent, 
    InfoIconComponent
  ],
  templateUrl: './contract-for-you.component.html',
  styleUrl: './contract-for-you.component.scss'
})
export class ContractForYouComponent implements OnInit,OnDestroy {
@ViewChild('contractTable') contractTable!: Table;
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
  contractData = [] as Icontractapproval[];
  originalContractData = [] as Icontractapproval[]; // Store original unsorted data
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
  searchValue: any;
  selectedLeaveStatus: any;
  totalCount:any;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder, private modalService: NgbModal,
    private authService: AuthService, public rbac: RbacService,public formsValidation: FormValidationsService,private signalService: SignalsService) {
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }

  ngOnInit(): void {
    this.getAllPendingApprovals();
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
  onCommentChange(value: string) {
  // Reset highlight only when the textarea becomes completely empty
  if (!value || value.trim() === '') {
    this.selectedLeaveStatus = null;
  }
}

  getFilteredAndSortedContracts(): Icontractapproval[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.contractData;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.contractData.filter((contract: Icontractapproval) => {
      const employeeId = contract.entity?.fusionEmpId?.toString().toLowerCase() || '';
      const employeeName = contract.entity?.employeeName?.toLowerCase() || '';
      const contractStartDate = contract.entity?.contractStartDate || '';
      const contractEndDate = contract.entity?.contractEndDate || '';
      const contractType = contract.entity?.contractType?.toLowerCase() || '';
      
      return employeeId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             contractStartDate.includes(searchTerm) ||
             contractEndDate.includes(searchTerm) ||
             contractType.includes(searchTerm);
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
        this.contractData = [...this.originalContractData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.contractTable) {
          this.contractTable.reset();
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

      // Handle contract fields
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
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (['contractStartDate', 'contractEndDate'].includes(field)) {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Employee ID sorting (numeric)
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
  }
  initaializeextendForm() {
    this.rejectForm = this.fb.group({
      extenddate: ['', Validators.required],
      trcomments: ['', Validators.required],
      rejectedReason: ['', Validators.required]
    });
      this.rejectForm.get('trcomments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
     });
    this.rejectForm.valueChanges.subscribe((val) => {
      this.selectedContractData.extenddate = val.extenddate;
      this.selectedContractData.trcomments = val.trcomments;
      this.selectedContractData.rejectedReason = val.rejectedReason;
    });
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
    this.selectedLeaveStatus = null;
  }

  commentsFunction(value: any, content: any) {
    const commentsArray = Array.isArray(value) ? value : [value];
    this.myApproverComments = commentsArray.map((ele: any) => {
      const parsedMetaData = ele.meta ? JSON.parse(ele.meta) : {};
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    });

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.comments = commentsArray;
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
  handleRequests(request: Icontractapproval) {
    this.requesthandler = request;
    this.selectedContractData = request.entity;
    this.selectedSpRequestDataforheader = request.approvalHeader;
    this.minExtendDate = this.empdata.trainingEndDate;
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
        this.conformationPopup.openSuccessModal('Request has been accepted successfully');
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
        this.signalService.contractForyouTriggerSignal.set(true);
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
  handleProcess(request: Icontractapproval) {
    let loggedInUser = this.authService.getToken();
    let requestBody = {
      status: 'Processed',
      currentStage: parseInt(request.approvalHeader.currentapprovalStage),
      approvedBy: loggedInUser.employeeId.toString(),
    };
    this.subscription = this.http.putData(`PendingApproval/process/${request.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.conformationPopup.openSuccessModal('Request processed successfully')
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
    this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${EmployeeId}`).subscribe((res: any) => {
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
    const moduleId=environment.contractorModuleId
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.contractData = data.data as Icontractapproval[];
        this.originalContractData = [...this.contractData];
        this.noRecalllength = this.contractData;
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
