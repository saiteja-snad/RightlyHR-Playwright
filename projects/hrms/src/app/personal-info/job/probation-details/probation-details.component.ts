import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IJob } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import { ProbationformViewComponent } from '../../../shared/probationform-view/probationform-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-probation-details',
  standalone: true,
  imports: [CommonModule, DateformatPipe, NgbPopoverModule, ProbationformViewComponent, TranslateModule, InfoIconComponent, NoDataFoundComponent, DataLoaderContentComponent, DocumentViewIconComponent, TableModule],
  templateUrl: './probation-details.component.html',
  styleUrl: './probation-details.component.scss'
})

export class ProbationDetailsComponent implements OnInit {
  @ViewChild('probationDetailsTable') probationDetailsTable!: Table;
  empinfo = {} as IJob;
  empdata = {} as any;
  subscription!: Subscription;
  getProbationRequestDetails = [] as any;
  originalProbationRequestDetails = [] as any;
  probationProbationNotiperiodDuration: any;
  probationExtendTimes: any;
  appcomment = {} as any;
  loggedinuser = {} as any;
  loading = false;
  totalCount: any;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, private authService: AuthService, private openModalService: OpenModalService,
    private modalService: NgbModal, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private readonly router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute()
    this.loggedinuser = this.authService.getToken();
    this.getProbationRequest();
    this.getProbationExtendDays();
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getEmployeeId();
      this.getProbationRequest();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getEmployeeId();
      this.getProbationRequest();
    }
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
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data)
        this.getProbationRequestDetails = data;
        this.originalProbationRequestDetails = [...data];
        this.loading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
      }
    })
  }

  shouldprobationShowButton(probationEndDate: string): boolean {
    console.log(probationEndDate);
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
        this.openModalService.openSuccessModal('Probation request raised successfully');
        this.getApprovalStatusCounts();
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
         this.getApprovalStatusCounts();
        this.openModalService.openSuccessModal('Probation Request raised successfully');
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
getApprovalStatusCounts() {
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.traineeoffboardingModuleId}&EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  openview(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static' });
  }

  setformView(employeeId: number, responseId: number) {
    this.http.communicationService.next({ employeeId, responseId });
  }

  probationCommentsFunction(Value: any, content: any) {
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static' });
    this.appcomment = Value?.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele?.metaData);
      return {
        ...ele,
        metadata: parsedMetaData
      };
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
        this.getProbationRequestDetails = [...this.originalProbationRequestDetails];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.probationDetailsTable) {
          this.probationDetailsTable.reset();
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

      if (field === 'appliedDate' || field === 'probationStartDate' || field === 'probationEndDate' || field === 'probationExtendedDate') {
        // Special handling for probationEndDate based on status
        if (field === 'probationEndDate') {
          // For 'Processed' status, use empdata.probationEndDate, otherwise use probation.probationEndDate
          const dateA = a.status === 'Processed' ? this.empdata?.probationEndDate : a[field];
          const dateB = b.status === 'Processed' ? this.empdata?.probationEndDate : b[field];
          
          const date1 = dateA ? new Date(dateA) : new Date(0);
          const date2 = dateB ? new Date(dateB) : new Date(0);
          
          val1 = isNaN(date1.getTime()) ? 0 : date1.getTime();
          val2 = isNaN(date2.getTime()) ? 0 : date2.getTime();
        } else {
          // Handle other date fields normally
          const date1 = a[field] ? new Date(a[field]) : new Date(0);
          const date2 = b[field] ? new Date(b[field]) : new Date(0);
          
          val1 = isNaN(date1.getTime()) ? 0 : date1.getTime();
          val2 = isNaN(date2.getTime()) ? 0 : date2.getTime();
        }
        
        return event.order * (val1 - val2);
      } else if (field === 'probationDays') {
        val1 = parseInt(a[field] ?? '0') || 0;
        val2 = parseInt(b[field] ?? '0') || 0;
        return event.order * (val1 - val2);
      } else {
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }
}