import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-team-complete-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule,PaginatorModule,TranslateModule, NoDataFoundComponent],
  templateUrl: './team-complete-reviews.component.html',
  styleUrl: './team-complete-reviews.component.scss'
})
export class TeamCompleteReviewsComponent {
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
  totalRecords = 100
  first: any = 1;
  rows: any = 10;
  destroy$: Subject<boolean> = new Subject();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

   onRowsChange() {
      this.first = 0;
    }


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
    this.dataload=true;
    this.http.getReviewCycles('reviewCycleHeader/getallperformances', 
      this.page, this.pageSize, 
      // this.searchQuery, 
      this.employeeId.toString(), 
      'Team Manager,Reporting Manager,HR', 'Submitted,Re-Submitted' ).pipe(takeUntil(this.destroy$)).subscribe({
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

  closeModal(){
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
   this.destroy$.next(true);
   this.destroy$.unsubscribe();
  }

}
