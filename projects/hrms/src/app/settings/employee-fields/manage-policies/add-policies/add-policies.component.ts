import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormBuilder,Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { IPolicies } from '../../../../Interfaces/policies.model';
import { Subject, takeUntil } from 'rxjs';
import { ILocation, IShiftHeader, ISubLocation } from '../../../time-off/flexible-leave-allocation/leave-allocation.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';


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
    ReactiveFormsModule,TabsModule,TranslateModule, ToggleSwitchModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
    policiesForm!: FormGroup;
    jobLocationDropDownData: any = [];
    subLocationsDropdown: any = [];
    empinfo : any;
    yearDetails: number[] = [];
    currentYear: number = new Date().getFullYear();
  isShiftAvailable: boolean = true;
  
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
        policyName: ['',[Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
        policyFile: ['',Validators.required],
        policyFilePath:[''],
        policyDescription: ['',[Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
        acknowledged : [false],
        notification : [false],
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
  
    onClickedAck(event: any, index : number){
      const control = this.policies.at(index);
      if (event.target.checked) {
        control.get('acknowledged')?.setValue(true);
      } else {
        control.get('acknowledged')?.setValue(false);
      }
    }

    onClickedEmail(event: any, index : number){
      const control = this.policies.at(index);
      if (event.target.checked) {
        control.get('notification')?.setValue(true);
      } else {
        control.get('notification')?.setValue(false);
      }

    }
  
    removePolicyRow(index: number) {
      this.policies.removeAt(index);
    }
    onReactiveFileChange(event: any, index: number): void {
      const file = event.target.files[0];
      if (!file) return;
    
      const d: Date = new Date();
      const renamedFile = this.renameFile(file, `${this.empinfo.employeeId}_${d.getTime()}_${file.name}`);
      const filepath = `/FusionDocuments/organizationPolicy/${this.empinfo.employeeId}`;
    
      this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filepath, renamedFile).subscribe({
        next: (response: any) => {
          const control = this.policies.at(index);
          console.log(control)
          control.get('policyFilePath')?.setValue(response.path); // set uploaded file path
          console.log( control.get('policyFilePath')?.setValue(response.path))
        },
        error: err => {
          console.error('File upload failed:', err);
        }
      });
    }
    renameFile(file: File, newName: string): File {
      return new File([file], newName, { type: file.type });
    }
    
    submit() {
      const formValue = this.policiesForm.value;
  
      const payload = {
        locationId: formValue.location?.id,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year ?? new Date().getFullYear(),
        addedby: parseInt(this.empinfo.employeeId),
        addedDate: new Date().toISOString(),
        status: 'Pending for submission',
        authorizedDate: new Date().toISOString(),
        authorizedstatus: 'string',
        shiftID: formValue.shift,
        orgPolicyItems: formValue.policies.map((item: any) => ({
          policyName: item.policyName,
          policyDescription: item.policyDescription,
          policyAttachment: item.policyFilePath,
          requiresAcknowledgment : item.acknowledged,
          sendEmailNotification: item.notification,
          sendPushNotification : false,
          sendNotification: item.notification,
          status: "Pending for submission",
        }))
      };
      this.subscription = this.http.postdata('orgPolicies/Post', payload).subscribe({
        next: (response: any) => {
          localStorage.setItem('personaldata', JSON.stringify(response))
          localStorage.setItem('updatepolicies', JSON.stringify(response))
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
        this.policiesForm.get('shift')?.disable();
        this.policiesForm.get('subLocation')?.markAsTouched();
      } else {
        this.jobLocationDropDownData = [];
        this.subLocationsDropdown=[];
        this.policiesForm.get('subLocation')?.disable();
        this.policiesForm.get('shift')?.disable();
      }
    }
  
    getSubLocationByid(selectedLocation: any): void {
      if (selectedLocation && selectedLocation.id) {
          // Reset subLocation and shift fields when location changes
      this.policiesForm.patchValue({
        subLocation: null,
        shift: null
      });
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
        this.subscription = this.http
          .getData(
            `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
          )
          .subscribe({
            next: (data: any) => {
              if (data.length === 0) {
                this.subLocationsDropdown = [];
                 this.shiftDropdown = []; 
                 this.policiesForm.get('subLocation')?.enable();
            this.policiesForm.get('shift')?.disable();
              } else {
                this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
                 this.shiftDropdown = []; 
                this.policiesForm.get('subLocation')?.enable();
                this.policiesForm.get('shift')?.disable();
              }

            },
            error: (error: any) => {
             if (error.error) {
            this.confirmation.openErrorModal(error.error.Message);
          }
            },
          });
      } else {
        this.subLocationsDropdown = [];
        this.shiftDropdown = [];
        
      }
    }


    onSubLocationChange(subLocationId: any) {
      if (subLocationId) {
        this.getShiftBYid(subLocationId);
        this.policiesForm.get('shift')?.enable();
         this.shiftDropdown = []; 
         this.policiesForm.get('shift')?.markAsTouched();
      } else {
        this.subLocationsDropdown=[];
         this.shiftDropdown = []; 
        this.policiesForm.get('shift')?.disable();
      }
    }

    shiftDropdown: any[] = [];
  
    getShiftBYid(selectedSubLocation: any): void {
      const formValue = this.policiesForm.value;
      if (selectedSubLocation && selectedSubLocation) {
                // Reset subLocation and shift fields when location changes
      this.policiesForm.patchValue({
        shift: null
      });
      this.shiftDropdown = [];
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
                this.isShiftAvailable = false;
              } else {
                 
                this.shiftDropdown = [].concat(
                  ...data.map((element: any) => element.orgShiftsItems)
                  
                ); // Flatten the shift data
                this.isShiftAvailable = false;
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
onShiftChange(shiftID:any) {
      if (shiftID) {
        this.isShiftAvailable = true;
      } else {
        this.isShiftAvailable = false;
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
