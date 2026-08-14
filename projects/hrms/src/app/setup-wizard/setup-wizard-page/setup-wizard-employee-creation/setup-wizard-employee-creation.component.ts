import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import {
  SetupWizardBulkEmployee,
  SetupWizardBulkUploadRequest
} from '../../models/setup-wizard.model';

@Component({
  selector: 'app-setup-wizard-employee-creation',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select, NgxCountriesDropdownModule],
  templateUrl: './setup-wizard-employee-creation.component.html',
  styleUrl: './setup-wizard-employee-creation.component.scss'
})
export class SetupWizardEmployeeCreationComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpService);
  private readonly confirmation = inject(OpenModalService);
  readonly formValidation = inject(FormValidationsService);

  readonly selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  readonly countryListConfig = { hideCode: true };

  employeesForm!: FormGroup;
  jobRoleDetails: { id: number; designationName: string; gradeId: number }[] = [];
  jobLocationDropDownData: { id: number; jobLocationName: string }[] = [];
  rowSubLocations: Record<number, { id: number; jobSubLocationName: string }[]> = {};
  saving = false;
  private nextRowId = 1;

  private subscriptions: Subscription[] = [];

  readonly employmentTypes = [
    { id: 1, name: 'Fresher' },
    { id: 2, name: 'Experienced' }
  ];

  ngOnInit(): void {
    this.employeesForm = this.fb.group({
      rows: this.fb.array([this.createRow()])
    });
    this.loadJobRoles();
    this.loadLocations();
    this.subscriptions.push(
      this.http.refresh$.subscribe(() => {
        this.loadLocations();
      })
    );
  }

  get rows(): FormArray {
    return this.employeesForm.get('rows') as FormArray;
  }

  rowGroup(index: number): FormGroup {
    return this.rows.at(index) as FormGroup;
  }

  subLocationsForRow(index: number): { id: number; jobSubLocationName: string }[] {
    return this.rowSubLocations[index] ?? [];
  }

  get canSaveEmployees(): boolean {
    return this.rows.controls.some(control => {
      const row = control as FormGroup;
      return this.isRowFilled(row) && row.valid;
    });
  }

  createRow(existingRowId?: number): FormGroup {
    const rowId = existingRowId ?? this.nextRowId++;
    if (existingRowId !== undefined && existingRowId >= this.nextRowId) {
      this.nextRowId = existingRowId + 1;
    }

    return this.fb.group({
      rowId: [rowId],
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      middleName: ['', [Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      personalEmail: ['', [Validators.required, Validators.email]],
      contactNumber: ['', this.getContactNumberValidators('IN')],
      contactNumberCountryFlag: ['IN'],
      contactNumberCountryCode: ['+91'],
      designation: [null, Validators.required],
      employmentType: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      isCredentialsRequired: [false]
    });
  }

  addRow(): void {
    this.rows.push(this.createRow());
  }

  removeRow(index: number): void {
    if (this.rows.length <= 1) {
      return;
    }
    this.rows.removeAt(index);
    this.reindexRowMaps(index);
  }

  private reindexRowMaps(removedIndex: number): void {
    this.rowSubLocations = this.reindexRecord(this.rowSubLocations, removedIndex);
  }

  private reindexRecord<T>(record: Record<number, T>, removedIndex: number): Record<number, T> {
    const next: Record<number, T> = {};
    Object.keys(record).forEach(key => {
      const idx = Number(key);
      if (idx < removedIndex) {
        next[idx] = record[idx];
      } else if (idx > removedIndex) {
        next[idx - 1] = record[idx];
      }
    });
    return next;
  }

  onContactCountryChange(country: { code?: string; dialling_code?: string }, index: number): void {
    if (!country?.code || !country?.dialling_code) {
      return;
    }

    const row = this.rowGroup(index);
    row.get('contactNumberCountryFlag')?.setValue(country.code);
    row.get('contactNumberCountryCode')?.setValue(country.dialling_code);
    row.get('contactNumber')?.setValidators(this.getContactNumberValidators(country.code));
    row.get('contactNumber')?.updateValueAndValidity();
  }

  onContactNumberInput(index: number): void {
    const row = this.rowGroup(index);
    const contactNumberControl = row.get('contactNumber');
    const countryFlag = row.get('contactNumberCountryFlag')?.value as string;

    if (contactNumberControl?.value && countryFlag) {
      const formattedValue = this.formatPhoneNumber(String(contactNumberControl.value), countryFlag);
      contactNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  onLocationChange(index: number, event: { value?: number }): void {
    const locationId = event?.value;
    const row = this.rowGroup(index);
    row.get('subLocation')?.setValue('');

    if (!locationId) {
      this.rowSubLocations[index] = [];
      return;
    }

    const sub = this.http
      .getData(`JobLocation/sub-location-by-joblocation/${locationId}`)
      .subscribe({
        next: (data: { jobSubLocations?: { id: number; jobSubLocationName: string }[] }) => {
          this.rowSubLocations[index] = data?.jobSubLocations ?? [];
        },
        error: () => {
          this.rowSubLocations[index] = [];
        }
      });
    this.subscriptions.push(sub);
  }

  saveEmployees(): void {
    const rowsToSave = this.rows.controls
      .map((control, index) => ({ control: control as FormGroup, index }))
      .filter(({ control }) => this.isRowFilled(control));

    if (rowsToSave.length === 0) {
      this.confirmation.openErrorModal('Please add at least one employee row with required details.');
      return;
    }

    const invalidRows = rowsToSave.filter(({ control }) => control.invalid);
    if (invalidRows.length > 0) {
      invalidRows.forEach(({ control }) => control.markAllAsTouched());
      this.confirmation.openErrorModal('Please fill all required fields correctly before saving.');
      return;
    }

    const payload: SetupWizardBulkUploadRequest = {
      employees: rowsToSave.map(({ control, index }) => this.buildEmployeePayload(control, index))
    };
    const formSnapshot = this.captureFormSnapshot();

    this.saving = true;
    const sub = this.http.postdata('Employeedata/bulk-upload', payload).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (this.isBulkUploadSuccess(res)) {
          this.confirmation.openSuccessModal(res.message ?? 'Employee(s) created successfully.');
          this.resetForm();
          this.http.triggerRefresh();
          return;
        }

        this.restoreFormSnapshot(formSnapshot);
        this.confirmation.openErrorModal(this.getBulkUploadErrorMessage(res));
      },
      error: (err: { error?: { Message?: string; message?: string }; message?: string }) => {
        this.saving = false;
        this.restoreFormSnapshot(formSnapshot);
        this.confirmation.openErrorModal(
          err?.error?.Message ?? err?.error?.message ?? err?.message ?? 'Failed to create employees.'
        );
      }
    });
    this.subscriptions.push(sub);
  }

  private isBulkUploadSuccess(res: any): boolean {
    if (!res) {
      return false;
    }

    if (res.success === false || res.isSuccess === false) {
      return false;
    }

    return res.statusCode === 201;
  }

  private getBulkUploadErrorMessage(res: any): string {
    return res?.message ?? res?.Message ?? res?.error?.message ?? 'Failed to create employees.';
  }

  private captureFormSnapshot(): EmployeeFormSnapshot {
    return {
      rows: this.rows.getRawValue(),
      rowSubLocations: { ...this.rowSubLocations },
      nextRowId: this.nextRowId
    };
  }

  private restoreFormSnapshot(snapshot: EmployeeFormSnapshot): void {
    this.rows.clear();

    snapshot.rows.forEach(rowValue => {
      const row = this.createRow(Number(rowValue['rowId']));
      row.patchValue(rowValue);
      const countryFlag = String(rowValue['contactNumberCountryFlag'] ?? 'IN');
      row.get('contactNumber')?.setValidators(this.getContactNumberValidators(countryFlag));
      this.rows.push(row);
    });

    this.nextRowId = snapshot.nextRowId;
    this.rowSubLocations = { ...snapshot.rowSubLocations };
  }

  private buildEmployeePayload(row: FormGroup, index: number): SetupWizardBulkEmployee {
    const value = row.getRawValue();
    const designation = value.designation as { id: number; designationName: string } | null;
    const locationId = Number(value.location);
    const sublocationId = Number(value.subLocation);

    const contactnumber = Number(String(value.contactNumber ?? '').replace(/\D+/g, ''));

    return {
      firstName: value.firstName?.trim() ?? '',
      middleName: value.middleName?.trim() ?? '',
      lastName: value.lastName?.trim() ?? '',
      personalEmailId: value.personalEmail?.trim() ?? '',
      contactnumber,
      contactNumberCountryCode: value.contactNumberCountryCode ?? '',
      contactNumberCountryFlag: value.contactNumberCountryFlag ?? '',
      designation: designation?.designationName ?? '',
      designationId: designation?.id ?? 0,
      employmentType: value.employmentType ?? '',
      location: this.getLocationName(locationId),
      locationId,
      sublocation: this.getSubLocationName(index, sublocationId),
      sublocationId,
      isCredentialsRequired: Boolean(value.isCredentialsRequired)
    };
  }

  private getLocationName(locationId: number): string {
    return this.jobLocationDropDownData.find(location => location.id === locationId)?.jobLocationName ?? '';
  }

  private getSubLocationName(index: number, sublocationId: number): string {
    return this.rowSubLocations[index]?.find(subLocation => subLocation.id === sublocationId)?.jobSubLocationName ?? '';
  }

  private isRowFilled(row: FormGroup): boolean {
    const values = row.getRawValue();
    return Boolean(
      values.firstName?.trim() ||
      values.lastName?.trim() ||
      values.personalEmail?.trim()
    );
  }

  private resetForm(): void {
    this.nextRowId = 1;
    this.rows.clear();
    this.rows.push(this.createRow());
    this.rowSubLocations = {};
  }

  private getContactNumberValidators(countryCode: string) {
    return [Validators.required, this.phoneNumberValidator(countryCode)];
  }

  private phoneNumberValidator(countryCode: string) {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value || !countryCode) {
        return null;
      }

      const phoneNumber = parsePhoneNumberFromString(value, countryCode as CountryCode);
      return phoneNumber?.isValid() ? null : { invalidPhoneNumber: true };
    };
  }

  private formatPhoneNumber(value: string, countryCode: string): string {
    if (!countryCode || !value) {
      return value;
    }

    const phoneNumber = parsePhoneNumberFromString(value, countryCode as CountryCode);
    if (phoneNumber?.isValid()) {
      return phoneNumber.formatNational();
    }

    return value;
  }

  private loadJobRoles(): void {
    const sub = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        this.jobRoleDetails = data ?? [];
      }
    });
    this.subscriptions.push(sub);
  }

  private loadLocations(): void {
    const sub = this.http.getData('JobLocation/getAllLocations').subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = (data ?? []).map((item: { id: number; jobLocationName: string }) => ({
          id: item.id,
          jobLocationName: item.jobLocationName
        }));
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

interface EmployeeFormSnapshot {
  rows: Record<string, unknown>[];
  rowSubLocations: Record<number, { id: number; jobSubLocationName: string }[]>;
  nextRowId: number;
}
