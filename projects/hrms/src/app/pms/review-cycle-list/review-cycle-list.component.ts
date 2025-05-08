import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { ViewComponent } from './view/view.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-review-cycle-list',
  imports: [
    CommonModule,
    FormsModule,
    NgbPopoverModule,
    PaginatorModule,
    TranslateModule,
    DataLoaderContentComponent,
    NoDataFoundComponent
],
  templateUrl: './review-cycle-list.component.html',
  styleUrl: './review-cycle-list.component.scss',
})

export class ReviewCycleListComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  filteredDetails: any[] = [];
  jobLocationDropDownData: any;
  subLocationsDropdown: any;
  seletedid: any;
  searchText = '';
  reviewCyclesList: any[] = [];
  dataload = false;

  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  searchQuery = '';
  first = 0;
  totalRecords = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  @ViewChild('cancelationConfirmation') cancelationConfirmation: any;
  @ViewChild('confirmation') confirmation: any;

  constructor(private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService, public rbac: RbacService) {
    effect(() => {
      if (this.http.reviewCycleTriggerSignal()) {
        this.getAllReviewCyclesList(this.page, this.pageSize);
        this.http.reviewCycleTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.getAllReviewCyclesList(this.page, this.pageSize);
  }

  openAdd() {
    this.modalService.open(CreateComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  onRowsChange() {
    this.first = 0;
  }

  onSearchTextChange(): void {
    this.getAllReviewCyclesList(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getAllReviewCyclesList(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;
    this.getAllReviewCyclesList(this.page, this.pageSize);
  }

  onUpdate(cycle: any) {
    const modalRef = this.modalService.open(UpdateComponent, { centered: true, backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.updateData = cycle;
  }

  onClickView(cycle: any) {
    const modalRef = this.modalService.open(ViewComponent, { centered: true, backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.updateData = cycle;
  }

  onClickYes() {
    this.modalService.dismissAll();
  }

  getNamesAsString(array: any, type: string) {
    switch (type) {
      case 'locations':
        return array.map((item: any) => item.locationName).join(', ');
      case 'subLocations':
        return array.map((item: any) => item.subLocationName).join(', ');
      case 'departments':
        return array.map((item: any) => item.departmentName).join(', ');
      case 'subDepartmentNames':
        return array.map((item: any) => item.subDepartmentName).join(', ');
      default:
        return '';
    }
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  getAllLocations() {
    this.subscription = this.http.getData('JobLocation/getAllLocations').subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.map((location: any) => {
          return {
            ...location,
            fullName: `${location.jobLocationName}`,
            selectedAllGroup: 'Group 3',
          };
        });
      },
    });
  }

  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations.map((subLocation: any) => {
            return {
              ...subLocation,
              fullName: `${subLocation.subLocationName}`,
              selectedAllGroup: 'Group 4',
            };
          }
        );
      },
    });
  }

  getAllReviewCyclesList(pagenum: number, pagesize: number): void {
    const params: { page: number; pageSize: number; searchQuery?: string } = {
      page: pagenum,
      pageSize: pagesize,
    };
    
    if (this.searchText) {
      params.searchQuery = this.searchText;
    }
    
    this.dataload = true;
    this.subscription = this.http.getpagentiontData('reviewCycleHeader', params).subscribe({
      next: (data: any) => {
        this.collectionSize = data.totalCount;
        this.reviewCyclesList = data.items || [];
        this.filteredDetails = this.reviewCyclesList;
        if (this.searchText) {
          this.filterDetails();
        }
        this.dataload = false;
      },
      error: (err: any) => {
        console.log('errors', err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  filterDetails(): void {
    if (!this.searchText) {
      this.filteredDetails = this.reviewCyclesList.slice(
        (this.page - 1) * this.pageSize,
        this.page * this.pageSize
      );
      this.collectionSize = this.reviewCyclesList.length;
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      const filtered = this.reviewCyclesList.filter((item) => {
        return this.objectContainsText(item, searchTextLower);
      });
      this.collectionSize = filtered.length;
      this.filteredDetails = filtered.slice(
        (this.page - 1) * this.pageSize,
        this.page * this.pageSize
      );
    }
    this.page = 1; // Reset to the first page
  }

  objectContainsText(obj: any, text: string): boolean {
    if (typeof obj === 'string') {
      return obj.toLowerCase().includes(text);
    }
    if (typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(text);
    }
    if (Array.isArray(obj)) {
      return obj.some((item) => this.objectContainsText(item, text));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some((val) =>
        this.objectContainsText(val, text)
      );
    }
    return false;
  }

  HoldReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: 'Review on Hold',
      createdBy: fusionUser.employeeId,
    };
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        this.onCreateCycleFormSubmitted();
        this.conformationPopup.openSuccessModal('Review Cycle is Kept on Hold');
      },
      error: (error) => {
        this.conformationPopup.openErrorModal(error.error.message);
        console.error('Error:', error);
      },
    });
  }

  ResumeReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: 'Resume',
      createdBy: fusionUser.employeeId,
    };
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        this.onCreateCycleFormSubmitted();
        this.conformationPopup.openSuccessModal('Review Cycle is Resumed Successfully');
      },
      error: (error) => {
        this.conformationPopup.openErrorModal(error.error.reason);
        console.error('Error:', error);
      },
    });
  }

  onCreateCycleFormSubmitted() {
    this.page = 1;
    this.pageSize = 10;
    this.getAllReviewCyclesList(this.page, this.pageSize);
  }

  closeModal() {
    this.openCancelationPopUp();
  }

  openCancelationPopUp() {
    this.modalService.open(this.cancelationConfirmation, { centered: true });
  }

  initiateReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: 'Initiated',
      createdBy: fusionUser.employeeId,
    };
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        // this.closeModal();
        this.onCreateCycleFormSubmitted();
        this.conformationPopup.openSuccessModal('Review Cycle Initiated Successfully');
      },
      error: (error) => {
        this.conformationPopup.openErrorModal(error.error.reason);
        console.error('Error:', error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}