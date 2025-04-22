import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-complete-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, NoDataFoundComponent],
  templateUrl: './complete-reviews.component.html',
  styleUrl: './complete-reviews.component.scss'
})
export class CompleteReviewsComponent implements OnInit, OnDestroy {
  dataload = false;
  employeeId!: number;
  searchQuery = '';

  reviewCycles: any[] = [];
  pendingReviews: any[] = [];
  completedReviews: any[] = [];
  filteredReviews: any[] = [];

  page = 1;
  pageSize = 10;
  collectionSize = 100;
  totalItems = 0;

  destroy$: Subject<boolean> = new Subject();

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
    private readonly http: HttpService
  ) { }

  fetchReviewCycles(): void {
    this.dataload = true;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances',
      this.page, this.pageSize,
      this.searchQuery,
      this.employeeId.toString(),
      'Employee','Submitted').pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          console.log(data)
          this.reviewCycles = data.items;
          this.totalItems = data.totalCount || 0;

          this.pendingReviews = data.items;
          console.log(this.pendingReviews)
          this.filteredReviews = this.pendingReviews;
          if (this.pendingReviews.length > 0) {
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
          this.dataload=false;
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

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchReviewCycles();
  }
  onPageSizeChange(newPageSize: number) {
    console.log('Page size changed to:', newPageSize);
    console.log(this.page)
    this.page = 1;
    this.fetchReviewCycles();
  }

  onSearch(): void {
    this.page = 1;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
