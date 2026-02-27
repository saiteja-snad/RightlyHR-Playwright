import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { Iroles } from '../../../roles-permissions/roles/roles.model';
import { EditIconComponent } from '../../../../icons/edit-icon/edit-icon.component';
import { Assignee } from '../../../../Interfaces/hierachy.modal';
import { RbacService } from '../../../../services/rbac.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { FormValidationsService } from '../../../../services/form-validations.service';
@Component({
  selector: 'app-expenses-limit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select, EditIconComponent, RouterModule],
  templateUrl: './expenses-limit.component.html',
  styleUrls: ['./expenses-limit.component.scss']
})

export class ExpensesLimitComponent implements OnInit {
  allowthresholdLimitForm!: FormGroup;
  subscription!: Subscription;
  allEmployees = [] as Assignee[];
  approverOptions = [
    { label: 'Employee', value: 'EMP' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Role', value: 'Role' },
  ];
  approverList: { label: string; value: any }[] = [];
  getAllEmployeeInfo = [] as any;
  empdata = {} as Ipersonal;
  dataLoad = false;
  rolesdetails: Iroles[] = [];
  isEditing = false;
  attribute!: string;
  entity!: string;
  value: boolean = false;
  id!: number;
  @ViewChild('cancel') cancel: any;

  constructor(private fb: FormBuilder,
    public router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private conformationPopup: OpenModalService,
    public formValidation: FormValidationsService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.initForm();
    this.getdatabyentriy();
  }

  initForm() {
    this.allowthresholdLimitForm = this.fb.group({
      attribute: [''],
      entity: [''],
      value: [{ value: false, disabled: true }], // toggle initially off
      thresholdAmount: ['null', Validators.required],
      approver: ['null', Validators.required],
      approverValue: ['null', Validators.required],
    });
  }

  setInitialFormState(): void {
    // Disable the entire form in view mode
    this.allowthresholdLimitForm.disable({ emitEvent: false });

    // Keep the toggle disabled only in view mode
    if (!this.isEditing) {
      this.allowthresholdLimitForm.get('value')?.disable({ emitEvent: false });
    } else {
      this.allowthresholdLimitForm.get('value')?.enable({ emitEvent: false });
    }
  }

  get isThresholdEnabled(): boolean {
    const v = this.allowthresholdLimitForm?.get('value')?.value;
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  savedMeta = {
    thresholdAmount: '',
    approver: '',
    approverValue: ''
  };

  onToggleChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (!checked) {
      // Save current values
      this.savedMeta = {
        thresholdAmount: this.allowthresholdLimitForm.get('thresholdAmount')?.value,
        approver: this.allowthresholdLimitForm.get('approver')?.value,
        approverValue: this.allowthresholdLimitForm.get('approverValue')?.value
      };

      // Clear and disable only input fields
      this.allowthresholdLimitForm.patchValue({
        thresholdAmount: '',
        approver: '',
        approverValue: ''
      });
      this.allowthresholdLimitForm.get('thresholdAmount')?.disable();
      this.allowthresholdLimitForm.get('approver')?.disable();
      this.allowthresholdLimitForm.get('approverValue')?.disable();
    } else {
      // Restore values and enable inputs
      this.allowthresholdLimitForm.patchValue({
        thresholdAmount: this.savedMeta.thresholdAmount,
        approver: this.savedMeta.approver,
        approverValue: this.savedMeta.approverValue
      });
      this.allowthresholdLimitForm.get('thresholdAmount')?.enable();
      this.allowthresholdLimitForm.get('approver')?.enable();
      this.allowthresholdLimitForm.get('approverValue')?.enable();
    }
  }

  onApproverChange(selectedType: string, restoreValue?: any) {
    this.allowthresholdLimitForm.patchValue({ approverValue: null });
    this.approverList = [];
    if (selectedType === 'EMP') {
      this.getAllEmployees(restoreValue);
    } else if (selectedType === 'Manager') {
      this.getManagers(restoreValue);
    } else if (selectedType === 'Role') {
      this.getRoles(restoreValue);
    }
  }

  getAllEmployees(restoreValue?: any) {
    const satus = ['active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`).subscribe({
      next: (response: any) => {
        if (response) {
          this.getAllEmployeeInfo = response
            .filter((employee: any) => employee.employeeId !== this.empdata.employeeId)
            .map((employee: any) => ({
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName ?? ''}
              ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim(),
            }));
          this.approverList = this.getAllEmployeeInfo.map((emp: any) => ({
            label: emp.fullName,
            value: emp.employeeId
          }));
          // restore approverValue after list populated
          if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
            // ensure types match (string vs number)
            const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
            if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
          }
        }
      },
      error: () => {
        this.approverList = [];
      }
    });
  }

  getManagers(restoreValue?: any) {
    this.approverList = [
      { label: 'Reporting Manager (RM)', value: 'RM' },
      { label: 'Team Manager (TM)', value: 'TM' },
    ];
    if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
      const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
      if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
    }
  }

  getRoles(restoreValue?: any) {
    this.subscription = this.http.getData("RightlyHrRole").subscribe({
      next: (data: any) => {
        this.rolesdetails = data as Iroles[];
        this.approverList = this.rolesdetails.map((role: any) => ({
          label: role.name,
          value: role.id
        }));
        if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
          const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
          if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
        }
      },
      error: () => {
        this.approverList = [];
      }
    });
  }

  getdatabyentriy() {
    const params = 'Expenses';
    const param = 'AllowThresholdLimitValidation';
    this.subscription = this.http.getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
      next: (data: any) => {
        const record = Array.isArray(data) ? data.find((item: any) => item.attribute === 'AllowThresholdLimitValidation') : null;
        if (record) {
          this.attribute = record.attribute;
          // normalize value to boolean
          this.value = record.value === true || record.value === 'true' || record.value === 1 || record.value === '1';
          this.entity = record.entity;
          this.id = record.id;
          let approver = '';
          let approverValue = '';
          let thresholdAmount = '';
          if (record.meta) {
            try {
              const meta = typeof record.meta === 'string' ? JSON.parse(record.meta) : record.meta;
              approver = meta.Approver || meta.approver || '';
              approverValue = meta.approverValue ?? '';
              thresholdAmount = meta.thresholdAmount ?? '';
            } catch (err) {
              console.error('Error parsing meta:', err);
            }
          }
          this.savedMeta = {
            thresholdAmount: `${thresholdAmount}`,
            approver: `${approver}`,
            approverValue: `${approverValue}`
          };
          this.allowthresholdLimitForm.patchValue({
            attribute: this.attribute,
            entity: this.entity,
            value: this.value,
            thresholdAmount,
            approver,
            approverValue
          });
          // ensure approver options are loaded so approverValue displays
          if (approver) {
            this.onApproverChange(approver, approverValue);
            this.allowthresholdLimitForm.get('approverValue')?.updateValueAndValidity({ emitEvent: false });
            this.setInitialFormState();
          }
        }
      },
      error: (err) => {
        console.log('Error fetching data:', err);
      }
    });
  }

  toggleEditing() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      // Enable form and toggle
      this.allowthresholdLimitForm.enable({ emitEvent: false });

      // If toggle is OFF, disable fields except toggle
      if (!this.isThresholdEnabled) {
        this.allowthresholdLimitForm.get('thresholdAmount')?.disable({ emitEvent: false });
        this.allowthresholdLimitForm.get('approver')?.disable({ emitEvent: false });
        this.allowthresholdLimitForm.get('approverValue')?.disable({ emitEvent: false });
      }
    } else {
      // Exit edit mode  lock form but allow toggle visible
      this.setInitialFormState();
    }
  }

  onSubmit(formdata: FormGroup) {
    if (formdata.valid || !this.isThresholdEnabled) {
      const formValue = formdata.value;
      let payload: any;

      if (formValue.value) {
        //  Toggle is ON  send full metadata
        const metaData = {
          displayName: 'Allow Threshold Limit Validation',
          thresholdAmount: Number(formValue.thresholdAmount),
          Approver: formValue.approver,
          approverValue: `${formValue.approverValue}`
        };

        payload = {
          id: this.id,
          entity: 'Expenses',
          attribute: 'AllowThresholdLimitValidation',
          value: 'true',
          meta: JSON.stringify(metaData)
        };
      } else {
        //  Toggle is OFF send meta as null
        payload = {
          id: this.id,
          entity: 'Expenses',
          attribute: 'AllowThresholdLimitValidation',
          value: 'false',
          meta: null
        };
      }
      this.subscription = this.http.postdata(`entityAttributeValues/update`, payload).subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Expense limit configuration updated successfully');
          this.allowthresholdLimitForm.get('value')?.disable({ onlySelf: true });
          this.isEditing = false;
          this.allowthresholdLimitForm.get('approver')?.reset();
          this.setInitialFormState(); // reset view mode
          this.getdatabyentriy();  // re-fetch the saved data

        },
        error: (err) => console.log('Update failed', err)
      });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  resetform() {
    this.isEditing = false;
    this.modalService.dismissAll();
    this.getdatabyentriy();  // re-fetch the saved data
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
