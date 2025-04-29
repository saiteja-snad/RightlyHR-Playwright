import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormBuilder,Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { IPolicies } from '../../../../Interfaces/policies.model';
import { Subject, takeUntil } from 'rxjs';
import { ILocation, IShiftHeader, ISubLocation } from '../../../time-off/flexible-leave-allocation/leave-allocation.model';

import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
@Component({
  selector: 'app-add-policies',
  imports: [RouterModule,
    Select,
    CommonModule,
    ReactiveFormsModule,TabsModule,TranslateModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('deletepopup1') deletepopup1: any;
  deleteIndex: number | null = null;
  subscription!: Subscription;
    policiesForm!: FormGroup;
    jobLocationDropDownData: any = [];
    subLocationsDropdown: any = [];
    empinfo : any;
    yearDetails: number[] = [];
    currentYear: number = new Date().getFullYear();
  
  
    constructor(private fb: FormBuilder,public router:Router,private http: HttpService,
       private confirmation: OpenModalService, private modalService: NgbModal,
       public formValidations: FormValidationsService
      ) { }

  
    ngOnInit(): void {
      this.getAllYears();
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
      this.getjobLocationList();
      this.policiesForm = this.fb.group({
        year: [new Date().getFullYear(),Validators.required],
        location: ['',Validators.required],
        subLocation: [{ value: '', disabled: true },Validators.required],
        shift : [{ value: '', disabled: true },Validators.required],
        policies: this.fb.array([]),
      });
      this.addMomentRow();
    }
    
    addPolicyRow() {
     return this.fb.group({
        policyName: ['',[Validators.required, Validators.maxLength(50)]],
        policyFile: ['',Validators.required],
        policyDescription: ['',[Validators.required, Validators.maxLength(50)]]
      });
    }
    getAllYears() {
      for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
        this.yearDetails.push(i);
      }
    }
  
    get policies(): FormArray {
      return this.policiesForm?.get('policies') as FormArray;
    }

    addMomentRow() {
      // if (this.policies.length < 4) {
        this.policies.push(this.addPolicyRow());
      // } else {
      // }
    }
  
  
    removePolicyRow(index: number) {
      this.policies.removeAt(index);
    }
  
    
    submit() {
      
      const formValue = this.policiesForm.value;
  
      const payload = {
        locationId: formValue.location?.id,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year?.value ?? new Date().getFullYear(),
        addedby: parseInt(this.empinfo.employeeId),
        addedDate: new Date().toISOString(),
        status: 'Pending for submission',
        authorizedDate: new Date().toISOString(),
        authorizedstatus: 'string',
        shiftID: formValue.shift,
        orgPolicyItems: formValue.policies.map((item: any) => ({
          policyName: item.policyName,
          policyDescription: item.policyDescription,
          policyAttachment: item.policyFile,
          status: "Pending for submission",
        }))
      };
      this.subscription = this.http.postdata('orgPolicies/Post', payload).subscribe({
        next: (response: any) => {
          localStorage.setItem('personaldata', JSON.stringify(response))
          this.confirmation.openSuccessModal('Policy added successfully');
          this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
        },
        error: (err) => {
          console.log(err);
          this.confirmation.openErrorModal('Policies added failed');
          
        }
      });   
    }
    groupedLocationData: any[] = [];
    getjobLocationList() {
      this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
  
        // Fetch sub-locations for each location
        const subLocationRequests = locations.map((location: { id: any; }) =>
          this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`)
        );
  
        
      }
    });
    
    }
  
    onLocationChange(locationId: any) {
      if (locationId) {
        this.getSubLocationByid(locationId);
        this.policiesForm.get('subLocation')?.enable();
      } else {
        this.jobLocationDropDownData = [];
        this.subLocationsDropdown=[];
        this.policiesForm.get('subLocation')?.disable();
        this.policiesForm.get('shift')?.disable();
      }
    }
  
    getSubLocationByid(selectedLocation: any): void {
      if (selectedLocation && selectedLocation.id) {
        this.subscription = this.http
          .getData(
            `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
          )
          .subscribe({
            next: (data: any) => {
              if (data.length === 0) {
                this.subLocationsDropdown = [];
              } else {
                this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
              }

            },
            error: (err: any) => {
             
            },
          });
      } else {
        this.subLocationsDropdown = [];
        
      }
    }


    onSubLocationChange(subLocationId: any) {
      if (subLocationId) {
        this.getShiftBYid(subLocationId);
        this.policiesForm.get('shift')?.enable();
      } else {
        this.subLocationsDropdown=[];
        this.policiesForm.get('shift')?.disable();
      }
    }

    shiftDropdown: any[] = [];
  
    getShiftBYid(selectedSubLocation: any): void {
      const formValue = this.policiesForm.value;
      if (selectedSubLocation && selectedSubLocation) {
        const locationId = formValue.location?.id
        const subLocationId = selectedSubLocation
  
        this.subscription = this.http
          .getData(
            `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
          )
          .subscribe({
            next: (data: any) => {
  
              if (data.length === 0) {
                this.shiftDropdown = []; // Reset if no shifts are found
              } else {
                this.shiftDropdown = [].concat(
                  ...data.map((element: any) => element.orgShiftsItems)
                ); // Flatten the shift data
              }
            },
            error: (err: any) => {
              console.error('Error fetching shift data:', err);
              this.shiftDropdown = []; // Reset on error
            },
          });
      } else {
        this.shiftDropdown = []; // Reset if no sub-location is selected
      }
    }

    deleteRow(i: any){
      this.deleteIndex = i;
      this.modalService.open(this.deletepopup1, { backdrop: 'static', centered: true });
    }

    onDeleteClose(modal: any) {
      modal.dismiss();
      if (this.deleteIndex !== null) {
        this.removePolicyRow(this.deleteIndex);
      }
    }

    navigation(){
      this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
    }

    closeDelete(modal: any) {
      modal.dismiss();
    }
  
    onDelete(modal: any) {
      modal.dismiss();
      this.navigation();
    }

    Cancel() {
      this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
    }
  
    ngOnDestroy(){
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

}
