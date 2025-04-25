import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { PaginatorModule } from 'primeng/paginator';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Router } from '@angular/router';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-complete-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent],
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
  rows = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  first = 0;
  totalRecords = 0;
  Status:any;

  destroy$: Subject<boolean> = new Subject();

  
  constructor(
    private readonly modalService: NgbModal,
    private readonly http: HttpService,
    private router: Router,
    private sharedModalService: OpenModalService,
  ) { }

  ngOnInit(): void {
    const fusionuserString = localStorage.getItem('rightlyHrUser');
    if (fusionuserString) {
      const fusionuser = JSON.parse(fusionuserString);
      this.employeeId = fusionuser.employeeId;
    }
    this.fetchReviewCycles();
  }

  fetchReviewCycles(): void {
    this.dataload = true;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances',
      this.page, this.pageSize,
      this.searchQuery,
      this.employeeId.toString(),
      'Employee','Submitted').pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.reviewCycles = data.items;
          this.totalItems = data.totalCount || 0;
          this.pendingReviews = data.items;
          this.filteredReviews = this.pendingReviews;
          if (this.pendingReviews.length > 0) {
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
          this.dataload=false;
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
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first

    this.fetchReviewCycles();
  }


  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;
    this.fetchReviewCycles();
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

  downloadPromotionletter(iteamid: any) {

     this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PromotionLetter&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({

      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' }); // Ensure correct MIME type
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PerformancePromotion_${iteamid.reviewEmployeeId}_${iteamid.reviewEmployeeIdName}.pdf`; // Set file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.Status = 'Promotion Letter Downloaded Successfully';
        this.sharedModalService.openSuccessModal(this.Status);
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
      },
    });
  }

  downloadletter(iteamid: any) {

     this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PerformanceAppraisal&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' }); 
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PerformanceAppraisal_${iteamid.reviewEmployeeId}_${iteamid.reviewEmployeeIdName}.pdf`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.Status = 'Appraisal Letter Downloaded Successfully';
        this.sharedModalService.openSuccessModal(this.Status);
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
      },
    });
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
