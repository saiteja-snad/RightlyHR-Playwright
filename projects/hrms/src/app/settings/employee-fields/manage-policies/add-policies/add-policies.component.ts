import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
@Component({
  selector: 'app-add-policies',
  imports: [RouterModule,
    Select,
    CommonModule,
    ReactiveFormsModule,TabsModule,TranslateModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent {
  subscription!: Subscription;
    policiesForm!: FormGroup;
    jobLocationDropDownData: any = [];
    subLocationsDropdown: any = [];
    empinfo : any;
    yearDetails = [
      { name: '2024', value: 2024 },
      { name: '2025', value: 2025 },
      { name: '2026', value: 2026 },
      { name: '2027', value: 2027 },
      { name: '2028', value: 2028 },
    ]
  
  
    constructor(private fb: FormBuilder,public router:Router,private http: HttpService, private confirmation: OpenModalService) { }

  
    ngOnInit(): void {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
      this.getjobLocationList();
      this.policiesForm = this.fb.group({
        year: [null,Validators.required],
        location: [null,Validators.required],
        subLocation: [null,Validators.required],
        shift : [null,Validators.required],
        policies: this.fb.array([]),
      });
  
      // this.addPolicyRow();
    }
    
    addPolicyRow() {
     return this.fb.group({
        policyName: ['',Validators.required],
        policyFile: ['',Validators.required],
        policyDescription: ['',Validators.required]
      });
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
        applicableyear: formValue.year?.value,
        addedby: parseInt(this.empinfo.employeeId),
        addedDate: new Date().toISOString(),
        status: 'Pending for submission',
        authorizedDate: new Date().toISOString(),
        authorizedstatus: 'string',
        shiftID: formValue.shift,
        orgPolicyItems: formValue.policies.map((item: any) => ({
          policyName: item.policyName,
          policyDescription: item.policyDescription,
          policyAttachment: item.policyAttachment,
          status: "Pending for submission",
        }))
      };
      this.subscription = this.http.postdata('orgPolicies/Post', payload).subscribe({
        next: (response: any) => {
          console.log(response);
          localStorage.setItem('personaldata', JSON.stringify(response))
          this.confirmation.openSuccessModal('Policies added successfully');
          this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
          
        },
        error: (err) => {
          console.log(err);
          this.confirmation.openErrorModal('Policies added failed');
          
        }
      });
      console.log(payload);
      
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
    
              console.log(this.subLocationsDropdown);
            },
            error: (err: any) => {
             
            },
          });
      } else {
        this.subLocationsDropdown = [];
        
      }
    }
    shiftDropdown: any[] = []; // To store the dynamically fetched shifts
  
    getShiftBYid(selectedSubLocation: any): void {
      const formValue = this.policiesForm.value;
      if (selectedSubLocation && selectedSubLocation) {
        const locationId = formValue.location?.id
        const subLocationId = selectedSubLocation
  
        console.log('Location ID:', locationId);
        console.log('Sub Location ID:', subLocationId);
  
        this.subscription = this.http
          .getData(
            `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
          )
          .subscribe({
            next: (data: any) => {
              console.log('Shift Data:', data);
  
              if (data.length === 0) {
                this.shiftDropdown = []; // Reset if no shifts are found
              } else {
                this.shiftDropdown = [].concat(
                  ...data.map((element: any) => element.orgShiftsItems)
                ); // Flatten the shift data
              }
  
              console.log('Shift Dropdown Values:', this.shiftDropdown);
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
    nagvition(){
      this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
    }
  
    ngOnDestroy(){
      
    }

}
