import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { IPolicies } from '../../../../Interfaces/policies.model';
import { Subject, takeUntil } from 'rxjs';
import { ILocation, IShiftHeader, ISubLocation } from '../../../time-off/flexible-leave-allocation/leave-allocation.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';


import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import {
  PolicyVisibilityModuleOption,
  PolicyVisibilitySubModuleOption,
  normalizePolicyVisibilityKey
} from '../../../../shared/policies/policy-visibility.catalog';
import { PolicyVisibilityOptionsService } from '../../../../shared/policies/policy-visibility-options.service';
@Component({
  selector: 'app-add-policies',
  imports: [RouterModule,
    Select,
    CommonModule,
    ReactiveFormsModule, TabsModule, TranslateModule, ToggleSwitchModule, MultiSelectModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  subscription!: Subscription;
  private destroy$ = new Subject<void>();
  submitAttempted = false;
  policiesForm!: FormGroup;
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  empinfo: any;
  yearDetails: number[] = [];
  currentYear: number = new Date().getFullYear();
  isShiftAvailable: boolean = true;
  policyVisibilityModules: PolicyVisibilityModuleOption[] = [];
  policyVisibilitySubModules: Record<string, Array<{ label: string; value: string }>> = {};
  policyVisibilitySubModulesLoading: Record<string, boolean> = {};

  constructor(private fb: FormBuilder, public router: Router, private http: HttpService,
    private confirmation: OpenModalService, private modalService: NgbModal,
    public formValidations: FormValidationsService,
    private policyVisibilityOptionsService: PolicyVisibilityOptionsService
  ) { }


  ngOnInit(): void {
    this.getAllYears();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getjobLocationList();
    this.policiesForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      policies: this.fb.array([]),
    });
    this.addMomentRow();
    this.loadPolicyVisibilityModules();
  }

  addPolicyRow() {
    return this.fb.group({
      policyName: ['', [Validators.required, Validators.maxLength(50)]],
      policyFile: ['', Validators.required],
      policyFilePath: [''],
      policyDescription: ['', [Validators.required, Validators.maxLength(50)]],
      acknowledged: [false],
      notification: [false],
      visibilityMappings: this.fb.array([this.createVisibilityMappingRow()]),
    },
      {
        validator: this.acknowledgementNotificationValidator
      }
    );
  }

  private createVisibilityMappingRow(value?: any): FormGroup {
    const row = this.fb.group({
      moduleKey: [normalizePolicyVisibilityKey(value?.moduleKey)],
      subModuleKeys: [Array.isArray(value?.subModuleKeys) ? value.subModuleKeys.map((item: string) => normalizePolicyVisibilityKey(item)) : []],
      displayEnabled: [value?.displayEnabled ?? false]
    });
    this.updateVisibilityMappingValidators(row);
    this.updateDisplayToggleState(row);
    return row;
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
    this.updateVisibilityMappingValidators(row);
    this.updateDisplayToggleState(row);
    this.validateDuplicateModules(policyIndex);
  }

  onSubModuleKeysChange(policyIndex: number, mappingIndex: number, subModuleKeys: string[] | null): void {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const next = (subModuleKeys ?? []).map((item) => normalizePolicyVisibilityKey(item));
    row.get('subModuleKeys')?.setValue(next);
    if (next.length === 0) row.get('displayEnabled')?.setValue(false);
    this.updateVisibilityMappingValidators(row);
  }

  isDisplayToggleVisible(policyIndex: number, mappingIndex: number): boolean {
    const row = this.getVisibilityMappings(policyIndex).at(mappingIndex) as FormGroup;
    const moduleKey = normalizePolicyVisibilityKey(row.get('moduleKey')?.value);
    if (!moduleKey || this.policyVisibilitySubModulesLoading[moduleKey] === true) {
      return false;
    }
    return true;
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

  hasSubModuleOptions(moduleKey: string | null | undefined): boolean {
    return this.getSubModuleOptions(moduleKey ?? null).length > 0;
  }

  isSubModuleDisabled(policyIndex: number, mappingIndex: number): boolean {
    const moduleKey = normalizePolicyVisibilityKey(this.getVisibilityMappings(policyIndex).at(mappingIndex)?.get('moduleKey')?.value);
    return !moduleKey || this.policyVisibilitySubModulesLoading[moduleKey] === true || !this.hasSubModuleOptions(moduleKey);
  }

  getSubModulePlaceholder(policyIndex: number, mappingIndex: number): string {
    const moduleKey = normalizePolicyVisibilityKey(this.getVisibilityMappings(policyIndex).at(mappingIndex)?.get('moduleKey')?.value);
    if (!moduleKey) {
      return 'Select main module first';
    }

    if (this.policyVisibilitySubModulesLoading[moduleKey] === true) {
      return 'Loading sub modules...';
    }

    if (!this.hasSubModuleOptions(moduleKey)) {
      return 'No sub modules available';
    }

    return 'Please select sub modules';
  }

  shouldShowMappingError(policyIndex: number, mappingIndex: number, controlName: 'moduleKey' | 'subModuleKeys', errorKey: string): boolean {
    const control = this.getVisibilityMappings(policyIndex).at(mappingIndex)?.get(controlName);
    return !!control && control.hasError(errorKey) && (control.touched || this.submitAttempted);
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

    this.policyVisibilitySubModulesLoading[normalizedModuleKey] = true;
    this.policyVisibilityOptionsService.getSubModules(normalizedModuleKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((subModules: PolicyVisibilitySubModuleOption[]) => {
        this.policyVisibilitySubModules[normalizedModuleKey] = subModules.map((item) => ({
          label: item.label,
          value: item.key
        }));
        this.policyVisibilitySubModulesLoading[normalizedModuleKey] = false;
        this.refreshVisibilityRowsForModule(normalizedModuleKey);
      }, () => {
        this.policyVisibilitySubModulesLoading[normalizedModuleKey] = false;
        this.refreshVisibilityRowsForModule(normalizedModuleKey);
      });
  }

  get isPolicyVisibilityLoading(): boolean {
    return Object.values(this.policyVisibilitySubModulesLoading).some((value) => value === true);
  }

  private updateVisibilityMappingValidators(row: FormGroup): void {
    const moduleKey = normalizePolicyVisibilityKey(row.get('moduleKey')?.value);
    const subModuleKeysControl = row.get('subModuleKeys');
    if (!subModuleKeysControl) {
      return;
    }

    if (moduleKey && this.hasSubModuleOptions(moduleKey)) {
      subModuleKeysControl.enable({ emitEvent: false });
      subModuleKeysControl.setValidators([this.requiredArrayValidator]);
    } else {
      if (!moduleKey || this.policyVisibilitySubModulesLoading[moduleKey] !== true) {
        subModuleKeysControl.setValue([], { emitEvent: false });
      }
      subModuleKeysControl.disable({ emitEvent: false });
      subModuleKeysControl.clearValidators();
      subModuleKeysControl.setErrors(null);
    }

    subModuleKeysControl.updateValueAndValidity({ emitEvent: false });
  }

  private updateDisplayToggleState(row: FormGroup): void {
    const moduleKey = normalizePolicyVisibilityKey(row.get('moduleKey')?.value);
    const displayEnabledControl = row.get('displayEnabled');
    if (!displayEnabledControl) {
      return;
    }

    if (moduleKey) {
      displayEnabledControl.enable({ emitEvent: false });
      return;
    }

    displayEnabledControl.setValue(false, { emitEvent: false });
    displayEnabledControl.disable({ emitEvent: false });
  }

  private requiredArrayValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    return Array.isArray(value) && value.length > 0 ? null : { required: true };
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

  private refreshVisibilityRowsForModule(moduleKey: string): void {
    this.policies.controls.forEach((policyControl, policyIndex) => {
      const mappings = policyControl.get('visibilityMappings') as FormArray | null;
      mappings?.controls.forEach((mappingControl) => {
        if (normalizePolicyVisibilityKey(mappingControl.get('moduleKey')?.value) === moduleKey) {
          this.updateVisibilityMappingValidators(mappingControl as FormGroup);
        }
      });
      this.validateDuplicateModules(policyIndex);
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
  acknowledgementNotificationValidator(group: FormGroup): { [key: string]: boolean } | null {
    const acknowledged = group.get('acknowledged')?.value;
    const notification = group.get('notification')?.value;

    if (acknowledged && !notification) {
      return { 'acknowledgementNotificationInvalid': true };
    }

    return null;
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

  removePolicyRow(index: number) {
    this.policies.removeAt(index);
  }

  onFileChange(event: any, index: number): void {

  }

  onReactiveFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (!file) return;

    const formValue = this.policiesForm.value;
    const year = formValue.year ?? new Date().getFullYear();
    const shiftId = formValue.shift;
    const d: Date = new Date();

    const renamedFile = this.renameFile(file, `${this.empinfo.employeeId}_${d.getTime()}_${file.name}`);
    const filepath = `/Policies/${year}/${shiftId}`;

    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filepath, renamedFile).subscribe({
      next: (response: any) => {
        const control = this.policies.at(index);
        console.log(control)
        control.get('policyFilePath')?.setValue(response.path); // set uploaded file path
        console.log(control.get('policyFilePath')?.setValue(response.path))
      },
      error: err => {
        console.error('File upload failed:', err);
      }
    });
  }

  renameFile(file: File, newName: string): File {
    const sanitizedFileName = newName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    return new File([file], sanitizedFileName, { type: file.type });
  }

  submit() {
    this.submitAttempted = true;
    this.policiesForm.markAllAsTouched();
    this.policies.controls.forEach((policyControl, policyIndex) => {
      const mappings = policyControl.get('visibilityMappings') as FormArray | null;
      mappings?.controls.forEach((mappingControl) => {
        this.updateVisibilityMappingValidators(mappingControl as FormGroup);
      });
      this.validateDuplicateModules(policyIndex);
    });

    if (this.policiesForm.invalid || !this.isShiftAvailable || this.isPolicyVisibilityLoading) {
      return;
    }

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

      if (!this.hasSubModuleOptions(moduleKey)) {
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
    return this.policyVisibilityModules.find((item) => item.key === moduleKey)?.label ?? '';
  }

  private getSubModuleLabel(moduleKey: string, subModuleKey: string): string {
    return this.getSubModuleOptions(moduleKey).find((item) => item.value === subModuleKey)?.label ?? '';
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
      this.subLocationsDropdown = [];
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
      this.subLocationsDropdown = [];
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
  onShiftChange(shiftID: any) {
    if (shiftID) {
      this.isShiftAvailable = true;
    } else {
      this.isShiftAvailable = false;
    }
  }
  navigation() {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
