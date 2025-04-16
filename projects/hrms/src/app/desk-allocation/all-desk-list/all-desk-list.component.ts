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


@Component({
  selector: 'app-all-desk-list',
  imports: [CommonModule, TabsModule, RouterModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, Select],
  templateUrl: './all-desk-list.component.html',
  styleUrl: './all-desk-list.component.scss'
})
export class AllDeskListComponent {
  subscription!: Subscription;
  empinfo = {} as any
  approvalname: any[] = []
  isToggled = false;
  shiftOptions: { id: number; shiftName: string }[] = [];
  shiftNamesArray = new BehaviorSubject<any[]>([])
  desklist = new BehaviorSubject<any[]>([])
  shift: any
  filteredOptions: any[] = []
  employeeiddetails = [] as any[];
  deskdataid = new BehaviorSubject<any[]>([])
  assetinactive = new BehaviorSubject<string[]>([]);
  deskundermaintence = new BehaviorSubject<any[]>([])
  deskrealse = new BehaviorSubject<any[]>([])
  selectedmanerEmployee: any
  employees = []
  employeid: any
  commentsdata = ''
  employename = ''
  isDropdownOpen = false;
  searchTerm: string = '';
  showTable = false;
  deskForm!: FormGroup;
  assiginForm!: FormGroup;
  realseForm!: FormGroup;
  reassiginForm!: FormGroup;
  selectedLocationId: any;
  selectedSubLocationId: any;
  allocateDeskForm!: FormGroup;
  deskStatusOptions: any[] = []; // Replace with your actual status options
  locations: any[] = [];
  subLocations: any[] = [];
  Status = ''
  inactiveForm!: FormGroup
  assignemployename: any
  undermaintancedata!: FormGroup
  locationfromdata!: FormGroup
  selectedtranferLocationId: any
  deskid: any
  selectedAsset!: any
  reportingManager: any;
  deskiteamid: any;
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  desktype = new BehaviorSubject<any[]>([])
  destroy$: Subject<boolean> = new Subject<boolean>();
  transtiondesk = new BehaviorSubject<any[]>([])
  loading = false
  searchQuery = ''
  commedate: any
  loactionid: any
  sublocation: any
  displayTemplate!: TemplateRef<any>
  selectedEmployeeId: any;
  employeeiddetailsdata = [] as any[];
  approvalid: any
  assignEmployeeId: any;
  issubmitdiable = false;
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
    private readonly cd: ChangeDetectorRef,
    public conformationPopup: OpenModalService,

    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.empinfo = JSON.parse(localStorage.getItem("fusionuser") ?? '{}');
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
    this.intialfromdata()
    this.getdatabyentriyrealse();
    // this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, null,null);
    this.getFilteredData();

    this.assiginForm.get('shifts')?.valueChanges
      .subscribe((seletshift) => {
        this.shift = seletshift
        this.selectedEmployee = null
        this.assiginForm.get('mReportingto')?.reset()
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
        const locationid = JSON.parse(localStorage.getItem('locationId') ?? 'null');
        const sublocationid = JSON.parse(localStorage.getItem('sublocationId') ?? 'null');
        console.log(locationid)
        console.log(sublocationid)

        this.getAllDesks(this.page, this.pageSize, Value, sublocationid, this.Status);
      }
    })
  }
  intialassigindesk() {
    this.assiginForm = this.fb.group({
      mReportingto: [null, Validators.required],
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

  intialfromdata() {
    this.locationfromdata = this.fb.group({
      perisionlocation: [{ value: null, disabled: true }],
      pervessublocation: [{ value: null, disabled: true }],
      locationId: [null, Validators.required],
      subLocationId: [{ value: null, disabled: true }, Validators.required],
      comments: [null, Validators.required]

    });

  }

  intialrealsedata() {
    this.realseForm = this.fb.group(
      {
        deskrealse: [null, Validators.required],
        reason: [null, [Validators.maxLength(250)]]

      }
    )
  }



  ngAfterViewInit(): void {
    this.displayTemplate = this.noResults;
    this.cd.detectChanges();
  }



  openmodal(content: any) {
    this.modalService.open(content, { size: 'xl' });
  }



  updateSubLocations(selectedLocationId: number) {
    // Find the selected location and set the sub-locations
    const selectedLocation = this.locations.find(location => location.id == selectedLocationId);
    // If a location is selected, set its sub-locations, otherwise, reset the sub-locations
    this.subLocations = selectedLocation ? selectedLocation.jobSubLocations : [];
    console.log(selectedLocation);
    console.log('Job Sub Locations:', selectedLocation?.jobSubLocations);

  }

  resetForm() {
    this.deskForm.reset();
    this.locationfromdata.reset()
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


  onPageChange(newPage: number) {
    console.log('Page changed to:', this.page);
    this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);
  }

  // Called when page size changes
  onPageSizeChange(newPageSize: number) {
    console.log('Page size changed to:', newPageSize);
    console.log(this.page)
    this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);
  }

  onSearchChange(event: any) {

    if (event !== '' && event.length >= 1) {

      this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);
    }

    if (event === '') {
      this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);
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
          // Map the response to match the table fields

          if (this.collectionSize > 0) {
            this.displayTemplate = this.mainContent
          } else if (this.collectionSize === 0) {
            this.displayTemplate = this.noResults
          }

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
    this.router.navigate(['/desk-allocation/deskdetails'], { queryParams: { id: deskid } });
  }

  // Method to handle form submission
  postdesk(deskForm: FormGroup) {
    if (this.deskForm.valid) {
      // Extracting values from the form
      const formValues = this.deskForm.value;

      // Create the payload
      const payload = {
        deskId: formValues.deskName,
        deskStatus: "Available",
        locationId: formValues.locationId,
        subLocationId: formValues.subLocationId,
        createdBy: this.empinfo.employeeId,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        comments: "string",
        status: "",
        items: [
          {
            status: "Unallocated",
            deskAllocatedTo: this.assignEmployeeId,
            allocatedBy: this.empinfo.employeeId,
            allocatedDate: new Date().toISOString(),
            shiftId: this.deskForm.get('shifts')?.value,
            approvalStatus: "Waiting for Approval",
            createdby: this.empinfo.employeeId,
            pendingApprovalHeaderVM: [
              {
                moduleId: 23,
                status: "Waiting for Approval",
                requestedBy: this.empinfo.employeeId
              }
            ],
            pendingRequestsPostVM: [
              {
                moduleId: 23,
                status: "Waiting for Approval",
                requestedDate: new Date().toISOString(),
                requestedBy: this.empinfo.employeeId
              }
            ]
          }
        ]
      };


      console.log('Payload:', payload);
      this.http.postdata("DeskAllocationHeader", payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);

            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Desk added Successfully ');
            this.deskForm.reset()
            setTimeout(() => {
              location.reload();
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error fetching locations', error);
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Desk Name Should be unique.',)
            setTimeout(() => {
              this.openModal(this.createDeskModal)
            }, 2005);
          }
        });
    }
  }
  getdatabyentriyrealse() {
    const params = 'Assets';
    const param = 'release';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.deskrealse.next(statusString.split(',')); // Split string into an array

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
    this.shiftOptions = [];

  }
  // getcount(locationId: string | null, subLocationId: string | null) {
  //   const params = new URLSearchParams();
  //   if (locationId) params.append('locationid', locationId);
  //   if (subLocationId) params.append('sublocationid', subLocationId);

  //   this.http.getData(`DeskAllocationHeader/v1/statuscount?${params.toString()}`).subscribe({
  //     next: (data: any) => {
  //       console.log(data);
  //       const totalCount = data.totalCount || 0;
  //       this.http.setAssetCount(totalCount);
  //       // Debug logs for verification
  //       console.log('Status Counts:', data);
  //       // Assign counts to variables if needed
  //       const aviblecount = data['Available'] || 0;
  //       const Allocatedcontount = data['Allocated'] || 0;
  //       const inactive = data['Inactive'] || 0;
  //       const undermaintnce = data['Under Maintenance'] || 0;
  //       const waitingforapproval = data['Waiting for Approval'] || 0;
  //       this.http.setTotalDeskCount(this.collectionSize ? this.collectionSize : 0);
  //       this.http.setAvailableDeskCount(aviblecount ? aviblecount : 0);
  //       this.http.setAllocatedDeskCount(Allocatedcontount ? Allocatedcontount : 0);
  //       this.http.setundermatinaceDeskCount(undermaintnce ? undermaintnce : 0);
  //       this.http.setinactiveSubjectDeskCount(inactive ? inactive : 0);
  //       this.http.setWFASubjectDeskCount(waitingforapproval ? waitingforapproval : 0);
  //     },
  //     error: (reason: any) => console.log(reason)
  //   });
  // }



  viewdata(data: any) {
    console.log(data); // Log the incoming data for debugging
    this.deskid = data.deskId
    this.http
      .getData(`DeskAllocationHeader/ById?id=${this.deskid}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response.items);

          this.transtiondesk.next(response.items)
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


  postAssignAssets(assignForm: FormGroup) {
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
          this.getAllDesks(this.page, this.pageSize, null, null, null);

          this.assiginForm.reset();
          this.assiginForm.get('employeeName')?.reset()
          this.assiginForm.get('approvid')?.reset()
          this.selectedEmployee = null;
          this.selectedmanerEmployee = null
          this.selectedEmployee = null
          this.shiftOptions = [];
        },
        error: (error) => {
          console.log('Error:', error);

          this.conformationPopup.openSuccessModal(error.error || 'Error occurred during assignment.');

          setTimeout(() => {
            this.openModal(this.assigindesk)
          }, 2000);

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



  // updatedeskitem(reassiginForm: FormGroup) {
  //   if (reassiginForm.valid) {


  //     const payload = {

  //       deskAllocationHeaderId: this.deskid,
  //       deskAllocationItemId: this.deskiteamid,
  //       type:'Reallocated',
  //       reallocatedTo: this.assignEmployeeId,
  //       allocatedBy: this.empinfo.employeeId,
  //       status: 'Released',
  //       releavedDate: new Date(),
  //       releavedBy: this.empinfo.employeeId,



  //     }
  //     console.log('Assignment Payload:', payload);


  //     this.http.putData(`DeskAllocationItem/${this.deskiteamid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
  //       next: (res) => {
  //         console.log(res);
  //         this.modalService.dismissAll();
  //         this.postunAssignAssets(this.reassiginForm)

  //       },
  //       error: (error) => {
  //         console.log('Error:', error);
  //         this.modalService.dismissAll();
  //         this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.');


  //       }
  //     });
  //   } else {
  //     console.log('Form is invalid');
  //   }



  // }


  postunAssignAssets(reassiginForm: FormGroup) {
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
          this.getAllDesks(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId, null);

          this.reassiginForm.reset();
          this.reassiginForm.get('employeeName')?.reset()
          this.reassiginForm.get('approvid')?.reset()
          this.selectedEmployee = null;
          this.selectedmanerEmployee = null
          this.shiftOptions = [];

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

  datesShouldNotBeEqual = false
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
        releavedReason: this.realseForm.get('deskrealse')?.value,


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
          this.modalService.dismissAll();
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
          this.assiginForm.reset();
          this.reportingManager = ''
          setTimeout(() => {
            location.reload();
          }, 2000);

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
            this.assetinactive.next(statusString.split(',')); // Split string into an array

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
            this.deskundermaintence.next(statusString.split(',')); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }


  updatedesk(reassiginForm: FormGroup) {
    if (reassiginForm.valid) {


      // Create the payload for asset assignment
      const payload: any = {
        //deskName: this.selectedAsset.deskName,
        deskStatus: "Allocated",
        createdBy: this.empinfo.employeeId,
        updatedOn: new Date().toISOString(),

      }


      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);

          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Request submitted Successfully')
          // this.getAllDesks(this.page, this.pageSize);
          setTimeout(() => {
            location.reload();
          }, 2000);
          this.reassiginForm.reset();
          this.reportingManager = ''
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

  removedesk(inactiveForm: FormGroup) {
    if (inactiveForm.valid) {

      const payload: any = {
        //deskName: this.selectedAsset.deskName,
        reason: this.inactiveForm.get("assetinactive")?.value,
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
          this.getAllDesks(this.page, this.pageSize, null, null, null);

          this.inactiveForm.reset();
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
  ifreasonnull(Value: any) {
    //console.log(Value)
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }



  viewlocationdata(data: any) {
    console.log(data)
    this.locationfromdata.patchValue({
      perisionlocation: data?.location?.jobLocationName,
      pervessublocation: data?.subLocation?.jobSubLocationName,

    })
  }



  viewasetsdata(data: any) {

    console.log(data);
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
        reason: this.undermaintancedata.get("assetundermatince")?.value,
        deskStatus: "Under Maintenance",
        createdBy: this.empinfo.employeeId,
        updatedOn: new Date().toISOString(),
        comments: this.undermaintancedata.get('reason')?.value,
        toDate: this.undermaintancedata.get('enddate')?.value,
        fromDate: this.undermaintancedata.get('startdate')?.value
      }


      console.log('Assignment Payload:', payload);

      // Send the HTTP POST request
      this.http.putData(`DeskAllocationHeader/${this.deskid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Desk marked as Maintenance Successfully')
          setTimeout(() => {
            location.reload()
          }, 2000);
          this.getAllDesks(this.page, this.pageSize, null, null, null);

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
        // this.getAllDesks(this.page, this.pageSize);
        this.getAllDesks(this.page, this.pageSize, null, null, null);
        setTimeout(() => {
          location.reload();
        }, 2000);

      },
      error: (error) => {
        console.log('Error:', error);
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(error.error?.Message || 'Error occurred during assignment.');


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
        // this.getAllDesks(this.page, this.pageSize);
        this.getAllDesks(this.page, this.pageSize, null, null, null);
        setTimeout(() => {
          location.reload();
        }, 2000);

      },
      error: (error) => {
        console.log('Error:', error);
        this.modalService.dismissAll();
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
