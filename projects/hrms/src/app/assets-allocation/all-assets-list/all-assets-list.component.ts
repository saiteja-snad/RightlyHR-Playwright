import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { AssetTransaction, IAsset, IAssetAllocation, IAssetid, ICategory, IVendor } from '../../Interfaces/assets-management.model';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-all-assets-list',
  imports: [NoDataFoundComponent,CommonModule,FormsModule,ReactiveFormsModule,Select],
  templateUrl: './all-assets-list.component.html',
  styleUrl: './all-assets-list.component.scss'
})
export class AllAssetsListComponent {
  datesShouldNotBeEqual=false
 subscription!: Subscription;
  selectedLocationId: any;
  warrantydateMismatch = false;
  selectedSubLocationId: any;
  loading=false;
  isToggledamc = false;
  isToggledWarranty = false;
  assetForm!: FormGroup;
  assetslist = new BehaviorSubject<IAsset[]>([])
  searchQuery: any;
  dateMismatch = false;
  assetinactivedropdrown:any[]=[]
  minEndDate = ''
  minAmcStartDate = ''
  minAmcEndDate = ''
  amcDateMismatch = false;
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  reassiginForm!: FormGroup
  inactiveForm!: FormGroup
  releaseform!: FormGroup
  assiginForm!: FormGroup;
  Status=''
  destroy$: Subject<boolean> = new Subject<boolean>();
  assetsid :IAssetid[]=[];
  selectedAsset!: any;
  undermainteenceForm!: FormGroup
  locationfromdata!: FormGroup
  assetid: any;
  assetstranstiondata = new BehaviorSubject<AssetTransaction[]>([])
  jobLocationDropDownData: any = [];
  assetsstatusesDropdown:any=[]
  subLocationsDropdown: any = [];
  assetSubCategory: any = [];
  assetCategorys: ICategory[] = [];
  vendor: IVendor[] = [];
  assetsrealsedropdown: any[]=[];
  assignEmployeeId: any;
  employeeiddetails: any;
  loactionid: any;
  sublocation: any;
  assetdataid: any;
  transactionid: any;
  transitionsid: any;
  employeid: any;
 constructor(
  private readonly fb: FormBuilder,
  private readonly http: HttpService,
  private readonly modalService: NgbModal,
  private readonly router: Router,
  public conformationPopup: OpenModalService,

  config: NgbModalConfig) {
  config.backdrop = 'static';
  config.keyboard = false;
}
  empinfo = {} as any
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.getFilteredData()
    this.getassetsCategory()
    this.getjobLocationList()
    this.getvendor()
    this.getdatabyentriy()
    this.getdatabyentriyinactive()
    this.getdatabyentriyrealse()
    this.initialassiginform();
    this.initialreassiginform();
    this.initialinactiveform();
    this.initialReleaseform();
    this.intialfromundermatince();
  }

  initialform() {
    this.assetForm = this.fb.group({
      assetModel: [null, [Validators.required, Validators.maxLength(20)]],
      assetCategory: [{ value: null, disabled: true }, Validators.required],
      assetSubCategory: [{ value: null, disabled: true }, Validators.required],
      assetID: [null],
      vendordetailes: [{ value: null, disabled: true }, Validators.required],
      serialnumber: [null, [Validators.required, Validators.maxLength(30)]],
      purchasedate: [null, Validators.required],
      warrantystartdate: [{ value: null, disabled: true }],
      warrantyenddate: [{ value: null, disabled: true }],
      amcstartdate: [{ value: null, disabled: true }],
      amcenddate: [{ value: null, disabled: true }],
      locationId: [{ value: null, disabled: true }],
      subLocationId: [{ value: null, disabled: true }],
      vendorname: [{ value: null, disabled: true },[]],
      contactnumber: [{ value: null, disabled: true }, []]
    }, {
      validators: [
        this.purchaseDateEqualWarrantyDateValidator(),
        // this.amcDateWithinWarrantyExpiryValidator()
      ]
    }
    )
  }

  intialfromundermatince() {
    this.undermainteenceForm = this.fb.group({
      //reason: [null, [Validators.required, Validators.maxLength(250)]],
      assetsstatatues: [null, Validators.required],
      startdate: [null],
      enddate: [null],
      comments: [null],
      vendorname: [{ value: null, disabled: true }, []],
      contactnumber: [{ value: null, disabled: true }, [Validators.maxLength(10), Validators.pattern("[0-9]+$")]]
    })
  }
  initialassiginform() {
    this.assiginForm = this.fb.group({
      assetID: [null, [Validators.required, Validators.maxLength(20)]],
      mReportingto: [null, Validators.required],

    })
  }


  initialreassiginform() {
    this.reassiginForm = this.fb.group({
      mReportingto: [null, Validators.required],
      assetid: [{ value: null, disabled: true }, Validators.required]
    })
  }
  initialinactiveform() {
    this.inactiveForm = this.fb.group({
      assetsstatatues: [null, Validators.required],
      reason: [null, [Validators.maxLength(250)]]
    })
  }
  initialReleaseform() {
    this.releaseform = this.fb.group({
      assetsstatatue: [null, Validators.required],
      reason: [null, [Validators.maxLength(250)]]
    })
  }

  purchaseDateEqualWarrantyDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const purchaseDate = control.get('purchasedate')?.value;
      const warrantyStartDate = control.get('warrantystartdate')?.value;

      // Check if both dates are available
      if (purchaseDate && warrantyStartDate) {
        const purchaseDateObj = new Date(purchaseDate);
        const warrantyStartDateObj = new Date(warrantyStartDate);

        // Check if the warranty start date is less than the purchase date
        if (warrantyStartDateObj < purchaseDateObj) {
          this.dateMismatch = true;
          return { dateMismatch: true };
        } else {
          this.dateMismatch = false;
        }
      }

      return null;
    };
  }
  openmodal(content: any, ) {
    this.modalService.open(content, { centered: true })

  }
  getFilteredData() {
    this.subscription = this.http.assetslocationId$.subscribe({
      next: (Value: any) => {
        console.log(Value);
        this.selectedLocationId= JSON.parse(localStorage.getItem('locationId') ?? 'null');
        this.selectedSubLocationId = JSON.parse(localStorage.getItem('sublocationId') ?? 'null');
       

        this.getassetsdata(this.page, this.pageSize, Value, this.selectedSubLocationId, this.Status);
      }
    })
  }

  getdatabyentriy() {
    const params = 'Assests';
    const param = 'statuses';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.assetsstatusesDropdown=statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }
  getdatabyentriyinactive() {
    const params = 'Assest';
    const param = 'inactive';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.assetinactivedropdrown=(statusString.split(',')); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }

  getdatabyentriyrealse() {
    const params = 'Assets';
    const param = 'release';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {

            const statusString = data[0].value;
            this.assetsrealsedropdown=statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }

  
  getassetsdata(pagenum: number, pagesize: number, locationid: any, sublocationid: any,Assetsstatus:any) {
    console.log("Fetching data for page:", pagenum, "with page size:", pagesize, "and search query:", this.searchQuery, this.selectedLocationId, this.selectedSubLocationId);

    const params = {
      page: pagenum,
      pageSize: pagesize,
      searchQuery: this.searchQuery,
      locationid: locationid,
      status:Assetsstatus,
      sublocationid: sublocationid
    };

    this.loading = true;

    this.subscription = this.http.getassetsdesk("AssetMaster", params.locationid, params.sublocationid,params.status, params.page, params.pageSize, params.searchQuery).subscribe({
      next: (res: any) => {
        this.assetslist.next(res.items);
        this.loading = false;
        this.collectionSize = res.totalCount;
    
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error fetching assets:', error);
        this.loading = false
        console.log(error);
      

      }
    });
  }
  getvendor() {
    this.http.getData('AssetVendor').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Use regular JavaScript `filter` method
        const filteredVendors = res.filter((vendor: { status: string; }) => vendor.status !== 'Inactive');
        this.vendor = filteredVendors; // Emit the filtered data
      },
      error: (errormessage) => {
        console.error('Error fetching vendors:', errormessage);
      }
    });
  }

  getassetsCategory() {
    this.http
      .getData('AssetCategory?parentId=0').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetCategorys = data;
          console.log(this.assetCategorys)
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  onassetsubcategory() {
    this.assetForm.get('assetSubCategory')?.enable()
    const selectedId = this.assetForm.get('assetCategory')?.value.id;

    this.http
      .getData(`AssetCategory?parentId=${selectedId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetSubCategory = data;

          let selectname = this.assetSubCategory.value.find((item: any) => item.id === selectedId)?.name
          console.log(selectname)

        },

        error: (reason: any) => {
          console.log(reason);
        },
      });
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

  getSubLocationByid(selectedLocation: any): void {

    this.assetForm.get('subLocationId')?.enable()
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
            this.assetForm.patchValue({ subLocation: null });
          },
          error: (err: any) => {
            console.error('Error fetching sub-location data:', err);
            this.subLocationsDropdown = []; // Reset on error
            this.assetForm.patchValue({ subLocation: null }); // Reset the sub-location field
          },
        });
    } else {
      this.subLocationsDropdown = []; // Reset if no location is selected

    }


  }

  postassets(formdata: FormGroup, removeasset: any) {
    if (formdata.valid) {
      // Convert dates to ISO format
      let purchaseDate = new Date(formdata.value.purchasedate).toISOString();

      let currentDate = new Date().toISOString().split('T')[0];

      // Create the initial payload for the asset
      const payload: any = {
        asset: {
          id: removeasset,
          assetid: this.assetid,
          assetModel: formdata.value.assetModel,
          assetCategory: formdata.value.assetCategory.name,
          assetSubCategory: formdata.value.assetSubCategory,
          identificationNumber: formdata.value.assetID,
          serialNumber: formdata.value.serialnumber,
          locationid: this.selectedAsset.locationid,
          sublocationid: this.selectedAsset.sublocationid,
          comments: "string",
          createdBy: parseInt(this.empinfo.employeeId),
          vendorId: formdata.value.vendordetailes,
          purchaseDate: purchaseDate,
        },
      };

      // Conditionally add assetWarranty if toggled
      if (this.isToggledWarranty) {
        payload.assetWarranty = {
          createdAt: currentDate,
          createdBy: parseInt(this.empinfo.employeeId),
          warrantyStartDate: this.assetForm.get('warrantystartdate')?.value,
          warrantyExpiryDate: this.assetForm.get('warrantyenddate')?.value,
        };
      }

      // Conditionally add assetAMC if toggled
      if (this.isToggledamc) {
        payload.assetAMC = {
          startDate: this.assetForm.get('amcstartdate')?.value,
          endDate: this.assetForm.get('amcenddate')?.value,
          createdAt: currentDate,
          createdBy: parseInt(this.empinfo.employeeId),
          phoneNumber: this.assetForm.get('contactnumber')?.value,
          name: this.assetForm.get('vendorname')?.value,
        };
      }

      // Debug the payload (optional)
      console.log(payload);
      console.log('Payload:', payload);
      this.http.putData(`AssetMaster/update/${removeasset}?assetId=${removeasset}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset Updated Successfully ');
          this.getassetsdata(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId,this.Status);
          this.assetForm.reset();
        },
        error: (error) => {
        
          this.conformationPopup.openErrorModal(error.error?.message || 'Error occurred while adding.',)

          
        },
        complete: () => {
        
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }


  onToggleChangeamc(event: Event) {
    this.isToggledamc = (event.target as HTMLInputElement).checked;
    this.toggleAmcFields(this.isToggledamc, true); // Reset values only when explicitly toggled by the user
    if ( this.isToggledamc) {

      this.assetForm.get('amcstartdate')?.enable();
      this.assetForm.get('amcenddate')?.enable();
      this.assetForm.get('vendorname')?.enable();
      this.assetForm.get('contactnumber')?.enable();
     

      this.assetForm.get('warrantystartdate')?.setValidators([Validators.required]);
      this.assetForm.get('warrantyenddate')?.setValidators([Validators.required]);
      this.assetForm.get('amcstartdate')?.setValidators([Validators.required]);
      this.assetForm.get('amcenddate')?.setValidators([Validators.required]);
      this.assetForm.get('vendorname')?.setValidators([Validators.required, Validators.pattern(/^(?!\s*$).+/)]);
      this.assetForm.get('contactnumber')?.setValidators([Validators.required,Validators.maxLength(10),Validators.minLength(10)]);
    } else {
      this.assetForm.get('amcstartdate')?.disable();
      this.assetForm.get('amcenddate')?.disable();
      this.assetForm.get('contactnumber')?.disable();
      this.assetForm.get('vendorname')?.disable();
      

      this.assetForm.get('amcstartdate')?.clearValidators();
      this.assetForm.get('amcstartdate')?.clearValidators();
      this.assetForm.get('contactnumber')?.clearValidators();
      this.assetForm.get('vendorname')?.clearValidators();
      this.assetForm.get('warrantystartdate')?.clearValidators();
      this.assetForm.get('warrantyenddate')?.clearValidators();
    }
    this.assetForm.get('amcstartdate')?.updateValueAndValidity();
    this.assetForm.get('amcenddate')?.updateValueAndValidity();
     this.assetForm.get('contactnumber')?.updateValueAndValidity();
    this.assetForm.get('vendorname')?.updateValueAndValidity();
    this.assetForm.get('warrantystartdate')?.updateValueAndValidity();
    this.assetForm.get('warrantyenddate')?.updateValueAndValidity();



  }
  toggleAmcFields(enable: boolean, resetValues: boolean = false) {
    const amcFields = ['amcstartdate', 'amcenddate', 'vendorname', 'contactnumber'];

    amcFields.forEach(field => {
      if (enable) {
        this.assetForm.get(field)?.enable();
      } else {
        this.assetForm.get(field)?.disable();
      }

    });
  }


  onToggleChangeWarranty(event: Event) {
    this.isToggledWarranty = (event.target as HTMLInputElement).checked;
    this.toggleWarrantyFields(this.isToggledWarranty, true); // Reset values only when explicitly toggled by the user
    if (this.isToggledWarranty) {
      // Enable fields and set validators
      this.assetForm.get('warrantystartdate')?.enable();
      this.assetForm.get('warrantyenddate')?.enable();

      this.assetForm.get('warrantystartdate')?.setValidators([Validators.required]);
      this.assetForm.get('warrantyenddate')?.setValidators([Validators.required]);
    } else {
      // Disable fields and clear validators
      this.assetForm.get('warrantystartdate')?.disable();
      this.assetForm.get('warrantyenddate')?.disable();

      //  this.assetForm.get('warrantystartdate')?.reset();
      //     this.assetForm.get('warrantyenddate')?.reset();
      this.assetForm.get('warrantystartdate')?.clearValidators();
      this.assetForm.get('warrantyenddate')?.clearValidators();
    }

    // Update the validity of the form controls after setting validators
    this.assetForm.get('warrantystartdate')?.updateValueAndValidity();
    this.assetForm.get('warrantyenddate')?.updateValueAndValidity();

  }

 

  toggleWarrantyFields(enable: boolean, resetValues: boolean = false) {
    const warrantyFields = ['warrantystartdate', 'warrantyenddate'];

    warrantyFields.forEach(field => {
      if (enable) {
        this.assetForm.get(field)?.enable();
      } else {
        this.assetForm.get(field)?.disable();
      }

      
    });
  }
  isToggledvender = false;
  onToggleChangevender(event: Event) {
    this.isToggledvender = (event.target as HTMLInputElement).checked;
    this.toggleverderyFields(this.isToggledvender, true)

    if (this.isToggledvender) {
      this.undermainteenceForm.get('vendorname')?.enable();
      this.undermainteenceForm.get('contactnumber')?.enable();
      this.undermainteenceForm.get('vendorname')?.setValidators([Validators.required]);
      this.undermainteenceForm.get('contactnumber')?.setValidators([Validators.required]);;


    } else {
      this.undermainteenceForm.get('vendorname')?.disable();
      this.undermainteenceForm.get('contactnumber')?.disable();
     
      this.undermainteenceForm.get('vendorname')?.clearValidators();
      this.undermainteenceForm.get('contactnumber')?.clearValidators();

    }
    this.undermainteenceForm.get('vendorname')?.updateValueAndValidity();
    this.undermainteenceForm.get('contactnumber')?.updateValueAndValidity();

  }


  toggleverderyFields(enable: boolean, resetValues: boolean = false) {
    const warrantyFields = ['vendorname', 'contactnumber'];

    warrantyFields.forEach(field => {
      if (enable) {
        this.assetForm.get(field)?.enable();
      } else {
        this.assetForm.get(field)?.disable();
      }

      if (resetValues) {
        this.assetForm.get(field)?.reset();
      }
    });
  }


  
  onStartDateChange(): void {
    const startDate = this.assetForm.get('warrantystartdate')?.value;

    if (startDate) {
      this.minEndDate = startDate;
    }
    this.checkDateMismatch();
  }
  onStartDateChangeamc(): void {
    const expiryDate = this.assetForm.get('warrantyexpirydate')?.value;
    if (expiryDate) {
      this.minAmcStartDate = expiryDate;
      this.minAmcEndDate = expiryDate;
    }
    this.checkAmcDateMismatch();
  }

  checkDateMismatch(): void {
    const startDate = this.assetForm.get('warrantystartdate')?.value;
    const endDate = this.assetForm.get('warrantyenddate')?.value;
    if (startDate && endDate) {
      this.warrantydateMismatch = new Date(endDate) <= new Date(startDate);
    } else {
      this.warrantydateMismatch = false;
    }
  }

  checkAmcDateMismatch(): void {
    const expiryDate = this.assetForm.get('warrantyexpirydate')?.value;
    const amcStartDate = this.assetForm.get('amcstartdate')?.value;
    const amcEndDate = this.assetForm.get('amcenddate')?.value;

    if (expiryDate && amcStartDate && amcEndDate) {
      const expiryDateObj = new Date(expiryDate);
      const amcStartDateObj = new Date(amcStartDate);
      const amcEndDateObj = new Date(amcEndDate);

      this.amcDateMismatch = amcStartDateObj < expiryDateObj || amcEndDateObj > expiryDateObj;
    } else {
      this.amcDateMismatch = false;
    }
  }

  amcDateWithinWarrantyExpiryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const warrantyExpiryDate = control.get('warrantyexpirydate')?.value;
      const amcStartDate = control.get('amcstartdate')?.value;
      const amcEndDate = control.get('amcenddate')?.value;

      if (warrantyExpiryDate && amcStartDate && amcEndDate) {
        const warrantyExpiryDateObj = new Date(warrantyExpiryDate);
        const amcStartDateObj = new Date(amcStartDate);
        const amcEndDateObj = new Date(amcEndDate);

        if (amcStartDateObj < warrantyExpiryDateObj || amcEndDateObj > warrantyExpiryDateObj) {

          this.amcDateMismatch = true;
          console.log(this.amcDateMismatch)
          return { amcDateMismatch: true };
        } else {
          this.amcDateMismatch = false;
        }
      }
      return null;
    };
  }

  isInputStarted: boolean = false;


  viewasetsdata(data: any) {

    this.loactionid = data.locationid;
    this.sublocation = data.sublocationid;
    this.getEmployeedata();
    this.getassetsid()

  }
  getassetsid() {
    if (!this.loactionid || !this.sublocation) {
      return;
    }
    this.http.getData(`AssetsData/getassetlocnsub?locationId=${this.loactionid}&subLocationId=${this.sublocation}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Filter only assets that are active and not deleted
        const filteredAssets = res.filter((asset: any) => asset.status === 'Active' && !asset.isDeleted);
        this.assetsid=filteredAssets;
      },
      error: (errormessage) => {
        console.log(errormessage);
      }
    });
  }

  getEmployeedata() {

    if (!this.loactionid || !this.sublocation) {
      return;
    }

    this.http.getData(`JobDetails/empslocansublocation?locationId=${this.loactionid}&sublocationId=${this.sublocation}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
          this.employeeiddetails = data.map((employee: any) => ({
            employeeId: employee.employeeId, 
            fusionEmployeeId: employee.fusionEmployeeId ?? '', 
            employeeName: employee.employeeName,
            displayText: `${employee.fusionEmployeeId ?? ''} - ${employee.employeeName}` // Create formatted string
          }));
        
        },

        error: (reason: any) => {

          console.log(reason);

        },

      });

  }

  
  postAssignAssets(assignForm: FormGroup, removeAsset: number) {
    if (assignForm.valid) {
      // Create the payload for the asset assignment
      const payload: IAssetAllocation = {
        assetId: removeAsset,
        employeeId: this.assignEmployeeId,
        allocatedDate: new Date(),
        assetDataId: this.assiginForm.get('assetID')?.value,
        status: 'Allocated',
        createdBy: parseInt(this.empinfo.employeeId),
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.postdata('AssetTransaction', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.updateAssets(assignForm, removeAsset);

            this.assiginForm.reset();
         
          },
          error: (error) => {
            console.error("Error assigning asset:", error);
            this.conformationPopup.openErrorModal(error.error.message)

        
          },
        
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }


  updatereallowed(reassiginForm: FormGroup, removeAsset: any) {
    if (reassiginForm.valid) {
      // Create the payload for the asset assignment
      const payload: any = {
        id: this.transactionid,
        assetId: removeAsset,
        employeeId: this.assignEmployeeId,
        returnDate: new Date(),
        assetDataId: this.assetdataid,
        status: 'Released',
        createdBy: parseInt(this.empinfo.employeeId),
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.putData(`AssetTransaction/${this.transactionid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.postreAssignAssets(reassiginForm, removeAsset);

          },
          error: (error) => {
            console.error("Error assigning asset:", error);
            this.conformationPopup.openErrorModal(error.error)

           
          },

        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }
  postreAssignAssets(reassiginForm: FormGroup, removeAsset: number) {
    if (reassiginForm.valid) {
      // Create the payload for the asset assignment
      const payload: IAssetAllocation = {
        assetId: removeAsset,
        employeeId: this.assignEmployeeId,
        allocatedDate: new Date(),
        assetDataId: this.assetdataid,
        status: 'Allocated',
        createdBy: parseInt(this.empinfo.employeeId),
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.postdata('AssetTransaction', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.conformationPopup.openSuccessModal('Asset Allocated Successfully')

            this.reassiginForm.reset();
          

          },
          error: (error) => {
            console.error("Error assigning asset:", error);
            this.conformationPopup.openErrorModal(error.error.message)

          },
          complete: () => {
            setTimeout(() => {
              window.location.reload()
            }, 2000);
          },
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }
  viewasset(id: any) {
   
    console.log('Fetching asset with ID:', id);

    // Fetch asset details by ID
    this.http.getData(`AssetMaster/${id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log('Asset data retrieved and form patched:', data);

        // Check if there are any transactions
        const transactions = data.transactions;
        if (transactions && transactions.length > 0) {
          // Get the last transaction in the array
          const lastTransaction = transactions[transactions.length - 1];
          this.assetdataid = lastTransaction.assetDataId;
          this.transactionid = lastTransaction.id

          // Patch the form with values from the last transaction
          this.reassiginForm.patchValue({
            assetid: lastTransaction.assetIdName
          });

          console.log('Last Transaction:', lastTransaction);
        } else {
          console.warn('No transactions found for asset ID:', id);
        }
      },
      error: (err) => {
        console.log('Error fetching asset data:', err);
      }
    });
  }
  updaterealse(releaseform: FormGroup, removeAsset: any) {
    if (releaseform.valid) {
      // Create the payload for the asset assignment
      const payload: any = {
        id: this.transactionid,
        assetId: removeAsset,
        employeeId: this.employeid,
        returnDate: new Date(),
        status: 'Released',
        assetDataId: this.assetdataid,
        createdBy: parseInt(this.empinfo.employeeId),
        reason: this.releaseform.controls['assetsstatatue']?.value,
        additionalComments: this.releaseform.controls['reason']?.value
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.putData(`AssetTransaction/${this.transactionid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.updaterealseAssets(releaseform, removeAsset)
            this.releaseform.reset()

          },
          error: (error) => {
            console.error("Error assigning asset:", error);

            this.releaseform.reset();

          },
          complete: () => {
            setTimeout(() => {
              window.location.reload()
            }, 2000);
          },
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }


  updaterealseAssets(releaseform: FormGroup, assetId: number) {
    if (releaseform.valid) {

      console.log(this.selectedAsset);
      const payload = {
        "asset": {
          id: assetId,
          assetModel: this.selectedAsset.assetModel,
          assetCategory: this.selectedAsset.assetCategory,
          assetSubCategory: this.selectedAsset.assetSubCategory,
          identificationNumber: this.selectedAsset.identificationNumber,
          serialNumber: this.selectedAsset.serialNumber,
          status: "Available",
          createdAt: new Date().toISOString(),
          createdBy: this.selectedAsset.createdBy,
          vendorId: this.selectedAsset.vendorId,
          purchaseDate: this.selectedAsset.purchaseDate,
        }

      };
      console.log('Payload for asset update:', payload);

      this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log("Update Response:", res);

            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Released Successfully ');
           
            this.getassetsdata(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId);
          },
          error: (error) => {
            console.error("Error updating asset:", error);

            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal("Asset Assigned Failed")

          },
          complete: () => {
            setTimeout(() => {
              window.location.reload()
            }, 2000);
          },
        });
    } else {
      console.log('Update form is invalid.');
    }
  }
  selectedEmployee: any
  onEmployeeSelect(event: any) {
    this.selectedEmployee = event
    this.assignEmployeeId = event?.employeeId;
    console.log(this.assignEmployeeId)
  }

  updateAssets(assignForm: FormGroup, assetId: number) {
    if (assignForm.valid) {

      console.log(this.selectedAsset);
      const payload = {
        "asset": {
          id: assetId,
          assetModel: this.selectedAsset.assetModel,
          assetCategory: this.selectedAsset.assetCategory,
          assetSubCategory: this.selectedAsset.assetSubCategory,
          identificationNumber: this.selectedAsset.identificationNumber,
          serialNumber: this.selectedAsset.serialNumber,
          status: "Allocated",
          createdAt: new Date().toISOString(),
          createdBy: this.selectedAsset.createdBy,
          vendorId: this.selectedAsset.vendorId,
          purchaseDate: this.selectedAsset.purchaseDate,
        }

      };
      console.log('Payload for asset update:', payload);

      this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log("Update Response:", res);

            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Allocated Successfully ');
        
            this.getassetsdata(this.page, this.pageSize, this.selectedLocationId, this.selectedSubLocationId);
          },
          error: (error) => {
            console.error("Error updating asset:", error);

            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal("Asset Assigned Failed")

          }
        });
    } else {
      console.log('Update form is invalid.');
    }
  }



  postinactive(inactiveForm: FormGroup, removeAsset: number) {
    if (inactiveForm.valid) {
      // Create the payload for the asset assignment
      const payload: any = {
        assetId: removeAsset,
        employeeId: parseInt(this.empinfo.employeeId),
        status: 'Inactive',
        assetDataId: this.selectedAsset.assetDataId,

        reason: inactiveForm.value.assetsstatatues,
        createdBy: parseInt(this.empinfo.employeeId),

        additionalComments: this.inactiveForm.get('comments')?.value
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.postdata('AssetTransaction', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.removeassets(inactiveForm, removeAsset);

          },
          error: (error) => {
            console.error("Error assigning asset:", error);

            // this.assiginForm.reset();
            // setTimeout(() => {
            //   this.openModal(this.assiginassets,true);
            // }, 2005);
          },

        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }

  viewassetdata(assetId: any) {
    this.http.getData(`AssetTransaction?assetId=${assetId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Ensure that the response data matches the AssetTransaction type
          if (Array.isArray(res) && res.length > 0) {
            this.assetid = assetId;
            this.assetstranstiondata.next(res);

            // Set data in BehaviorSubject
            const lastTransaction = res[res.length - 1];
            const employeeName = `${lastTransaction.firstName} ${lastTransaction.lastName}`.trim();
            console.log(lastTransaction)
            this.employeid = lastTransaction.employeeId
            this.transitionsid = lastTransaction.id;
            console.log(this.transitionsid)
            // this.reassiginForm.patchValue({
            //   mReportingto: employeeName,
            //   employeeID: lastTransaction.fusionEmpId,


            // });
            let assignedToData: any[] = [];

            res.forEach((assetTransaction: AssetTransaction) => {
              if (assetTransaction.assignedTo) {
                const assignedTo = assetTransaction.assignedTo;
                const employeeName = `${assignedTo.firstName} ${assignedTo.lastName}`.trim();
                const employeeID = assignedTo.employeeId;
                const transactionID = assignedTo.transactionId;

                assignedToData.push({
                  employeeName: employeeName,
                  employeeID: employeeID,
                  email: assignedTo.emailaddress,
                  fusionEmpId: assignedTo.fusionEmpId,
                  transactionID: transactionID,
                });

              }
            });

          
          } else {
         
            console.log('No asset transaction data found.');
            // this.openModal(this.successhide, true)
          }
        },
        error: (errorMessage) => {
          console.log('Error fetching data:', errorMessage);
        }
      });
  }
  removeassets(inactiveForm: FormGroup, deletid: any) {
    if (inactiveForm.valid) {
      console.log(this.selectedAsset);

      const payload = {
        "asset": {
          id: deletid,
          assetid: this.assetid,
          assetModel: this.selectedAsset.assetModel,
          assetCategory: this.selectedAsset.assetCategory,
          assetSubCategory: this.selectedAsset.assetSubCategory,
          identificationNumber: this.selectedAsset.identificationNumber,
          serialNumber: this.selectedAsset.serialNumber,
          status: "Inactive",
          createdBy: this.selectedAsset.createdBy,
          vendorId: this.selectedAsset.vendorId,
          purchaseDate: this.selectedAsset.purchaseDate,
          comments: inactiveForm.value.reason
        }
      }
        ;

      console.log('Payload for asset update:', payload);

      this.http.putData(`AssetMaster/update/${deletid}?assetId=${deletid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log(res);
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset marked as Inactivated Successfully');
          setTimeout(() => {
            window.location.reload()
          }, 2000);
            this.inactiveForm.reset()
          },
          error: (err) => {
            console.error('Error deleting asset:', err);

            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal('Failed to Update data')

          }
        });
    }
  }

  postudermaitence(undermainteenceForm: FormGroup, removeAsset: number) {
    if (undermainteenceForm.valid) {
      // Create the payload for the asset assignment
      const payload: any = {
        assetId: removeAsset,
        employeeId: parseInt(this.empinfo.employeeId),
        status: 'Under Maintenance',
        vendorId: this.selectedAsset.vendorId,
        fromDate: undermainteenceForm.value.startdate,
        toDate: this.undermainteenceForm.get('enddate')?.value,
        reason: undermainteenceForm.value.assetsstatatues,
        createdBy: parseInt(this.empinfo.employeeId),
        vendorName: this.undermainteenceForm.get('vendorname')?.value,
        vendorContactNumber: this.undermainteenceForm.get('contactnumber')?.value,
        additionalComments: this.undermainteenceForm.get('comments')?.value
      };

      console.log("Payload for assignment:", payload);
      console.log(this.selectedAsset);

      this.http.postdata('AssetTransaction', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
            this.updateundermaitence(undermainteenceForm, removeAsset);

          },
          error: (error) => {
            console.error("Error assigning asset:", error);

            // this.assiginForm.reset();
            // setTimeout(() => {
            //   this.openModal(this.assiginassets,true);
            // }, 2005);
          },
        
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }

  updateundermaitence(inactiveForm: FormGroup, assetId: number) {


    console.log(this.selectedAsset);
    const payload = {
      'asset': {
        id: assetId,
        employeeId: parseInt(this.empinfo.employeeId),
        status: "Under Maintenance",
        createdAt: new Date().toISOString(),
        createdBy: this.selectedAsset.createdBy,
        vendorId: this.selectedAsset.vendorId,
        fromDate: this.selectedAsset.fromDate,
        toDate: this.selectedAsset.toDate,
        reason: this.selectedAsset.reson,
        additionalComments: this.selectedAsset.additionalComments,
        vendorContactNumber: this.selectedAsset.vendorContactNumber,
        vendorName: this.selectedAsset.vendorName
      }


    };
    console.log('Payload for asset update:', payload);

    this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log("Update Response:", res);
          this.undermainteenceForm.reset()
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset marked as Maintenance Successfully ');
          setTimeout(() => {
            location.reload()
          }, 2000);
      

          //this.getassetsdata(this.page, this.pageSize);
        },
        error: (error) => {
          console.error("Error updating asset:", error);

          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal("Asset Maintenance Failed")

        }
      });

  }
}
