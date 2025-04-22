import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { ViewComponent } from './view/view.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-review-cycle-list',
  imports: [CommonModule, FormsModule, NgbPopoverModule, PaginatorModule, TranslateModule],
  templateUrl: './review-cycle-list.component.html',
  styleUrl: './review-cycle-list.component.scss'
})
export class ReviewCycleListComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  filteredDetails: any[] = [];
  jobLocationDropDownData: any
  subLocationsDropdown: any
  seletedid: any
  totalRecords = 100
  first: any = 1;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  searchText = '';
  reviewCyclesList: any[] = []
  dataload = false;
  @ViewChild('cancelationConfirmation') cancelationConfirmation: any;
  @ViewChild('confirmation') confirmation: any;

  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }

  constructor(private router: Router, private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,) {

  }

  ngOnInit(): void {
    this.getAllReviewCyclesList(this.page, this.pageSize);

  }

  openAdd() {
    this.modalService.open(CreateComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  onUpdate(cycle: any) {
    const modalRef = this.modalService.open(UpdateComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.updateData = cycle;
  }

  onClickView(cycle: any) { 
   const modalRef = this.modalService.open(ViewComponent, {
          centered: true,
          backdrop: 'static',
          size: 'lg',
        });
        modalRef.componentInstance.updateData = cycle;
  }

  onClickYes() {
    this.modalService.dismissAll()
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
    console.log(content)
    this.modalService.open(content, { centered: true })
  }

  getAllLocations() {
    this.subscription = this.http.getData("JobLocation/getAllLocations").subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.map((location: any) => {
          return {
            ...location,
            fullName: `${location.jobLocationName}`,
            selectedAllGroup: 'Group 3',
          };
        });
      }
    })
  }

  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations.map((subLocation: any) => {
          return {
            ...subLocation,
            fullName: `${subLocation.subLocationName}`,
            selectedAllGroup: 'Group 4',
          };
        });
      }
    })
  }

  getAllReviewCyclesList(pagenum: number, pagesize: number, fetchAll: boolean = false): void {
    const pageSize = fetchAll ? 10000 : this.pageSize; // Fetch all records if fetchAll is true
    const params = {
      page: pagenum,
      pageSize: pageSize,
      // searchQuery: this.searchText
    };
    this.dataload = true;

    this.subscription = this.http.getpagentiontData("reviewCycleHeader", params).subscribe({
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
        console.log("errors", err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  filterDetails(): void {
    if (!this.searchText) {
      this.filteredDetails = this.reviewCyclesList.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
      this.collectionSize = this.reviewCyclesList.length;
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      const filtered = this.reviewCyclesList.filter(item => {
        return this.objectContainsText(item, searchTextLower);
      });
      this.collectionSize = filtered.length;
      this.filteredDetails = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
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
      return obj.some(item => this.objectContainsText(item, text));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(val => this.objectContainsText(val, text));
    }
    return false;
  }

  HoldReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: "Review on Hold",
      createdBy: fusionUser.employeeId,
    }
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.closeModal()
        this.onCreateCycleFormSubmitted()
        this.conformationPopup.openSuccessModal('Review Cycle is Kept on Hold')
        // this.modalService.open(this.success, { centered: true });
      },
      error: (error) => {
        this.conformationPopup.openErrorModal(error.error.message)
        // this.modalService.open(this.success, { centered: true });
        console.error('Error:', error);
      }
    });
  }

  ResumeReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: "Resume",
      createdBy: fusionUser.employeeId,
    }
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.closeModal()
        this.onCreateCycleFormSubmitted()
        // this.Status = 'Review Cycle is Resumed Successfully'
        this.conformationPopup.openSuccessModal('Review Cycle is Resumed Successfully')
        // this.modalService.open(this.success, { centered: true });
      },
      error: (error) => {
        // this.Status = error.error.reason
        this.conformationPopup.openErrorModal(error.error.reason)
        // this.modalService.open(this.success, { centered: true });
        console.error('Error:', error);
      }
    });
  }

  onCreateCycleFormSubmitted() {
    this.page = 1
    this.pageSize = 10
    this.getAllReviewCyclesList(this.page, this.pageSize)
  }

  closeModal() {
    this.openCancelationPopUp()
  }

  openCancelationPopUp() {
    this.modalService.open(this.cancelationConfirmation, { centered: true });
  }

  initiateReviewCycle(cycle: any) {
    const fusionUser = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    const data = {
      status: "Initiated",
      createdBy: fusionUser.employeeId,
    }
    this.http.putData(`reviewCycleHeader/updatestatus/${cycle.id}`, data).subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.closeModal()
        this.onCreateCycleFormSubmitted()
        this.conformationPopup.openSuccessModal('Review Cycle Initiated Successfully')
        // this.Status = 'Review Cycle Initiated Successfully'
        // this.modalService.open(this.success, { centered: true });
      },
      error: (error) => {
        this.conformationPopup.openErrorModal(error.error.reason)
        // this.Status = error.error.reason
        // this.modalService.open(this.success, { centered: true });
        console.error('Error:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
