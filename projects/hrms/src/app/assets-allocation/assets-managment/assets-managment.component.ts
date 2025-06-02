import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { IAsset, ICategory, IVendor } from '../../Interfaces/assets-management.model';
import { RbacService } from '../../services/rbac.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-assets-managment',
  imports: [CommonModule, TabsModule, Select, RouterModule, ReactiveFormsModule, NgbPopoverModule, FormsModule, ModuleInformationComponent, ChartModule],
  templateUrl: './assets-managment.component.html',
  styleUrl: './assets-managment.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class AssetsManagmentComponent {
  moduleinfo: string = '';
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
  searchQuery = ''
  assetSubCategory: any = [];
  assetCategorys: ICategory[] = [];
  vendor: IVendor[] = [];
  allNavTabs: any[] = [];
  assetslist = new BehaviorSubject<IAsset[]>([])
  locationfromdata!: FormGroup
  Status = ''
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  minpurchesDate: any;
  maxpurchesDate: any;
  assetData: any;
  assetDataOptions: any;

  constructor(private readonly fb: FormBuilder, public http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,
    public formValidation: FormValidationService, public rbac: RbacService, public readonly router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initialform()
    this.getassetsCategory()
    this.getjobLocationList()
    this.getvendor()
    this.intiallocationandsublocation()
    this.getcount(null, null)
    this.getassetsdata(this.page, this.pageSize, null, null, this.Status);
    const today = new Date();
    // Set max to today's date
    this.maxpurchesDate = today.toISOString().split('T')[0];
    // Set min to Jan 1st of the current year
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    this.minpurchesDate = startOfYear.toISOString().split('T')[0];
    this.initializeNavTabs();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initializeNavTabs(): void {
    // Populate allNavTabs with permission checks
    this.allNavTabs = [
      { label: 'All', route: '/assets-management/all-assets', count$: this.http.assetCountSubject, icon: '/desk-icon/all-icon.png', permission: { feature: 'Asset Management - All', action: 'view' } },
      { label: 'Available', route: '/assets-management/available-assets', count$: this.http.avilableassetCountSubject, icon: '/assets-icon/available-icon.png', backgroundcolour: '#25BBFF', permission: { feature: 'Asset Management - Available', action: 'view' } },
      { label: 'Allocated', route: '/assets-management/allocated-assets', count$: this.http.allocatedassetCountSubject, icon: '/assets-icon/Allocated-icon.png', backgroundcolour: '#FCD643', permission: { feature: 'Asset Management - Allocated', action: 'view' } },
      { label: 'Under Maintenance', route: '/assets-management/under-maintenance-assets', count$: this.http.undermatinaceassetCountSubject, icon: '/assets-icon/Maintenance-icon.png', backgroundcolour: '#FF338A', permission: { feature: 'Asset Management - Under Maintenance', action: 'view' } },
      { label: 'Inactive', route: '/assets-management/inactive-assets', count$: this.http.inactiveaceassetCountSubject, icon: '/assets-icon/Inactive-icon.png', backgroundcolour: '#338DF8', permission: { feature: 'Asset Management - Inactive', action: 'view' } },
    ];
    // Filter navTabs based on permissions
    this.navTabs = this.allNavTabs.filter(tab =>
      tab.permission && tab.permission.feature && tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  initialform() {
    this.assetForm = this.fb.group({
      assetModel: [null, [Validators.required, Validators.maxLength(20), Validators.pattern(/^[^\s].*$/)]],
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

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/assets-management': MODULE_INFOS.ASSET_ALLOCATION_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  intiallocationandsublocation() {
    this.locationfromdata = this.fb.group({
      locationId: [null],
      subLocationId: [{ value: null, disabled: true }],
    });
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
      this.assetForm.get('contactnumber')?.setValidators([Validators.required, Validators.maxLength(15), Validators.pattern("[0-9]+$"), Validators.minLength(10), this.allZeroesIfMaxLength()]);
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
    this.http.getData('AssetCategory?parentId=0').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.assetCategorys = data;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  // onassetsubcategory() {
  //   this.assetForm.get('assetSubCategory')?.enable()
  //   const selectedId = this.assetForm.get('assetCategory')?.value.id;
  //   this.http.getData(`AssetCategory?parentId=${selectedId}`).pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (data: any) => {
  //         this.assetSubCategory = data;
  //         let selectname = this.assetSubCategory.value.find((item: any) => item.id === selectedId)?.name;
  //       },
  //       error: (reason: any) => {
  //         console.log(reason);
  //       },
  //     });
  // }
  onassetsubcategory() {
    this.assetForm.get('assetSubCategory')?.reset(); // Reset previous value
    this.assetForm.get('assetSubCategory')?.markAsTouched(); // Mark as touched to trigger validation
    this.assetForm.get('assetSubCategory')?.enable();

    const selectedId = this.assetForm.get('assetCategory')?.value.id;

    this.http.getData(`AssetCategory?parentId=${selectedId}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetSubCategory = data;
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getAssetCatData(data: any) {
    return this.assetCategorys.find((t) => parseInt(data) === t.id)?.name
  }

  onLocationChange() {
    const locationId = this.locationfromdata.get('locationId')?.value;
    this.getSubLocationByidfliters(locationId);
    localStorage.setItem('assetlocationId', JSON.stringify(locationId))
    this.locationfromdata.get('subLocationId')?.reset()
    localStorage.setItem('assetsublocationId', JSON.stringify(null))
    this.http.assetsUpdateLocationId(locationId);
    this.getcount(locationId, null)
  }

  onSubLocationChange() {
    const subLocationId = this.locationfromdata.get('subLocationId')?.value;
    if (subLocationId) {
      const loctionid = this.locationfromdata.get('locationId')?.value
      localStorage.setItem('assetsublocationId', JSON.stringify(subLocationId))
      this.http.assetsUpdateLocationId(loctionid);
      this.getassetsdata(this.page, this.pageSize, loctionid, subLocationId, null);
      this.getcount(loctionid, subLocationId)
    }
    else {
      const loctionid = this.locationfromdata.get('locationId')?.value
      localStorage.setItem('assetsublocationId', JSON.stringify(subLocationId))
      this.http.assetsUpdateLocationId(loctionid);
    }
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
          this.subLocationsDropdown = [];
          this.locationfromdata.patchValue({ subLocationId: null });
          window.location.reload()
          this.locationfromdata.get('subLocationId')?.disable()
          localStorage.removeItem('assetsublocationId');
          localStorage.removeItem('assetlocationId');
        }
      });
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data
      },
    });
  }

  getSubLocationByid(selectedLocation: any): void {
    this.assetForm.get('subLocationId')?.enable();

    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http
        .getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`)
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations;
            }

            // Reset and make subLocationId required
            this.assetForm.get('subLocationId')?.setValue(null);
            this.assetForm.get('subLocationId')?.setValidators([Validators.required]);
            this.assetForm.get('subLocationId')?.markAsTouched(); // Force show error immediately
            this.assetForm.get('subLocationId')?.updateValueAndValidity();
          },
          error: (err: any) => {
            this.subLocationsDropdown = [];
            this.assetForm.get('subLocationId')?.setValue(null);
            this.assetForm.get('subLocationId')?.markAsTouched();
          },
        });
    } else {
      this.subLocationsDropdown = [];
      this.assetForm.get('subLocationId')?.setValue(null);
      this.assetForm.get('subLocationId')?.clearValidators();
      this.assetForm.get('subLocationId')?.updateValueAndValidity();
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
      this.http.postdata('AssetMaster', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset Registered successfully ');
          this.getassetsdata(this.page, this.pageSize, null, null, this.Status);
          this.getcount(null, null);
          this.assetForm.reset();
          this.http.setnewassetsDetails();
        },
        error: (error) => {
          if (error.status !== 500) {
            this.conformationPopup.openErrorModal(error.error?.message);
          }
          else {
            this.conformationPopup.openErrorModal("There was a problem on our side. Please try again later, or contact the administrator if the issue persists.")
          }
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  resetfrom() {
    this.isToggledamc = false
    this.isToggledWarranty = false
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
      this.assetForm.get('warrantystartdate')?.reset();
      this.assetForm.get('warrantyenddate')?.reset();
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

  getassetsdata(pagenum: number, pagesize: number, locationid: any, sublocationid: any, Assetsstatus: any) {
    const params = {
      page: pagenum,
      pageSize: pagesize,
      searchQuery: this.searchQuery,
      locationid: locationid,
      status: Assetsstatus,
      sublocationid: sublocationid
    };
    this.subscription = this.http.getassetsdesk("AssetMaster", params.locationid, params.sublocationid, params.status,
      params.page, params.pageSize, params.searchQuery).subscribe({
        next: (res: any) => {
          this.assetslist.next(res.items);
        },
        error: (error: any) => {
        }
      });
  }

  getcount(locationId: string | null, subLocationId: string | null) {
    const params = new URLSearchParams();
    if (locationId) params.append('locationid', locationId);
    if (subLocationId) params.append('sublocationid', subLocationId);
    params.append('status', status);
    // this.http.getData(`AssetMaster/v1/statuscount?${params.toString()}`).subscribe({
    //   next: (data: any) => {
    //     const totalCount = data.totalCount || 0;
    //     this.http.setAssetCount(totalCount);
    //     const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];
    //     const availableData = statusCounts.find((item: any) => item.status === "Available");
    //     const allocateData = statusCounts.find((item: any) => item.status === "Allocated");
    //     const inactivedata = statusCounts.find((item: any) => item.status === "Inactive");
    //     const undermaintence = statusCounts.find((item: any) => item.status === "Under Maintenance");
    //     const availableCount = availableData?.count || 0;
    //     const allocateCount = allocateData?.count || 0;
    //     const inactiveCount = inactivedata?.count || 0;
    //     const undermaintenceCount = undermaintence?.count || 0;
    //     this.http.setavilableAssetCount(availableCount);
    //     this.http.setallocatedAssetCount(allocateCount);
    //     this.http.setundermatinaceAssetCount(undermaintenceCount);
    //     this.http.setinactiveSubjectAssetCount(inactiveCount);
    //     this.initChart();
    //   },
    //   error: (error) => {
    //     console.error('Error fetching count:', error);
    //   }
    // });
  this.http.getData(`AssetMaster/v1/statuscount?${params.toString()}`).subscribe({
    next: (data: any) => {
  const totalCount = data.totalCount || 0;
  this.http.setAssetCount(totalCount);

  const statusCounts = Array.isArray(data.statusCounts) ? data.statusCounts : [];

  const availableCount = statusCounts.find((item: any) => item.status === "Available")?.count || 0;
  const allocateCount = statusCounts.find((item: any) => item.status === "Allocated")?.count || 0;
  const inactiveCount = statusCounts.find((item: any) => item.status === "Inactive")?.count || 0;
  const undermaintenceCount = statusCounts.find((item: any) => item.status === "Under Maintenance")?.count || 0;

  this.http.setavilableAssetCount(availableCount);
  this.http.setallocatedAssetCount(allocateCount);
  this.http.setundermatinaceAssetCount(undermaintenceCount);
  this.http.setinactiveSubjectAssetCount(inactiveCount);

  // 🔁 Move chart initialization here
  setTimeout(() => this.initChart(), 0);
},
  });
  }

  //close dailog open
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.assetForm.reset();
    this.modalService.dismissAll();
    this.isToggledWarranty = false
    this.isToggledamc = false
  }

  // initChart() {
  //   const chartTabs = this.allNavTabs.filter(tab => !!tab.backgroundcolour);
  //   const backgroundColors = chartTabs.map(item => item.backgroundcolour);

  //   this.assetData = {
  //     datasets: [
  //       {
  //         data: [

  //           this.http.avilableassetCountSubject.value ?? 0,
  //           this.http.allocatedassetCountSubject.value ?? 0,
  //           this.http.undermatinaceassetCountSubject.value ?? 0,
  //           this.http.inactiveaceassetCountSubject.value ?? 0,

  //         ],
  //         backgroundColor: backgroundColors,
  //         borderWidth: 0,
  //       }
  //     ]
  //   };


  //   this.assetDataOptions = {
  //     cutout: '70%',
  //   };
  // }
initChart(): void {
  combineLatest([
    this.http.avilableassetCountSubject,
    this.http.allocatedassetCountSubject,
    this.http.undermatinaceassetCountSubject,
    this.http.inactiveaceassetCountSubject
  ]).subscribe(([available, allocated, underMaintenance, inactive]) => {
    const chartTabs = this.allNavTabs.filter(tab => !!tab.backgroundcolour);
    const backgroundColors = chartTabs.map(item => item.backgroundcolour);

    this.assetData = {
      datasets: [
        {
          data: [available ?? 0, allocated ?? 0, underMaintenance ?? 0, inactive ?? 0],
          backgroundColor: backgroundColors,
          borderWidth: 0,
        }
      ]
    };

    this.assetDataOptions = {
      cutout: '70%',
    };
  });
}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    localStorage.removeItem('assetlocationId');
    localStorage.removeItem('assetsublocationId');
  }
}