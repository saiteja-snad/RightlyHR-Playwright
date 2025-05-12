import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-leaves-waiting-for-approval',
  imports: [CommonModule,TranslateModule,ReactiveFormsModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './leaves-waiting-for-approval.component.html',
  styleUrl: './leaves-waiting-for-approval.component.scss'
})

export class LeavesWaitingForApprovalComponent implements OnInit,OnDestroy{
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  cancelForm!:FormGroup;
  selectedFields = {} as any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
isLoading=false;
  constructor(private http: HttpService, private signalService:SignalsService, private modalService: NgbModal,private conformationPopup: OpenModalService, private authService: AuthService, public rbac: RbacService,private fb:FormBuilder) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getDataByLPID();
    this.formInializer();
  }
 formInializer() {
    this.cancelForm = this.fb.group({
      cancelReason: [null,
        [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/), noWhitespaceValidator]
      ]
    });
  }
    onClick(data: any,content:any) {
    this.selectedFields = data
    console.log(this.selectedFields);
    this.modalService.open(content, { centered: true});
  }
  //function to cancle the leave
  cancelLeaveSubmit(){
    this.isLoading=true;
    const currentDate=moment()
 const payload={
       "updatedDate": currentDate,
        "rejectedReason": this.cancelForm.get('cancelReason')?.value,
        "rejectedBy": this.empdata.employeeId
    }
    this.subscription=this.http.putData(`Timeoff/cancel?id=${this.selectedFields.id}`,payload).subscribe({
      next:(res:any)=>{
        console.log(res);
        if(res){
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Leave cancelled successfully')
            this.getDataByLPID();
          
        }
       this.signalService.timecountTriggerSignal.set(true);
      
      },
      error:(err:any)=>{
        console.log(err)
        this.isLoading=false;
        this.conformationPopup.openErrorModal(err.error.message);
        this.modalService.dismissAll();
      },
      complete:()=> {
        this.isLoading=false;
         this.getDataByLPID();
      },

    })
  }
  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Waiting for Approval');
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
    ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
