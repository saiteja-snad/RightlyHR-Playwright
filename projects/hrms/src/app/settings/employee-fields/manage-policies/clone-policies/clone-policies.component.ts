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
  selector: 'app-clone-policies',
  imports: [CommonModule,Select,ReactiveFormsModule,TranslateModule, NgbPopoverModule],
  templateUrl: './clone-policies.component.html',
  styleUrl: './clone-policies.component.scss'
})
export class ClonePoliciesComponent {
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
          policyFile : [row.policyAttachment,Validators.required],
          policyDescription  : [row.policyDescription,[Validators.required, Validators.maxLength(50)]],
          policyNewFile: ['']
         
        })
      );
    });
  }



  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  
  addPolicyRow() {
    const policyGroup = this.fb.group({
      policyName: ['', [Validators.required, Validators.maxLength(50)]],
      policyFile: ['', Validators.required],
      policyDescription: ['',[ Validators.required, Validators.maxLength(50)]],
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
    } else {
      this.jobLocationDropDownData = [];
      this.subLocationsDropdown=[];
      this.policyForm.get('subLocation')?.disable();
      this.policyForm.get('shift')?.disable();
    }
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
  shiftDropdown: any[] = []; 

  onSubLocationChange(subLocationId: any) {
    if (subLocationId) {
      this.getShiftBYid(subLocationId);
      this.policyForm.get('shift')?.enable();
    } else {
      this.subLocationsDropdown=[];
      this.policyForm.get('shift')?.disable();
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
