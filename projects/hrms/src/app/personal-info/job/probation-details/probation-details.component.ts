import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IJob } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment.dev';
@Component({
  selector: 'app-probation-details',
  imports: [CommonModule, DateformatPipe],
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

  constructor(private http: HttpService, private authService: AuthService, private openModalService:OpenModalService, private modalService:NgbModal) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.loggedinuser = this.authService.getToken();
    this.getEmployeeId();
    this.getProbationRequest();
    this.getProbationExtendDays()
    console.log(this.probationProbationNotiperiodDuration);
    
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
        console.log(data);
        const duration = data.find((ele: any) => {
          return ele.configValueId === probationnoticeperiodId;
        })
        console.log(duration);
        this.probationProbationNotiperiodDuration = duration.noOfDays;
        const probExtendTimes = data.find((ele: any) => {
          return ele.configValueId === probtimesextended;
        })
        this.probationExtendTimes = probExtendTimes.noOfDays;
      }
    })
  }
  isprobationEndDateComplete(probationEndDate: string) {
    console.log(probationEndDate);
    if (probationEndDate) {
      const endDate = new Date(probationEndDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(endDate.getDate() - parseInt(this.probationProbationNotiperiodDuration));
      console.log(buttonEnabledDate)
      const currentDate = new Date();
      const isComplete = currentDate >= buttonEnabledDate;
      return isComplete;
    }
    return false;
  }

  requestForProbation(Value: any) {
    this.openModalService.openLoaderModal('Requesting...');
    const employeeId = parseInt(this.empinfo.employeeId);
    const referenceId = Value.probationId;
    const raisedbyempId = this.loggedinuser.employeeId;
    this.http.postProbation(`ProbationFlow/raiseprobationrequest`, employeeId, referenceId, raisedbyempId).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.getProbationRequest();
        this.openModalService.openSuccessModal('Probation Request Raised Successfully');
      },
      error: (reason: any) => {
        if (reason.status == 500) {
          this.modalService.dismissAll();
          this.openModalService.openErrorModal(reason.error);
        }
        else {
          this.modalService.dismissAll();
          this.openModalService.openErrorModal(reason.error.Message);
        }
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

  probationCommentsFunction(Value: any) {
    // const modalElement = document.getElementById('probationCommentsPopup');
    // if (modalElement) {
    //   modalElement.classList.add('show');
    //   modalElement.style.display = 'block';
    // }
    // console.log(Value)
    this.appcomment = Value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData // Assign parsed metaData to metadata property
      };
    });
    // console.log(this.appcomment)
  }
}