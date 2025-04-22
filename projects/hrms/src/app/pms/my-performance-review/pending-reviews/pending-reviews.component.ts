import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule],
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
    private router: Router
  ) { }
  
  fetchReviewCycles(): void {
    this.dataload=true;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances', 
      this.page, this.pageSize, 
      this.searchQuery, 
      this.employeeId.toString(), 
      'Employee', 'Pending,Draft' ).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          console.log(data)
          this.reviewCycles = data.items;
          this.totalItems = data.totalCount || 0;
          
          this.pendingReviews =  data.items;
          console.log(this.pendingReviews)
          this.filteredReviews = this.pendingReviews;
          if(this.pendingReviews.length>0){
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
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

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchReviewCycles();
  }

  onPageSizeChange(newPageSize: number) {
    console.log('Page size changed to:', newPageSize);
    console.log(this.page)
    this.page=1;
    this.fetchReviewCycles();
  }

  onSearch(): void {
    this.page = 1; 
  }

  selfAssessment(reviewCycleItemId: number, currentStage: number, assessorItemId:number,reviewEmployeeId:number,reviewcycleitemformresponseid:number,formresponseid:number) {
    console.log(currentStage)
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
