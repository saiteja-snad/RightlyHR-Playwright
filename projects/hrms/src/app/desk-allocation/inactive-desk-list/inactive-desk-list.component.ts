import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-inactive-desk-list',
  imports: [CommonModule, FormsModule, NoDataFoundComponent, PaginatorModule, DropdownModule],
  templateUrl: './inactive-desk-list.component.html',
  styleUrl: './inactive-desk-list.component.scss'
})
export class InactiveDeskListComponent {
  subscription!: Subscription;
  empinfo = {} as any
  desklist = new BehaviorSubject<any[]>([])
  searchTerm: string = '';
  Status = 'Inactive'
  employeid: any
  deskid: any
  selectedAsset!: any
  deskiteamid: any;
  first:any = 1;
  rows:any = 10;
  totalRecords = 100;
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
    private readonly modalService: NgbModal,
    private readonly router: Router,

    public conformationPopup: OpenModalService,

    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("fusionuser") ?? '{}');
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

  onSearchChange(event: any) {

    if (event !== '' && event.length >= 1) {

      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }

    if (event === '') {
      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
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

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  activeassets(selectedAsset: any) {
    console.log(selectedAsset)
    const payload: any = {
      //deskName: this.selectedAsset.deskName,
      deskStatus: "Available",
      createdBy: this.empinfo.employeeId,
      updatedOn: new Date().toISOString(),
      comments: selectedAsset.comments,
      locationId: this.selectedAsset.location.id,
      subLocationId: this.selectedAsset.subLocation.id
    }
    console.log('Assignment Payload:', payload);

    // Send the HTTP POST request
    this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        console.log(res);
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Desk marked as Active Successfully')
        // this.getAllDesks(this.first, this.rows);
        this.getAllDesks(this.first, this.rows, null, null, this.Status)
        this.getcount(null, null, this.Status);
      },
      error: (error) => {
        console.log('Error:', error);
        this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.')
      }
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
