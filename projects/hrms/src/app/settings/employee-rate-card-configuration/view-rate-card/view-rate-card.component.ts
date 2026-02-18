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
      code: "EUR",
      name: "Euro",
      symbol: "€"
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
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥"
    },
  ];
  clientTypeOptions=[
    {lable:'Internal',value:'Internal'},
    {lable:'External',value:'External'},
  ]
  minDate: string = '';
  maxDate: string = '';
     constructor(
      public router: Router,
      private fb: FormBuilder,
      private http: HttpService,
      private modalService: NgbModal,
      private conformationPopup: OpenModalService
    ) {
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
    // Year and Effective from
  if (this.viewratecardData.effectiveFrom) {
    this.viewratecardForm.patchValue({
      year: moment(this.viewratecardData.effectiveFrom).year(),
      effectivefrom: this.viewratecardData.effectiveFrom.split('T')[0]
      });
    }
    // Client Type
    if (this.viewratecardData.clientType) {
      const clientTypes = this.viewratecardData.clientType.split(',');
        this.viewratecardForm.patchValue({
          clientType: clientTypes
        });
    }
    // Currency
    if (this.viewratecardData.experienceBands?.length) {
      const uniqueCurrencies = [...new Set(
        this.viewratecardData.experienceBands.flatMap((band: any) => 
          band.currencies?.map((c: any) => c.currencyCode) || []
        )
      )];
      this.viewratecardForm.patchValue({
        currency: uniqueCurrencies
      }, { emitEvent: false });
    }
      this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.viewratecardForm.get('year')?.valueChanges.subscribe((year: number) => {
      const effectiveFromCtrl = this.viewratecardData.get('effectivefrom');
  
      if (year) {
        this.minDate = `${year}-01-01`;
        this.maxDate = `${year}-12-31`;
        effectiveFromCtrl?.enable();
        effectiveFromCtrl?.reset();
      } else {
        effectiveFromCtrl?.disable();
        this.minDate = '';
        this.maxDate = '';
      }
    });
    }
     limitDigits(event: any, maxDigits: number) {
    const value = event.target.value;
    if (value.length > maxDigits) {
      event.target.value = value.slice(0, maxDigits);
    }
  }
  preventInvalidKeys(event: KeyboardEvent) {
    const invalidKeys = ['-', '+', 'e', 'E'];
  
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
  disableScroll(event: WheelEvent) {
    event.preventDefault();
  }
   getCurrenciesArray(rateItem: FormGroup): FormArray {
     return rateItem.get('currencies') as FormArray;
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
          error: () => {},
        });
    }
  setExperienceBands() {
    const rateArray = this.rateItems;
    rateArray.clear();
  
    this.viewratecardData.experienceBands.forEach((band: any) => {
      const currenciesArray = this.fb.array<FormGroup>([]);
      
      band.currencies?.forEach((curr: any) => {
        currenciesArray.push(
          this.fb.group({
            currencyCode: [curr.currencyCode, Validators.required],
            currencyName: [curr.currencyName, Validators.required],
            symbol: [curr.symbol],
            rate: [curr.rate, Validators.required]
          }) as FormGroup
        );
      });
  
      rateArray.push(
        this.fb.group({
          experienceFrom: [band.experienceFrom, Validators.required],
          experienceTo: [band.experienceTo, Validators.required],
          status: [band.status],
          currencies: currenciesArray
        })
      );
    });
  }
   getCurrencyName(code: string): string {
      const currency = this.currencyCodes.find(c => c.code === code);
      return currency ? `${currency.code} - ${currency.name}` : code;
    }
  
  
     ////this method used for location list show in location dropdown 
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
    currency: [{ value: '', disabled: true }, Validators.required],
    clientType: [{ value: '', disabled: true },Validators.required],
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
    addRateCardItems() {
      const selectedCurrencies = this.viewratecardForm.get('currency')?.value || [];
  
      this.rateItems.controls.forEach((rateItem: any, rateIndex: number) => {
        const currenciesArray = rateItem.get('currencies') as FormArray;
        const existingRates = currenciesArray.controls.map((c: any) => ({
          code: c.get('currencyCode')?.value,
          rate: c.get('rate')?.value
        }));
        
        while (currenciesArray.length > 0) {
          currenciesArray.removeAt(0);
        }
  
        selectedCurrencies.forEach((currencyCode: string) => {
          const currency = this.currencyCodes.find(c => c.code === currencyCode);
          const existingRate = existingRates.find(r => r.code === currencyCode)?.rate || '';
          currenciesArray.push(
            this.fb.group({
              currencyCode: [{value:currencyCode,disabled: true}, Validators.required],
              currencyName: [{value:currency?.name || '',disabled: true}],
              symbol: [{value:currency?.symbol || '',disabled: true}],
              rate: [{vale:existingRate,disabled: true}, Validators.required]
            })
          );
        });
      });
    }
     addMoreRateItems() {
      const selectedCurrencies = this.viewratecardForm.get('currency')?.value || [];
      const currenciesArray = this.fb.array<FormGroup>([]);
  
      selectedCurrencies.forEach((currencyCode: string) => {
        const currency = this.currencyCodes.find(c => c.code === currencyCode);
        currenciesArray.push(
          this.fb.group({
            currencyCode: [currencyCode, Validators.required],
            currencyName: [currency?.name || ''],
            symbol: [currency?.symbol || ''],
            rate: ['', Validators.required]
          }) as FormGroup
        );
      });
  
      this.rateItems.push(
        this.fb.group({
          experienceFrom: ['', Validators.required],
          experienceTo: ['', Validators.required],
          status: ['Active'],
          currencies: currenciesArray
        })
      );
    }
  createRateCardItems(): FormGroup {
      return this.fb.group({
      experienceFrom: ['', Validators.required],
      experienceTo: ['', Validators.required],
      // frequencyType: ['', Validators.required],
      status: ['Active'],
      currencies: this.fb.array([
        this.createCurrencies()
      ])
      });
  }
   createCurrencies(): FormGroup {
    return this.fb.group({
      experienceFrom: ['',[ Validators.required,Validators.min(0), Validators.max(999)]],
      experienceTo: ['', [Validators.required,Validators.min(0), Validators.max(999)]],
      currencyCode: ['', Validators.required],
      currencyName: [''],
      status: [''],
      symbol: [''],
      rate: ['', Validators.required]   // user fills this
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
       const currenciesArray = this.rateItems
      .at(rateIndex)
      .get('currencies') as FormArray;
  
    const rateControl = currenciesArray
      .at(currencyIndex)
      .get('rate');
  
    if (!rateControl) return;
  
    // Ensure rate is always updated in the currency object
    currenciesArray.at(currencyIndex).patchValue(
      { rate: rateControl.value },
      { emitEvent: false }
    );
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
      subLocationControl?.enable();
  
      const selectedLocations = this.locations.filter((loc: any) =>
        selectedLocationIds.includes(loc.id)
      );
  
      // MUST contain subLocations from API
      this.subLocations = selectedLocations.flatMap(
        (loc: any) => loc.subLocations || []
      );
    } else {
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
