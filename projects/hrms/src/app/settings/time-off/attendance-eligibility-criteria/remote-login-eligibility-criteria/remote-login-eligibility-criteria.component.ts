import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IPermissionsvalue } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-remote-login-eligibility-criteria',
  imports: [
    CommonModule,
    NoDataFoundComponent,
    FormsModule,
    DataLoaderContentComponent,
    TranslateModule,
  ],
  templateUrl: './remote-login-eligibility-criteria.component.html',
  styleUrl: './remote-login-eligibility-criteria.component.scss',
})
export class RemoteLoginEligibilityCriteriaComponent implements OnInit, OnDestroy{
  regularizationValues = [] as IPermissionsvalue[];
  editingIndex: number | null = null;
  temporaryValue: any;
  valueId!: number;
  currentEntity!: string;
  validationError!: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataLoad = false;
  fieldNameMap: { [key: string]: string } = {
    allowedPerMonth: 'Allowed Per Month',
    pastDatesAllowed: 'Past Dates Allowed',
    futureDatesAllowed: 'Future Dates Allowed',
  };
  constructor(
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.getRemotLoginCriteria();
  }

  getRemotLoginCriteria() {
    this.disableEdit();
    const params = 'RemoteLoginEligibilityCriteria';
    const param = ['allowedPerMonth', 'pastDatesAllowed', 'futureDatesAllowed'];
    this.dataLoad = true;
    this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.regularizationValues = (data as IPermissionsvalue[])?.sort(
            (a, b) => a.id - b.id
          );
          this.dataLoad = false;
        },
        error: (err) => {
          this.dataLoad = false;
          console.log('errors', err);
        },
      });
  }

  validateDecimal(event: KeyboardEvent, criteriaName: string) {
    const inputChar = String.fromCharCode(event.charCode);
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    const newValue =
      currentValue.slice(0, inputElement.selectionStart!) +
      inputChar +
      currentValue.slice(inputElement.selectionEnd!);
    const decimalPattern = /^\d{0,3}(\.\d{0,2})?$/;
    if (!decimalPattern.test(newValue)) {
      event.preventDefault();
    }
  }

  allowOnlyWholeNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const inputChar = event.key;

    if (!allowedKeys.includes(inputChar)) {
      event.preventDefault(); // Block anything not a digit
    }
  }

  blockPaste(event: ClipboardEvent | DragEvent): void {
    event.preventDefault();
  }

  enableEditForRemoteLogin(
    index: number,
    valueId: number,
    currentValue: any,
    entity: string
  ) {
    this.editingIndex = index;
    this.valueId = valueId;
    this.temporaryValue = currentValue;
    this.currentEntity = entity;
  }

  disableEdit() {
    this.editingIndex = null;
    this.temporaryValue = null;
  }

  submitRemoteLoginEligibilityValue(index: number, value: any) {
    this.disableEdit();
    this.validationError = this.validateRemoteLoginEligibilityValue(
      this.valueId,
      value
    );

    if (this.validationError) {
      this.sharedModalService.openErrorModal(this.validationError);
      return;
    }
    const data = {
      id: this.valueId,
      value: value,
    };
    this.http
      .updatePermissionEligibilityValues(`entityAttributeValues/update`, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.getRemotLoginCriteria();

          const currentCriteria = this.regularizationValues;
          const criteria = currentCriteria.find((c) => c.id === this.valueId);
          const fieldLabel =
            this.fieldNameMap[criteria?.attribute ?? ''] || criteria?.attribute;
          this.sharedModalService.openSuccessModal(
            `${fieldLabel} updated successfully`
          );
        },
        error: (err) => {
          console.log(err);
          this.sharedModalService.openErrorModal(err.error);
        },
      });
  }

 validateRemoteLoginEligibilityValue(id: number, value: any): string | null {
  if (value === null || value === undefined || value === '') {
    return 'Value cannot be null or empty.';
  }

  const currentCriteria = this.regularizationValues;
  const criteria = currentCriteria.find((c) => c.id === id);

  if (!criteria) {
    return 'Criteria not found.';
  }

  const displayName = this.fieldNameMap[criteria.attribute] || criteria.attribute;

  switch (criteria.attribute) {
    case 'pastDatesAllowed':
      if (isNaN(value) || value < 0 || value > 31) {
        return `${displayName} should be between 0 and 31.`;
      }
      break;

    case 'futureDatesAllowed':
      if (isNaN(value) || value < 0 || value > 31) {
        return `${displayName} should be between 0 and 31.`;
      }
      break;

    case 'allowedPerMonth':
      if (isNaN(value) || value < 0 || value > 999) {
        return `${displayName} should be between 0 and 999 `;
      }
      break;

    default:
      if (isNaN(value)) {
        return `Please enter a valid number for ${displayName}.`;
      }

      if (value < 0) {
        return `${displayName} cannot be negative.`;
      }
  }

  return null;
}



  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
