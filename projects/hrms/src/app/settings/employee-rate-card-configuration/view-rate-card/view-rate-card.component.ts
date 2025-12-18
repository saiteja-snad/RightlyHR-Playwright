import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal, ViewChild, TemplateRef} from '@angular/core';
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
  selector: 'app-view-rate-card',
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
  templateUrl: './view-rate-card.component.html',
  styleUrl: './view-rate-card.component.scss'
})
export class ViewRateCardComponent {
  subscription!: Subscription;
  viewratecardForm!: FormGroup;
  years: number[] = [];
  Employeeinfo = {} as any;
  currentYear: number = moment().year();
  locations = [] as any;
  subLocations = [] as any;
  sublocatiodis = false;
  ProjectroleDetails = [] as any;
  FrequencyDetail = [] as any;
// @ViewChild('deletepopup') deletepopup!: TemplateRef<any>;
  isloading = false;
  loading = true;
  selectedCountryConfig: {
    hideCode: boolean;
    hideName: boolean;
    dialCode?: string;
  } = {
    hideCode: true,
    hideName: true,
  };
  countryListConfig = {
    hideCode: true,
  };
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedDialphoneCode: any;
  selectedworkcoutrycode = signal<any>('');
  buttons = false;
  employeedetails: any;
  viewratecardData: any;
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
    effect(() => {
      this.selectedworkcoutrycode.set(this.selectedDialCode);
    });
  }

  ngOnInit(): void {
    this.employeedetails = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.viewratecardData= JSON.parse(localStorage.getItem("viewratecard") || '{}');
    console.log('viewratecard', this.viewratecardData );
    this.loading = false;
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.getJobrole();
    this.getFrequencies();
         //  PATCH EXPERIENCE DATA
  if (this.viewratecardData.experienceBands?.length) {
    this.setExperienceBands();
  }
  // Effective from
  if (this.viewratecardData.effectiveFrom) {
    this.viewratecardForm.patchValue({
      effectivefrom: this.viewratecardData.effectiveFrom.split('T')[0]
    });
  }
    this.Employeeinfo = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}'
    );
      this.patchMainFormData();
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
  patchMainFormData() {
  this.viewratecardForm.patchValue({
    year: new Date(this.viewratecardData.effectiveFrom).getFullYear(),
    effectivefrom: this.viewratecardData.effectiveFrom.split('T')[0],
    role: [this.viewratecardData.roleId]
  });
}
   getJobrole() {
    this.subscription = this.http.getData('ProjectRoles?isActive=true').subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.ProjectroleDetails = response.data.map((item: any) => ({
            id: item.id,
            projectrole: item.roleName,                // Job role name
            entityname: item.entity?.entityName || '-',      // Department name
            entityReferenceId: item.entity?.entityReferenceId || item.entityReferenceId || 0, // Department ID
            entityType: item.entityType || 'department',    // Entity type
            isActive: item.isActive,
            color: item.meta?.graphData?.color || '#000000'
          }));
           if (this.viewratecardData.roleId) {
          this.viewratecardForm.patchValue({
            role: [this.viewratecardData.roleId]
          });
        }
        } else {
          this.ProjectroleDetails = [];
        }
      },
      error: () => {
      }
    });
  }
geAllLocations() {
  this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
    next: (data: any) => {
      this.locations = data;

      const location = this.locations.find(
        (x: any) => x.id === this.viewratecardData.locationId
      );

      if (location) {
        this.viewratecardForm.patchValue({
          location: [location.id]
        });

        this.subLocations = location.subLocations || [];

        const subLoc = this.subLocations.find(
          (s: any) => s.id === this.viewratecardData.subLocationId
        );

        if (subLoc) {
          this.viewratecardForm.patchValue({
            subLocation: [subLoc.id]
          });
        }
      }
    }
  });
}


setExperienceBands() {
  const rateArray = this.viewratecardForm.get('rateItems') as FormArray;
  rateArray.clear();

  this.viewratecardData.experienceBands.forEach((band: any) => {
    rateArray.push(
      this.fb.group({
        experienceFrom: [{ value: band.experienceFrom, disabled: true }],
        experienceTo: [{ value: band.experienceTo, disabled: true }],
        frequencyType: [{ value: band.frequencyType, disabled: true }],
        currencies: this.fb.array([
          this.fb.group({
            currencyCode: [{ value: band.currencies[0].currencyCode, disabled: true }],
            currencyName: [{ value: band.currencies[0].currencyName, disabled: true }],
            symbol: [{ value: band.currencies[0].symbol, disabled: true }],
            rate: [{ value: band.currencies[0].rate, disabled: true }]
          })
        ]),
        status: [{ value: band.status, disabled: true }]
      })
    );
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
  this.viewratecardForm = this.fb.group({
    year: [{ value: '', disabled: true }, Validators.required],
    location: [{ value: [], disabled: true }, Validators.required],
    subLocation: [{ value: [], disabled: true }, Validators.required],
    role: [{ value: [], disabled: true }, Validators.required],
    effectivefrom: [{ value: '', disabled: true }, Validators.required],
    rateItems: this.fb.array([])
  });



// this.holidayForm = this.fb.group({
//       year: [{value : '', disabled : true}, Validators.required],
//       location: [{value : '', disabled : true},, Validators.required],
//       subLocation: [{value : '', disabled : true},, Validators.required],
//       shift: [{value : '', disabled : true},, Validators.required],
//       holidays: this.fb.array([])
//     });

  }
  get rateItems(): FormArray {
    return this.viewratecardForm.get('rateItems') as FormArray;
  }
  getCurrencies(rateIndex: number): FormArray {
  return this.rateItems.at(rateIndex).get('currencies') as FormArray;
}
  // addRateCardItems() {
  //   this.rateItems.push(this.createRateCardItems());
  // }
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
 onCountryChange(event: any, rateIndex: number, currencyIndex: number) {
  const currenciesArray = this.getCurrencies(rateIndex);

  const selectedCurrency = this.currencyCodes.find(
    c => c.code === event.value
  );

  if (!selectedCurrency) return;

  currenciesArray.at(currencyIndex).patchValue({
    currencyCode: selectedCurrency.code,
    currencyName: selectedCurrency.name,
    symbol: selectedCurrency.symbol
  });
}


  // location changes
  onLocationChange(selectedLocationIds: number[] | null) {
    const subLocationControl = this.viewratecardForm.get('subLocation');
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
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
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
