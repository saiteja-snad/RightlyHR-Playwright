import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-allocated-desk-list',
  imports: [CommonModule, Select, ReactiveFormsModule, FormsModule, PaginatorModule,FormsModule, NoDataFoundComponent,TranslateModule, DataLoaderContentComponent],
  templateUrl: './allocated-desk-list.component.html',
  styleUrl: './allocated-desk-list.component.scss'
})
export class AllocatedDeskListComponent {
  subscription!: Subscription;
  datesShouldNotBeEqual = false
  empinfo = {} as any
  approvalname: any[] = []
  desklist = new BehaviorSubject<any[]>([])
  shift: any
  employeeiddetails = [] as any[];
  deskdataid = new BehaviorSubject<any[]>([])
  deskinactive: string[] = [];
  deskundermaintence: any[] = []
  deskrealse: any[] = []
  selectedmanerEmployee: any
  employeid: any
  searchTerm: string = '';

  realseForm!: FormGroup;
  reassiginForm!: FormGroup;
  selectedLocationId: any;
  selectedSubLocationId: any;
  allocateDeskForm!: FormGroup;
  locations: any[] = [];
  subLocations: any[] = [];
  Status = 'Allocated'

  assignemployename: any
  deskid: any
  selectedAsset!: any
  deskiteamid: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  desktype = new BehaviorSubject<any[]>([])
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false
  searchQuery = ''
  loactionid: any
  sublocation: any
  selectedEmployeeId: any;
  employeeiddetailsdata = [] as any[];
  approvalid: any
  assignEmployeeId: any;
  shiftDropdown: any[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private readonly router: Router,
    public conformationPopup: OpenModalService,
    public rbac: RbacService,

  public formValidation: FormValidationService,
    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    console.log(this.empinfo);
  
    this.getAllLocations();
    this.getapproval()
    this.intialreassigindesk();
    
    this.getdatabyentriy()
    this.intialrealsedata()

    this.getdatabyentriyrealse();
    // this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, null,null);
    this.getFilteredData();

    this.reassiginForm.get('shifts')?.valueChanges
      .subscribe((seletshift) => {
        this.shift = seletshift
        this.selectedEmployee = null
        this.reassiginForm.get('employeeName')?.reset()
        console.log('Selected Category:', seletshift);
        this.getEmployeedata()

      });
  }

  getFilteredData() {
    this.subscription=this.http.desklocationId$.subscribe({
      next:(Value:any)=>{
        console.log(Value);
        this.selectedLocationId = JSON.parse(localStorage.getItem('locationId') ?? 'null');
        this.selectedSubLocationId= JSON.parse(localStorage.getItem('sublocationId') ?? 'null');
        this.getAllDesks(this.page, this.pageSize, Value, this.selectedSubLocationId, this.Status);
        this.getcount(Value, this.selectedSubLocationId,this.Status);
      }
    })
  }




  intialreassigindesk() {
    this.reassiginForm = this.fb.group({
      employeeName: [null, Validators.required],
      deskid: [{ value: null, disabled: true }],
      shifts: [Validators.required],
      approvid: [null, Validators.required]
    })
  }



  intialrealsedata() {
    this.realseForm = this.fb.group(
      {
        deskrealse: [null, Validators.required],
        reason: [null, [Validators.maxLength(250)]]

      }
    )
  }


  updateSubLocations(selectedLocationId: number) {
    // Find the selected location and set the sub-locations
    const selectedLocation = this.locations.find(location => location.id == selectedLocationId);
    // If a location is selected, set its sub-locations, otherwise, reset the sub-locations
    this.subLocations = selectedLocation ? selectedLocation.jobSubLocations : [];
    console.log(selectedLocation);
    console.log('Job Sub Locations:', selectedLocation?.jobSubLocations);

  }


  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  conformationpoppup() {
    this.modalService.dismissAll()

    this.realseForm.reset()
  }

  getAllLocations() {
    this.http.getData("JobLocation")
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Map the response to the Location interface structure
          this.locations = data.jobLocations.map((location: any) => ({
            id: location.id,
            jobLocationName: location.jobLocationName,
            jobSubLocations: location.jobSubLocations.filter(
              (subLocation: any) => subLocation.jobSubLocationName
            )

          }));
        },
        error: (error: any) => {
          console.error('Error fetching locations', error);
        }
      });
  }

  onRowsChange() {
    this.page = 1;        
    this.first = 0; 
    this.getAllDesks(this.page, this.pageSize, null,null,this.Status);
  }

  onPageChange(event: any) {
     this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getAllDesks(this.page, this.pageSize, null,null, this.Status);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
     this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;
    this.getAllDesks(this.page, this.pageSize, null,null, this.Status);
  }


 onSearchChange(event: any) {
    if (event !== '' && event.length >= 1) {
      this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
    if (event === '') {
      this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
  }


  getAllDesks(pagenum: number, pagesize: number, locationid: any, sublocationid: any, Deskstatus: any) {
    const params = {
      page: pagenum,
      pageSize: pagesize,
      locationid: locationid,
      sublocationid: sublocationid,
      status: Deskstatus,
      searchQuery: this.searchQuery

    };
    this.loading = true
    this.subscription = this.http.getstatusdesk("DeskAllocationHeader", params.locationid, params.sublocationid, params.status, params.page, params.pageSize, params.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loading = false
          this.desklist.next(data.items)
          //this.getcount(this.selectedLocationId, this.selectedSubLocationId)
          // Update the collection size (total records) for pagination
          this.collectionSize = data.totalRecords;

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

  navigateToAsset(deskid: any) {
    this.router.navigate(['/desk/view-desk'], { queryParams: { id: deskid } });
  }


  getdatabyentriyrealse() {
    const params = 'Assets';
    const param = 'release';
    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {
            const statusString = data[0].value;
            this.deskrealse = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }


  resetassiginform() {
    this.modalService.dismissAll()
    this.selectedEmployee = null;
    this.selectedmanerEmployee = null;
    this.realseForm.reset()
    this.reassiginForm.reset()
    this.shiftDropdown = [];

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




  getdatabyentriy() {
    const params = 'Desk';
    const param = 'desktype';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.desktype.next(statusString.split(',')); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }



  postReallocateAssets(reassiginForm: FormGroup) {
    if (reassiginForm.valid) {

      // Create the payload for asset assignment
      const payload: any = {
        deskAllocationHeaderId: this.deskid,
        status: "Allocated",
        deskAllocatedTo: this.assignEmployeeId,
        allocatedBy: this.empinfo.employeeId,
        allocatedDate: new Date(),
        allocatedToName: this.assignemployename,
        comments: '',
        approvalStatus: 'Waiting for approval',
        shiftId: this.reassiginForm.get('shifts')?.value,
        approverId: this.approvalid,
      };

      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.postdata('DeskAllocationItem', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Request submitted Successfully')
          ///this.updatedeskallowcation(this.assiginForm)
        this.getAllDesks(this.page, this.pageSize, null, null, null);
          this.reassiginForm.reset();
          this.reassiginForm.get('employeeName')?.reset()
          this.reassiginForm.get('approvid')?.reset()
          this.selectedEmployee = null;
          this.selectedmanerEmployee = null
          this.shiftDropdown = [];

        },
        error: (error) => {
          console.log('Error:', error);
          this.conformationPopup.openErrorModal(error.error.message);

        }
      });
    } else {
      console.log('Form is invalid');
    }
  }




  updatedeskitemrelease(realseForm: FormGroup) {
    if (realseForm.valid) {
      const payload = {
        deskAllocationItemId: this.deskiteamid,
        allocatedBy: this.empinfo.employeeId,
        allocatedToName: this.assignemployename,
        releavedDate: new Date(),
        status: 'Released',
        releavedBy: this.empinfo.employeeId,
        comments: realseForm.get('reason')?.value,
        releavedReason: this.realseForm.get('deskrealse')?.value?.value,
      }
      console.log('Assignment Payload:', payload);
      this.http.putData(`DeskAllocationItem/${this.deskiteamid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.updatedeskrelase(this.realseForm)

        },
        error: (error) => {
          console.log('Error:', error);
          this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.');
        }
      });
    } else {
      console.log('Form is invalid');
    }

  }

  updatedeskrelase(realseForm: FormGroup) {
    if (realseForm.valid) {
      // Create the payload for asset assignment
      const payload: any = {
        // deskId: this.selectedAsset.deskId,
        deskStatus: "Available",
        createdBy: this.empinfo.employeeId,
        updatedOn: new Date().toISOString(),
        locationId: this.selectedAsset.location.id,
        subLocationId: this.selectedAsset.subLocation.id

      }
      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Request submitted Successfully')
          this.getAllDesks(this.page, this.pageSize, null, null, null);


        },
        error: (error) => {
          console.log('Error:', error);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.');

        }
      });
    } else {
      console.log('Form is invalid');
    }

  }


  



  viewasetsdata(data: any) {
    this.reassiginForm.patchValue({
      deskid: data?.deskName,
      shifts: data?.latestAllocationItem?.shiftId
    });

    this.loactionid = data?.location?.id;
    this.sublocation = data?.subLocation?.id;
    this.getEmployeedata();
    if (this.loactionid && this.sublocation) {

      this.getbasedonlocationshits(); // Fetch shifts or other location-based data
      this.getdeskid()
    } else {
      console.error('Location or Sub-location data is missing.');
    }
  }

  getdeskid() {
    this.http.getData(`desksData/getdeskslocnsub?locationId=${this.loactionid}&subLocationId=${this.sublocation}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Filter only assets that are active and not deleted
        const filteredAssets = res.filter((asset: any) => asset.status === 'Available' && !asset.isDeleted);
        this.deskdataid.next(filteredAssets);
        console.log(this.deskdataid.value)
      },
      error: (errormessage) => {
        console.log(errormessage);
      }
    });
  }


  getbasedonlocationshits() {
    this.http
      .getData(`orgShifts/getshiftlocation?locationId=${this.loactionid}&subLocationId=${this.sublocation}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []; // Reset if no shifts are found
          } else {
            this.shiftDropdown = [].concat(
              ...data.map((element: any) => element.orgShiftsItems)
            ); // Flatten the shift data
          }

          console.log('Shift Dropdown Values:', this.shiftDropdown);
        }
      });
  }

  getEmployeedata() {
    if (!this.loactionid || !this.sublocation || !this.shift) {
      console.error("Location ID or Sub-location ID is missing.");
      return;
    }

    this.http
      .getData(`JobDetails/getAllJobdetails?locationId=${this.loactionid}&sublocationId=${this.sublocation}&shiftId=${this.shift}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // Transform the data to add `employeeName` and a combined property
          this.employeeiddetails = data.map((employee: any) => ({
            ...employee,
            employeeName: `${employee.fusionEmpId ?? ''}- ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,

          }));
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {
          console.error(reason);
        }
      });
  }

  selectedEmployee: any
  onEmployeeSelect(event: any) {
    this.selectedEmployee = event
    this.assignEmployeeId = event?.value?.employeeId;
    this.assignemployename = event?.value?.employeeName
    console.log(this.assignemployename)

  }

  getapproval() {
    this.http.getData('JobDetails/getAllReportingnTeamManagers')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log(res);
          // Transform data to include `employeeName`
          this.approvalname = res.map((employee: any) => ({
            ...employee,
            employeeName: `${employee.fusionEmpId ?? ''} - ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          }));
        },
        error: (errormessage) => {
          console.log(errormessage);
        }
      });
  }

  selectedreportingEmployee: any
  onApprovalSelects(event: any) {
    this.selectedmanerEmployee = event
    this.approvalid = event?.value?.employeeId;
    console.log(this.approvalid)
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
  
        console.log('Available Count:', availableCount);
        console.log('Allocated Count:', allocateCount);
        console.log('Inactive Count:', inactiveCount);
        console.log('Under Maintenance Count:', undermaintenceCount);
        console.log('Waiting for Approval Count:', waitingForApprovalCount);
      },
      error: (error) => {
        console.error('Error fetching count:', error);
      }
    });
  }
       //close dailog open
  openallocationModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
  cleardata(){
    this.reassiginForm.reset();
      this.modalService.dismissAll();
    }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}


