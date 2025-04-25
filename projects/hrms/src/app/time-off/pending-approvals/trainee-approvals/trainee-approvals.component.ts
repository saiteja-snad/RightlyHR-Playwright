import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
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
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TraineesearchfilterPipe } from "../../../Pipes/traineesearchfilter.pipe";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { RbacService } from '../../../services/rbac.service';
import { TraineeApprovalsTabsComponent } from "../../../shared/time-off-module-tabs/pending-approvals-tabs/trainee-approvals-tabs/trainee-approvals-tabs.component";
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';

@Component({
  selector: 'app-trainee-approvals',
  imports: [DateformatPipe, CommonModule, ReactiveFormsModule, NgbPopoverModule, PaginatorModule, FormsModule, TranslateModule, NoDataFoundComponent, TraineesearchfilterPipe, TraineeApprovalsTabsComponent],
  templateUrl: './trainee-approvals.component.html',
  styleUrl: './trainee-approvals.component.scss'
})
export class TraineeApprovalsComponent {
  isLoading= false;
  private customsetup: any;
  private datePipe: DatePipe;
  selectedLeaveData: any = {
    extend: false,
    discontinue: false,
    extenddate: null,
    trcomments: '',
    rejectedReason: '',
  };
  acceptForm!: FormGroup;
  subscription!: Subscription;
  requesthandler = {} as any;
  empdata = {} as Ipersonal;
  Trainees = new BehaviorSubject<Itraineeapproval[]>([]);
  myApproverComments = {} as any;
  discontinue: any;
  extend: any;
  isempeffectivevaild: boolean = true;
  rejectForm!: FormGroup
  rejectSeparationForm!: FormGroup
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
  constructor(
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private authService: AuthService,
    public rbac: RbacService,
  ) {
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }
  ngOnInit(): void {
    this.getAllPendingApprovals();
  }

  iniializationForm() {
    this.acceptForm = this.fb.group({
      trcomments: [this.selectedLeaveData.trcomments || '', Validators.required,noWhitespaceValidator]
    });
  }
  initaializeextendForm() {
    this.rejectForm = this.fb.group({
      extenddate: ['', Validators.required],
      trcomments: ['', Validators.required,noWhitespaceValidator],
      rejectedReason: ['', Validators.required,noWhitespaceValidator]
    });

    this.rejectForm.valueChanges.subscribe(val => {
      this.selectedLeaveData.extenddate = val.extenddate;
      this.selectedLeaveData.trcomments = val.trcomments;
      this.selectedLeaveData.rejectedReason = val.rejectedReason;
    });
  }

  transform(value: any, ...args: unknown[]): unknown {
    if (value) {
      return this.datePipe.transform(value, this.customsetup);
    }
    return null;
  }

  reload(): void {
    this.acceptForm.reset();
  }

  comment = {} as any;
  commentsFunction(Value: any) {
    this.comment = Value;
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

  updateExtendDateValidity(): void {
    if (this.empdata.trainingEndDate > this.selectedLeaveData.extenddate) {
      console.log(this.empdata.trainingEndDate);
      console.log(this.selectedLeaveData.extenddate);
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
    console.log(this.selectedLeaveData);

    this.getEmployeedatabyid(this.selectedLeaveData);
  }

  handleAccept(f:NgForm) {
    this.isLoading=true;
    let requestBody = {
      status: 'Approved',
      comments: this.selectedLeaveData.trcomments,
    };
    f.reset();
    console.log(requestBody);
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.conformationPopup.openSuccessModal('Request Accepted Successfully')
        },
        error: (reason: any) => {
          this.isLoading=false
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
           this.isLoading=false;
           this.getAllPendingApprovals();
           this.selectedLeaveData.trcomments='';
        },
      });
  }

  //function to send the rejected status and comments
  handleReject(f:NgForm) {
    this.isLoading=true
    let requestBody = {
      status: 'Rejected',
      comments: this.selectedLeaveData.rejectedReason,
    };
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll()
          this.conformationPopup.openSuccessModal('Request Rejected Successfully')
        },
        error: (reason: any) => {
          this.isLoading=false
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
          this.isLoading=false;
          this.getAllPendingApprovals();
          this.selectedLeaveData={};
        },
      });
  }

  //function to send the processed status
  handleProcess(request: Itraineeapproval) {
    let requestBody = {
      status: 'Processed',
      comments: this.selectedLeaveData.comments,
    };
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${request.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.conformationPopup.openSuccessModal('Request Processed Successfully')
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
        },
      });
  }

  //function to get the employeedata
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.empId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
          alert('Insertion of data faild');
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
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
      comments: this.selectedLeaveData.trcomments,
      trainingEndDate: this.selectedLeaveData.extenddate,
    };
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.conformationPopup.openSuccessModal('Request Extend Successfully')
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
        },
      });
  }

  initializeForm(): void {
    this.rejectSeparationForm = this.fb.group({
      // extenddate: [this.selectedLeaveData.extenddate, [Validators.required, this.extendDateValidator.bind(this)]],
      trcomments: [this.selectedLeaveData.trcomments, [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]+$/)]]
    });
  }

  getAllPendingApprovals() {
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=15&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.Trainees.next(data.data as Itraineeapproval[])
        this.noRecalllength = this.Trainees;
      },
      error: (reason) => console.log(reason),
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
}