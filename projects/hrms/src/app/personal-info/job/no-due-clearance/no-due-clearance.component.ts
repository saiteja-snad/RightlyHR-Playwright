import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { INodue } from '../../../myinfo/nodue-details/nodue-details';

@Component({
  selector: 'app-no-due-clearance',
  imports: [NoDataFoundComponent,CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    RouterModule,
    NoDataFoundComponent,],
  templateUrl: './no-due-clearance.component.html',
  styleUrl: './no-due-clearance.component.scss'
})
export class NoDueClearanceComponent {
  subscription!:Subscription
  nodue_Clearance_Details =new BehaviorSubject<INodue[]>([]);
  nodueapprovalcount!: any;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  lineOrder = false;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal
  ) {
    // Initialize any required services or dependencies here
  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getNodueClearance();
    this.getEmployeeId();
  }
  //function to pass the employeeid
  onsubmission(Value:any){
    this.http.tirggerCountSignal.update((status) => ({
      ...status,
      employeeId: Value,
    }));
  }
    //function to get employee by id
    getEmployeeId() {
      let employeeId = parseInt(this.empinfo.employeeId);
      this.subscription = this.http
        .getData(`Employeedata/${employeeId}`)
        .subscribe({
          next: (data: any) => {
            this.empdata = data as Ipersonal;
          },
          error: (err: any) => {
            console.log(err);
            this.conformationPopup.openErrorModal('Insertion of data faild');
          },
        });
    }
  //function to get the nodue data
  getNodueClearance() {
    const employeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
      next: (data: any) => {
        this.nodue_Clearance_Details.next(data);
        const nodueapprovecount = data.filter((ele: any) => ele.status?.toLowerCase() == 'approved')
        this.nodueapprovalcount = nodueapprovecount.length
        if (nodueapprovecount.length > 0) {
          const lineOrders = data.map((item: any) => item.lineOrder);
          const highestLineOrder = Math.max(...lineOrders);
          if (highestLineOrder == this.nodueapprovalcount) {
            this.lineOrder = true
          }
        }
      }
    })
  }
  rerequestFornoDue(Value: any) {
   
    let noduereq = {
      parentId:Value.id
    };
    this.subscription = this.http.postdata(`NoDueClearanceForm/re-request/${Value.id}`, noduereq).subscribe({
      next: (data: any) => {
        console.log(data);
        this.conformationPopup.openSuccessModal('Requested No Due Successfully')
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Re Request Failed')
      },
    })
  }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
