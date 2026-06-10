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
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { MultiSelectModule } from 'primeng/multiselect';
import { POLICY_VISIBILITY_MODULES } from '../../../../shared/policies/policy-visibility.catalog';

@Component({
  selector: 'app-update-policies',
  imports: [
    CommonModule,
    Select,
    ReactiveFormsModule,
    TranslateModule,
    NgbPopoverModule,
    ToggleSwitchModule,
    InfoIconComponent,
    MultiSelectModule
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
  policyVisibilityModules = POLICY_VISIBILITY_MODULES;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private http: HttpService,
    private confirmation: OpenModalService,
    private modalService: NgbModal,
    public formValidations: FormValidationsService
  ) { }

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
          acknowledged: [row.requiresAcknowledgment],
          notification: [row.sendEmailNotification],
          visibilityMappings: this.fb.array(this.getInitialVisibilityMappings(row)),
        },
          {
            validator: this.acknowledgementNotificationValidator
          }
        )
      );
    }
    );
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
      policyName: ['', [Validators.required]],
      policyFile: [''],
      policyDescription: ['', [Validators.required]],
      policyNewFile: ['', Validators.required],
      acknowledged: [false],
      notification: [false],
      visibilityMappings: this.fb.array([this.createVisibilityMappingRow()]),
    },
      {
        validator: this.acknowledgementNotificationValidator
      }
    );
    this.hidePublishCloneButtons = true;
    this.policies.push(policyGroup);
  }
  // allowed characters A-Z a-z 0-9 space - _ /
restrictPolicyNamedescription(event: KeyboardEvent) {
  const key = event.key;
  const input = event.target as HTMLInputElement;

  // Allow control keys
  if (
    key === 'Backspace' ||
    key === 'Delete' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'Tab' ||
    key === 'Enter'
  ) {
    return;
  }

  // Prevent leading space
  if (key === ' ' && input.selectionStart === 0) {
    event.preventDefault();
    return;
  }

  // Allowed description characters
  const allowed =
    /^[A-Za-z0-9 .,:;?\-_\/&()%'" ]$/;

  if (!allowed.test(key)) {
    event.preventDefault();
  }
}

  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
  }

  private createVisibilityMappingRow(value?: any): FormGroup {
    return this.fb.group({
      moduleKey: [value?.moduleKey ?? null],
      subModuleKeys: [value?.subModuleKeys ?? []],
      displayEnabled: [value?.displayEnabled ?? false]
    });
  }

  private getInitialVisibilityMappings(item: any): FormGroup[] {
    const targets = item?.visibilityTargets;
    if (!Array.isArray(targets) || targets.length === 0) {
      return [this.createVisibilityMappingRow()];
    }
    const byModule = new Map<string, { moduleKey: string; subModuleKeys: string[]; displayEnabled: boolean }>();
    targets.forEach((t: any) => {
      const moduleKey = String(t?.moduleKey ?? '');
      const subModuleKey = String(t?.subModuleKey ?? '');
      if (!moduleKey || !subModuleKey) return;
      const existing = byModule.get(moduleKey);
      const enabled = t?.enabled === true || t?.displayEnabled === true;
      if (!existing) {
        byModule.set(moduleKey, { moduleKey, subModuleKeys: [subModuleKey], displayEnabled: enabled });
      } else {
        if (!existing.subModuleKeys.includes(subModuleKey)) existing.subModuleKeys.push(subModuleKey);
        existing.displayEnabled = existing.displayEnabled || enabled;
      }
    });
    const rows = [...byModule.values()];
    if (rows.length === 0) return [this.createVisibilityMappingRow()];
    return rows.map(r => this.createVisibilityMappingRow(r));
  }

  getVisibilityMappings(policyIndex: number): FormArray {
    return this.policies.at(policyIndex)?.get('visibilityMappings') as FormArray;
  }

  addVisibilityMapping(policyIndex: number): void {
    this.getVisibilityMappings(policyIndex).push(this.createVisibilityMappingRow());
  }

  removeVisibilityMapping(policyIndex: number, mappingIndex: number): void {
    const mappings = this.getVisibilityMappings(policyIndex);
    if (mappings.length <= 1) return;
    mappings.removeAt(mappingIndex);
  }

  onModuleKeyChange(policyIndex: number, mappingIndex: number, moduleKey: string | null): void {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    row.patchValue({ moduleKey, subModuleKeys: [], displayEnabled: false });
  }

  onSubModuleKeysChange(policyIndex: number, mappingIndex: number, subModuleKeys: string[] | null): void {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const next = subModuleKeys ?? [];
    row.get('subModuleKeys')?.setValue(next);
    if (next.length === 0) row.get('displayEnabled')?.setValue(false);
  }

  isDisplayToggleVisible(policyIndex: number, mappingIndex: number): boolean {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const selected = row.get('subModuleKeys')?.value as string[] | null;
    return (selected?.length ?? 0) > 0;
  }

  getSubModuleOptions(moduleKey: string | null): Array<{ label: string; value: string }> {
    const mod = this.policyVisibilityModules.find(m => m.key === moduleKey);
    return (mod?.subModules ?? []).map(s => ({ label: s.label, value: s.key }));
  }

  acknowledgementNotificationValidator(group: FormGroup): { [key: string]: boolean } | null {
    const acknowledged = group.get('acknowledged')?.value;
    const notification = group.get('notification')?.value;

    if (acknowledged && !notification) {
      return { 'acknowledgementNotificationInvalid': true };
    }

    return null;
  }

  onClickedAck(event: any, index: number) {
    const control = this.policies.at(index);
    if (event.target.checked) {
      control.get('acknowledged')?.setValue(true);
    } else {
      control.get('acknowledged')?.setValue(false);
    }
  }

  onClickedEmail(event: any, index: number) {
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

    const formValue = this.policyForm.value;
    const year = formValue.year ?? new Date().getFullYear();
    const shiftId = formValue.shift;

    const timestamp = new Date().getTime();
    const renamedFile = this.renameFile(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    const filepath = `/Policies/${year}/${shiftId}`;

    const control = this.policies.at(index);

    control.get('policyNewFile')?.setValue(file);

    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filepath, renamedFile).subscribe({
      next: (response: any) => {
        control.get('policyNewFile')?.setValue(response.path);
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  renameFile(file: File, newName: string): File {
    const sanitizedFileName = newName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    return new File([file], sanitizedFileName, { type: file.type });
  }

  hidePublishCloneButtons: boolean = false;
  submit() {
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
        Id: item.id,
        PolicyName: item.policyName,
        PolicyAttachment:
          item.policyNewFile && item.policyNewFile !== ''
            ? item.policyNewFile
            : item.policyFile,
        PolicyDescription: item.policyDescription,
        requiresAcknowledgment: item.acknowledged,
        sendEmailNotification: item.notification,
        sendPushNotification: false,
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
          error: (err: any) => { },
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
