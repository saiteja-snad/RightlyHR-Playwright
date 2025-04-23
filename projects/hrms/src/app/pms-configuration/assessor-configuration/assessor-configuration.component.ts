import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { AddIncrementComponent } from '../increment-percentage/add-increment/add-increment.component';
import { UpdateIncrementComponent } from '../increment-percentage/update-increment/update-increment.component';
import { ViewIncrementComponent } from '../increment-percentage/view-increment/view-increment.component';
import { AuthService } from '../../services/auth.service';
import { UpdateAssessorComponent } from './update-assessor/update-assessor.component';
import { ViewAssessorComponent } from './view-assessor/view-assessor.component';
import { AddAssessorComponent } from './add-assessor/add-assessor.component';

@Component({
  selector: 'app-assessor-configuration',
  imports: [CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,],
  templateUrl: './assessor-configuration.component.html',
  styleUrl: './assessor-configuration.component.scss'
})
export class AssessorConfigurationComponent implements OnInit , OnDestroy {
  totalRecords = 100;
  first: any = 1;
  rows: any = 10;
  empinfo = {} as any;
  subscription!: Subscription;
  searchValue: any;
  deleteId: any;
  ratingscaledetailsarray = [] as any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  onRowsChange() {
    this.first = 1;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  assessorDetailsget: any[] = [];
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    private authService:AuthService
  ) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.tirggerCountSignal().global) {
        this.getAllAssesorConfigurationdata();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllAssesorConfigurationdata();
  }

  openAdd() {
    this.modalService.open(AddAssessorComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
  }
  openDelete(content: any, id: any) {
    this.deleteId = id;
    console.log(this.deleteId);
    this.modalService.open(content, { centered: true });
  }
  editDetails(data: any) {
    const modalRef = this.modalService.open(UpdateAssessorComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.updateData = data;
  }
  viewDetails(data: any) {
    this.modalService.open(ViewAssessorComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
  }
  //function to get the globalpermissions details
  getAllAssesorConfigurationdata(): void {
    this.subscription = this.http
      .getReviewCyclesteam(
        `Assessor/GetAssessors`,
        this.first,
        this.rows,
        this.searchValue
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.assessorDetailsget = response?.items;
          this.totalRecords = response?.totalCount;
        },
        error: (err: any) => {
          console.log('errors', err);
        },
        complete: () => {},
      });
  }
  getNamesAsString(array: any, type: string): string {
    if (!Array.isArray(array)) {
      return '';
    }

    switch (type) {
      case 'locationName':
        return array.map((item: any) => item.locationName).join(', ');
      case 'subLocationName':
        return array.map((item: any) => item.subLocationName).join(', ');
      case 'departmentName':
        return array.map((item: any) => item.departmentName).join(', ');
      case 'subDepartmentName':
        return array.map((item: any) => item.subDepartmentName).join(', ');
      default:
        return '';
    }
  }
  //function to inactivate the incremental persentage
  deleteData() {
    const payload = {
      reviewCycleId: this.deleteId,
    };
    this.http
      .postdata( `Assessor/delete?id=${this.deleteId}`, payload )
      .subscribe({
        next: (response: any) => {
          this.getAllAssesorConfigurationdata();
         this.conformationPopup.openSuccessModal('Deleted Successfully')
        
        },
        error: (err: any) => {
          console.log(err);
           this.conformationPopup.openErrorModal(err.error.message)
        },
        complete: () => { },
      });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
