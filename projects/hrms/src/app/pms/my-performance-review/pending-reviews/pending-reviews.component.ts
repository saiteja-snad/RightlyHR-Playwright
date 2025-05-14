import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { PaginatorModule } from 'primeng/paginator';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-pending-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, TranslateModule],
  templateUrl: './pending-reviews.component.html',
  styleUrl: './pending-reviews.component.scss'
})
export class PendingReviewsComponent implements OnInit, OnDestroy{
  dataload=false;
  employeeId!:number;
  searchQuery = '';

  reviewCycles: any[] = [];
  pendingReviews: any[] = []; 
  completedReviews: any[] = [];
  filteredReviews: any[] = [];

  page = 1;
  pageSize = 10;
  collectionSize=100;
  totalItems = 0;
  rows = 10;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  first = 0;
  totalRecords = 0;

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
    private readonly http: HttpService,
    private router: Router,
    public rbac : RbacService
  ) { }
  
  fetchReviewCycles(): void {
    this.dataload=true;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances', 
      this.page, this.pageSize, 
      this.searchQuery, 
      this.employeeId.toString(), 
      'Employee', 'Pending,Draft' ).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.reviewCycles = data.items;
          this.totalItems = data.totalCount || 0;
          this.pendingReviews =  data.items;
          this.filteredReviews = this.pendingReviews;
          if(this.pendingReviews.length>0){
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
          this.dataload=false;
          console.error('Error fetching review cycles:', err);
        },
        complete: () => {
          this.dataload=false;
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

  selfAssessment(reviewCycleItemId: number, currentStage: number, assessorItemId:number,reviewEmployeeId:number,reviewcycleitemformresponseid:number,formresponseid:number) {
    const queryParams = {
      reviewCycleItemId: reviewCycleItemId,
      currentStage: currentStage,
      assessorItemId: assessorItemId,
      reviewCycles: JSON.stringify(this.reviewCycles), // Ensure this.reviewCycles is defined
      reviewEmployeeId:reviewEmployeeId,
      reviewcycleitemformresponseid:reviewcycleitemformresponseid,
      formresponseid:formresponseid
    };
  
    // Store queryParams in localStorage
    localStorage.setItem('queryParams', JSON.stringify(queryParams));
  
    // Navigate to the assessment route
    this.router.navigate(['/pms/assessment-form']);
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
   this.destroy$.next(true);
   this.destroy$.unsubscribe();
  }

}
