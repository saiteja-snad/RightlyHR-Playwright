import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { PaginatorModule } from 'primeng/paginator';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-pending-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, TranslateModule, TableModule],
  templateUrl: './pending-reviews.component.html',
  styleUrl: './pending-reviews.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PendingReviewsComponent implements OnInit, OnDestroy {
  dataload = false;
  employeeId!: number;
  searchQuery = '';

  reviewCycles: any[] = [];
  pendingReviews: any[] = [];
  completedReviews: any[] = [];
  filteredReviews: any[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  currentSortField = '';
  currentSortOrder = 0;
  currentUIField = '';
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  destroy$: Subject<boolean> = new Subject();
  @ViewChild('pendingReviewsTable') pendingReviewsTable!: Table;

  ngOnInit(): void {
    const fusionuserString = localStorage.getItem('rightlyHrUser');
    if (fusionuserString) {
      const fusionuser = JSON.parse(fusionuserString);
      this.employeeId = fusionuser.employeeId;
    }
    this.fetchReviewCycles();
  }

  constructor(
    private readonly modalService: NgbModal,
    private readonly http: HttpService,
    private router: Router,
    public rbac: RbacService
  ) { }

  fetchReviewCycles(): void {
    this.dataload = true;
    const sortBy = this.currentSortField && this.currentSortOrder !== 0 ? this.currentSortField : undefined;
    const sortOrder = this.currentSortOrder === 1 ? 'asc' : this.currentSortOrder === -1 ? 'desc' : undefined;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances',
      this.page, this.pageSize,
      this.searchQuery,
      this.employeeId.toString(),
      'Employee', 'Pending,Draft',
      sortBy, sortOrder).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.reviewCycles = data.items;
          this.totalRecords = data.totalCount || 0;
          this.pendingReviews = data.items;
          this.filteredReviews = this.pendingReviews;
          if (this.pendingReviews.length > 0) {
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
          this.dataload = false;
          console.error('Error fetching review cycles:', err);
        },
        complete: () => {
          this.dataload = false;
        },
      });
  }

  getDepartments(departments: any[]): string {
    return departments?.map(dept => dept.departmentName).join(', ') || '-';
  }

  getSubDepartments(subdepartments: any[]): string {
    return subdepartments?.map(subDept => subDept.subDepartmentName).join(', ') || '-';
  }

  getLocations(locations: any[]): string {
    return locations?.map(loc => loc.locationName).join(', ') || '-';
  }

  getSubLocations(sublocations: any[]): string {
    return sublocations?.map(subLoc => subLoc.subLocationName).join(', ') || '-';
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;


    this.fetchReviewCycles();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first

    this.fetchReviewCycles();
  }

  onSearch(): void {
    this.page = 1;
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    if (
      this.currentUIField === field &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    if (this.currentUIField === field && this.currentSortOrder === -1) {
      this.currentSortField = '';
      this.currentUIField = '';
      this.currentSortOrder = 0;
      if (this.pendingReviewsTable) {
        this.pendingReviewsTable.sortField = '';
        this.pendingReviewsTable.sortOrder = 0;
      }
      this.page = 1;
      this.first = 0;
      this.fetchReviewCycles();
      return;
    }

    this.currentUIField = field;
    this.currentSortField = field;
    this.currentSortOrder = order;
    this.page = 1;
    this.first = 0;
    this.fetchReviewCycles();
  }

  selfAssessment(reviewCycleItemId: number, currentStage: number, assessorItemId: number, reviewEmployeeId: number, reviewcycleitemformresponseid: number, formresponseid: number) {
    const queryParams = {
      reviewCycleItemId: reviewCycleItemId,
      currentStage: currentStage,
      assessorItemId: assessorItemId,
      reviewCycles: JSON.stringify(this.reviewCycles), // Ensure this.reviewCycles is defined
      reviewEmployeeId: reviewEmployeeId,
      reviewcycleitemformresponseid: reviewcycleitemformresponseid,
      formresponseid: formresponseid
    };

    // Store queryParams in localStorage
    localStorage.setItem('queryParams', JSON.stringify(queryParams));

    // Navigate to the assessment route
    this.router.navigate(['/pms/assessment-form']);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
