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
  selector: 'app-update-rate-card',
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
  templateUrl: './update-rate-card.component.html',
  styleUrl: './update-rate-card.component.scss'
})
export class UpdateRateCardComponent {
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
  updateratecardData: any;
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
    this.updateratecardForm.patchValue({
      effectivefrom: this.updateratecardData.effectiveFrom.split('T')[0]
    });
  }
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
     //default year show selected
    // this.updateratecardForm.patchValue({
    //   year: this.years.find((x: any) => x.value === this.updateratecardData.createdDate)

    // });
  }

  getCurrencies(rateIndex: number): FormArray {
  return this.rateItems.at(rateIndex).get('currencies') as FormArray;
}

 getCurrenciesArray(rateItem: FormGroup): FormArray {
   return rateItem.get('currencies') as FormArray;
 }
 addRateCardItems() {
    this.rateItems.push(this.createRateCardItems());
  }
  //get the rate basics
    getFrequencies() {
    this.subscription = this.http.getData('Frequency').subscribe({
      next: (data: any) => {
        this.FrequencyDetail = data;
        this.FrequencyDetail = data.map((item: any) => ({
          label: item.frequency1,
          value: item.frequency1
        }));
      }, error: (error: any) => {
        console.log(error);
      }
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
           if (this.updateratecardData.roleId) {
          this.updateratecardForm.patchValue({
            role: [this.updateratecardData.roleId]
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
setExperienceBands() {
  const rateArray = this.updateratecardForm.get('rateItems') as FormArray;
  rateArray.clear();

  this.updateratecardData.experienceBands?.forEach((band: any) => {
    rateArray.push(
      this.fb.group({
        experienceMin: [band.experienceFrom, Validators.required],
        experienceMax: [band.experienceTo, Validators.required],
        rateBasic: [band.frequencyType, Validators.required],
        currency: [band.currencies?.[0]?.currencyCode, Validators.required],
        rate: [band.currencies?.[0]?.rate, Validators.required]
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

      this.updateratecardForm.patchValue({
        location: selectedLocationIds
      });

      // Trigger sublocation loading
      this.onLocationChange(selectedLocationIds);

       // ---- SUB LOCATION BY NAME ----
      if (this.updateratecardData.subLocationName) {
        const matchedSubLocations = this.subLocations.filter(
          (sub: any) =>
            sub.jobSubLocationName === this.updateratecardData.subLocationName
        );

        const subLocationIds = matchedSubLocations.map((s: any) => s.id);

        this.updateratecardForm.patchValue({
          subLocation: subLocationIds
        });
    }
  }
  });
}


   initializeForm() {
    this.updateratecardForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: [[], Validators.required],   // ✅ array
      subLocation: [{ value: [], disabled: true }, Validators.required], 
      role:['',Validators.required],
      effectivefrom:['',Validators.required],
       rateItems: this.fb.array([this.createRateCardItems()]),
      
    });
  }
   get rateItems(): FormArray {
    return this.updateratecardForm.get('rateItems') as FormArray;
  }
 addShift() {
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
  deleteShift(index: number) {
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
addRateCard(){

  }
    onCountryChange(country: any, index: number) {
    console.log(country);
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryCodegflag = country.code;
   const rateItem = this.rateItems.at(index) as FormGroup;
  const currenciesArray = rateItem.get('currencies') as FormArray;
  const rateValue = rateItem.get('rate')?.value;
  const currencyData = {
    currencyCode: country.currency.code,
    currencyName: country.currency.name,
    symbol: country.currency.symbol,
    rate: currenciesArray.at(0).get('rate')?.value || ''
  };
   if (currenciesArray.length > 0) {
    // 🔁 Update existing currency
    currenciesArray.at(0).patchValue(currencyData, { emitEvent: false });
  } else {
    // ➕ Create first currency
    currenciesArray.push(this.fb.group(currencyData));
  }
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
