import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-desk-management',
  imports: [CommonModule, TabsModule, RouterModule, ReactiveFormsModule, Select],
  templateUrl: './desk-management.component.html',
  styleUrl: './desk-management.component.scss'
})
export class DeskManagementComponent {
  navTabs: any[] = [
    { label: 'All Desks', link: '/desk/management/all-desks', },
    { label: 'Available Desks', link: '/desk/management/available-desks', },
    { label: 'Allocated Desks', link: '/desk/management/allocated-desk', },
    { label: 'Under Maintenance', link: '/desk/management/under-maintenance-desk' },
    { label: 'Inactive Desks', link: '/desk/management/inactive-desk', },
    { label: 'Waiting for Approval', link: '/desk/management/waiting-for-approval-desks', }
  ];
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

  locationfromdata!:FormGroup
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
          this.jobLocationDropDownData = [
            { id: null, jobLocationName: 'All Locations' },
            ...data
          ];
        },
      });
  }


  getSubLocationByidfliters(selectedLocation: any): void {
    this.locationfromdata.get('subLocationId')?.enable();
  
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http
        .getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`)
        .subscribe({
          next: (data: any) => {
            if (data && data.jobSubLocations) {
              // Prepend 'All Sub Locations' option
              this.subLocationsDropdown = [
                { id: null, jobSubLocationName: 'All Sub Locations' },
                ...data.jobSubLocations
              ];
            } else {
              this.subLocationsDropdown = [];
            }
          },
          error: (err: any) => {
            console.error('Error fetching sub-location data:', err);
            this.subLocationsDropdown = [];
            this.locationfromdata.patchValue({ subLocationId: null });
          }
        });
    } else {
      this.subLocationsDropdown = [];
      this.locationfromdata.patchValue({ subLocationId: null });
    }
  }
  
  getSubLocationByid(selectedLocation: any): void {
    this.locationfromdata.get('subLocationId')?.enable()
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
            employeeName: `${employee.fusionEmpId ?? ''} - ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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

}
