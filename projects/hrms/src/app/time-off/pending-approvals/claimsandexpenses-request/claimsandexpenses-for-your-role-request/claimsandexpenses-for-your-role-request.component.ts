import { Component, ViewChild } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AttendanceRequest, ICategoryDetails } from '../../../../Interfaces/timoff-model';
import { Subject } from 'rxjs';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IJob } from '../../../../Interfaces/letters-model';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DropdownModule } from 'primeng/dropdown';
import { Entity } from '../../../../Interfaces/claimsandexpenses.model';

@Component({
  selector: 'app-claimsandexpenses-for-your-role-request',
  imports: [DateformatPipe, CommonModule, ReactiveFormsModule, FormsModule, NoDataFoundComponent,PaginatorModule,
      DropdownModule,NgbPopoverModule],
  templateUrl: './claimsandexpenses-for-your-role-request.component.html',
  styleUrl: './claimsandexpenses-for-your-role-request.component.scss'
})
export class ClaimsandexpensesForYourRoleRequestComponent {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  expenseheaderpending = [] as Entity[];
  approverComments = [] as any[];
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals()
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=19&approvedType=ROLE`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.expenseheaderpending = (response.data as Entity[]).filter(
            (item) =>
              item.approvalHeader.status != 'Processed' &&
              item.approvalHeader.status != 'Rejected'
          );
        
        },
        error: (reason) => console.log(reason),
      });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }


  comments(value: any, commentspopup: any){
    this.modalService.open(commentspopup, {centered: true,backdrop: 'static',size: 'lg'});
    this.approverComments = value;
    console.log(this.approverComments);
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
