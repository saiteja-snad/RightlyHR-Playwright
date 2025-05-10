import { Component } from '@angular/core';
import { Entity } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-desk-for-you-request',
  imports: [CommonModule, NoDataFoundComponent, DateformatPipe, ReactiveFormsModule, TranslateModule],
  templateUrl: './desk-for-you-request.component.html',
  styleUrl: './desk-for-you-request.component.scss'
})
export class DeskForYouRequestComponent {
  employdata: any
  deskiteam: any
  updataid: any
  assiginemploye: any
  deskheaderpending: Entity[] = [];
  deskid: any;
  selectedexpenesid: any
  subscription!: Subscription
  rejectForm!: FormGroup;

  constructor(private http: HttpService, private readonly modalService: NgbModal, 
    public conformationPopup: OpenModalService, private fb: FormBuilder,public rbac: RbacService) { }

  ngOnInit(): void {
    this.employdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensespendingforyou();
    this.intializeRejectForm()
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]],
    });
  }

  getexpensespendingforyou(): void {
    this.http.getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.deskheaderpending = (data.data as Entity[]).filter(item => 
          item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        // this.filterPendingExpenses()
      }, error: (err) => {
        console.log("expensesheadererror");
      },
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  process(expid: any, exp: any): void {
    this.assiginemploye = exp.deskAllocatedTo
    this.deskid = expid
    const userStatus: any = {
      id: this.deskid,
      status: 'Processed',
      approvedBy: this.employdata.employeeId.toString()
    };
    this.http.putData(`PendingApproval/process/${this.deskid}`, userStatus).subscribe({
      next: (res: any) => {
        this.conformationPopup.openSuccessModal("Request Processed Successfully")
        this.updatedeskitem()
        this.getexpensespendingforyou()
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
    this.modalService.open(content, { size: 'xl' });
  }

  viewdeskitem(deskid: any) {
    this.updataid = deskid;
    this.subscription = this.http.getData(`DeskAllocationItem/getRecordpending?deskAllocationItemId=${this.updataid}`).subscribe({
      next: (data: any) => {
        this.deskiteam = data;
      },
      error: (err: any) => {
        this.deskiteam = null;
      },
    });
  }

  Rejected(formdata: FormGroup) {
    const userStatus: any = {
      id: this.selectedexpenesid,
      status: 'Rejected',
      comments: this.rejectForm.get('comments')?.value,
      approvedBy: this.employdata.employeeId.toString()
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
}