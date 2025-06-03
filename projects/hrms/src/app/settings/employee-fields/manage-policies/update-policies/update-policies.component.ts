import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-update-policies',
  imports: [
    CommonModule,
    Select,
    ReactiveFormsModule,
    TranslateModule,
    NgbPopoverModule,
    ToggleSwitchModule
  ],
  templateUrl: './update-policies.component.html',
  styleUrl: './update-policies.component.scss',
})
export class UpdatePoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
  policyForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updatePoliciesData: any;
  subLocationsDropdown: any = [];
  empinfo: any;
  initialPoliciesState: any;
  yearDetails = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
  ];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private http: HttpService,
    private confirmation: OpenModalService,
    private modalService: NgbModal,
    public formValidations: FormValidationsService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updatePoliciesData = JSON.parse(
      localStorage.getItem('updatepolicies') ?? '{}'
    );

    this.getjobLocationList();

    this.policyForm = this.fb.group({
      year: [{ value: null, disabled: true }, Validators.required],
      location: [{ value: null, disabled: true }, Validators.required],
      subLocation: [{ value: null, disabled: true }, Validators.required],
      shift: [{ value: null, disabled: true }, Validators.required],
      policies: this.fb.array([]),
    });

    this.policyForm.patchValue({
      year: this.yearDetails.find(
        (x: any) => x.value === this.updatePoliciesData.applicableyear
      ),
    });
    this.updatePoliciesData.orgPolicyItems.forEach((row: any) => {
      this.policies.push(
        this.fb.group({
          policyName: [
            row.policyName,
            [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)],
          ],
          policyFile: [row.policyAttachment],
          policyDescription: [
            row.policyDescription,
            [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)],
          ],
          policyNewFile: [''],
          acknowledged : [row.requiresAcknowledgment],
          notification : [row.sendEmailNotification],
        })
      );
    });
    // this.addPolicyRow();

    this.policies.valueChanges.subscribe(() => {
    const currentState = JSON.stringify(this.policies.getRawValue());
    this.hidePublishCloneButtons = currentState !== this.initialPoliciesState;
});
  }

  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  addPolicyRow() {
    const policyGroup = this.fb.group({
      policyName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      policyFile: [''],
      policyDescription: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      policyNewFile: ['', Validators.required],
      acknowledged : [false],
      notification : [false],
    });
    this.hidePublishCloneButtons = true;
    this.policies.push(policyGroup);
  }

  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
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
  
  onPolicyFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (!file) return;
  
    const timestamp = new Date().getTime();
    const renamedFile = this.renameFile(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    const filepath = `/FusionDocuments/organizationPolicy/${this.empinfo.employeeId}`;
  
    const control = this.policies.at(index);
  
    // Save original file object (for validation or display if needed)
    control.get('policyNewFile')?.setValue(file);
  
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filepath, renamedFile).subscribe({
      next: (response: any) => {
        control.get('policyNewFile')?.setValue(response.path);  // save uploaded file path instead
      
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  renameFile(file: File, newName: string): File {
    return new File([file], newName, { type: file.type });
  }
  

  hidePublishCloneButtons: boolean = false;
  submit() {
    debugger
    console.log(this.updatePoliciesData)
    const formValue = this.policyForm.value;
    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId:
        formValue.subLocation?.id ?? this.updatePoliciesData.subLocationId,
      applicableyear:
        formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby:
        parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: this.updatePoliciesData.status,
      authorizedDate:
        new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift?.id ?? this.updatePoliciesData.shiftID,
      id: this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        Id : item.id,
        PolicyName: item.policyName,
        PolicyAttachment:
          item.policyNewFile && item.policyNewFile !== ''
            ? item.policyNewFile
            : item.policyFile,
        PolicyDescription: item.policyDescription,
        requiresAcknowledgment : item.acknowledged,
        sendEmailNotification: item.notification,
        sendPushNotification : false,
        sendNotification: item.notification,
        Status: 'Pending for submission',
        // holidayColor: 'string',
        HeaderID: this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      })),
    };
    console.log(payload);
    this.subscription = this.http
      .postdata('orgPolicies/Update', payload)
      .subscribe({
        next: (response: any) => {
          this.confirmation.openSuccessModal('Policies updated successfully');
          this.router.navigate([
            '/settings/employee-fields/manage-policies/pending-for-submit',
          ]);
        },
        error: (err) => {
          console.log(err);
          this.confirmation.openErrorModal('Policies update failed');
        },
      });
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  Cancel() {
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  clonePolicy1(): void {
     this.router.navigate(['/settings/employee-fields/clonepolices']);
  }

  publish() {
    this.initialPoliciesState = JSON.stringify(this.policies.getRawValue());
    this.hidePublishCloneButtons = false;
    let publishItem = {
      Category: 'policies',
      refentityId: this.updatePoliciesData.orgPolicyItems[0].headerID
    }
    this.subscription = this.http
      .postdata(`CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`, { params: publishItem })
      .subscribe({
        next: (response: any) => {
          this.confirmation.openSuccessModal('Policies published successfully');
          this.router.navigate([
            '/settings/employee-fields/manage-policies/pending-for-submit',
          ]);
        },
        error: (err) => {
          console.log(err);
          this.confirmation.openErrorModal('Policies published failed');
        },
      });
  }

  getjobLocationList() {
    this.subscription = this.http
      .getData(`JobLocation/getAllLocations`)
      .subscribe({
        next: (locations: any) => {
          this.jobLocationDropDownData = locations;
          this.policyForm.patchValue({
            location: this.jobLocationDropDownData.find(
              (x: any) =>
                x.jobLocationName === this.updatePoliciesData.locationName
            ),
          });
          this.getSubLocationByid(this.updatePoliciesData.locationId);
        },
      });
  }

  getPolicyAttachmentName(fullPath: string): string {
    if (!fullPath) return 'No file attached';
    const fileName = fullPath.split('organizationPolicy/').pop();
    return fileName || 'No file attached';
  }

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation) {
      this.subscription = this.http
        .getData(`JobLocation/sub-location-by-joblocation/${selectedLocation}`)
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations;
            }

            this.policyForm.patchValue({
              subLocation: this.subLocationsDropdown.find(
                (x: any) =>
                  x.jobSubLocationName ===
                  this.updatePoliciesData.subLocationName
              ),
            });

            const shiftdata = {
              locid: this.updatePoliciesData.locationId,
              sublocid: this.updatePoliciesData.subLocationId,
            };
            this.getShiftBYid(shiftdata);
          },
          error: (err: any) => {},
        });
    } else {
      this.subLocationsDropdown = [];
    }
  }
  shiftDropdown: any[] = [];

  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.policyForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId = this.updatePoliciesData.locationId;
      const subLocationId =
        this.updatePoliciesData.subLocationId ?? selectedSubLocation;

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

            this.policyForm.patchValue({
              shift: this.shiftDropdown.find(
                (x: any) => x.id === this.updatePoliciesData.shiftID
              ),
            });
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

  navigation() {
    this.router.navigate([
      '/settings/employee-fields/manage-policies/pending-for-submit',
    ]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
