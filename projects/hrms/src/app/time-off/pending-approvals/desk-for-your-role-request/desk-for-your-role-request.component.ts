import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { RbacService } from '../../../services/rbac.service';
import { SearchfilterPipe } from "../../../Pipes/searchfilter.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
@Component({
  selector: 'app-desk-for-your-role-request',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule, TranslateModule, DateformatPipe, SearchfilterPipe],
  templateUrl: './desk-for-your-role-request.component.html',
  styleUrl: './desk-for-your-role-request.component.scss'
})

export class DeskForYourRoleRequestComponent implements OnInit, OnDestroy {
  employdata: any;
  deskiteam: any;
  updataid: any;
  assiginemploye: any;
  deskheaderpending: any[] = [];
  deskid: any;
  selectedexpenesid: any;
  subscription!: Subscription;
  rejectForm!: FormGroup;
  searchValue:any
  constructor(private http: HttpService, private readonly modalService: NgbModal, public conformationPopup: OpenModalService,public rbac: RbacService,
     private fb: FormBuilder, public formValidation: FormValidationService) { }


  ngOnInit(): void {
    this.employdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensespendingforyou();
    this.intializeRejectForm()
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  getexpensespendingforyou(): void {
    this.http.getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=ROLE`).subscribe({
      next: (data: any) => {
        this.deskheaderpending = (data.data as any[]).filter(item => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        // this.filterPendingExpenses()
      }, error: (err) => {
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
        this.conformationPopup.openSuccessModal("Request Processed Successfully")
         this.getexpensespendingforyou()
        this.updatedeskitem()
       
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
    this.modalService.open(content, { size: 'xl' , backdrop: 'static', centered: true });
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
    const userStatus: any = {
      id: this.selectedexpenesid,
      status: 'Rejected',
      comments: this.rejectForm.get('comments')?.value,
      approvedBy: this.employdata.employeeId.toString(),
      currentStage: parseInt(this.expapprovalsdata.approvalHeader.currentStage),
    };
    this.http.putData(`PendingApproval/${this.selectedexpenesid}`, userStatus).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.getexpensespendingforyou();
        this.conformationPopup.openSuccessModal("Request Rejected Successfully");
        this.rejectForm.reset();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.message || 'An error occurred');
        console.error('Error response from API:', error);
      }
    });
  }
  cleardata(){
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
