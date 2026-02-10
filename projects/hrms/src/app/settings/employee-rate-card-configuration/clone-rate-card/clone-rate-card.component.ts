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
    responseSummary!: any;
    isloading = false;
    employeedetails: any;
    updateratecardData: any;
    removeRowdata: any;
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
  //  if (this.updateratecardData.effectiveFrom) {
  //     const effectiveMoment = moment(this.updateratecardData.effectiveFrom);
  //        const selectedYear = effectiveMoment.year();
  //       this.minDate = `${selectedYear}-01-01`;
  //        this.maxDate = `${selectedYear}-12-31`;
  //    this.updateratecardForm.patchValue({
  //      effectivefrom: this.updateratecardData.effectiveFrom.split('T')[0]
  //    });
  //  }
  //  // Client Type
  //  if (this.updateratecardData.clientType) {
  //    const clientTypes = this.updateratecardData.clientType.split(',');
  //      this.updateratecardForm.patchValue({
  //        clientType: clientTypes
  //      });
  //  }
   // Currency
   if (this.updateratecardData.experienceBands?.length) {
     const uniqueCurrencies = [...new Set(
       this.updateratecardData.experienceBands.flatMap((band: any) => 
         band.currencies?.map((c: any) => c.currencyCode) || []
       )
     )];
     this.updateratecardForm.patchValue({
       currency: uniqueCurrencies
     }, { emitEvent: false });
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
       currency:['', Validators.required],
       clientType:['', Validators.required],
       rateItems: this.fb.array([this.createRateCardItems()]),
     });
      this.updateratecardForm.get('currency')?.valueChanges.subscribe((data: number) => {
       if (data) {
       this.addRateCardItems();
       }
   });
   }
   get rateItems(): FormArray {
     return this.updateratecardForm.get('rateItems') as FormArray;
   }
 getCurrencies(rateIndex: number): FormArray {
   return this.rateItems.at(rateIndex).get('currencies') as FormArray;
 }
   addRateCardItems() {
     const selectedCurrencies = this.updateratecardForm.get('currency')?.value || [];
 
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
             currencyCode: [currencyCode, Validators.required],
             currencyName: [currency?.name || ''],
             symbol: [currency?.symbol || ''],
             rate: [existingRate, Validators.required]
           })
         );
       });
     });
   }
    addMoreRateItems() {
     const selectedCurrencies = this.updateratecardForm.get('currency')?.value || [];
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
    openModal(content: any) {
     this.modalService.open(content, { centered: true, backdrop: 'static' });
   }
 updateRateCard(){
     let formValues = this.updateratecardForm.getRawValue();
     let payload = {
       effectiveFrom: formValues.effectivefrom,
       roleIds: formValues?.role?.join(','),
       locationIds: formValues?.location?.join(','),
       subLocationIds: formValues?.subLocation?.join(','),
       status: 'Active',
       createdBy: this.Employeeinfo.employeeId,
       experienceBands: formValues.rateItems,
       clientType:formValues.clientType.toString()
     };
    this.subscription=this.http.postdata(`RateCard`,payload).subscribe({
           next: (res: any) => {
             this.isloading = false;
 
               this.responseSummary = res.data;
           if (res.failureCount==0) {
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
 
 onExperienceInput(
   event: Event,
   index: number,
   controlName: 'experienceFrom' | 'experienceTo'
 ) {
   const input = event.target as HTMLInputElement;
   let value = input.value;
 
   // Allow only numbers + one dot + 2 decimals
   if (!/^\d*\.?\d{0,2}$/.test(value)) {
     input.value = value.slice(0, -1);
     return;
   }
 
   const rateItem = this.rateItems.at(index) as FormGroup;
   rateItem.get(controlName)?.setValue(value, { emitEvent: false });
 }
 
 onExperienceBlur(index: number, controlName: 'experienceFrom' | 'experienceTo') {
   const control = (this.rateItems.at(index) as FormGroup).get(controlName);
   if (!control?.value) return;
 
   const value = control.value.toString();
 
   // format check
   if (!/^\d+(\.\d{1,2})?$/.test(value)) {
     control.setValue('', { emitEvent: false });
     control.setErrors({ invalidFormat: true });
     return;
   }
 
   const [, monthStr] = value.split('.');
   if (monthStr && Number(monthStr) > 12) {
     //  CLEAR FIELD
     control.setValue('', { emitEvent: false });
 
     // SHOW ERROR
     control.setErrors({ invalidMonth: true });
     return;
   }
 
   // valid value → clear errors
   control.setErrors(null);
 }
 
 
 validateExperience(value: string): { valid: boolean; error?: string } {
   if (!value) return { valid: true };
 
   if (!/^\d+(\.\d{1,2})?$/.test(value)) {
     return { valid: false, error: 'Invalid format' };
   }
 
   const [, monthStr] = value.split('.');
   if (monthStr && Number(monthStr) > 12) {
     return { valid: false, error: 'Months cannot exceed 12' };
   }
 
   return { valid: true };
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
