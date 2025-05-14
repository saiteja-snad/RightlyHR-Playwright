import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule, DatePipe } from '@angular/common';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Select } from 'primeng/select';
import { AssetTransaction, IAsset, IAssetAllocation, IAssetid, ICategory, IVendor } from '../../Interfaces/assets-management.model';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';

@Component({
  selector: 'app-inactive-assets-list',
  imports: [NoDataFoundComponent, CommonModule, FormsModule, ReactiveFormsModule, Select, PaginatorModule, DropdownModule, DataLoaderContentComponent],
  templateUrl: './inactive-assets-list.component.html',
  styleUrl: './inactive-assets-list.component.scss',
  providers: [DatePipe]
})
export class InactiveAssetsListComponent {
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
  Status = 'Inactive'
  destroy$: Subject<boolean> = new Subject<boolean>();
  assetsid: IAssetid[] = [];
  selectedAsset!: any;
  assetid: any;
  jobLocationDropDownData: any = [];
  assetsundermaintanceDropdown: any = []
  subLocationsDropdown: any = [];
  assetSubCategory: any = [];
  assetCategorys: ICategory[] = [];
  vendor: IVendor[] = [];
  minpurchesDate: any;
  maxpurchesDate: any;
 
  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private readonly router: Router,
    public conformationPopup: OpenModalService,
    public rbac: RbacService,
    private readonly datepipe: DatePipe,
    public formValidation: FormValidationService,

    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  empinfo = {} as any
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.getFilteredData();
    this.getassetsCategory()
    this.getjobLocationList()
    this.getvendor()
    this.initialform();
    const today = new Date();
  // Set max to today's date
  this.maxpurchesDate = today.toISOString().split('T')[0];
  // Set min to Jan 1st of the current year
  const startOfYear = new Date(today.getFullYear(), 0, 1); 
  this.minpurchesDate = startOfYear.toISOString().split('T')[0];

  }

 
  initialform() {
    this.assetForm = this.fb.group({
      assetModel: [null, [Validators.required, Validators.maxLength(20)]],
      assetCategory: [null, Validators.required],
      assetSubCategory: [{ value: null, disabled: true }, Validators.required],
      assetID: [null],
      vendordetailes: [{ value: null, disabled: true }, Validators.required],
      serialnumber: [null, [Validators.required, Validators.maxLength(30)]],
      purchasedate: [null, Validators.required],
      warrantystartdate: [{ value: null, disabled: true }],
      warrantyenddate: [{ value: null, disabled: true }],
      amcstartdate: [{ value: null, disabled: true }],
      amcenddate:[{ value: null, disabled: true }],
      locationId: [{ value: null, disabled: true }],
      subLocationId: [{ value: null, disabled: true }],
      vendorname:[{ value: null, disabled: true },[]],
      contactnumber:[{ value: null, disabled: true },[]]
    }, {
      validators: [
        this.purchaseDateEqualWarrantyDateValidator(),
        //this.amcDateWithinWarrantyExpiryValidator()
      ]
    }
    )
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

  getFilteredData() {
    this.subscription = this.http.assetslocationId$.subscribe({
      next: (Value: any) => {
        console.log(Value);
        this.selectedLocationId = JSON.parse(localStorage.getItem('assetlocationId') ?? 'null');
        this.selectedSubLocationId = JSON.parse(localStorage.getItem('assetsublocationId') ?? 'null');
        this.getassetsdata(this.first, this.rows, Value, this.selectedSubLocationId, this.Status);
        this.getcount(Value,  this.selectedSubLocationId,this.Status);
      }
    })
  }
  
  navigateToAsset(assetId: any) {
    this.router.navigate(['/assets-management/view-assets-details'],{ queryParams: { id: assetId }});
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
    onRowsChange() {
      this.first = 1;
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
    }
    onPageChange(event: PaginatorState) {
      this.first = event.first;
      this.rows = event.rows;
      this.getassetsdata(this.first, this.rows, this.selectedLocationId, this.selectedSubLocationId, this.Status);
  
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
           this.getcount(null, null,this.Status);
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
    // update delet pop up
  opendeletepopup(content:any){
 this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
closedailog(){
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
