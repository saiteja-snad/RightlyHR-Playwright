import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { AddIncrementComponent } from './add-increment/add-increment.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { UpdateIncrementComponent } from './update-increment/update-increment.component';
import { ViewIncrementComponent } from './view-increment/view-increment.component';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-increment-percentage',
  imports: [
    CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DataLoaderContentComponent
],
  templateUrl: './increment-percentage.component.html',
  styleUrl: './increment-percentage.component.scss',
})
export class IncrementPercentageComponent implements OnInit, OnDestroy {
  dataload=false;
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
  IncementalDetailsget: any[] = [];
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService
  ) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.tirggerCountSignal().global) {
        this.getAllIncrementalPercentagedata();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllIncrementalPercentagedata();
  }

  openAdd() {
    this.modalService.open(AddIncrementComponent, {
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
    const modalRef = this.modalService.open(UpdateIncrementComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.updateData = data;
  }
  viewDetails(data: any) {
    const modalRef = this.modalService.open(ViewIncrementComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.updateData = data;
  }
  //function to get the globalpermissions details
  getAllIncrementalPercentagedata(): void {
    this.dataload=true;
    this.subscription = this.http
      .getReviewCyclesteam(
        `IncrementalPercentage`,
        this.first,
        this.rows,
        this.searchValue
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.IncementalDetailsget = response?.items;
          this.totalRecords = response?.totalCount;
        },
        error: (err: any) => {
          console.log('errors', err);
        },
        complete: () => {
          this.dataload=false;
        },
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
      case 'departments':
        return array.map((item: any) => item.departmentName).join(', ');
      case 'subDepartmentName':
        return array.map((item: any) => item.subDepartmentName).join(', ');
      default:
        return '';
    }
  }
  //function to inactivate the incremental persentage
  deleteData() {
    const payLoad = {};
    this.http
      .postdata(`IncrementalPercentage/delete?id=${this.deleteId}`, payLoad)
      .subscribe({
        next: (response: any) => {
          //console.log(response)
          this.conformationPopup.openSuccessModal(
            'Incremental Percentage Deleted Sucessfully'
          );
          this.getAllIncrementalPercentagedata();
        },
        error: (err: any) => {
          //console.log(err)

          if (err.status === 404) {
            this.conformationPopup.openErrorModal(
              'The requested resource was not found. Please check the URL or contact the administrator for assistance.'
            );
          } else if (err.status === 500) {
            this.conformationPopup.openErrorModal(err.error.details);
          } else {
            this.conformationPopup.openErrorModal(err.error.message);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        complete: () => {
          this.getAllIncrementalPercentagedata();
        },
      });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
