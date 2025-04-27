import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-policies',
  imports: [CommonModule,Select,ReactiveFormsModule,TranslateModule, NgbPopoverModule],
  templateUrl: './update-policies.component.html',
  styleUrl: './update-policies.component.scss'
})
export class UpdatePoliciesComponent {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
  policyForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updatePoliciesData : any;
  subLocationsDropdown: any = [];
  empinfo : any;
  yearDetails = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
  ]


  constructor(private fb: FormBuilder,public router:Router,private http: HttpService, private confirmation: OpenModalService,private modalService: NgbModal) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updatePoliciesData = JSON.parse(localStorage.getItem('updatepolicies') ?? '{}');

    this.getjobLocationList();

    
    
    this.policyForm = this.fb.group({
      year: [null,Validators.required],
      location: [null,Validators.required],
      subLocation: [null,Validators.required],
      shift : [null,Validators.required],
      policies: this.fb.array([])
    });
    

    this.policyForm.patchValue({
      year: this.yearDetails.find((x:any) => x.value === this.updatePoliciesData.applicableyear),
    });
    console.log(this.updatePoliciesData);
    this.updatePoliciesData.orgPolicyItems.forEach((row:any) => {
      this.policies.push(
        this.fb.group({
          policyName : [row.policyName, Validators.required],
          policyOldFile :[row.policyAttachment, Validators.required],
          policyDescription  : [row.policyDescription, Validators.required],
          policyNewFile: [''] 
         
        })
      );
    });
    // this.addPolicyRow();
    console.log(this.updatePoliciesData);
  }



  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  
  addPolicyRow() {
    const policyGroup = this.fb.group({
      policyName: ['', Validators.required],
      policyOldFile: ['', Validators.required],
      policyDescription: ['', Validators.required],
      policyNewFile: [''] 
    });
    this.policies.push(policyGroup);
  }

  
  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
  }

  hidePublishCloneButtons : boolean = false
  submit() {
    const formValue = this.policyForm.value;
    console.log(formValue);
    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId: formValue.subLocation.id ?? this.updatePoliciesData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: this.updatePoliciesData.status,
      authorizedDate: new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string' ,
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      id : this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        PolicyName: item.policyName,
        PolicyAttachment: (item.policyNewFile && item.policyNewFile !== '') 
        ? item.policyNewFile 
        : item.policyOldFile,
        PolicyDescription: item.policyDescription ,
        Status: 'Published',
        // holidayColor: 'string',
        HeaderID : this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgPolicies/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Policies updated successfully');
        this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Policies update failed');
        
      }
    });
    console.log(payload);
    
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  clonePolicy1(): void {
    const policyData = localStorage.getItem('viewpolicies');
    if (policyData) {
      const parsedPolicy = JSON.parse(policyData);
      const id = parsedPolicy?.id;
      localStorage.setItem('cloningPolicyId', id);
      if (id) {
        this.router.navigate(['/settings/employee-fields/clonepolices', id]);
      } else {
        console.error('ID not found in viewpolicies localStorage.');
      }
    } else {
      console.error('No viewpolicies data found in localStorage.');
    }
  }

  publish() {
    const formValue = this.policyForm.value;
    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId: formValue.subLocation.id ?? this.updatePoliciesData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: 'Published',
      authorizedDate: new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string' ,
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      id : this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        PolicyName: item.policyName,
        PolicyAttachment: (item.policyNewFile && item.policyNewFile !== '') 
        ? item.policyNewFile 
        : item.policyOldFile,
        PolicyDescription: item.policyDescription,
        Status: 'Published',
        // holidayColor: 'string',
        HeaderID : this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgPolicies/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Policies published successfully');
        this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Policies published failed');
        
      }
    });
    console.log(payload);
    
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        console.log(this.jobLocationDropDownData);
        this.policyForm.patchValue({
          location : this.jobLocationDropDownData.find((x:any) => x.jobLocationName === this.updatePoliciesData.locationName),
        });
        this.getSubLocationByid(this.updatePoliciesData.locationId)
      }
    });

  }

  getPolicyAttachmentName(fullPath: string): string {
    if (!fullPath) return 'No file attached';
    return fullPath.split('\\').pop() || fullPath;
  }

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation) {
      this.subscription = this.http
        .getData(
          `JobLocation/sub-location-by-joblocation/${selectedLocation}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations; 
             
            }

            console.log(this.subLocationsDropdown);
            this.policyForm.patchValue({
              subLocation : this.subLocationsDropdown.find((x:any) => x.jobSubLocationName === this.updatePoliciesData.subLocationName),
            });

            const shiftdata  = {
              locid : this.updatePoliciesData.locationId,
              sublocid : this.updatePoliciesData.subLocationId
            }
            this.getShiftBYid(shiftdata);
          },
          error: (err: any) => {

          },
        });
    } else {
      this.subLocationsDropdown = [];

    }
  }
  shiftDropdown: any[] = []; 

  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.policyForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId =  formValue.location?.id
      const subLocationId = this.updatePoliciesData.subLocationId ?? selectedSubLocation

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
            
            this.policyForm.patchValue({
              shift : this.shiftDropdown.find((x:any) => x.id === this.updatePoliciesData.shiftID),
            });
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

  navigation(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }

  ngOnDestroy(){
    
  }
}
