import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { OpenModalService } from '../../../services/open-modal.service';
import { Itraineeapproval } from '../../../Interfaces/traineedetails.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-trainee-approvals',
  imports: [DateformatPipe, CommonModule, NoDataFoundComponent, ReactiveFormsModule, NgbPopoverModule,],
  templateUrl: './trainee-approvals.component.html',
  styleUrl: './trainee-approvals.component.scss'
})
export class TraineeApprovalsComponent {
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
  trainee_details = new BehaviorSubject<Itraineeapproval[]>([]);
  myApproverComments = {} as any;
  discontinue: any;
  extend: any;
  isempeffectivevaild: boolean = true;
  rejectForm!: FormGroup

  constructor(private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder, private modalService: NgbModal) {
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }
  iniializationForm() {
    this.acceptForm = this.fb.group({
      trcomments: [this.selectedLeaveData.trcomments || '', Validators.required]
    });
  }
  initaializeextendForm() {
    this.rejectForm = this.fb.group({
      extenddate: ['', Validators.required],
      trcomments: ['', Validators.required],
      rejectedReason: ['', Validators.required]
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

  handleAccept(f: FormGroup) {
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
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
      });
  }

  //function to send the rejected status and comments
  handleReject(f: NgForm) {
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
          this.conformationPopup.openSuccessModal('Request Rejected Successfully')
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(reason.error.message)
        },
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
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
          setTimeout(() => {
            window.location.reload();
          }, 2000);
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
    console.log(Value)
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
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
      });
  }

}
