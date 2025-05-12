import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { AssetTransaction, IAsset, IAssetAllocation, IAssetid, ICategory, IVendor } from '../../Interfaces/assets-management.model';
import { Select } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';

import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
@Component({
  selector: 'app-all-assets-list',
  imports: [NoDataFoundComponent, CommonModule, FormsModule, PaginatorModule, DropdownModule, ReactiveFormsModule, Select, DataLoaderContentComponent],
  templateUrl: './all-assets-list.component.html',
  styleUrl: './all-assets-list.component.scss',
  providers: [DatePipe]
})
export class AllAssetsListComponent {
  datesShouldNotBeEqual = false
  subscription!: Subscription;
  selectedLocationId: any;
  selectedSubLocationId: any;
  first:any = 1;
  rows:any = 10;
  totalRecords = 100;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  loading = false;
  storeassetid: any
  warrantydateMismatch = false;
  isToggledamc = false;
  isToggledWarranty = false;
  assetForm!: FormGroup;
  assetslist = new BehaviorSubject<IAsset[]>([])
  searchQuery='';
  dateMismatch = false;
  assetinactivedropdrown: any[] = []
  minEndDate = ''
  minAmcStartDate = ''
  minAmcEndDate = ''
  amcDateMismatch = false;
  reassiginForm!: FormGroup
  inactiveForm!: FormGroup
  releaseform!: FormGroup
  assiginForm!: FormGroup;
  Status = ''
  destroy$: Subject<boolean> = new Subject<boolean>();
  assetsid: IAssetid[] = [];
  selectedAsset!: any;
  undermainteenceForm!: FormGroup
  locationfromdata!: FormGroup
  assetid: any;
  assetstranstiondata = new BehaviorSubject<AssetTransaction[]>([])
  jobLocationDropDownData: any = [];
  assetsundermaintanceDropdown: any = []
  subLocationsDropdown: any = [];
  assetSubCategory: any = [];
  assetCategorys: ICategory[] = [];
  vendor: IVendor[] = [];
  assetsrealsedropdown: any[] = [];
  assignEmployeeId: any;
  employeeiddetails: any;
  loactionid: any;
  sublocation: any;
  assetdataid: any;
  transactionid: any;
  transitionsid: any;
  employeid: any;
  minpurchesDate: any;
  maxpurchesDate: any;
  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private readonly router: Router,
    public conformationPopup: OpenModalService, public formValidation: FormValidationService,public rbac: RbacService,
    private readonly datepipe: DatePipe,
   
    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  empinfo = {} as any
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.getFilteredData();
    this.getassetsCategory();
    this.getjobLocationList();
    this.getvendor();
    this.initialform();
    this.getdatabyentriy();
    this.getdatabyentriyinactive();
    this.getdatabyentriyrealse();
    this.initialassiginform();
    this.initialreassiginform();
    this.initialinactiveform();
    this.initialReleaseform();
    this.intialfromundermatince();
    this.intialtransferfrom();
    const today = new Date();
  // Set max to today's date
  this.maxpurchesDate = today.toISOString().split('T')[0];
  // Set min to Jan 1st of the current year
  const startOfYear = new Date(today.getFullYear(), 0, 1); 
  this.minpurchesDate = startOfYear.toISOString().split('T')[0];
    this.http.assetDetailesadded$.subscribe(() => {
      this.getFilteredData(); 
    });
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
      vendorname: [{ value: null, disabled: true }, []],
      contactnumber: [{ value: null, disabled: true }, []]
    }, {
      validators: [
        this.purchaseDateEqualWarrantyDateValidator(),
        // this.amcDateWithinWarrantyExpiryValidator()
      ]
    }
    )
  }

  intialtransferfrom() {
    this.locationfromdata = this.fb.group({
      perisionlocation: [{ value: null, disabled: true }],
      pervessublocation: [{ value: null, disabled: true }],
      locationId: [null, Validators.required],
      subLocationId: [{ value: null, disabled: true }, Validators.required],
      comments: [null]

    });
  }

  intialfromundermatince() {
    this.undermainteenceForm = this.fb.group({
      //reason: [null, [Validators.required, Validators.maxLength(250)]],
      assetsstatatues: [null, Validators.required],
      startdate: [null],
      enddate: [null],
      comments: [null],
      vendorname: [{ value: null, disabled: true }, []],
      contactnumber: [{ value: null, disabled: true }, [Validators.maxLength(15),Validators.minLength(10), Validators.pattern("[0-9]+$"),this.allZeroesIfMaxLength()]]
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
  openModal(content: any,) {
    this.modalService.open(content, { centered: true })

  }
  navigateToAsset(assetId: any) {
    this.router.navigate(['/assets-management/view-assets-details'],{ queryParams: { id: assetId }});
  }


   onRowsChange() {
      this.first = 1;
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
  
    }
    onPageChange(event: PaginatorState) {
      const page = event.page ?? 0;
      const rows = event.rows ?? 10;
      this.rows = rows;
      // Calculate first record index (0-based), then add 1 to make it 1-based
      this.first = page * rows + 1;
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }


  getFilteredData() {
    this.subscription = this.http.assetslocationId$.subscribe({
      next: (Value: any) => {
        console.log(Value);
        this.selectedLocationId = JSON.parse(localStorage.getItem('assetlocationId') ?? 'null');
        this.selectedSubLocationId = JSON.parse(localStorage.getItem('assetsublocationId') ?? 'null');
        this.getassetsdata(this.first, this.rows, Value, this.selectedSubLocationId, this.Status);
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
            this.assetsundermaintanceDropdown = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

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
            this.assetinactivedropdrown = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

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
            this.assetsrealsedropdown = statusString.split(',').map((type: any) => ({ value: type })); // Split string into an array

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
    this.assiginForm.reset();
    this.selectedEmployee = null;
    this.reassiginForm.reset()
    this.locationfromdata.reset()
  }

  conformationpoppup() {
    this.modalService.dismissAll()
    this.assetForm.reset();
    this.undermainteenceForm.reset()
    this.inactiveForm.reset()
    this.releaseform.reset()
    this.isToggledvender = false
  }

  getassetsdata(pagenum: number, pagesize: number, locationid: any, sublocationid: any, Assetsstatus: any) {

    const params = {
      first: pagenum,
      rows: pagesize,
      searchQuery: this.searchQuery,
      locationid: locationid,
      status: Assetsstatus,
      sublocationid: sublocationid
    };
    this.loading = true;
    this.subscription = this.http.getassetsdesk("AssetMaster", params.locationid, params.sublocationid, params.status, params.first, params.rows, params.searchQuery).subscribe({
      next: (res: any) => {
        this.assetslist.next(res.items);
        this.loading = false;
        this.totalRecords = res.totalCount;
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error fetching assets:', error);
        this.loading = false

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
    const selectedId = this.assetForm.get('assetCategory')?.value
    this.http.getData(`AssetCategory?parentId=${selectedId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetSubCategory = data;
          let selectname = this.assetSubCategory.value.find((item: any) => item.id === selectedId)?.name
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
    this.locationfromdata.get('subLocationId')?.enable()
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
  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }
  onSearchChange(event: any) {

    if (event !== '' && event.length >= 1) {
      // localStorage.setItem('assetsdata', JSON.stringify(this.assets.value))
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
    if (event === '') {
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
  }

  updateanasset(formdata: FormGroup, storeassetid: any) {
    if (formdata.valid) {
      // Convert dates to ISO format
      let purchaseDate = new Date(formdata.value.purchasedate).toISOString();

      let currentDate = new Date().toISOString().split('T')[0];
      // Create the initial payload for the asset
      const payload: any = {
        asset: {
          id: storeassetid,
          assetid: this.assetid,
          assetModel: formdata.value.assetModel,
          assetCategory: formdata.value.assetCategory,
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
      this.http.putData(`AssetMaster/update/${storeassetid}?assetId=${storeassetid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset Updated Successfully ');
          this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
          this.assetForm.reset();
        },
        error: (error) => {
          this.conformationPopup.openErrorModal(error.error?.message || 'Error occurred while adding.',)
        },

      });
    } else {
      console.log('Form is invalid');
    }
  }


  onToggleChangeamc(event: Event) {
    this.isToggledamc = (event.target as HTMLInputElement).checked;
    this.toggleAmcFields(this.isToggledamc, true); // Reset values only when explicitly toggled by the user
    if (this.isToggledamc) {

      this.assetForm.get('amcstartdate')?.enable();
      this.assetForm.get('amcenddate')?.enable();
      this.assetForm.get('vendorname')?.enable();
      this.assetForm.get('contactnumber')?.enable();


      this.assetForm.get('warrantystartdate')?.setValidators([Validators.required]);
      this.assetForm.get('warrantyenddate')?.setValidators([Validators.required]);
      this.assetForm.get('amcstartdate')?.setValidators([Validators.required]);
      this.assetForm.get('amcenddate')?.setValidators([Validators.required]);
      this.assetForm.get('vendorname')?.setValidators([Validators.required, Validators.pattern(/^(?!\s*$).+/)]);
      this.assetForm.get('contactnumber')?.setValidators([Validators.required, Validators.maxLength(15), Validators.minLength(10),this.allZeroesIfMaxLength()]);
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

//if user put only zero multipul times mobile no field
allZeroesIfMaxLength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value || '');
    if (/^0{10,}$/.test(value)) {
      return { allZeroesIfMaxLength: true };
    }
    return null;
  };
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
        this.assetsid = filteredAssets;
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
          ...employee,
          employeeName: `${employee.fusionEmployeeId ?? ''}- ${employee.employeeName} `,

        }));
        console.log(this.employeeiddetails);
      },
      error: (reason: any) => {
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
      this.http.postdata('AssetTransaction', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log("Assignment Response:", res);
            // Call the updateAssets function if the assignment is successful
           this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Allocated Successfully')
            this.reassiginForm.reset();
          },
          error: (error) => {
            console.error("Error assigning asset:", error);
            this.conformationPopup.openErrorModal(error.error.message)
          },
          complete: () => {
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
          },
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }
  viewasset(id: any) {
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
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
          },
        });
    } else {
      console.log("Assignment Form is invalid.");
    }
  }


  updaterealseAssets(releaseform: FormGroup, assetId: number) {
    if (releaseform.valid) {
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
      this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Released Successfully ');
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
            this.getcount(null,null,this.Status);

          },
          error: (error) => {
            this.conformationPopup.openErrorModal("Asset Assigned Failed")
          },

        });
    } else {
      console.log('Update form is invalid.');
    }
  }
  selectedEmployee: any
  onEmployeeSelect(event: any) {
    this.selectedEmployee = event
    this.assignEmployeeId = event?.value.employeeId;
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
      this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {

            this.modalService.dismissAll();
            this.getcount(null,null,this.Status);
            this.conformationPopup.openSuccessModal('Asset Allocated Successfully ');
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
           
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

  updatetranferlocation(locationfromdata: FormGroup, assetId: number) {
    if (locationfromdata.valid) {
      console.log('Selected Asset:', this.selectedAsset);
      const payload = {
        assetModel: this.selectedAsset.assetModel,
        assetCategory: this.selectedAsset.assetCategory,
        assetSubCategory: this.selectedAsset.assetSubCategory,
        identificationNumber: this.selectedAsset.identificationNumber,
        serialNumber: this.selectedAsset.serialNumber,
        status: this.selectedAsset.status,
        createdBy: this.selectedAsset.createdBy,
        vendorId: this.selectedAsset.vendorId,
        purchaseDate: this.selectedAsset.purchaseDate,
        locationid: this.locationfromdata.get('locationId')?.value.id, // Selected location ID
        sublocationid: this.locationfromdata.get('subLocationId')?.value, // Selected sub-location ID
        transferReason: locationfromdata.get('comments')?.value
      };

      console.log('Payload for asset update:', payload);

      this.http.putData(`AssetMaster/assettransfer?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Transferred  Successfully ');
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
            this.getcount(null,null,this.Status);
            this.locationfromdata.reset();
          },
          error: (error) => {
            console.error("Error updating asset:", error);
            this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred while Asset Unassigned.',)
          }
        });
    } else {
      console.log('Update form is invalid.');
    }
  }


  updateAssetsmaster(reassigndata: FormGroup, assetId: number) {
    if (reassigndata.valid) {
      console.log('Selected Asset:', this.selectedAsset);

      const payload = {
        id: assetId,
        assetModel: this.selectedAsset.assetModel,
        assetCategory: this.selectedAsset.assetCategory,
        assetSubCategory: this.selectedAsset.assetSubCategory,
        identificationNumber: this.selectedAsset.identificationNumber,
        serialNumber: this.selectedAsset.serialNumber,
        status: "Reallocated",
        createdBy: this.selectedAsset.createdBy,
        vendorId: this.selectedAsset.vendorId,
        purchaseDate: this.selectedAsset.purchaseDate,

      };

      console.log('Payload for asset update:', payload);

      this.http.putData(`AssetMaster/update/${assetId}?assetId=${assetId}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log("Asset update response:", res);

            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Reallocated Successfully ');
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
            this.getcount(null,null,this.Status);
          },
          error: (error) => {
            console.error("Error updating asset:", error);
            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred while Asset Unassigned.',)

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
            this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
            this.getcount(null,this.selectedSubLocationId,this.Status);
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
           
             this.getcount(null,null,this.Status);
               this.getassetsdata(this.first, this.rows,null, null, this.Status);
          },
          error: (error) => {

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
          this.getcount(null,null,this.Status);
 this.getassetsdata(this.first, this.rows,null, null, this.Status);
        },
        error: (error) => {
          console.error("Error updating asset:", error);

          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal("Asset Maintenance Failed")

        }
      });

  }

  viewupdate(data: any) {
    console.log(data);
    // Patching form values
    this.assetForm.patchValue({
      locationId: data.locationName,
      subLocationId: data.sublocationName,
      assetModel: data.assetModel,
      assetCategory: data.assetCategoryid,
      assetSubCategory: data.assetCategoryid,
      serialnumber: data.serialNumber,
      vendordetailes: data.vendorId,
      purchasedate: this.datepipe.transform(data.purchaseDate, 'yyyy-MM-dd'),
      warrantystartdate: data.assetWarranties?.[0]?.warrantyStartDate
        ? this.datepipe.transform(data.assetWarranties[0].warrantyStartDate, 'yyyy-MM-dd')
        : null,
      warrantyenddate: data.assetWarranties?.[0]?.warrantyExpiryDate
        ? this.datepipe.transform(data.assetWarranties[0].warrantyExpiryDate, 'yyyy-MM-dd')
        : null,
      createdBy: data.createdBy,
      amcstartdate: data.assetamcVM?.[0]?.startDate
        ? this.datepipe.transform(data.assetamcVM[0].startDate, 'yyyy-MM-dd')
        : null,
      amcenddate: data.assetamcVM?.[0]?.endDate
        ? this.datepipe.transform(data.assetamcVM[0].endDate, 'yyyy-MM-dd')
        : null,
      vendorname: data.assetamcVM?.[0]?.name || null,
      contactnumber: data.assetamcVM?.[0]?.phoneNumber || null,
    });
    this.onassetsubcategory()
    this.assetForm.get('assetSubCategory')?.setValue(data.assetSubCategory)

    // Set AMC toggle based on data: ensure all required AMC fields are present (startDate, endDate, name, phoneNumber)
    const hasAmcData = !!(data.assetamcVM?.[0]?.startDate &&
      data.assetamcVM?.[0]?.endDate &&
      data.assetamcVM?.[0]?.name &&
      data.assetamcVM?.[0]?.phoneNumber);
    this.isToggledamc = hasAmcData;
    this.toggleAmcFields(this.isToggledamc);

    // Set Warranty toggle based on presence of both warranty dates (start and expiry date)
    const hasWarrantyDates = !!(data.assetWarranties?.[0]?.warrantyStartDate && data.assetWarranties?.[0]?.warrantyExpiryDate);
    this.isToggledWarranty = hasWarrantyDates;
    this.toggleWarrantyFields(this.isToggledWarranty);
  }

  viewdatatrasfer(asset: any) {
    console.log(asset)
    this.locationfromdata.patchValue({
      perisionlocation: asset.locationName,
      pervessublocation: asset.sublocationName


    });
  }
  avaliableassets(deletid: any) {
    const payload = {
      "asset": {
        id: deletid,
        assetModel: this.selectedAsset.assetModel,
        assetCategory: this.selectedAsset.assetCategory,
        assetSubCategory: this.selectedAsset.assetSubCategory,
        identificationNumber: this.selectedAsset.identificationNumber,
        serialNumber: this.selectedAsset.serialNumber,
        status: "Available",
        createdBy: this.selectedAsset.createdBy,
        vendorId: this.selectedAsset.vendorId,
        purchaseDate: this.selectedAsset.purchaseDate

      }

    };
    this.http.putData(`AssetMaster/update/${deletid}?assetId=${deletid}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset marked as Available Successfully ');
          this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
          this.getcount(null,null,this.Status);
        },
        error: (err) => {
          console.error('Error deleting asset:', err);

          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('Failed to Update data')

        },

      });
  }

  activeassets(deletid: any) {
    const payload = {
      "asset": {
        id: deletid,
        assetModel: this.selectedAsset.assetModel,
        assetCategory: this.selectedAsset.assetCategory,
        assetSubCategory: this.selectedAsset.assetSubCategory,
        identificationNumber: this.selectedAsset.identificationNumber,
        serialNumber: this.selectedAsset.serialNumber,
        status: "Available",
        createdBy: this.selectedAsset.createdBy,
        vendorId: this.selectedAsset.vendorId,
        purchaseDate: this.selectedAsset.purchaseDate

      }

    };
    this.http.putData(`AssetMaster/update/${deletid}?assetId=${deletid}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset marked as Active Successfully ');
          this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
        },
        error: (err) => {
          console.error('Error deleting asset:', err);
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('Failed to Update data')

        },

      });
  }

  getcount(locationId: string | null, subLocationId: string | null, status: string) {
    const params = new URLSearchParams();
    if (locationId) params.append('locationid', locationId);
    if (subLocationId) params.append('sublocationid', subLocationId);
    params.append('status', status);

    this.http.getData(`AssetMaster/v1/statuscount?${params.toString()}`).subscribe({
      next: (data: any) => {
        const totalCount = data.totalCount || 0;
        this.http.setAssetCount(totalCount);

        const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];
        const availableData = statusCounts.find((item: any) => item.status === "Available");
        const allocateData = statusCounts.find((item: any) => item.status === "Allocated");
        const inactivedata = statusCounts.find((item: any) => item.status === "Inactive");
        const undermaintence = statusCounts.find((item: any) => item.status === "Under Maintenance");

        const availableCount = availableData?.count || 0;
        const allocateCount = allocateData?.count || 0;
        const inactiveCount = inactivedata?.count || 0;
        const undermaintenceCount = undermaintence?.count || 0;

        this.http.setavilableAssetCount(availableCount);
        this.http.setallocatedAssetCount(allocateCount);
        this.http.setundermatinaceAssetCount(undermaintenceCount);
        this.http.setinactiveSubjectAssetCount(inactiveCount);
      },
      error: (error) => {
        console.error('Error fetching count:', error);
      }
    });
  }
    //update close dailog open
    openConfirmationModal(content: any) {
      this.modalService.open(content, {centered: true,backdrop: 'static'});
    }
    cleardata(){
      this.assetForm.reset();
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
