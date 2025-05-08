import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from 'primeng/paginator';
import { Router } from '@angular/router';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-team-complete-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, PaginatorModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './team-complete-reviews.component.html',
  styleUrl: './team-complete-reviews.component.scss'
})
export class TeamCompleteReviewsComponent implements OnInit, OnDestroy{
  Status: any;

  employeeId!: any;
  reviewCycles: any[] = [];
  searchQuery = '';
  searchTerm = '';
  activeTab = 'completed';
  subscription!: Subscription;
  dataload = false
  completedReviews: any[] = [];
  pendingReviews: any[] = [];
  filteredReviews: any[] = [];
  filteredCompletedReviews: any[] = [];

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
  
  constructor(
    private router: Router,
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService,
  ) { }

  ngOnInit(): void {
    const fusionuser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = fusionuser.employeeId;
    this.fetchReviewCycles();
  }

  fetchReviewCycles() {
    this.dataload = true
    this.http.getReviewCyclesteam('reviewCycleHeader/getallperformances', this.page, this.pageSize, this.searchQuery, this.employeeId, 'Team Manager,Reporting Manager,HR', 'Submitted,Re-Submitted')
      .subscribe({
        next: (data: any) => {
          this.reviewCycles = data.items;
          this.totalItems = data.totalCount || 0;
          this.completedReviews = data.items;
          this.filteredReviews = this.completedReviews;
          if (this.completedReviews.length > 0) {
            this.collectionSize = data.totalCount;
          }
        },
        error: (err) => {
          this.dataload = false;
        },
        complete: () => {
          this.dataload = false
        }
      });
  }

  isPendingReview(status: string): boolean {
    const pendingStatuses = [
      'Employee Review Pending',
      'Employee Assessment Pending',
      'HR Review Pending',
      'Reporting Manager Review Pending',
      'Team Manager Review Pending',
      'Draft'
    ];
    return pendingStatuses.includes(status);
  }

  filterReviews(): void {
    const searchTextLower = this.searchTerm.toLowerCase();
    if (this.activeTab === 'pending') {
      if (this.searchTerm) {
        this.filteredReviews = this.pendingReviews.filter(item => this.objectContainsText(item, searchTextLower));
      } else {
        this.filteredReviews = this.pendingReviews;
      }
      this.collectionSize = this.filteredReviews.length;
    } else if (this.activeTab === 'completed') {
      if (this.searchTerm) {
        this.filteredCompletedReviews = this.completedReviews.filter(item => this.objectContainsText(item, searchTextLower));
      } else {
        this.filteredCompletedReviews = this.completedReviews;
      }
      this.collectionSize = this.filteredCompletedReviews.length;
    }
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

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.filterReviews();
  }

  selfAssessment(reviewCycleItemId: number, currentStage: number, assessorType: string, assessorItemId: number, reviewEmployeeId: number, reviewcycleitemformresponseid: number, formresponseid: number) {
    const queryParams = {
      reviewCycleItemId: reviewCycleItemId,
      currentStage: currentStage,
      assessorType: assessorType,
      assessorItemId: assessorItemId,
      reviewCycles: JSON.stringify(this.reviewCycles), // Ensure this.reviewCycles is defined
      reviewEmployeeId: reviewEmployeeId,
      reviewcycleitemformresponseid: reviewcycleitemformresponseid,
      formresponseid: formresponseid
    };

    localStorage.setItem('queryParams', JSON.stringify(queryParams));

    // Navigate to the assessment route
    this.router.navigate(['/pms/assessment-form']);
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

  downloadPromotionletter(iteamid: any) {
    this.subscription = this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PromotionLetter&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({
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
        this.modal.openSuccessModal(this.Status);
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
        this.modal.openErrorModal(this.Status);
      },
    });
  }

  downloadletter(iteamid: any) {
    this.subscription = this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PerformanceAppraisal&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({

      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' }); // Ensure correct MIME type
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PerformanceAppraisal_${iteamid.reviewEmployeeId}_${iteamid.reviewEmployeeIdName}.pdf`; // Set file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.Status = 'Appraisal Letter Downloaded Successfully';
        this.modal.openSuccessModal(this.Status)
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
        this.modal.openErrorModal(this.Status);
      },
    });
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
