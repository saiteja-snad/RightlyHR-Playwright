import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, combineLatest, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-desk-management',
  imports: [CommonModule, TabsModule, RouterModule, ReactiveFormsModule, Select, ModuleInformationComponent, NgbPopoverModule, ChartModule,],
  templateUrl: './desk-management.component.html',
  styleUrl: './desk-management.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class DeskManagementComponent {
  moduleinfo: string = '';
  @ViewChild('createDeskModal') private readonly createDeskModal!: NgbModal;
  deskForm!: FormGroup;
  subscription!: Subscription;
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  shiftDropdown: any[] = [];
  employeeiddetails = [] as any[];
  approvalname: any[] = [];
  approvalid: any;
  selectedEmployeeid: any;
  empinfo: any;
  desktype: any[] = [];
  deskdataid: any[] = [];
  allNavTabs: any[] = [];
  navTabs: any[] = [];
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  locationfromdata!: FormGroup;
  searchQuery = '';
  desklist = new BehaviorSubject<any[]>([]);
  deskData: any;
  deskDataOptions: any;
  totaldeskCount: any;

  constructor(private readonly fb: FormBuilder, public http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,
    private router: Router, public rbac: RbacService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
  
    this.intialdesk()
    this.intiallocationandsublocation()
    this.getjobLocationList()
    this.getapproval()
    //this.getdatabyentriy()
    this.getcount(null, null)
    this.initializeNavTabs();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();

  }

  initializeNavTabs(): void {
    // Populate allNavTabs with permission checks
    this.allNavTabs = [
      { label: 'All', route: '/desk/management/all-desks', icon: '/desk-icon/all-icon.png', permission: { feature: 'Desk Allocation - All', action: 'view' }, count$: this.http.deskTotalCountSubject },
      { label: 'Available', route: '/desk/management/available-desks', icon: '/desk-icon/Available-icon.png', backgroundcolour: '#25BBFF', permission: { feature: 'Desk Allocation - Available', action: 'view' }, count$: this.http.deskAvailableCountSubject },
      { label: 'Allocated', route: '/desk/management/allocated-desk', icon: '/desk-icon/Allocated-icon.png', backgroundcolour: '#FCD643', permission: { feature: 'Desk Allocation - Allocated', action: 'view' }, count$: this.http.deskAllocatedCountSubject },
      { label: 'Under Maintenance', route: '/desk/management/under-maintenance-desk', icon: '/desk-icon/Under-Maintannace-icon.png', backgroundcolour: '#FF338A', permission: { feature: 'Desk Allocation - Under Maintenance', action: 'view' }, count$: this.http.deskUndermaindanaenceCountSubject },
      { label: 'Inactive', route: '/desk/management/inactive-desk', icon: '/desk-icon/workspace-icon.png', backgroundcolour: '#338DF8', permission: { feature: 'Desk Allocation - Inactive', action: 'view' }, count$: this.http.deskinactiveCountSubject },
      { label: 'Waiting For Approval', route: '/desk/management/waiting-for-approval-desks', icon: '/time-off-icon/waiting-for-approval-icon.png', backgroundcolour: '#AEFF69', permission: { feature: 'Desk Allocation - Waiting For Approval', action: 'view' }, count$: this.http.deskWiatingforapprovalCountsubject }
    ];
    // Filter navTabs based on permissions
    this.navTabs = this.allNavTabs.filter(tab =>
      tab.permission && tab.permission.feature && tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/desk/management': MODULE_INFOS.DESK_ALLOCATION_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  intiallocationandsublocation() {
    this.locationfromdata = this.fb.group({
      locationId: [null],
      subLocationId: [{ value: null, disabled: true },Validators.required],
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
    this.deskForm.reset(); 
    this.deskForm.get('subLocationId')?.disable();
    this.deskForm.get('shifts')?.disable();
    this.deskForm.get('employeid')?.disable();
    this.deskForm.get('deskapprovalid')?.disable();
    this.isToggled = false;
    this.desktype = [];
    this.subLocationsDropdown = [];
    this.deskdataid = [];
    this.shiftDropdown = [];
    this.employeeiddetails = [];
    this.modalService.open(content, { centered: true });
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data
      },
    });
  }

  getSubLocationByidfliters(selectedLocation: any): void {
    this.locationfromdata.get('subLocationId')?.enable();
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation}`).subscribe({
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
    this.deskForm.get('subLocationId')?.enable();
     this.deskForm.get('subLocationId')?.reset();
  this.deskForm.get('subLocationId')?.markAsTouched();
  this.deskForm.get('subLocationId')?.updateValueAndValidity();
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = []; // Reset if no sub-locations are found
          } else {
            this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
          }
          // Reset the sub-location selection in the form
        //  this.deskForm.patchValue({ subLocation: null });
        },
        error: (err: any) => {
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
      const locationId = this.deskForm.get('locationId')?.value?.id ?? this.deskForm.get('locationId')?.value; // Get the selected location ID
      const subLocationId = selectedSubLocation.id; // Get the selected sub-location ID
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []; // Reset if no shifts are found
          } else {
            this.shiftDropdown = [].concat(
              ...data.map((element: any) => element.orgShiftsItems)
            ); // Flatten the shift data
          }
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

  resetfrom() {
    this.isToggled = false;
    this.deskForm.reset();
  }

  isToggled = false
  onToggleChange(event: Event) {
    this.isToggled = (event.target as HTMLInputElement).checked;
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
    this.http.getData(`JobDetails/getAllJobdetails?locationId=${locationId}&sublocationId=${sublocationId}&shiftId=${shift}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          // Transform the data to add `employeeName` and a combined property
          this.employeeiddetails = data.map((employee: any) => ({
            ...employee,
            employeeName: `${employee.fusionEmpId ?? ''}- ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,

          }));
        },
        error: (reason: any) => {
          // this.employeeiddetails = [];
          console.error(reason);
        }
      });
  }

  getapproval() {
    this.http.getData('JobDetails/getAllReportingnTeamManagers').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Transform data to include `employeeName`
        this.approvalname = res.map((employee: any) => ({
          ...employee,
          employeeNames: `${employee.fusionEmpId ?? ''} - ${employee.firstName} 
          ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
        this.getdatabyentriy();
      },
      error: (errormessage) => {
        console.log(errormessage);
      }
    });
  }

  getdatabyentriy() {
    const params = 'Desk';
    const param = 'desktype';
    this.http.getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
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
      this.http.postdata("DeskAllocationHeader", payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Desk Registered Successfully ');
            this.getAllDesks(this.page, this.pageSize, null, null, 'All');
            this.getcount(null, null);
            this.navigateToAsset();
            this.deskForm.reset();
            this.isToggled = false;
            this.http.setnewdeskDetails();
          },
          error: (error: any) => {
            console.error('Error fetching locations', error);
            this.conformationPopup.openErrorModal(error.error.Message);
          }
        });
    }
  }

  onLocationChange() {
    const locationId = this.locationfromdata.get('locationId')?.value;
    this.getSubLocationByidfliters(locationId);
    localStorage.setItem('locationId', JSON.stringify(locationId));
    this.locationfromdata.get('subLocationId')?.reset();
    localStorage.setItem('sublocationId', JSON.stringify(null));
    this.http.deskUpdateLocationId(locationId);
    this.getcount(locationId, null);
  }

  onSubLocationChange() {
    const subLocationId = this.locationfromdata.get('subLocationId')?.value;
    if (subLocationId) {
      const loctionid = this.locationfromdata.get('locationId')?.value
      localStorage.setItem('sublocationId', JSON.stringify(subLocationId))
      this.http.deskUpdateLocationId(loctionid);
      this.getAllDesks(this.page, this.pageSize, loctionid, subLocationId, null);
      this.getcount(loctionid, subLocationId);
    }
    else {
      const loctionid = this.locationfromdata.get('locationId')?.value;
      localStorage.setItem('sublocationId', JSON.stringify(subLocationId));
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
    this.subscription = this.http.getstatusdesk("DeskAllocationHeader", params.locationid, params.sublocationid,
      params.status, params.page, params.pageSize, params.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
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
    params.append('status', status);
   
  
  this.http.getData(`DeskAllocationHeader/v1/statuscount?${params.toString()}`).subscribe({
    next: (data: any) => {
  const totalCount = data.totalCount || 0;
  this.http.setTotalDeskCount(totalCount);
  const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];
  const availableCount = statusCounts.find((item: any) => item.status === "Available")?.count || 0;
  const allocateCount = statusCounts.find((item: any) => item.status === "Allocated")?.count || 0;
  const inactiveCount = statusCounts.find((item: any) => item.status === "Inactive")?.count || 0;
  const undermaintenceCount = statusCounts.find((item: any) => item.status === "Under Maintenance")?.count || 0;
  const waitingForApprovalCount = statusCounts.find((item: any) => item.status === "Waiting for Approval")?.count || 0;

  this.http.setAvailableDeskCount(availableCount);
  this.http.setAllocatedDeskCount(allocateCount);
  this.http.setundermatinaceDeskCount(undermaintenceCount);
  this.http.setinactiveSubjectDeskCount(inactiveCount);
  this.http.setWFASubjectDeskCount(waitingForApprovalCount);

  // Move chart initialization here
  setTimeout(() => this.initChart(), 0);
},
  });
  }

  onHitSubLocationChange() {
    const subLocationId = this.locationfromdata.get('subLocationId')?.value;
    const loctionid = this.locationfromdata.get('locationId')?.value;
    this.http.deskUpdateLocationId(loctionid);

  }

  navigateToAsset() {
    this.router.navigate(['/desk/management/all-desks']);
  }

  //close dailog open
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.deskForm.reset();
    this.modalService.dismissAll();
    this.isToggled = false;
  }


initChart(): void {
  combineLatest([
    this.http.deskAvailableCountSubject,
    this.http.deskAllocatedCountSubject,
    this.http.deskUndermaindanaenceCountSubject,
    this.http.deskinactiveCountSubject,
    this.http.deskWiatingforapprovalCountsubject,
  ]).subscribe(([available, allocated, underMaintenance, inactive, waitingForApproval]) => {
    const chartTabs = this.allNavTabs.filter(tab => !!tab.backgroundcolour);
    const backgroundColors = chartTabs.map(item => item.backgroundcolour);

    this.deskData = {
      datasets: [
        {
          data: [
            available ?? 0,
            allocated ?? 0,
            underMaintenance ?? 0,
            inactive ?? 0,
            waitingForApproval ?? 0
          ],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        }
      ]
    };

    this.deskDataOptions = {
      cutout: '70%',
    };
  });
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