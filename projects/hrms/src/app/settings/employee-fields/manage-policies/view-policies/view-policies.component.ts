import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-policies',
  imports: [CommonModule,Select,ReactiveFormsModule,TranslateModule],
  templateUrl: './view-policies.component.html',
  styleUrl: './view-policies.component.scss'
})
export class ViewPoliciesComponent {
  subscription!: Subscription;
  policyForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updatePoliciesData : any;
  subLocationsDropdown: any = [];
  empinfo : any;
  policyFileName: string = '';
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
    this.updatePoliciesData = JSON.parse(localStorage.getItem('viewpolicies') ?? '{}');

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
    this.updatePoliciesData.orgPolicyItems.forEach((row:any) => {
      this.policies.push(
        this.fb.group({
          policyName : row.policyName,
          policyFile : row.policyAttachment,
          policyDescription  : row.policyDescription
         
        })
        
      );
      this.getFileName(row.policyAttachment);
    });
  
    console.log(this.updatePoliciesData);
  }

  getFileName(attachmentPath: string): string {
    if (attachmentPath) {
      const splitPath = attachmentPath.split('/');
      let fileName = splitPath[splitPath.length - 1];
      if (fileName.length > 12) {
        fileName = fileName.substring(12);
        
      }
      this.policyFileName = fileName;
      return fileName;
      
    }
    return '';
  }

  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  
  addPolicyRow() {
    const policyGroup = this.fb.group({
      policyName: [''],
      policyFile: [''],
      policyDescription: ['']
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
      status: this.updatePoliciesData.status,
      authorizedDate: new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string' ,
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      id : this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        policyName: item.policyName,
        policyAttachment: item.policyAttachment,
        policyDescription: item.policyDescription,
        status: 'Published',
        holidayColor: 'string',
        headerID : this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgPolicies/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Policies updated successfully');
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Policies update failed');
        
      }
    });
    console.log(payload);
    
  }
  
  cancel(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  clone(){
    this.router.navigate(['/settings/employee-fields/clonepolices']);
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
        policyName: item.policyName,
        policyAttachment: item.policyAttachment,
        policyDescription: item.policyDescription,
        status: 'Published',
        holidayColor: 'string',
        headerID : this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgPolicies/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Holidays published successfully');
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays published failed');
        
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

  nagvition(){
    this.router.navigate(['/settings/employee-fields/manage-policies/published-policies']);
  }

  ngOnDestroy(){
    
  }
}
