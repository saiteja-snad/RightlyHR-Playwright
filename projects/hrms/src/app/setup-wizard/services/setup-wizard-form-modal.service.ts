import { Injectable, Type, inject, signal } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SetupWizardFormModalShellComponent } from '../setup-wizard-page/setup-wizard-form-modal-shell/setup-wizard-form-modal-shell.component';
import { HttpService } from '../../services/http.service';

export type SetupWizardFormKey =
  | 'add-shifts'
  | 'add-holidays'
  | 'add-weekends'
  | 'add-policies'
  | 'add-leave-category'
  | 'update-shifts'
  | 'update-holidays'
  | 'update-weekends'
  | 'update-policies'
  | 'update-leave-category';

export interface SetupWizardFormDefinition {
  title: string;
  loadComponent: () => Promise<Type<unknown>>;
}

export interface OpenWizardFormOptions {
  onClosed?: () => void;
  onSaved?: () => void;
}

const SETUP_WIZARD_FORM_DEFINITIONS: Record<SetupWizardFormKey, SetupWizardFormDefinition> = {
  'add-shifts': {
    title: 'Add Shifts',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-shifts/add-shift/add-shift.component').then(
        (m) => m.AddShiftComponent as Type<unknown>
      )
  },
  'add-holidays': {
    title: 'Add Holidays',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-holidays/add-holidays/add-holidays.component').then(
        (m) => m.AddHolidaysComponent as Type<unknown>
      )
  },
  'add-weekends': {
    title: 'Add Weekends',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-weekends/add-weekend/add-weekend.component').then(
        (m) => m.AddWeekendComponent as Type<unknown>
      )
  },
  'add-policies': {
    title: 'Add Policies',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-policies/add-policies/add-policies.component').then(
        (m) => m.AddPoliciesComponent as Type<unknown>
      )
  },
  'add-leave-category': {
    title: 'Add Leave Category',
    loadComponent: () =>
      import('../../settings/time-off/leave-categoery/add-leavecategory/add-leavecategory.component').then(
        (m) => m.AddLeavecategoryComponent as Type<unknown>
      )
  },
  'update-shifts': {
    title: 'Update Shifts',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-shifts/update-shift/update-shift.component').then(
        (m) => m.UpdateShiftComponent as Type<unknown>
      )
  },
  'update-holidays': {
    title: 'Update Holidays',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-holidays/update-holidays/update-holidays.component').then(
        (m) => m.UpdateHolidaysComponent as Type<unknown>
      )
  },
  'update-weekends': {
    title: 'Update Weekends',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-weekends/update-weekends/update-weekends.component').then(
        (m) => m.UpdateWeekendsComponent as Type<unknown>
      )
  },
  'update-policies': {
    title: 'Update Policies',
    loadComponent: () =>
      import('../../settings/employee-fields/manage-policies/update-policies/update-policies.component').then(
        (m) => m.UpdatePoliciesComponent as Type<unknown>
      )
  },
  'update-leave-category': {
    title: 'Update Leave Category',
    loadComponent: () =>
      import('../../settings/time-off/leave-categoery/update-leavecategory/update-leavecategory.component').then(
        (m) => m.UpdateLeavecategoryComponent as Type<unknown>
      )
  }
};

@Injectable({ providedIn: 'root' })
export class SetupWizardFormModalService {
  private readonly modalService = inject(NgbModal);
  private readonly http = inject(HttpService);
  private activeRef: NgbModalRef | null = null;
  readonly isModalOpen = signal(false);

  isModalContext(): boolean {
    return this.isModalOpen();
  }

  openWizardForm(formKey: SetupWizardFormKey, options: OpenWizardFormOptions = {}): void {
    const definition = SETUP_WIZARD_FORM_DEFINITIONS[formKey];
    if (!definition) {
      return;
    }

    definition.loadComponent().then((component: Type<unknown>) => {
      this.openModal(component, definition.title, options);
    });
  }

  closeActive(result?: unknown): boolean {
    if (!this.activeRef) {
      return false;
    }
    this.activeRef.close(result);
    return true;
  }

  dismissActive(reason?: unknown): boolean {
    if (!this.activeRef) {
      return false;
    }
    this.activeRef.dismiss(reason);
    return true;
  }

  private openModal(
    formComponent: Type<unknown>,
    title: string,
    options: OpenWizardFormOptions = {}
  ): void {
    this.activeRef = this.modalService.open(SetupWizardFormModalShellComponent, {
      size: 'xl',
      scrollable: true,
      backdrop: 'static',
      keyboard: false,
      centered: true,
      windowClass: 'setup-wizard-form-modal-window',
      modalDialogClass: 'setup-wizard-form-modal-dialog'
    });

    const instance = this.activeRef.componentInstance as SetupWizardFormModalShellComponent;
    instance.title = title;
    instance.formComponent = formComponent;

    this.isModalOpen.set(true);

    this.activeRef.closed.subscribe((result) => {
      this.handleModalClosed(result, options);
    });
    this.activeRef.dismissed.subscribe(() => {
      this.handleModalDismissed(options);
    });
  }

  private handleModalClosed(result: unknown, options: OpenWizardFormOptions): void {
    const saved = result === 'saved';
    this.resetModalState();

    setTimeout(() => {
      if (saved) {
        this.http.triggerRefresh(400);
        options.onSaved?.();
      }
      options.onClosed?.();
    });
  }

  private handleModalDismissed(options: OpenWizardFormOptions): void {
    this.resetModalState();

    setTimeout(() => {
      options.onClosed?.();
    });
  }

  private resetModalState(): void {
    this.activeRef = null;
    this.isModalOpen.set(false);
  }
}
