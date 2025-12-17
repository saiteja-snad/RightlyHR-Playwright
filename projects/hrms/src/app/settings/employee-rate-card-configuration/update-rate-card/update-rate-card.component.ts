import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { updateratecardmodel } from '../rate-card/rate-card-model';

@Component({
  selector: 'app-update-rate-card',
   imports: [RouterModule, Select, ReactiveFormsModule, MultiSelectModule,
    CommonModule, TabsModule, TranslateModule, InfoIconComponent,NgbPopoverModule],
  templateUrl: './update-rate-card.component.html',
  styleUrl: './update-rate-card.component.scss'
})
export class UpdateRateCardComponent {
  subscription!: Subscription;
  updateratecardForm!:FormGroup
  years: number[] = [];
  Employeeinfo={} as any;
  currentYear: number = moment().year();
  locations=[] as any;
  subLocations=[] as any;
  sublocatiodis = false;
  ProjectroleDetails=[] as any;
  FrequencyDetail=[] as any;
    employeedetails = {} as any;
    updateratecardData!: updateratecardmodel;
   @ViewChild('deletepopup') deletepopup: any;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
  ) { }

    ngOnInit(): void {
    this.employeedetails = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.updateratecardData = JSON.parse(localStorage.getItem("updateratecard") || '{}');
    console.log('updateratecard',   this.updateratecardData );
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.getJobrole();
    this.getFrequencies();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
     //default year show selected
    // this.updateratecardForm.patchValue({
    //   year: this.years.find((x: any) => x.value === this.updateratecardData.createdDate)

    // });
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
        } else {
          this.ProjectroleDetails = [];
        }
      },
      error: () => {
      }
    });
  }

   ////this method used for location list show in location dropdown 
  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
         this.sublocatiodis = true;
        const selectedLocation = this.locations.find(
  (x: any) => x.jobLocationName === this.updateratecardData.locationName
);
this.updateratecardForm.patchValue({
  location: selectedLocation ? [selectedLocation.id] : []
});
        // this.subLocationsDropdown = [];
        //this.getSubLocationByid(this.updateHolidaysData.locationId)
      }
    });

  }
   initializeForm() {
    this.updateratecardForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      role:['',Validators.required],
      effectivefrom:['',Validators.required],
      rateItems: this.fb.array([this.createShift()])
      
    });
  }
   get rateItems(): FormArray {
    return this.updateratecardForm.get('rateItems') as FormArray;
  }
 addShift() {
    this.rateItems.push(this.createShift());
  }
    createShift(): FormGroup {
    return this.fb.group({
      experienceMin: ['', Validators.required],
      experienceMax: ['', Validators.required],
      rateBasic: ['', Validators.required],
      currency: ['', Validators.required],
      rate: ['', Validators.required],
    });
  }
    isDeleteDisabled: boolean = false;
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
addRateCard(){

  }
   // location changes
  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.updateratecardForm.get('subLocation');
    // Reset subLocation value
    subLocationControl?.reset();
    if (selectedLocationId) {
      // Enable subLocation field
      subLocationControl?.enable();
      // Find the selected location object
      const selectedLocation = this.locations.find(
        (loc:any) => loc.id === selectedLocationId
      );
      // Extract subLocations
      this.subLocations = selectedLocation?.subLocations || [];
      this.updateratecardForm.get('subLocation')?.markAsTouched();
    } else {
      // Disable if location is invalid
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
