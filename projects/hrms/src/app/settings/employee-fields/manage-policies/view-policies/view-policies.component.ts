import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-policies',
  imports: [
    CommonModule,
    Select,
    ReactiveFormsModule,
    TranslateModule,
    NgbPopoverModule,
  ],
  templateUrl: './view-policies.component.html',
  styleUrl: './view-policies.component.scss',
})
export class ViewPoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
  policyForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updatePoliciesData: any;
  subLocationsDropdown: any = [];
  empinfo: any;
  hideBUTTON = false;
  policyFileName: string = '';
  policyFileNames: string[] = [];
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updatePoliciesData = JSON.parse(
      localStorage.getItem('viewpolicies') ?? '{}'
    );

    this.getjobLocationList();

    this.policyForm = this.fb.group({
      year: [{ value: null, disabled: true }, Validators.required],
      location: [{ value: null, disabled: true }, Validators.required],
      subLocation: [{ value: null, disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      policies: this.fb.array([]),
    });

    this.policyForm.patchValue({
      year: this.yearDetails.find(
        (x: any) => x.value === this.updatePoliciesData.applicableyear
      ),
    });
    this.updatePoliciesData.orgPolicyItems.forEach(
      (row: any, index: number) => {
        this.policies.push(
          this.fb.group({
            policyName: [{ value: row.policyName, disabled: true }],
            policyFile: [row.policyAttachment],
            policyDescription: [
              { value: row.policyDescription, disabled: true },
            ],
          })
        );
        const fileName = this.getFileName(row.policyAttachment);
        this.policyFileNames[index] = fileName;
      }
    );

    this.policyForm.patchValue({
      location: { jobLocationName: this.updatePoliciesData.locationName },
      subLocation: {
        jobSubLocationName: this.updatePoliciesData.subLocationName,
      },
      shift: { id: this.updatePoliciesData.shiftName }, // Or use shiftName if that's the display value
    });
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
      policyName: [{ value: '', disabled: true }, Validators.required],
      policyFile: [{ value: '', disabled: true }, Validators.required],
      policyDescription: [{ value: '', disabled: true }, Validators.required],
    });
    this.policies.push(policyGroup);
  }

  cloneshiftsPolicy1(): void {
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
  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
  }

  hidePublishCloneButtons: boolean = false;
  submit() {
    const formValue = this.policyForm.value;

    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId:
        formValue.subLocation.id ?? this.updatePoliciesData.subLocationId,
      applicableyear:
        formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby:
        parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: this.updatePoliciesData.status,
      authorizedDate:
        new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      id: this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        policyName: item.policyName,
        policyAttachment: item.policyAttachment,
        policyDescription: item.policyDescription,
        status: 'Published',
        holidayColor: 'string',
        headerID: this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      })),
    };
    this.subscription = this.http
      .postdata('orgPolicies/Update', payload)
      .subscribe({
        next: (response: any) => {
          this.confirmation.openSuccessModal('Policies updated successfully');
        },
        error: (err) => {
          this.confirmation.openErrorModal('Policies update failed');
        },
      });
  }

  Cancel() {
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }

  cancel() {
    this.router.navigate([
      '/settings/employee-fields/manage-policies/pending-for-submit',
    ]);
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  clone() {
    this.router.navigate(['/settings/employee-fields/clonepolices']);
  }

  publish() {
    const formValue = this.policyForm.value;
    const payload = {
      locationId: formValue.location?.id ?? this.updatePoliciesData.locationId,
      subLocationId:
        formValue.subLocation.id ?? this.updatePoliciesData.subLocationId,
      applicableyear:
        formValue.year?.value ?? this.updatePoliciesData.applicableyear,
      addedby:
        parseInt(this.empinfo.employeeId) ?? this.updatePoliciesData.addedby,
      addedDate: new Date().toISOString() ?? this.updatePoliciesData.addedDate,
      status: 'Published',
      authorizedDate:
        new Date().toISOString() ?? this.updatePoliciesData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updatePoliciesData.shiftID,
      id: this.updatePoliciesData.id,
      orgPolicyItems: formValue.policies.map((item: any) => ({
        policyName: item.policyName,
        policyAttachment: item.policyAttachment,
        policyDescription: item.policyDescription,
        status: 'Published',
        holidayColor: 'string',
        headerID: this.updatePoliciesData?.orgPolicyItems?.[0]?.headerID,
      })),
    };
    this.subscription = this.http
      .postdata('orgPolicies/Update', payload)
      .subscribe({
        next: (response: any) => {
          this.confirmation.openSuccessModal('Holidays published successfully');
        },
        error: (err) => {
          console.log(err);
          this.confirmation.openErrorModal('Holidays published failed');
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
      const locationId =
        this.updatePoliciesData.locationId ?? formValue.location.id;
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
                (x: any) => x.id === this.updatePoliciesData.shiftName
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

  getPolicyAttachmentName(fullPath: string): string {
    if (!fullPath) return 'No file attached';
    return fullPath.split('\\').pop() || fullPath;
  }

  navigation() {
    this.router.navigate([
      '/settings/employee-fields/manage-policies/published-policies',
    ]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // localStorage.removeItem('viewpolicies');
  }
}
