import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subject, Subscription, takeUntil } from 'rxjs';
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
import {
  PolicyVisibilityModuleOption,
  PolicyVisibilitySubModuleOption,
  normalizePolicyVisibilityKey
} from '../../../../shared/policies/policy-visibility.catalog';
import { PolicyVisibilityOptionsService } from '../../../../shared/policies/policy-visibility-options.service';

@Component({
  selector: 'app-clone-policies',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule, NgbPopoverModule, ToggleSwitchModule, InfoIconComponent, MultiSelectModule],
  templateUrl: './clone-policies.component.html',
  styleUrl: './clone-policies.component.scss'
})
export class ClonePoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
  private destroy$ = new Subject<void>();
  isFormEdited: boolean = false;
  submitAttempted = false;
  policyForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updatePoliciesData: any;
  subLocationsDropdown: any = [];
  empinfo: any;
  yearDetails = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
  ]
  policyVisibilityModules: PolicyVisibilityModuleOption[] = [];
  policyVisibilitySubModules: Record<string, Array<{ label: string; value: string }>> = {};


  constructor(private fb: FormBuilder, public router: Router, private http: HttpService,
    private confirmation: OpenModalService, private modalService: NgbModal,
    public formValidations: FormValidationsService,
    private policyVisibilityOptionsService: PolicyVisibilityOptionsService
  ) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updatePoliciesData = JSON.parse(localStorage.getItem('updatepolicies') ?? '{}');

    this.getjobLocationList();
    this.policyForm = this.fb.group({
      year: [null, Validators.required],
      location: [null, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      policies: this.fb.array([])
    });


    this.policyForm.patchValue({
      year: this.yearDetails.find((x: any) => x.value === this.updatePoliciesData.applicableyear),
    });
    this.updatePoliciesData.orgPolicyItems.forEach((row: any) => {
      this.policies.push(
        this.fb.group({
          policyName: [row.policyName, [Validators.required]],
          policyFile: [row.policyAttachment],
          policyDescription: [row.policyDescription,[Validators.required]],
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
    });
    this.policies.controls.forEach((_, policyIndex) => this.validateDuplicateModules(policyIndex));
    this.loadPolicyVisibilityModules();


    this.policyForm.valueChanges.subscribe(() => {
      this.checkIfFormEdited();
    });
  }


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
  checkIfFormEdited() {
    const formValue = this.policyForm.value;

    const hasChanged =
      formValue.year?.value !== this.updatePoliciesData.applicableyear ||
      formValue.location?.id !== this.updatePoliciesData.locationId ||
      formValue.subLocation?.id !== this.updatePoliciesData.subLocationId ||
      formValue.shift?.id !== this.updatePoliciesData.shiftID ||
      this.isPoliciesChanged(formValue.policies, this.updatePoliciesData.orgPolicyItems);

    this.isFormEdited = hasChanged;

    console.log(formValue.shift?.id, this.updatePoliciesData.shiftID)
  }

  isPoliciesChanged(formPolicies: any[], originalPolicies: any[]): boolean {
    if (formPolicies.length !== originalPolicies.length) {
      return true;
    }

    for (let i = 0; i < formPolicies.length; i++) {
      const formPolicy = formPolicies[i];
      const originalPolicy = originalPolicies[i];

      const formName = formPolicy.policyName?.trim();
      const originalName = originalPolicy.policyName?.trim();

      const formDescription = formPolicy.policyDescription?.trim();
      const originalDescription = originalPolicy.policyDescription?.trim();

      if (
        formName !== originalName ||
        formDescription !== originalDescription ||
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
      policyName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      policyFile: [''],
      policyDescription: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      policyNewFile: ['', Validators.required],
      acknowledged: [false],
      notification: [false],
      visibilityMappings: this.fb.array([this.createVisibilityMappingRow()]),
    },
      {
        validator: this.acknowledgementNotificationValidator
      }
    );
    this.policies.push(policyGroup);
  }

  removePolicyRow(index: number) {
    if (this.policies.length > 1) {
      this.policies.removeAt(index);
    }
  }

  acknowledgementNotificationValidator(group: FormGroup): { [key: string]: boolean } | null {
    const acknowledged = group.get('acknowledged')?.value;
    const notification = group.get('notification')?.value;

    if (acknowledged && !notification) {
      return { 'acknowledgementNotificationInvalid': true };
    }

    return null;
  }

  private createVisibilityMappingRow(value?: any): FormGroup {
    return this.fb.group({
      moduleKey: [normalizePolicyVisibilityKey(value?.moduleKey), Validators.required],
      subModuleKeys: [Array.isArray(value?.subModuleKeys) ? value.subModuleKeys.map((item: string) => normalizePolicyVisibilityKey(item)) : []],
      displayEnabled: [value?.displayEnabled ?? false]
    });
  }

  private getInitialVisibilityMappings(item: any): FormGroup[] {
    const byModule = new Map<string, { moduleKey: string; subModuleKeys: string[]; displayEnabled: boolean }>();
    const moduleMappings = item?.moduleMappings;
    if (Array.isArray(moduleMappings) && moduleMappings.length > 0) {
      moduleMappings.forEach((m: any) => {
        const moduleKey = normalizePolicyVisibilityKey(m?.moduleName);
        const subModuleKey = normalizePolicyVisibilityKey(m?.subModuleName);
        if (!moduleKey) return;
        const existing = byModule.get(moduleKey);
        const enabled = m?.isVisible === true;
        if (!existing) {
          byModule.set(moduleKey, { moduleKey, subModuleKeys: subModuleKey ? [subModuleKey] : [], displayEnabled: enabled });
        } else {
          if (subModuleKey && !existing.subModuleKeys.includes(subModuleKey)) existing.subModuleKeys.push(subModuleKey);
          existing.displayEnabled = existing.displayEnabled || enabled;
        }
      });
    } else {
      const targets = item?.visibilityTargets;
      if (Array.isArray(targets) && targets.length > 0) {
        targets.forEach((t: any) => {
          const moduleKey = normalizePolicyVisibilityKey(t?.moduleKey);
          const subModuleKey = normalizePolicyVisibilityKey(t?.subModuleKey);
          if (!moduleKey) return;
          const existing = byModule.get(moduleKey);
          const enabled = t?.enabled === true || t?.displayEnabled === true;
          if (!existing) {
            byModule.set(moduleKey, { moduleKey, subModuleKeys: subModuleKey ? [subModuleKey] : [], displayEnabled: enabled });
          } else {
            if (subModuleKey && !existing.subModuleKeys.includes(subModuleKey)) existing.subModuleKeys.push(subModuleKey);
            existing.displayEnabled = existing.displayEnabled || enabled;
          }
        });
      }
    }
    const rows = [...byModule.values()];
    if (rows.length === 0) return [this.createVisibilityMappingRow()];
    return rows.map(r => this.createVisibilityMappingRow(r));
  }

  getVisibilityMappings(policyIndex: number): FormArray {
    return this.policies.at(policyIndex)?.get('visibilityMappings') as FormArray;
  }

  addVisibilityMapping(policyIndex: number): void {
    this.getVisibilityMappings(policyIndex).push(this.createVisibilityMappingRow());
    this.validateDuplicateModules(policyIndex);
  }

  removeVisibilityMapping(policyIndex: number, mappingIndex: number): void {
    const mappings = this.getVisibilityMappings(policyIndex);
    if (mappings.length <= 1) return;
    mappings.removeAt(mappingIndex);
    this.validateDuplicateModules(policyIndex);
  }

  onModuleKeyChange(policyIndex: number, mappingIndex: number, moduleKey: string | null): void {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const normalizedModuleKey = normalizePolicyVisibilityKey(moduleKey);
    row.patchValue({ moduleKey: normalizedModuleKey, subModuleKeys: [], displayEnabled: false });
    this.loadSubModuleOptions(normalizedModuleKey);
    this.validateDuplicateModules(policyIndex);
  }

  onSubModuleKeysChange(policyIndex: number, mappingIndex: number, subModuleKeys: string[] | null): void {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const next = (subModuleKeys ?? []).map((item) => normalizePolicyVisibilityKey(item));
    row.get('subModuleKeys')?.setValue(next);
    if (next.length === 0) row.get('displayEnabled')?.setValue(false);
  }

  isDisplayToggleVisible(policyIndex: number, mappingIndex: number): boolean {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const moduleKey = normalizePolicyVisibilityKey(row.get('moduleKey')?.value);
    const selected = row.get('subModuleKeys')?.value as string[] | null;
    if (!moduleKey) {
      return false;
    }

    if (this.getSubModuleOptions(moduleKey).length === 0) {
      return true;
    }

    return (selected?.length ?? 0) > 0;
  }

  getSubModuleOptions(moduleKey: string | null): Array<{ label: string; value: string }> {
    return this.policyVisibilitySubModules[normalizePolicyVisibilityKey(moduleKey)] ?? [];
  }

  getModuleOptionsForRow(policyIndex: number, mappingIndex: number): Array<PolicyVisibilityModuleOption & { disabled?: boolean }> {
    const selectedModules = this.getVisibilityMappings(policyIndex).controls
      .map((control, index) => index === mappingIndex ? null : normalizePolicyVisibilityKey(control.get('moduleKey')?.value))
      .filter((value): value is string => !!value);
    const currentValue = normalizePolicyVisibilityKey(this.getVisibilityMappings(policyIndex).at(mappingIndex)?.get('moduleKey')?.value);

    return this.policyVisibilityModules.map((module) => ({
      ...module,
      disabled: module.key !== currentValue && selectedModules.includes(module.key)
    }));
  }

  shouldShowMappingError(policyIndex: number, mappingIndex: number, controlName: 'moduleKey' | 'subModuleKeys', errorKey: string): boolean {
    const control = this.getVisibilityMappings(policyIndex).at(mappingIndex)?.get(controlName);
    return !!control && control.hasError(errorKey) && (control.touched || this.submitAttempted);
  }

  private validateDuplicateModules(policyIndex: number): void {
    const mappings = this.getVisibilityMappings(policyIndex);
    const counts = new Map<string, number>();

    mappings.controls.forEach((control) => {
      const moduleKey = normalizePolicyVisibilityKey(control.get('moduleKey')?.value);
      if (!moduleKey) {
        return;
      }
      counts.set(moduleKey, (counts.get(moduleKey) ?? 0) + 1);
    });

    mappings.controls.forEach((control) => {
      const moduleControl = control.get('moduleKey');
      const moduleKey = normalizePolicyVisibilityKey(moduleControl?.value);
      if (!moduleControl) {
        return;
      }

      const errors = { ...(moduleControl.errors ?? {}) };
      if (moduleKey && (counts.get(moduleKey) ?? 0) > 1) {
        errors['duplicateModule'] = true;
      } else {
        delete errors['duplicateModule'];
      }

      moduleControl.setErrors(Object.keys(errors).length ? errors : null);
    });
  }

  private loadPolicyVisibilityModules(): void {
    this.policyVisibilityOptionsService.getModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe((modules) => {
        this.policyVisibilityModules = modules;
        this.preloadExistingSubModuleOptions();
      });
  }

  private preloadExistingSubModuleOptions(): void {
    this.policies.controls.forEach((policyControl) => {
      const mappings = policyControl.get('visibilityMappings') as FormArray | null;
      mappings?.controls.forEach((mappingControl) => {
        const moduleKey = normalizePolicyVisibilityKey(mappingControl.get('moduleKey')?.value);
        this.loadSubModuleOptions(moduleKey);
      });
    });
  }

  private loadSubModuleOptions(moduleKey: string | null | undefined): void {
    const normalizedModuleKey = normalizePolicyVisibilityKey(moduleKey);
    if (!normalizedModuleKey || this.policyVisibilitySubModules[normalizedModuleKey]) {
      return;
    }

    this.policyVisibilityOptionsService.getSubModules(normalizedModuleKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((subModules: PolicyVisibilitySubModuleOption[]) => {
        this.policyVisibilitySubModules[normalizedModuleKey] = subModules.map((item) => ({
          label: item.label,
          value: item.key
        }));
      });
  }

  hidePublishCloneButtons: boolean = false
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
    const sanitizedFileName = newName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    return new File([file], sanitizedFileName, { type: file.type });
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


  submit() {
    this.submitAttempted = true;
    this.policyForm.markAllAsTouched();
    this.policies.controls.forEach((_, policyIndex) => this.validateDuplicateModules(policyIndex));
    if (this.policyForm.invalid) return;

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
        requiresAcknowledgment: item.acknowledged,
        sendEmailNotification: item.notification,
        sendPushNotification: false,
        sendNotification: item.notification,
        status: "Pending for submission",
        moduleMappings: this.buildModuleMappings(item.visibilityMappings),
      }))
    };
    this.subscription = this.http.postdata('orgPolicies/Post', payload).subscribe({
      next: (response: any) => {
        localStorage.setItem('personaldata', JSON.stringify(response))
        this.confirmation.openSuccessModal('Policy added successfully');
        this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
      },
      error: (err) => {
        const errorMessage = err.error?.Message || 'Failed to add policy';
        this.confirmation.openErrorModal(errorMessage);

      }
    });

  }

  private buildModuleMappings(visibilityMappings: any[] | null | undefined): Array<{
    moduleName: string;
    subModuleName: string;
    isVisible: boolean;
  }> {
    if (!Array.isArray(visibilityMappings)) {
      return [];
    }

    return visibilityMappings.flatMap((mapping: any) => {
      const moduleKey = normalizePolicyVisibilityKey(mapping?.moduleKey);
      const subModuleKeys = Array.isArray(mapping?.subModuleKeys)
        ? mapping.subModuleKeys.map((item: string) => normalizePolicyVisibilityKey(item)).filter(Boolean)
        : [];

      if (!moduleKey) {
        return [];
      }

      const moduleName = this.getModuleLabel(moduleKey);
      if (!moduleName) {
        return [];
      }

      if (this.getSubModuleOptions(moduleKey).length === 0) {
        return [{
          moduleName,
          subModuleName: '',
          isVisible: mapping?.displayEnabled === true
        }];
      }

      return subModuleKeys
        .map((subModuleKey: string) => {
          const subModuleName = this.getSubModuleLabel(moduleKey, subModuleKey);
          if (!subModuleName) {
            return null;
          }

          return {
            moduleName,
            subModuleName,
            isVisible: mapping?.displayEnabled === true
          };
        })
        .filter((item: { moduleName: string; subModuleName: string; isVisible: boolean } | null): item is { moduleName: string; subModuleName: string; isVisible: boolean } => item !== null);
    });
  }

  private getModuleLabel(moduleKey: string): string {
    return this.policyVisibilityModules.find((item) => item.key === moduleKey)?.label ?? moduleKey;
  }

  private getSubModuleLabel(moduleKey: string, subModuleKey: string): string {
    return this.getSubModuleOptions(moduleKey).find((item) => item.value === subModuleKey)?.label ?? subModuleKey;
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }

  cancel() {
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
      this.policyForm.get('subLocation')?.markAsTouched();
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

            const shiftdata = {
              locid: this.updatePoliciesData.locationId,
              sublocid: this.updatePoliciesData.subLocationId
            }
            this.getShiftBYid(shiftdata);
          },
          error: (err: any) => {

          },
        });
    } else {
      this.jobLocationDropDownData = [];
      this.subLocationsDropdown = [];

    }
  }

  shiftDropdown: any[] = [];

  onSubLocationChange(subLocationId: any) {
    if (subLocationId) {
      // Get shift data based on selected sublocation
      this.getShiftBYid(subLocationId);
      // Enable shift dropdown
      this.policyForm.get('shift')?.enable();
      // Reset the shift value to null (allow user to select again)
      this.policyForm.get('shift')?.setValue(null);
      this.policyForm.get('shift')?.markAsTouched();
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
      const locationId = formValue.location?.id ?? this.updatePoliciesData.locationId;
      const subLocationId = formValue.subLocation?.id ?? this.updatePoliciesData.subLocationId;

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
    const fileName = fullPath.split('organizationPolicy/').pop();
    return fileName || 'No file attached';
  }

  navigation() {
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
