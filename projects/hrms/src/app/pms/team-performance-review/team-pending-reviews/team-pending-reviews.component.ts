import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { Router } from '@angular/router';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';

@Component({
  selector: 'app-team-pending-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './team-pending-reviews.component.html',
  styleUrl: './team-pending-reviews.component.scss'
})
export class TeamPendingReviewsComponent implements OnInit, OnDestroy {
  Status: any;
  @ViewChild('createReviewCycle') createReviewCycle: any;
  @ViewChild('confirmation') confirmation: any;
  @ViewChild('success') success: any;
  @ViewChild('error') error: any;
  employeeId!: any;
  reviewCycles: any[] = [];
  searchQuery = '';
  searchTerm = '';
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  totalItems = 0;
  activeTab = 'pending';
  subscription!: Subscription;
  dataload = false
  completedReviews: any[] = [];
  pendingReviews: any[] = [];
  filteredReviews: any[] = [];
  filteredCompletedReviews: any[] = []
  constructor(
    private readonly modalService: NgbModal,
    private router: Router,
    private http: HttpService) { }

  ngOnInit(): void {
    const fusionuser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = fusionuser.employeeId;
    this.fetchReviewCycles();
  }

  fetchReviewCycles() {
    this.dataload = true
    this.http.getReviewCyclesteam('reviewCycleHeader/getallperformances', this.page, this.pageSize, this.searchQuery, this.employeeId, 'Team Manager,Reporting Manager,HR', 'Pending,Draft')
      .subscribe({
        next: (data: any) => {
          this.reviewCycles = data.items;
          this.pendingReviews = data.items;
          this.filteredReviews = this.pendingReviews;
          if (this.pendingReviews.length > 0) {
            this.collectionSize = data.totalCount;
          }
          if (this.searchTerm) {
            this.filterReviews();
          }
        },
        error: (err) => {
          this.dataload = false
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
    const searchTextLower = this.searchQuery.toLowerCase();
    if (this.activeTab === 'pending') {
      if (this.searchQuery) {
        this.filteredReviews = this.pendingReviews.filter(item => this.objectContainsText(item, searchTextLower));
      } else {
        this.filteredReviews = this.pendingReviews;
      }
      this.collectionSize = this.filteredReviews.length;
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
    console.log(currentStage)
    const queryParams = {
      reviewCycleItemId: reviewCycleItemId,
      currentStage: currentStage,
      assessorType: assessorType,
      assessorItemId: assessorItemId,
      reviewCycles: JSON.stringify(this.reviewCycles), 
      reviewEmployeeId: reviewEmployeeId,
      reviewcycleitemformresponseid: reviewcycleitemformresponseid,
      formresponseid: formresponseid
    };

    localStorage.setItem('queryParams', JSON.stringify(queryParams));

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

  openCreate() {
    this.modalService.open(this.createReviewCycle, {
      size: 'lg',
      centered: true,
    });
  }

  downloadPromotionletter(iteamid: any) {

    this.subscription = this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PromotionLetter&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({

      next: (data: Blob) => {
        console.log('Received byte data:', data);
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
        this.modalService.open(this.success, { centered: true });
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
      },
    });
  }

  downloadletter(iteamid: any) {

    this.subscription = this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PerformanceAppraisal&reviewcycleitemid=${iteamid.reviewCycleItemId}`, { responseType: 'blob' as 'json' }).subscribe({

      next: (data: Blob) => {
        console.log('Received byte data:', data);
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
        this.modalService.open(this.success, { centered: true });
      },
      error: (err) => {
        this.Status = 'Failed to download letter';
      },
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
