import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-clone-rate-card',
  imports: [   RouterModule,
    Select,
    ReactiveFormsModule,
    MultiSelectModule,
    CommonModule,
    TabsModule,
    TranslateModule,
    InfoIconComponent,
    NgbPopoverModule,
    NgxCountriesDropdownModule,],
  templateUrl: './clone-rate-card.component.html',
  styleUrl: './clone-rate-card.component.scss'
})
export class CloneRateCardComponent {
  subscription!: Subscription;
  updateratecardForm!: FormGroup;
   years: number[] = [];
   Employeeinfo = {} as any;
   currentYear: number = moment().year();
   locations = [] as any;
   subLocations = [] as any;
   sublocatiodis = false;
   ProjectroleDetails = [] as any;
   FrequencyDetail = [] as any;
   @ViewChild('deletepopup') deletepopup: any;
   @ViewChild('Summary') Summary: any;
   isloading = false;
  employeedetails: any;
  updateratecardData: any;
  responseSummary!: any;
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
    this.updateratecardData = JSON.parse(localStorage.getItem("updateratecard") || '{}');
    console.log('updateratecard',   this.updateratecardData );
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.getJobrole();
    this.getFrequencies();
      //  PATCH EXPERIENCE DATA
  if (this.updateratecardData.experienceBands?.length) {
    this.setExperienceBands();
  }
  // Effective from
  if (this.updateratecardData.effectiveFrom) {
    const effectiveMoment = moment(this.updateratecardData.effectiveFrom);
    const selectedYear = effectiveMoment.year();
   this.minDate = `${selectedYear}-01-01`;
    this.maxDate = `${selectedYear}-12-31`;
    // this.updateratecardForm.patchValue({
    //   effectivefrom: this.updateratecardData.effectiveFrom.split('T')[0]
    // });
  }
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      
    this.updateratecardForm.get('year')?.valueChanges.subscribe((year: number) => {
    const effectiveFromCtrl = this.updateratecardForm.get('effectivefrom');

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
            if (this.updateratecardData.roleId) {
          // this.updateratecardForm.patchValue({
          //   role: [this.updateratecardData.roleId]
          // });
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

  this.updateratecardData.experienceBands.forEach((band: any) => {
    rateArray.push(
      this.fb.group({
        experienceFrom: [band.experienceFrom, Validators.required],
        experienceTo: [band.experienceTo, Validators.required],
        frequencyType: [band.frequencyType, Validators.required],
        status: [band.status],
        currencies: this.fb.array([
          this.fb.group({
            currencyCode: [band.currencies?.[0]?.currencyCode, Validators.required],
            currencyName: [band.currencies?.[0]?.currencyName, Validators.required],
            symbol: [band.currencies?.[0]?.symbol],
            rate: [band.currencies?.[0]?.rate, Validators.required]
          })
        ])
      })
    );
  });
}

   ////this method used for location list show in location dropdown 
geAllLocations() {
  this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
    next: (data: any) => {
      this.locations = data;

      // ---- LOCATION ----
      const selectedLocation = this.locations.find(
        (x: any) => x.jobLocationName === this.updateratecardData.locationName
      );

      const selectedLocationIds = selectedLocation
        ? [selectedLocation.id]
        : [];

      // this.updateratecardForm.patchValue({
      //   location: selectedLocationIds
      // });

      // Trigger sublocation loading
      this.onLocationChange(selectedLocationIds);

       // ---- SUB LOCATION BY NAME ----
      if (this.updateratecardData.subLocationName) {
        const matchedSubLocations = this.subLocations.filter(
          (sub: any) =>
            sub.jobSubLocationName === this.updateratecardData.subLocationName
        );

      //  const subLocationIds = matchedSubLocations.map((s: any) => s.id);

        // this.updateratecardForm.patchValue({
        //   subLocation: subLocationIds
        // });
    }
  }
  });
}


  initializeForm() {
    this.updateratecardForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      role: ['', Validators.required],
      effectivefrom: ['', Validators.required],
      rateItems: this.fb.array([this.createRateCardItems()]),
    });
  }
  get rateItems(): FormArray {
    return this.updateratecardForm.get('rateItems') as FormArray;
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
    status: ['Active'],
    currencies: this.fb.array([
      this.createCurrencies()
    ])
  });
}
 createCurrencies(): FormGroup {
  return this.fb.group({
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

  // ✅ Ensure rate is always updated in the currency object
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
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }
cloneRateCard(){
    let formValues = this.updateratecardForm.getRawValue();
    let payload = {
      effectiveFrom: formValues.effectivefrom,
      roleIds: formValues?.role?.join(','),
      locationIds: formValues?.location?.join(','),
      subLocationIds: formValues?.subLocation?.join(','),
      status: 'Active',
      createdBy: this.Employeeinfo.employeeId,
      experienceBands: formValues.rateItems,
    };
    this.subscription=this.http.postdata(`RateCard`,payload).subscribe({
          next: (res: any) => {
            this.isloading = false;
             this.responseSummary = res.data;
          if (res.failureCount==0) {
            this.conformationPopup.openSuccessModal(
              'Rate Card created successfully'
            );
          } else {
            this.openModal(this.Summary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
          // this.getAllRateCardDetails();
          this.nagvition();
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
  const subLocationControl = this.updateratecardForm.get('subLocation');

  subLocationControl?.reset([]);

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


nagvition(){
    this.router.navigate(['/settings/employee-rate-card/rate-card/rate-card-active']);
}
 Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
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
