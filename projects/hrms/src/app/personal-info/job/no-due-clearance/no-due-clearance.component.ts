import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, BehaviorSubject } from 'rxjs';

import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { Ipersonal } from '../../../Interfaces/personal-modal';

import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';

@Component({
  selector: 'app-no-due-clearance',
  imports: [NoDataFoundComponent, CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    RouterModule,
    NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './no-due-clearance.component.html',
  styleUrl: './no-due-clearance.component.scss'
})
export class NoDueClearanceComponent {
  subscription!: Subscription
  nodue_Clearance_Details = new BehaviorSubject<any[]>([]);
  nodueapprovalcount!: any;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  lineOrder = false;
  loading = false
  constructor(


    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService,
  ) {
    // Initialize any required services or dependencies here
  }
  ngOnInit(): void {
    this.getEmpInfoFromRoute();

  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getNodueClearance();
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getNodueClearance();
      this.getEmployeeId();
    }
  }
  //function to pass the employeeid
  onsubmission(Value: any) {
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
  allApproved = false;
  nodueapprovedcount = 0;
  getNodueClearance() {
    this.loading = true
    const employeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
      next: (data: any) => {
        this.loading = false
        this.nodue_Clearance_Details.next(data);
        const totalCount = data.filter((ele: any) => (ele.subStatus?.toLowerCase() !== 'rerequested')).length;
        const approvedCount = data.filter((ele: any) => (ele.status?.toLowerCase() === 'approved')).length;
        this.nodueapprovedcount = approvedCount;
        this.allApproved = totalCount > 0 && approvedCount === totalCount;
        this.nodueapprovalcount = data.length
        if (data.length > 0) {
          const lineOrders = data.map((item: any) => item.lineOrder);
          const highestLineOrder = Math.max(...lineOrders);
          if (highestLineOrder == this.nodueapprovalcount) {
            this.lineOrder = true
            console.log(this.lineOrder);

          }
        }
      }, error: (err) => {
        this.loading = false
      }
    })
  }
  rerequestFornoDue(Value: any) {

    let noduereq = {
      parentId: Value.id
    };
    this.subscription = this.http.postdata(`NoDueClearanceForm/re-request/${Value.id}`, noduereq).subscribe({
      next: (data: any) => {
        console.log(data);
        this.conformationPopup.openSuccessModal('No Due requested successfully');
        this.getNodueClearance();
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
