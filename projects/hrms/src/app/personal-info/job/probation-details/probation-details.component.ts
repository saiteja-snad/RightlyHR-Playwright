import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IJob } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import { ProbationformViewComponent } from '../../../shared/probationform-view/probationform-view.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-probation-details',
  standalone: true,
  imports: [CommonModule, DateformatPipe, NgbPopoverModule, ProbationformViewComponent, TranslateModule],
  templateUrl: './probation-details.component.html',
  styleUrl: './probation-details.component.scss'
})

export class ProbationDetailsComponent implements OnInit {
  empinfo = {} as IJob;
  empdata = {} as any;
  subscription!: Subscription;
  getProbationRequestDetails = [] as any;
  probationProbationNotiperiodDuration: any;
  probationExtendTimes: any;
  appcomment = {} as any;
  loggedinuser = {} as any;

  constructor(private http: HttpService, private authService: AuthService, private openModalService: OpenModalService,
     private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.loggedinuser = this.authService.getToken();
    this.getEmployeeId();
    this.getProbationRequest();
    this.getProbationExtendDays();
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  getProbationRequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getProbationRequestDetails = data;
      }
    })
  }

  shouldprobationShowButton(probationEndDate: string): boolean {
    const shouldShow = (this.isprobationEndDateComplete(probationEndDate));
    return shouldShow;
  }

  getProbationExtendDays() {
    const probationnoticeperiodId = environment.ProbationbuttonbeforeId;
    const probtimesextended = environment.ProbationExtendPeriodTimes
    this.subscription = this.http.getData(`ProbationFlow/settingsprobationconfiggetall`).subscribe({
      next: (data: any) => {
        const duration = data.find((ele: any) => {
          return ele.configValueId === probationnoticeperiodId;
        })
        this.probationProbationNotiperiodDuration = duration.noOfDays;
        const probExtendTimes = data.find((ele: any) => {
          return ele.configValueId === probtimesextended;
        })
        this.probationExtendTimes = probExtendTimes.noOfDays;
      }
    })
  }

  isprobationEndDateComplete(probationEndDate: string) {
    if (probationEndDate) {
      const endDate = new Date(probationEndDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(endDate.getDate() - parseInt(this.probationProbationNotiperiodDuration));
      const currentDate = new Date();
      const isComplete = currentDate >= buttonEnabledDate;
      return isComplete;
    }
    return false;
  }

  requestForProbation(Value: any) {
    this.openModalService.openLoaderModal('Requesting....');
    const employeeId = parseInt(this.empinfo.employeeId);
    const referenceId = Value.probationId;
    const raisedbyempId = this.loggedinuser.employeeId;
    this.http.postProbation(`ProbationFlow/raiseprobationrequest`, employeeId, referenceId, raisedbyempId).subscribe({
      next: (response: any) => {
        this.getProbationRequest();
        this.modalService.dismissAll();
        this.openModalService.openSuccessModal('Probation Request Raised Successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.modalService.dismissAll();
        this.openModalService.openErrorModal(reason.error.message);
      }
    })
  }

  requestforconfirmationWhenExtended(Values: any) {
    this.openModalService.openLoaderModal('Requesting...');
    let payload = {
      "employeeId": Values.employeeId,
      "probationStartDate": Values.probationStartDate,
      "probationEndDate": Values.probationEndDate,
      "status": "Waiting for Approval",
      "appliedDate": Values.appliedDate,
      "dateOfJoining": Values.dateOfJoining,
      "probationDays": Values.probationDays,
      "raisedBy": this.loggedinuser.employeeId,
      "parentId": Values.probationId,
      "probationExtendedDate": Values.probationExtendedDate,
      "probationExtendCount": Values.probationExtendCount,
    }
    this.http.postdata(`ProbationFlow/postProbationActivationEmployees`, payload).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.getProbationRequest();
        this.openModalService.openSuccessModal('Probation Request Raised Successfully');
      },
      error: (error: any) => {
        this.modalService.dismissAll();
        this.openModalService.openErrorModal(error.error.message);
      }
    })
  }

  closeModel() {
    this.modalService.dismissAll();
  }

  openview(content: any) {
    this.modalService.open(content, { size:'xl', centered: true, backdrop: 'static' });
  }

  setformView(employeeId: number, responseId: number) {
    this.http.communicationService.next({ employeeId, responseId });
  }

  probationCommentsFunction(Value: any, content: any) {
    this.modalService.open(content, { size:'xl', centered: true, backdrop: 'static' });
    this.appcomment = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData
      };
    });
  }
}