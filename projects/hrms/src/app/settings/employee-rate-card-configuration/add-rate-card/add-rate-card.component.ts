import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';

@Component({
  selector: 'app-add-rate-card',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    MultiSelectModule,
    CommonModule,
    TabsModule,
    TranslateModule,
    InfoIconComponent,
    NgbPopoverModule,
    NgxCountriesDropdownModule,
  ],
  templateUrl: './add-rate-card.component.html',
  styleUrl: './add-rate-card.component.scss',
})
export class AddRateCardComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  ratecardForm!: FormGroup;
  years: number[] = [];
  Employeeinfo = {} as any;
  currentYear: number = moment().year();
  locations = [] as any;
  subLocations = [] as any;
  sublocatiodis = false;
  ProjectroleDetails = [] as any;
  FrequencyDetail = [] as any;
  @ViewChild('deletepopup') deletepopup: any;
  isloading = false;
  currencyCodes=[
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$"
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€"
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥"
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£"
  },
  {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫"
  },
   {
    code: "USD",
    name: "United States Dollar",
    symbol: "$"
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹"
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£"
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€"
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥"
  },
  {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫"
  }
];
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService
  ) {
  }
  ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.getJobrole();
    this.getFrequencies();
    this.Employeeinfo = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
  }

  //get the rate basics
  getFrequencies() {
    this.subscription = this.http.getData('Frequency').subscribe({
      next: (data: any) => {
        this.FrequencyDetail = data;
        this.FrequencyDetail = data.map((item: any) => ({
          label: item.frequency1,
          value: item.frequency1,
        }));
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
  getJobrole() {
    this.subscription = this.http
      .getData('ProjectRoles?isActive=true')
      .subscribe({
        next: (response: any) => {
          if (response && response.success && Array.isArray(response.data)) {
            this.ProjectroleDetails = response.data.map((item: any) => ({
              id: item.id,
              projectrole: item.roleName, // Job role name
              entityname: item.entity?.entityName || '-', // Department name
              entityReferenceId:
                item.entity?.entityReferenceId || item.entityReferenceId || 0, // Department ID
              entityType: item.entityType || 'department', // Entity type
              isActive: item.isActive,
              color: item.meta?.graphData?.color || '#000000',
            }));
          } else {
            this.ProjectroleDetails = [];
          }
        },
        error: () => {},
      });
  }

  geAllLocations() {
    this.subscription = this.http
      .getData(`JobLocation/getAllLocations`)
      .subscribe({
        next: (data: any) => {
          this.locations = data;
          this.sublocatiodis = true;
        },
        error: (reason: any) => console.log(reason),
      });
  }
getCurrenciesArray(rateItem: FormGroup): FormArray {
  return rateItem.get('currencies') as FormArray;
}

getFirstCurrency(rateItem: FormGroup): FormGroup | null {
  const currencies = this.getCurrenciesArray(rateItem);
  return currencies && currencies.length > 0 ? (currencies.at(0) as FormGroup) : null;
}
  initializeForm() {
    this.ratecardForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      role: ['', Validators.required],
      effectivefrom: ['', Validators.required],
      rateItems: this.fb.array([this.createRateCardItems()]),
    });
  }
  get rateItems(): FormArray {
    return this.ratecardForm.get('rateItems') as FormArray;
  }
  getCurrencies(rateIndex: number): FormArray {
  return this.rateItems.at(rateIndex).get('currencies') as FormArray;
}
  addRateCardItems() {
    this.rateItems.push(this.createRateCardItems());
  }
  createRateCardItems(): FormGroup {
    return this.fb.group({
      experienceFrom: ['', Validators.required],
      experienceTo: ['', Validators.required],
      frequencyType: ['', Validators.required],
      currencies: this.fb.array([this.createCurrencies()]),
      status: ['Active'],
    });
  }
  createCurrencies(): FormGroup {
    return this.fb.group({
      currencyCode: ['',Validators.required],
      currencyName: ['',Validators.required],
      symbol: [''],
      rate: ['', Validators.required]
    });
  }
  isDeleteDisabled: boolean = false;
  deleteratecard(index: number) {
    if (this.rateItems.length > 1) {
      this.rateItems.removeAt(index);
      this.isDeleteDisabled = false; // allow delete if more than 1
    } else {
      this.isDeleteDisabled = true; // disable delete button
    }
  }
  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
  }
onRateChange(rateIndex: number, currencyIndex: number) {
  const rateControl = (this.rateItems.at(rateIndex).get('currencies') as FormArray)
                        .at(currencyIndex)
                        .get('rate');
  console.log(rateControl?.value);
}
  onCountryChange(country: any, index: number) {
    console.log(country);
   const rateItem = this.rateItems.at(index) as FormGroup;
  const currenciesArray = rateItem.get('currencies') as FormArray;
  const rateValue = rateItem.get('rate')?.value;
  const currencyData = {
    currencyCode: country?.value?.code,
    currencyName: country?.value?.name,
    symbol: country?.value?.symbol,
    rate: currenciesArray.at(0).get('rate')?.value || ''
  };
   if (currenciesArray.length > 0) {
    // 🔁 Update existing currency
    currenciesArray.at(0).patchValue(currencyData, { emitEvent: false });
  } else {
    // ➕ Create first currency
    currenciesArray.push(this.fb.group(currencyData));
  }
  console.log(this.ratecardForm)
  }
  addRateCard() {
    let formValues = this.ratecardForm.getRawValue();
    console.log(formValues);
    let payload = {
      effectiveFrom: formValues.effectivefrom,
      //  effectiveTo: '2025-12-17T05:53:20.076Z',
      roleIds: formValues?.role?.join(','),
      locationIds: formValues?.location?.join(','),
      subLocationIds: formValues?.subLocation?.join(','),
      status: 'Active',
      createdBy: this.Employeeinfo.employeeId,
      experienceBands: formValues.rateItems,
    };
    console.log(payload);
    this.subscription=this.http.postdata('RateCard',payload).subscribe({
          next: (res: any) => {
            this.isloading = false;
            this.conformationPopup.openSuccessModal(
              'Rate Card created successfully'
            );
            this.router.navigate(['/settings/employee-rate-card/rate-card/rate-card-active'])
          },
          error: (err: any) => {
            this.isloading = false;
            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal(
              err.error.message
                ? err.error.message
                : 'Failed to allocate Work Hours. Please try again later'
            );
          },
          complete: () => {
          },
        });
  }
  // location changes
  onLocationChange(selectedLocationIds: number[] | null) {
    const subLocationControl = this.ratecardForm.get('subLocation');
    // Reset subLocation value
    subLocationControl?.reset();
    if (selectedLocationIds && selectedLocationIds.length > 0) {
      // Enable subLocation field
      subLocationControl?.enable();
      // Get all selected locations
      const selectedLocations = this.locations.filter((loc: any) =>
        selectedLocationIds.includes(loc.id)
      );
      // Merge all subLocations
      this.subLocations = selectedLocations.flatMap(
        (loc: any) => loc.subLocations || []
      );
      subLocationControl?.markAsTouched();
    } else {
      // Disable if no location selected
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }
  nagvition() {
    this.router.navigate([
      '/settings/employee-rate-card/rate-card/rate-card-active',
    ]);
  }
  Cancel() {
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  onDelete(modal: any) {
    modal.dismiss();
    this.nagvition();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
