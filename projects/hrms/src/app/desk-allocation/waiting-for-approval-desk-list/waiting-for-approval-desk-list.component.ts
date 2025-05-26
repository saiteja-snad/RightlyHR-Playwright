import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-waiting-for-approval-desk-list',
  imports: [NoDataFoundComponent, CommonModule, FormsModule, PaginatorModule, DropdownModule, DataLoaderContentComponent],
  templateUrl: './waiting-for-approval-desk-list.component.html',
  styleUrl: './waiting-for-approval-desk-list.component.scss'
})
export class WaitingForApprovalDeskListComponent {
  subscription!: Subscription;
  empinfo = {} as any
  desklist = new BehaviorSubject<any[]>([])
  searchTerm: string = '';
  Status = 'Waiting for Approval'
    employeid: any
  deskid: any
  selectedAsset!: any
  deskiteamid: any;
  first: any = 0;
  rows: any = 10;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false
  selectedSubLocationId: any
  selectedLocationId: any

  constructor(
    private readonly http: HttpService,
    private readonly router: Router,
    public conformationPopup: OpenModalService,
    public rbac: RbacService
   ) {
  
  }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    console.log(this.empinfo);
    this.getFilteredData()

  }

  getFilteredData() {
    this.subscription = this.http.desklocationId$.subscribe({
      next: (Value: any) => {
        console.log(Value);
        this.selectedLocationId = JSON.parse(localStorage.getItem('locationId') ?? 'null');
        this.selectedSubLocationId = JSON.parse(localStorage.getItem('sublocationId') ?? 'null');

        this.getAllDesks(this.first, this.rows, Value, this.selectedSubLocationId, this.Status);
        this.getcount(Value, this.selectedSubLocationId, this.Status);   
      }
    })
  }


  getAllDesks(pagenum: number, pagesize: number, locationid: any, sublocationid: any, Deskstatus: any) {

    const params = {
      first: pagenum,
      rows: pagesize,
      locationid: locationid,
      sublocationid: sublocationid,
      status: Deskstatus,
      searchQuery: this.searchTerm

    };
    this.loading = true
    this.subscription = this.http.getstatusdesk("DeskAllocationHeader", params.locationid, params.sublocationid, params.status, params.first, params.rows, params.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loading = false
          this.desklist.next(data.items)
          this.getcount(this.selectedLocationId, this.selectedSubLocationId, this.Status)
          // Update the collection size (total records) for pagination
          this.totalRecords = data.totalRecords;

        },
        error: (error: any) => {
          console.error('Error fetching desk data', error);
          this.loading = false
        },
        complete: () => {

          this.loading = false;

        }

      });
  }
  onRowsChange() {
    this.first = 1;
    this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
    this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);

  }
  onSearchChange(event: any) {

    if (event !== '' && event.length >= 1) {

      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }

    if (event === '') {
      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
  }


  navigateToAsset(deskid: any) {
    this.router.navigate(['/desk/view-desk'], { queryParams: { id: deskid } });
  }
  viewdata(data: any) {
    console.log(data); // Log the incoming data for debugging
    this.deskid = data.deskId
    this.http
      .getData(`DeskAllocationHeader/ById?id=${this.deskid}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response.items);

          const lastItem = response.items[response.items.length - 1];
          if (lastItem) {
            this.employeid = lastItem.deskAllocatedTo
            this.deskiteamid = lastItem.deskAllocationItemId;

          } else {
            console.error("No items found in response.");
          }

        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }


  getcount(locationId: string | null, subLocationId: string | null, status: string) {
    const params = new URLSearchParams();
    if (locationId) params.append('locationid', locationId);
    if (subLocationId) params.append('sublocationid', subLocationId);
    params.append('status', status);

    this.http.getData(`DeskAllocationHeader/v1/statuscount?${params.toString()}`).subscribe({
      next: (data: any) => {
        console.log(data);
        const totalCount = data.totalCount || 0;


        const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];
        const availableData = statusCounts.find((item: any) => item.status === "Available");
        const allocateData = statusCounts.find((item: any) => item.status === "Allocated");
        const inactivedata = statusCounts.find((item: any) => item.status === "Inactive");
        const undermaintence = statusCounts.find((item: any) => item.status === "Under Maintenance");
        const waitingForApprovalData = statusCounts.find((item: any) => item.status === "Waiting for Approval");

        const availableCount = availableData?.count || 0;
        const allocateCount = allocateData?.count || 0;
        const inactiveCount = inactivedata?.count || 0;
        const undermaintenceCount = undermaintence?.count || 0;
        const waitingForApprovalCount = waitingForApprovalData?.count || 0;

        this.http.setTotalDeskCount(totalCount);
        this.http.setAvailableDeskCount(availableCount);
        this.http.setAllocatedDeskCount(allocateCount);
        this.http.setundermatinaceDeskCount(undermaintenceCount);
        this.http.setinactiveSubjectDeskCount(inactiveCount);
        this.http.setWFASubjectDeskCount(waitingForApprovalCount);

      },
      error: (error) => {
        console.error('Error fetching count:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }


}
