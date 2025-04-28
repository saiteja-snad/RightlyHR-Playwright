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
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-clone-policies',
  imports: [CommonModule,Select,ReactiveFormsModule,TranslateModule, NgbPopoverModule],
  templateUrl: './clone-policies.component.html',
  styleUrl: './clone-policies.component.scss'
})
export class ClonePoliciesComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('deletepopup1') deletepopup1: any;
  deleteIndex: number | null = null;
  subscription!: Subscription;
  isFormEdited: boolean = false;
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


  constructor(private fb: FormBuilder,public router:Router,private http: HttpService,
     private confirmation: OpenModalService,private modalService: NgbModal,
     public formValidations: FormValidationsService
    ) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updatePoliciesData = JSON.parse(localStorage.getItem('updatepolicies') ?? '{}');

    this.getjobLocationList();
    this.policyForm = this.fb.group({
      year: [null,Validators.required],
      location: [null,Validators.required],
      subLocation: [{ value: '', disabled: true },Validators.required],
      shift : [{ value: '', disabled: true },Validators.required],
      policies: this.fb.array([])
    });
    

    this.policyForm.patchValue({
      year: this.yearDetails.find((x:any) => x.value === this.updatePoliciesData.applicableyear),
    });
    this.updatePoliciesData.orgPolicyItems.forEach((row:any) => {
      this.policies.push(
        this.fb.group({
          policyName : [row.policyName,[Validators.required, Validators.maxLength(50)]],
          policyFile : [row.policyAttachment],
          policyDescription  : [row.policyDescription,[Validators.required, Validators.maxLength(50)]],
          policyNewFile: ['']
         
        })
      );
    });

    
    this.policyForm.valueChanges.subscribe(() => {
      this.checkIfFormEdited();
    });
  }


  checkIfFormEdited() {
    const formValue = this.policyForm.value;
    
    const hasChanged = 
      formValue.year?.value !== this.updatePoliciesData.applicableyear ||
      formValue.location?.id !== this.updatePoliciesData.locationId ||
      formValue.subLocation?.id !== this.updatePoliciesData.subLocationId ||
      formValue.shift?.id !== this.updatePoliciesData.shiftID ||
      this.isPoliciesChanged(formValue.policies, this.updatePoliciesData.orgPolicyItems);
  
    this.isFormEdited = hasChanged;
  }

  isPoliciesChanged(formPolicies: any[], originalPolicies: any[]): boolean {
    if (formPolicies.length !== originalPolicies.length) {
      return true;
    }
  
    for (let i = 0; i < formPolicies.length; i++) {
      const formPolicy = formPolicies[i];
      const originalPolicy = originalPolicies[i];
  
      if (
        formPolicy.policyName !== originalPolicy.policyName ||
        formPolicy.policyDescription !== originalPolicy.policyDescription ||
        (formPolicy.policyNewFile && formPolicy.policyNewFile !== '')
      ) {
        return true;
      }
    }
  
    return false;
  }

  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  
  addPolicyRow() {
    const policyGroup = this.fb.group({
      policyName: ['', [Validators.required, Validators.maxLength(50)]],
      policyFile: [''],
      policyDescription: ['',[ Validators.required, Validators.maxLength(50)]],
      policyNewFile: ['', Validators.required]
    });
    this.policies.push(policyGroup);
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
  
  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
  }

  hidePublishCloneButtons : boolean = false

  submit() {
      
    const formValue = this.policyForm.value;

    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId: formValue.subLocation.id ?? this.updatePoliciesData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: 'Pending for submission',
      authorizedDate: new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        policyName: item.policyName,
        policyDescription: item.policyDescription,
        policyAttachment: (item.policyNewFile && item.policyNewFile !== '') 
              ? item.policyNewFile 
              : item.policyFile,
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
        this.confirmation.openErrorModal('Failed to add policy');
        
      }
    });
    
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }
  
  cancel(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }

  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        // this.policyForm.patchValue({
        //   location : this.jobLocationDropDownData.find((x:any) => x.jobLocationName === this.updatePoliciesData.locationName),
        // });
        this.getSubLocationByid(this.updatePoliciesData.locationId)
      }
    });

  }

  onLocationChange(locationId: any) {
    if (locationId) {
      this.getSubLocationByid(locationId);
      this.policyForm.get('subLocation')?.enable();
      this.policyForm.get('subLocation')?.setValue(null);
      this.policyForm.get('shift')?.setValue(null);
      this.policyForm.get('shift')?.disable();
    } else {
      this.jobLocationDropDownData = [];
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
      this.policyForm.get('subLocation')?.setValue(null);
      this.policyForm.get('subLocation')?.disable();
      this.policyForm.get('shift')?.setValue(null);
      this.policyForm.get('shift')?.disable();
    }
  }

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation) {
      this.subscription = this.http
        .getData(
          `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations; 
             
            }

            // this.policyForm.patchValue({
            //   subLocation : this.subLocationsDropdown.find((x:any) => x.jobSubLocationName === this.updatePoliciesData.subLocationName),
            // });

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
      this.jobLocationDropDownData=[];
      this.subLocationsDropdown = [];

    }
  }

  // getSubLocationByid(selectedLocation: any): void {
  //   if (selectedLocation && selectedLocation.id) {
  //     this.subscription = this.http
  //       .getData(
  //         `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
  //       )
  //       .subscribe({
  //         next: (data: any) => {
  //           if (data.length === 0) {
  //             this.subLocationsDropdown = [];
  //           } else {
  //             this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
  //           }

  //         },
  //         error: (err: any) => {
           
  //         },
  //       });
  //   } else {
  //     this.subLocationsDropdown = [];
      
  //   }
  // }
  shiftDropdown: any[] = []; 

  onSubLocationChange(subLocationId: any) {
    if (subLocationId) {
      // Get shift data based on selected sublocation
      this.getShiftBYid(subLocationId);
      // Enable shift dropdown
      this.policyForm.get('shift')?.enable();
      // Reset the shift value to null (allow user to select again)
      this.policyForm.get('shift')?.setValue(null);
    } else {
      // Clear shift data and reset shift field if no sublocation is selected
      this.shiftDropdown = [];
      this.policyForm.get('shift')?.setValue(null); // Reset shift value
      this.policyForm.get('shift')?.disable(); // Disable shift dropdown
    }
  }

  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.policyForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId =  this.updatePoliciesData.locationId
      const subLocationId = this.updatePoliciesData.subLocationId ?? selectedSubLocation

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
            
            // this.policyForm.patchValue({
            //   shift : this.shiftDropdown.find((x:any) => x.id === this.updatePoliciesData.shiftID),
            // });
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

  getPolicyAttachmentName(fullPath: string): string {
    if (!fullPath) return 'No file attached';
    // Extract the file name from path (like "C:\\fakepath\\file.pdf")
    return fullPath.split('\\').pop() || fullPath;
  }

  navigation(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }

  ngOnDestroy(){
    
  }
}
