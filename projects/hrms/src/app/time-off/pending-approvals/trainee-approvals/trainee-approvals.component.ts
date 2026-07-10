import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, Signal, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { OpenModalService } from '../../../services/open-modal.service';
import { Itraineeapproval } from '../../../Interfaces/traineedetails.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, NgForm, FormControl, FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TraineesearchfilterPipe } from "../../../Pipes/traineesearchfilter.pipe";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { RbacService } from '../../../services/rbac.service';
import { TraineeApprovalsTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/trainee-approvals-tabs/trainee-approvals-tabs.component";
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { SignalsService } from '../../../services/signals.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-trainee-approvals',
  imports: [DateformatPipe, CommonModule, ReactiveFormsModule, NgbPopoverModule, PaginatorModule, FormsModule, TranslateModule,
    NoDataFoundComponent, TraineesearchfilterPipe, TraineeApprovalsTabsComponent, DataLoaderContentComponent, TableModule],
  templateUrl: './trainee-approvals.component.html',
  styleUrl: './trainee-approvals.component.scss',
})

export class TraineeApprovalsComponent implements OnInit, OnDestroy {
  @ViewChild('traineeTable') traineeTable!: Table;
  isLoading = false;
  private customsetup: any;
  private datePipe: DatePipe;
  selectedLeaveData: any = {
    extend: false,
    discontinue: false,
    extenddate: null,
    trcomments: '',
    rejectedReason: '',
  };
  subscription!: Subscription;
  requesthandler = {} as any;
  empdata = {} as Ipersonal;
  Trainees = new BehaviorSubject<Itraineeapproval[]>([]);
  originalTraineesData = [] as Itraineeapproval[]; // Store original unsorted data
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
  Traineeaprovalsearch: any;
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

  constructor(private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder, private modalService: NgbModal,
    private authService: AuthService, public rbac: RbacService,public formsValidation: FormValidationsService,private signalService: SignalsService) {
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }
totalCount:any;
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
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
     });
    this.rejectForm.valueChanges.subscribe((val) => {
      this.selectedLeaveData.extenddate = val.extenddate;
      this.selectedLeaveData.trcomments = val.trcomments;
      this.selectedLeaveData.rejectedReason = val.rejectedReason;
    });
  }
onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
   this.selectedLeaveData.trcomments= 'Approved';
  }
}
onCommentChange(value: string) {
  // Reset highlight only when the textarea becomes completely empty
  if (!value || value.trim() === '') {
    this.selectedLeaveStatus = null;
  }
}
  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.selectedLeaveData.trcomments='Rejected';
    }
  }
    onStatusdiccontinueRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.selectedLeaveData.rejectedReason='Rejected';
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
    this.selectedLeaveData = {};
    this.modalService.dismissAll();
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
    this.selectedLeaveData.reasonForDiscontinue = '';
    this.selectedLeaveData.rejectedReason = '';
  }

  toggleDiscontinue() {
    this.discontinue = true;
    this.extend = false;
    // If Discontinue is selected, clear Extend and related values
    this.selectedLeaveData.extenddate = null;
    this.selectedLeaveData.reasonForExtend = '';
    this.selectedLeaveData.trcomments = '';
  }

  minExtendDate: any;
  updateExtendDateValidity(): void {
    if (this.empdata.trainingEndDate > this.selectedLeaveData.extenddate) {
      this.isempeffectivevaild = false;
    } else {
      this.isempeffectivevaild = true;
    }
  }

  selectedSpRequestDataforheader = {} as any;
  handleRequests(request: Itraineeapproval) {
    this.requesthandler = request;
    this.selectedLeaveData = request.entity;
    this.selectedSpRequestDataforheader = request.approvalHeader;
    const endDate = request.entity?.traineeEndDate;
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      this.minExtendDate = this.datePipe.transform(nextDay, 'yyyy-MM-dd');
    } else {
      this.minExtendDate = null;
    }
    this.getEmployeedatabyid(this.selectedLeaveData);
  }

  handleAccept(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    let requestBody = {
      status: 'Approved',
      approvedBy: loggedInUser.employeeId.toString(),
      comments: this.selectedLeaveData.trcomments,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };

    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Request has been approved successfully');
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
        this.selectedLeaveData.trcomments = '';
        this.signalService.traineeDetailsTriggerSignal.set(true);
         this.signalService.probationDetailsTriggerSignal.set(true);
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
      },
    });
  }

  //function to send the rejected status and comments
  handleReject(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    let requestBody = {
      status: 'Rejected',
      approvedBy: loggedInUser.employeeId.toString(),
      comments: this.selectedLeaveData.rejectedReason,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };
    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Trainee request rejected successfully');
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
      },
      error: (reason: any) => {
        this.isLoading = false
        this.conformationPopup.openErrorModal(reason.error.message)
      },
      complete: () => {
        this.isLoading = false;
        this.getAllPendingApprovals();
        this.getApprovalStatusCounts();
        this.signalService.traineeDetailsTriggerSignal.set(true);
         this.signalService.probationDetailsTriggerSignal.set(true);
        this.selectedLeaveData = {};
      },
    });
  }

  //function to send the processed status
  handleProcess(request: Itraineeapproval) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.authService.getToken().employeeId.toString(),
      currentStage: parseInt(request.approvalHeader.currentapprovalStage),
    };
    this.subscription = this.http.putData(`PendingApproval/process/${request.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.conformationPopup.openSuccessModal('Trainee request processed successfully')
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message)
      },
      complete: () => {
        this.getAllPendingApprovals();
        this.getApprovalStatusCounts();
        this.signalService.traineeDetailsTriggerSignal.set(true);
         this.signalService.probationDetailsTriggerSignal.set(true);
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
      },
    });
  }
 getApprovalStatusCounts() {
      let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.traineeoffboardingModuleId}&EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  //function to get the employeedata
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.empId;
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

  //function for extend
  handleExtend(f: NgForm) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.authService.getToken().employeeId.toString(),
      comments: this.selectedLeaveData.trcomments,
      trainingEndDate: this.selectedLeaveData.extenddate,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };
    this.subscription = this.http.putData(`PendingApproval/process/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal('Trainee request extend successfully');
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
        this.signalService.traineeDetailsTriggerSignal.set(true);
        this.signalService.probationDetailsTriggerSignal.set(true);
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message)
      },
      complete: () => {
        this.getAllPendingApprovals();
        this.selectedLeaveData = {};

      },
    });
  }

  initializeForm(): void {
    this.rejectSeparationForm = this.fb.group({
      // extenddate: [this.selectedLeaveData.extenddate, [Validators.required, this.extendDateValidator.bind(this)]],
      trcomments: [this.selectedLeaveData.trcomments, [Validators.required]]
    });
  }

  getAllPendingApprovals() {
    this.loading = true;
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=15&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.Trainees.next(data.data as Itraineeapproval[]);
        this.originalTraineesData = [...data.data]; // Store original data
        this.noRecalllength = this.Trainees;
      },
      error: (reason) => {
        console.log(reason)
        this.loading = false;
      },
    });
  }

  getFilteredAndSortedTrainees(): Itraineeapproval[] {
    const search = this.Traineeaprovalsearch?.toLowerCase() ?? '';
    let trainees = this.Trainees.getValue() ?? [];

    if (search) {
      trainees = trainees.filter(trainee =>
        trainee.entity?.empName?.toLowerCase().includes(search)
      );
    }

    return trainees;
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
        this.Trainees.next([...this.originalTraineesData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.traineeTable) {
          this.traineeTable.reset();
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
        case 'empId':
          val1 = a.entity?.empId;
          val2 = b.entity?.empId;
          break;
        case 'empName':
          val1 = a.entity?.empName;
          val2 = b.entity?.empName;
          break;
        case 'traineeStartDate':
          val1 = a.entity?.traineeStartDate;
          val2 = b.entity?.traineeStartDate;
          break;
        case 'traineeEndDate':
          val1 = a.entity?.traineeEndDate;
          val2 = b.entity?.traineeEndDate;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (field === 'traineeStartDate' || field === 'traineeEndDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Employee ID sorting (alphanumeric)
      if (field === 'empId') {
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
