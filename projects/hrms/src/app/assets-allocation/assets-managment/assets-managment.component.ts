import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RouterModule } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ICategory, IVendor } from '../../Interfaces/assets-management.model';

@Component({
  selector: 'app-assets-managment',
  imports: [CommonModule, TabsModule, Select, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assets-managment.component.html',
  styleUrl: './assets-managment.component.scss'
})
export class AssetsManagmentComponent {
  navTabs: any[] = [];
  subscription!: Subscription;
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  warrantydateMismatch = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dateMismatch = false;
  minEndDate = ''
  minAmcStartDate = ''
  minAmcEndDate = ''
  amcDateMismatch = false;
  isToggledamc = false;
  isToggledWarranty = false;
  empinfo: any
  assetForm!: FormGroup;
  assetSubCategory: any = [];
  assetCategorys: ICategory[] = [];
  vendor: IVendor[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initialform()
    this.getassetsCategory()
    this.getjobLocationList()
    this.getvendor()
    this.navTabs = [
      { label: 'All', route: '/assets-management/all-assets', count$: this.http.deskTotalCountSubject },
      { label: 'Available', route: '/assets-management/available-assets', count$: this.http.deskAvailableCountSubject },
      { label: 'Allocated', route: '/assets-management/allocated-assets', count$: this.http.deskAllocatedCountSubject },
      { label: 'Under Maintenance', route: '/assets-management/under-maintenance-assets', count$: this.http.deskUndermaindanaenceCountSubject },
      { label: 'Inactive', route: '/assets-management/inactive-assets', count$: this.http.deskinactiveCountSubject },
    ];
  }


  initialform() {
    this.assetForm = this.fb.group({
      assetModel: [null, [Validators.required, Validators.maxLength(20)]],
      assetCategory: [null, Validators.required],
      assetSubCategory: [{ value: null, disabled: true }, Validators.required],
      assetID: [null],
      vendordetailes: [null, Validators.required],
      serialnumber: [null, [Validators.required, Validators.maxLength(30)]],
      purchasedate: [null, Validators.required],
      warrantystartdate: [{ value: null, disabled: true }, []],
      warrantyenddate: [{ value: null, disabled: true }, []],
      amcstartdate: [{ value: null, disabled: true }, []],
      amcenddate: [{ value: null, disabled: true }, []],
      locationId: [null, Validators.required],
      subLocationId: [{ value: null, disabled: true }, [Validators.required]],
      vendorname: [{ value: null, disabled: true }, []],
      contactnumber: [{ value: null, disabled: true }, []]
    }, {
      validators: [
        this.purchaseDateEqualWarrantyDateValidator(),

      ]
    }
    )
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true });

  }
  getToday(): string {
    return new Date().toISOString().split('T')[0]
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


  onToggleChangeamc(event: Event) {
    this.isToggledamc = (event.target as HTMLInputElement).checked;
    console.log(this.isToggledamc)
    this.toggleAmcFields(this.isToggledamc, true); // Reset values only when explicitly toggled by the user

    this.isToggledamc === (event.target as HTMLInputElement).checked;
    if (this.isToggledamc) {

      this.assetForm.get('isToggledWarranty')?.enable();
      this.assetForm.get('amcstartdate')?.enable();
      this.assetForm.get('amcenddate')?.enable();
      this.assetForm.get('vendorname')?.enable();
      this.assetForm.get('contactnumber')?.enable();

      this.assetForm.get('amcstartdate')?.setValidators([Validators.required]);
      this.assetForm.get('amcenddate')?.setValidators([Validators.required]);
      this.assetForm.get('vendorname')?.setValidators([Validators.required, Validators.maxLength(20)]);
      this.assetForm.get('contactnumber')?.setValidators([Validators.required, Validators.maxLength(10), Validators.pattern("[0-9]+$"), Validators.minLength(10)]);
    } else {
      this.assetForm.get('amcstartdate')?.disable();
      this.assetForm.get('amcenddate')?.disable();
      this.assetForm.get('contactnumber')?.disable();
      this.assetForm.get('vendorname')?.disable();
      // this.assetForm.get('warrantystartdate')?.disable();
      // this.assetForm.get('warrantyenddate')?.disable();

      this.assetForm.get('amcstartdate')?.clearValidators();
      this.assetForm.get('amcstartdate')?.clearValidators();
      this.assetForm.get('contactnumber')?.clearValidators();
      this.assetForm.get('vendorname')?.clearValidators();
      // this.assetForm.get('warrantystartdate')?.clearValidators();
      // this.assetForm.get('warrantyenddate')?.clearValidators();
    }

    this.assetForm.get('amcstartdate')?.updateValueAndValidity();
    this.assetForm.get('amcenddate')?.updateValueAndValidity(); this.assetForm.get('contactnumber')?.updateValueAndValidity();
    this.assetForm.get('vendorname')?.updateValueAndValidity();
    // this.assetForm.get('warrantystartdate')?.updateValueAndValidity();
    // this.assetForm.get('warrantyenddate')?.updateValueAndValidity();


  }





  toggleAmcFields(enable: boolean, resetValues: boolean = false) {
    const amcFields = ['amcstartdate', 'amcenddate', 'vendorname', 'contactnumber'];

    amcFields.forEach(field => {
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
  getAssetCatData(data: any) {
    return this.assetCategorys.find((t) => parseInt(data) === t.id)?.name
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

  postassets(formdata: FormGroup) {

    if (formdata.valid) {
      // Convert dates to ISO format
      let purchaseDate = new Date(formdata.value.purchasedate).toISOString();

      let currentDate = new Date().toISOString().split('T')[0];
      // Create the payload for the asset, including the warranty details
      const payload: any = {
        assetModel: formdata.value.assetModel,
        assetCategory: formdata.value.assetCategory.name,
        assetSubCategory: formdata.value.assetSubCategory.name,
        identificationNumber: formdata.value.assetID,
        serialNumber: formdata.value.serialnumber,
        status: "Available",
        locationid: this.assetForm.get('locationId')?.value.id,
        sublocationid: this.assetForm.get('subLocationId')?.value.id,
        // comments: "string",
        createdBy: parseInt(this.empinfo.employeeId),
        vendorId: formdata.value.vendordetailes.id,
        purchaseDate: purchaseDate,
        assetWarrantyVM: {
          // warrantyNumber: 'truru65',
          createdAt: currentDate,
          createdBy: parseInt(this.empinfo.employeeId),
          warrantyStartDate: this.assetForm.get('warrantystartdate')?.value,
          warrantyExpiryDate: this.assetForm.get('warrantyenddate')?.value

        },
        assetamcVM: {

          startDate: this.assetForm.get('amcstartdate')?.value,
          endDate: this.assetForm.get('amcenddate')?.value,
          // createdAt: currentDate,
          createdBy: parseInt(this.empinfo.employeeId),
          phoneNumber: this.assetForm.get('contactnumber')?.value,
          name: this.assetForm.get('vendorname')?.value
        }
      };
      if (this.isToggledamc !== true) {
        payload.assetamcVM = null
      }
      if (this.isToggledWarranty !== true) {
        payload.assetWarrantyVM = null
      }
      console.log('Payload:', payload);
      this.http.postdata('AssetMaster', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log(res);
          this.modalService.dismissAll()
          this.conformationPopup.openSuccessModal('Asset Registered Successfully ');

          this.assetForm.reset();
        },
        error: (error) => {

          console.log(error);
          if (error.status !== 500) {
            this.conformationPopup.openErrorModal(error.error?.message);
          }
          else {
            this.conformationPopup.openErrorModal("There was a problem on our side. Please try again later, or contact the administrator if the issue persists.")
          }
        },
        complete: () => {
          setTimeout(() => {
            window.location.reload()
          }, 2000);
        },
      });
    } else {
      console.log('Form is invalid');
    }

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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    localStorage.removeItem('assetsdata');
  }
}