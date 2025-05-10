import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';


@Component({
  selector: 'app-all-desk-list',
  imports: [CommonModule, TabsModule, RouterModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, Select, DataLoaderContentComponent],
  templateUrl: './all-desk-list.component.html',
  styleUrl: './all-desk-list.component.scss'
})
export class AllDeskListComponent {
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
  deskForm!: FormGroup;
  assiginForm!: FormGroup;
  realseForm!: FormGroup;
  reassiginForm!: FormGroup;
  selectedLocationId: any;
  selectedSubLocationId: any;
  allocateDeskForm!: FormGroup;
  locations: any[] = [];
  subLocations: any[] = [];
  Status = ''
  inactiveForm!: FormGroup
  assignemployename: any
  undermaintancedata!: FormGroup
  deskid: any
  selectedAsset!: any
  deskiteamid: any;
  first: any = 1;
  rows: any = 10;
  totalRecords = 100;
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
  @ViewChild('assigindesk') private readonly assigindesk!: NgbModal;
  @ViewChild('unassigindesk') private readonly unassigindesk!: NgbModal;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  @ViewChild('createDeskModal') private readonly createDeskModal!: NgbModal;
  @ViewChild('mainContent') private readonly mainContent!: TemplateRef<any>;
  @ViewChild('noResults') private readonly noResults!: TemplateRef<any>;
  @ViewChild('loadingSpinner') private loadingSpinner!: TemplateRef<any>;
  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private readonly router: Router,
    public conformationPopup: OpenModalService,
    public rbac: RbacService,

    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    console.log(this.empinfo);
    this.getdatabyentriyinactive()
    this.intialassigindesk()
    this.getAllLocations();

    this.getapproval()
    this.intialreassigindesk();
    this.initialinactiveform();
    this.intialundermaintancedata()
    this.getdatabyentriyundermaintance()
    this.getdatabyentriy()
    this.intialrealsedata()

    this.getdatabyentriyrealse();
    // this.getAllDesks(this.first, this.rows, this.selectedLocationId, null,null);
    this.getFilteredData();

    this.assiginForm.get('shifts')?.valueChanges
      .subscribe((seletshift) => {
        this.shift = seletshift
        this.selectedEmployee = null
        this.assiginForm.get('employeeid')?.reset()
        console.log('Selected Category:', seletshift);
        this.getEmployeedata()

      });

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
    this.subscription = this.http.desklocationId$.subscribe({
      next: (Value: any) => {
        console.log(Value);
        this.selectedLocationId= JSON.parse(localStorage.getItem('locationId') ?? 'null');
        this.selectedSubLocationId = JSON.parse(localStorage.getItem('sublocationId') ?? 'null');
       

        this.getAllDesks(this.first, this.rows, Value, this.selectedSubLocationId, this.Status);
      }
    })
  }


  intialassigindesk() {
    this.assiginForm = this.fb.group({
      employeeid: [null, Validators.required],
      approvid: [null, Validators.required],
      shifts: [null, Validators.required]
    })

  }

  initialinactiveform() {
    this.inactiveForm = this.fb.group({
      assetinactive: [null, Validators.required],
      reason: [null]
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

  intialundermaintancedata() {
    this.undermaintancedata = this.fb.group(
      {
        assetundermatince: [null, Validators.required],
        startdate: [null],
        enddate: [null],
        reason: [null]

      }, { validators: this.startDateEndDateValidator() }
    )
  }


  intialrealsedata() {
    this.realseForm = this.fb.group(
      {
        deskrealse: [null, Validators.required],
        reason: [null, [Validators.maxLength(250)]]

      }
    )
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  conformationpoppup() {
    this.modalService.dismissAll()
    this.undermaintancedata.reset()
    this.inactiveForm.reset()
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
    this.first = 1;
    this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
    this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);

  }


  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    console.log('Page size changed to:', newPageSize);
    console.log(this.first)
    this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);
  }

  onSearchChange(event: any) {
    if (event !== '' && event.length >= 1) {
      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);
    }

    if (event === '') {
      this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);
    }
  }


  getAllDesks(pagenum: number, pagesize: number, locationid: any, sublocationid: any, Deskstatus: any) {
    const params = {
      first: pagenum,
      rows: pagesize,
      locationid: locationid,
      sublocationid: sublocationid,
      status: Deskstatus,
      searchQuery: this.searchQuery

    };
    this.loading = true
    this.subscription = this.http.getstatusdesk("DeskAllocationHeader", params.locationid, params.sublocationid, params.status, params.first, params.rows, params.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loading = false
          this.desklist.next(data.items)
          //this.getcount(this.selectedLocationId, this.selectedSubLocationId)
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
    this.assiginForm.reset()
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


  postAllocateAssets(assignForm: FormGroup) {
    if (assignForm.valid) {
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
        shiftId: this.assiginForm.get('shifts')?.value,
        approverId: this.approvalid,

      };

      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.postdata('DeskAllocationItem', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Request submitted Successfully')
          this.getAllDesks(this.first, this.rows, null, null, null);

          this.assiginForm.reset();
          this.assiginForm.get('employeeName')?.reset()
          this.assiginForm.get('approvid')?.reset()
          this.selectedEmployee = null;
          this.selectedmanerEmployee = null
          this.selectedEmployee = null

        },
        error: (error) => {
          console.log('Error:', error);
          this.conformationPopup.openErrorModal(error.error || 'Error occurred during assignment.')
        }
      });
    } else {
      console.log('Form is invalid');
    }
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
          this.getAllDesks(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, null);
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


  startDateEndDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startdate')?.value;
      const endDate = control.get('enddate')?.value;

      if (startDate && endDate && startDate === endDate || startDate && endDate && startDate > endDate) {
        this.datesShouldNotBeEqual = true
        return { datesShouldNotBeEqual: true };
      } else {
        this.datesShouldNotBeEqual = false
      }

      return null;
    };
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
          this.getAllDesks(this.first, this.rows, null, null, null);
          this.assiginForm.reset();

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


  getdatabyentriyinactive() {
    const params = 'Assest';
    const param = 'inactive';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.deskinactive = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }

  getdatabyentriyundermaintance() {
    const params = 'Assests';
    const param = 'statuses';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.deskundermaintence = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }



  inactivedesk(inactiveForm: FormGroup) {
    if (inactiveForm.valid) {

      const payload: any = {
        //deskName: this.selectedAsset.deskName,
        reason: this.inactiveForm.get("assetinactive")?.value?.value,
        deskStatus: "Inactive",
        createdBy: this.empinfo.employeeId,
        updatedOn: new Date().toISOString(),
        additionalComments: this.inactiveForm.get('reason')?.value
      }
      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Desk marked as Inactivated Successfully')
          setTimeout(() => {
            location.reload();
          }, 2000);
          this.getAllDesks(this.first, this.rows, null, null, null);

          this.inactiveForm.reset();
        },
        error: (error) => {
          console.log('Error:', error);
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred during assignment.');

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

  undermaintancedesk(undermaintancedata: FormGroup) {
    if (undermaintancedata.valid) {

      const payload: any = {
        //deskName: this.selectedAsset.deskName,
        reason: this.undermaintancedata.get("assetundermatince")?.value?.value,
        deskStatus: "Under Maintenance",
        createdBy: this.empinfo.employeeId,
        updatedOn: new Date().toISOString(),
        comments: this.undermaintancedata.get('reason')?.value,
        toDate: this.undermaintancedata.get('enddate')?.value,
        fromDate: this.undermaintancedata.get('startdate')?.value
      }



      // Send the HTTP POST request
      this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Desk marked as Maintenance Successfully')
          this.getAllDesks(this.first, this.rows, null, null, null)
          this.undermaintancedata.reset();
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

  activeassets(selectedAsset: any) {
    console.log(selectedAsset)
    const payload: any = {
      //deskName: this.selectedAsset.deskName,
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
        this.conformationPopup.openSuccessModal('Desk marked as Active Successfully')
        // this.getAllDesks(this.first, this.rows);
        this.getAllDesks(this.first, this.rows, null, null, null)
      },
      error: (error) => {
        console.log('Error:', error);
        this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.')
      }
    });

  }

  aviableassets(selectedAsset: any) {
    console.log(selectedAsset)
    const payload: any = {
      //deskName: this.selectedAsset.deskName,
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
        this.conformationPopup.openSuccessModal('Desk marked as Available Successfully')
        // this.getAllDesks(this.first, this.rows);
        this.getAllDesks(this.first, this.rows, null, null, null);
        setTimeout(() => {
          location.reload();
        }, 2000);

      },
      error: (error) => {
        console.log('Error:', error);
        this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.');
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

  selectedreportingEmployee: any
  onApprovalSelects(event: any) {
    this.selectedmanerEmployee = event
    this.approvalid = event?.value?.employeeId;
    console.log(this.approvalid)
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
