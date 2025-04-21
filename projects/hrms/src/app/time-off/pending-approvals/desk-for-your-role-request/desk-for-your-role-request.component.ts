import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Entity } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-desk-for-your-role-request',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule, TranslateModule, DateformatPipe],
  templateUrl: './desk-for-your-role-request.component.html',
  styleUrl: './desk-for-your-role-request.component.scss'
})
export class DeskForYourRoleRequestComponent {
  employdata: any
  deskiteam: any
  updataid: any
  assiginemploye: any
  deskheaderpending: Entity[] = [];
  deskid: any;
  selectedexpenesid: any
  subscription!: Subscription
  rejectForm!: FormGroup;
  constructor(
    private http: HttpService,
    private readonly modalService: NgbModal,
    public conformationPopup: OpenModalService,
    private fb: FormBuilder,
  ) { }


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
    this.http
      .getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=ROLE`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.deskheaderpending = (data.data as Entity[]).filter(item => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
          console.log(this.deskheaderpending)

          // this.filterPendingExpenses()
        }, error: (err) => {
          console.log("expensesheadererror")

        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  process(expid: any, exp: any): void {
    console.log(exp)
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
        console.log('Error:', error);
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
    console.log(this.updataid)
    this.subscription = this.http
      .getData(`DeskAllocationItem/getRecordpending?deskAllocationItemId=${this.updataid}`)
      .subscribe({
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
      approvedBy: this.employdata.employeeId.toString()

    };
    this.http.putData(`PendingApproval/${this.selectedexpenesid}`, userStatus).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll()
        this.getexpensespendingforyou()
        this.conformationPopup.openSuccessModal("Request Rejected Successfully")
        this.rejectForm.reset()
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.message || 'An error occurred')

        console.error('Error response from API:', error);
      }
    });
  }
   
}
