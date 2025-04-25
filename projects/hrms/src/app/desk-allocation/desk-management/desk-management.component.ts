import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';

import { OpenModalService } from '../../services/open-modal.service';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-desk-management',
  imports: [CommonModule, TabsModule, RouterModule, ReactiveFormsModule,Select ],
  templateUrl: './desk-management.component.html',
  styleUrl: './desk-management.component.scss'
})

export class DeskManagementComponent {


  @ViewChild('createDeskModal') private readonly createDeskModal!: NgbModal;
  deskForm!: FormGroup;
  subscription!: Subscription;
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  shiftDropdown: any[] = [];
  employeeiddetails = [] as any[];
  approvalname: any[] = []
  approvalid: any
  selectedEmployeeid: any
  empinfo: any
  desktype: any[] = []
  deskdataid: any[] = []
  navTabs: any[] = [];
  page = 1;
  pageSize = 10;
  collectionSize = 0;

  locationfromdata!: FormGroup
  searchQuery = '';
  desklist = new BehaviorSubject<any[]>([])
  constructor(
    private readonly fb: FormBuilder,
    private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,) { }

  ngOnInit() {

    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intialdesk()
    this.intiallocationandsublocation()
    this.getjobLocationList()
    this.getapproval()
    this.getdatabyentriy()
    this.getcount(null, null)
    this.navTabs = [
      { label: 'All', route: '/desk/management/all-desks', count$: this.http.deskTotalCountSubject },
      { label: 'Available', route: '/desk/management/available-desks', count$: this.http.deskAvailableCountSubject },
      { label: 'Allocated', route: '/desk/management/allocated-desk', count$: this.http.deskAllocatedCountSubject },
      { label: 'Under Maintenance', route: '/desk/management/under-maintenance-desk', count$: this.http.deskUndermaindanaenceCountSubject },
      { label: 'Inactive', route: '/desk/management/inactive-desk', count$: this.http.deskinactiveCountSubject },
      { label: 'Waiting For Approval', route: '/desk/management/waiting-for-approval-desks', count$: this.http.deskWiatingforapprovalCountsubject }
    ];

  }

  intiallocationandsublocation() {
    this.locationfromdata = this.fb.group({
      locationId: [null],
      subLocationId: [{ value: null, disabled: true }],
    });

  }

  intialdesk() {
    this.deskForm = this.fb.group({
      locationId: [null, Validators.required],
      subLocationId: [{ value: null, disabled: true }, Validators.required],
      desktype: [null, Validators.required],
      deskid: [null, Validators.required],
      employeid: [{ value: null, disabled: true }, []],
      shifts: [{ value: null, disabled: true }, []],
      deskapprovalid: [{ value: null, disabled: true }, []],


    });
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true });

  }
  getjobLocationList() {
    this.subscription = this.http
      .getData(`JobLocation/getAllLocations`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.jobLocationDropDownData = data
        },
      });
  }


  getSubLocationByidfliters(selectedLocation: any): void {
    this.locationfromdata.get('subLocationId')?.enable();

    this.subscription = this.http
      .getData(`JobLocation/sub-location-by-joblocation/${selectedLocation}`)
      .subscribe({
        next: (data: any) => {
          if (data && data.jobSubLocations) {
            // Prepend 'All Sub Locations' option
            this.subLocationsDropdown = data.jobSubLocations
          } else {
            this.subLocationsDropdown = [];
          }
        },
        error: (err: any) => {
          console.error('Error fetching sub-location data:', err);
          this.subLocationsDropdown = [];
          this.locationfromdata.reset()
          this.locationfromdata.get('subLocationId')?.disable()
          window.location.reload()
          localStorage.removeItem('locationId');
          localStorage.removeItem('sublocationId');
  
        }
      });


  }

  getSubLocationByid(selectedLocation: any): void {

    this.deskForm.get('subLocationId')?.enable()
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http
        .getData(
          `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
        )
        .subscribe({
          next: (data: any) => {
            console.log('Sub Location Data:', data);

            if (data.length === 0) {
              this.subLocationsDropdown = []; // Reset if no sub-locations are found
            } else {
              this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
            }

            // Reset the sub-location selection in the form
            this.deskForm.patchValue({ subLocation: null });
          },
          error: (err: any) => {
            console.error('Error fetching sub-location data:', err);
            this.subLocationsDropdown = []; // Reset on error
            this.deskForm.patchValue({ subLocation: null }); // Reset the sub-location field
          },
        });
    } else {
      this.subLocationsDropdown = []; // Reset if no location is selected

    }
  }


  getShiftBYid(selectedSubLocation: any): void {
    if (selectedSubLocation && selectedSubLocation.id) {
      const locationId =
        this.deskForm.get('locationId')?.value?.id ?? this.deskForm.get('locationId')?.value; // Get the selected location ID
      const subLocationId = selectedSubLocation.id; // Get the selected sub-location ID

      console.log('Location ID:', locationId);
      console.log('Sub Location ID:', subLocationId);

      this.subscription = this.http
        .getData(
          `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
        )
        .subscribe({
          next: (data: any) => {
            console.log('Shift Data:', data);

            if (data.length === 0) {
              this.shiftDropdown = []; // Reset if no shifts are found
            } else {
              this.shiftDropdown = [].concat(
                ...data.map((element: any) => element.orgShiftsItems)
              ); // Flatten the shift data
            }

            console.log('Shift Dropdown Values:', this.shiftDropdown);
          },
          error: (err: any) => {
            console.error('Error fetching shift data:', err);
            this.shiftDropdown = []; // Reset on error
          },
        });
    } else {
      this.shiftDropdown = []; // Reset if no sub-location is selected
    }
  }


  isToggled = false
  onToggleChange(event: Event) {
    this.isToggled = (event.target as HTMLInputElement).checked;
    console.log(this.isToggled);  // Debugging log to check the state

    if (this.isToggled) {
      // Enable fields and set validators
      this.deskForm.get('employeid')?.enable();
      this.deskForm.get('shifts')?.enable();
      this.deskForm.get('deskapprovalid')?.enable();


      this.deskForm.get('employeid')?.setValidators([Validators.required]);
      this.deskForm.get('shifts')?.setValidators([Validators.required]);
      this.deskForm.get('deskapprovalid')?.setValidators([Validators.required])

    } else {
      // Disable fields and clear validators
      this.deskForm.get('employeid')?.disable();
      this.deskForm.get('shifts')?.disable();
      this.deskForm.get('deskapprovalid')?.disable();


      this.deskForm.get('employeid')?.reset();
      this.deskForm.get('shifts')?.reset();
      this.deskForm.get('deskapprovalid')?.reset();
      // this.selectedmanerEmployee=null


      this.deskForm.get('employeid')?.clearValidators();
      this.deskForm.get('shifts')?.clearValidators();
      this.deskForm.get('deskapprovalid')?.clearValidators();

    }

    // Update the validity of the form controls after setting validators
    this.deskForm.get('employeid')?.updateValueAndValidity();
    this.deskForm.get('shifts')?.updateValueAndValidity();
    this.deskForm.get('deskapprovalid')?.updateValueAndValidity();

  }


  getEmployeedata() {
    const locationId = this.deskForm.get('locationId')?.value?.id;
    const sublocationId = this.deskForm.get('subLocationId')?.value?.id;
    const shift = this.deskForm.get('shifts')?.value?.id;
    if (!locationId || !sublocationId) {
      console.error("Location ID or Sub-location ID is missing.");
      return;
    }

    this.http
      .getData(`JobDetails/getAllJobdetails?locationId=${locationId}&sublocationId=${sublocationId}&shiftId=${shift}`)
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
          // this.employeeiddetails = [];
          console.error(reason);
        }
      });
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
            employeeNames: `${employee.fusionEmpId ?? ''} - ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          }));
        },
        error: (errormessage) => {
          console.log(errormessage);
        }
      });
  }



  getdeskid() {
    const locationId = this.deskForm.get('locationId')?.value?.id;
    const sublocationId = this.deskForm.get('subLocationId')?.value?.id;
    this.http.getData(`desksData/getdeskslocnsub?locationId=${locationId}&subLocationId=${sublocationId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Filter only assets that are active and not deleted
        const filteredAssets = res.filter((asset: any) => asset.status === 'Available' && !asset.isDeleted);
        this.deskdataid = filteredAssets;

      },
      error: (errormessage) => {
        console.log(errormessage);
      }
    });
  }

  getdatabyentriy() {
    const params = 'Desk';
    const param = 'desktype';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param)
      .subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {
            const statusString = data[0].value;
            this.desktype = statusString.split(',').map((type: any) => ({ value: type }));
          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }


  onEmployeeSelect(event: any) {
    this.selectedEmployeeid = event?.value?.employeeId;
  }
  onApprovalSelects(event: any) {
    this.approvalid = event?.value?.employeeId;
    console.log(this.approvalid)
  }

  postdesk(deskForm: FormGroup) {
    if (deskForm.valid) {

      const formValues = this.deskForm.value;

      // Create the payload
      const payload: any = {
        deskId: this.deskForm.get('deskid')?.value,
        deskStatus: "Available",
        locationId: formValues.locationId?.id,
        subLocationId: formValues.subLocationId?.id,
        createdBy: this.empinfo.employeeId,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        comments: "string",
        deskType: this.deskForm.get('desktype')?.value?.value,
      };

      if (this.isToggled) {
        payload.items = [
          {
            deskId: this.deskForm.get('deskid')?.value,
            status: "Unallocated",
            deskAllocatedTo: this.selectedEmployeeid,
            allocatedBy: this.empinfo.employeeId,
            allocatedDate: new Date().toISOString(),
            shiftId: this.deskForm.get('shifts')?.value?.id,
            approvalStatus: "Waiting for Approval",
            deskType: this.deskForm.get('desktype')?.value?.value,
            createdby: this.empinfo.employeeId,
            approverId: this.approvalid,

          },
        ];
      };
      console.log('Payload:', payload);
      this.http.postdata("DeskAllocationHeader", payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Desk Registered Successfully ');
            this.deskForm.reset()

          },
          error: (error: any) => {
            console.error('Error fetching locations', error);

            this.conformationPopup.openErrorModal(error.error.Message)


          }
        });
    }
  }


  onLocationChange() {
    const locationId = this.locationfromdata.get('locationId')?.value;
    this.getSubLocationByidfliters(locationId);
    localStorage.setItem('locationId', JSON.stringify(locationId))
    console.log(locationId)
    this.locationfromdata.get('subLocationId')?.reset()
    localStorage.setItem('sublocationId', JSON.stringify(null))
    this.http.deskUpdateLocationId(locationId);

    this.getcount(locationId, null)
  }
  
  onSubLocationChange() {
    const subLocationId = this.locationfromdata.get('subLocationId')?.value;
    if (subLocationId) {
      const loctionid = this.locationfromdata.get('locationId')?.value
      localStorage.setItem('sublocationId', JSON.stringify(subLocationId))
      this.http.deskUpdateLocationId(loctionid);
      console.log(loctionid)
      this.getAllDesks(this.page, this.pageSize, loctionid, subLocationId, null);
      this.getcount(loctionid, subLocationId)

    }
    else {
      const loctionid = this.locationfromdata.get('locationId')?.value
      localStorage.setItem('sublocationId', JSON.stringify(subLocationId))
      this.http.deskUpdateLocationId(loctionid);
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

    this.subscription = this.http.getstatusdesk("DeskAllocationHeader", params.locationid, params.sublocationid, params.status, params.page, params.pageSize, params.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.desklist.next(data.items)
        },
        error: (error: any) => {
          console.error('Error fetching desk data', error);

        },


      });
  }

  getcount(locationId: string | null, subLocationId: string | null) {
    const params = new URLSearchParams();
    if (locationId) params.append('locationid', locationId);
    if (subLocationId) params.append('sublocationid', subLocationId);

    this.http.getData(`DeskAllocationHeader/v1/statuscount?${params.toString()}`).subscribe({
      next: (data: any) => {
        console.log(data);
        const totalCount = data.totalCount || 0;
        // this.http.setAssetCount(totalCount);

        const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];
        const availableData = statusCounts.find((item: any) => item.status === "Available");
        const allocateData = statusCounts.find((item: any) => item.status === "Allocated");
        const inactivedata = statusCounts.find((item: any) => item.status === "Inactive");
        const undermaintence = statusCounts.find((item: any) => item.status === "Under Maintenance");
        const waitingForApprovalData = statusCounts.find((item: any) => item.status === "Waiting for Approval");
        this.http.setTotalDeskCount(totalCount);
        const availableCount = availableData?.count || 0;
        const allocateCount = allocateData?.count || 0;
        const inactiveCount = inactivedata?.count || 0;
        const undermaintenceCount = undermaintence?.count || 0;
        const waitingForApprovalCount = waitingForApprovalData?.count || 0;


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

  onHitSubLocationChange() {
    const subLocationId = this.locationfromdata.get('subLocationId')?.value;
    const loctionid = this.locationfromdata.get('locationId')?.value
    this.http.deskUpdateLocationId(loctionid);
    console.log(loctionid)

  }

  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    localStorage.removeItem('locationId');
    localStorage.removeItem('sublocationId');
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
