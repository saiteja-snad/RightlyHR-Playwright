import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { IEAV } from '../../../../Interfaces/timoff-model';

@Component({
  selector: 'app-extra-hours-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './extra-hours-configuration.component.html',
  styleUrls: ['./extra-hours-configuration.component.scss']
})
export class ExtraHoursConfigurationComponent implements OnInit, OnDestroy {
  EAVData: IEAV[] = [];
  editingIndex: number | null = null;
  temporaryValue: any;
  valueId!: number;
  currentEntity!: string;
  dataLoad = false;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.loadEAVData();
  }

  /** Fetch configuration data */
  loadEAVData(): void {
    this.cancelEdit();
    this.dataLoad = true;

    const entity = 'ExtraLogHours';
    const attributes = ['AllowedPastDays', 'AllowedHours'];

    this.http.getDatabyentriyvalue(`entityAttributeValues/getv1`, entity, attributes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.EAVData = data.sort((a: { id: number; }, b: { id: number; }) => a.id - b.id);
          this.dataLoad = false;
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.dataLoad = false;
        },
      });
  }

  /** Start editing a specific record */
  startEdit(index: number, id: number, value: any, entity: string): void {
    this.editingIndex = index;
    this.valueId = id;
    this.temporaryValue = value;
    this.currentEntity = entity;
  }

  /** Cancel edit mode */
  cancelEdit(): void {
    this.editingIndex = null;
    this.temporaryValue = null;
  }

  /** Validate values before update */
  validateValue(id: number, value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Value cannot be empty.';
    }

    const criteria = this.EAVData.find(c => c.id === id);
    if (!criteria) return 'Invalid configuration item.';

    switch (criteria.attribute) {
      case 'AllowedPastDays': {
        const intVal = parseInt(value, 10);
        if (isNaN(intVal) || intVal < 1 || intVal > 31) {
          return 'Allowed Past Days should be between 1 and 31';
        }
        break;
      }
      case 'AllowedHours': {
        const floatVal = parseFloat(value);
        if (isNaN(floatVal) || floatVal < 0.5 || floatVal > 6) {
          return 'Allowed Hours should be between 0.5 and 6 (inclusive)';
        }
        break;
      }
      default:
        return 'Invalid attribute type.';
    }

    return null;
  }

  /** Submit updated value */
  submitValue(index: number, value: any): void {
    const error = this.validateValue(this.valueId, value);
    if (error) {
      this.modal.openErrorModal(error);
      return;
    }

    const payload = { id: this.valueId, value };
    this.http.updatePermissionEligibilityValues(`entityAttributeValues/update`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.modal.openSuccessModal('Extra Hours updated successfully');
          this.loadEAVData();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.modal.openErrorModal(err.error || 'Error updating value');
        },
      });

    this.cancelEdit();
  }

  /** Allow only valid decimal or integer input */
  validateInput(event: KeyboardEvent, currentValue: string, attribute: string): void {
    const key = event.key;
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    // Always allow control keys
    if (allowedControlKeys.includes(key)) return;

    if (attribute === 'AllowedPastDays') {
      // Only whole numbers allowed
      if (!/[0-9]/.test(key)) event.preventDefault();
    } else if (attribute === 'AllowedHours') {
      // Allow decimals
      const isNumber = /[0-9]/.test(key);
      const isDot = key === '.';
      if (!isNumber && !isDot) event.preventDefault();
      if (isDot && currentValue.includes('.')) event.preventDefault();

      const newValue = currentValue + key;
      const decimalPattern = /^\d{0,2}(\.\d{0,2})?$/; // e.g., 6.00 max
      if (!decimalPattern.test(newValue)) event.preventDefault();
    }
  }

  /** Block paste, drag, or drop */
  blockPaste(event: ClipboardEvent | DragEvent): void {
    event.preventDefault();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
