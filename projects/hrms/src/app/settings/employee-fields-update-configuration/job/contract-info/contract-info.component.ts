import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { IRoles } from '../../../roles-permissions/permissions/permission.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-contract-info',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, MultiSelectModule, ToggleSwitchModule, DataLoaderContentComponent],
  templateUrl: './contract-info.component.html',
  styleUrl: './contract-info.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ContractInfoComponent {
  subscription!: Subscription;
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedFieldConfig: any = null;
  selectedDeleteConfigItem: any = null;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('fieldConfigpopup') fieldConfigpopup: any;
  fieldConfigForm!: FormGroup;

  // Static data for the popup fields
  fieldOptions = [] as any;
  contractInfoFieldsConfigList = [] as any;
  approvalTypeOptions = [
    { label: 'Employee', value: 'EMP' },
    { label: 'Role', value: 'ROLE' },
    { label: 'Manager', value: 'MANAGER' }
  ];
  activeEmplist = [] as any;
 managerOptions = [
    { label: 'Reporting Manager', value: 'RM' },
    { label: 'Team Manager', value: 'TM' }
  ];
  roles = [] as any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
    private authService: AuthService,
  ) {

  }
  ngOnInit(): void {
    this.fieldConfigForm = this.fb.group({
      fieldNames: [[], Validators.required],
      approvalRequired: [true],
      approvalType: [''],
      selectedEmployee: [''],
      selectedRole: [''],
      selectedManager:['']
    });
    this.getContractInfoFields();
    this.setupFormSubscriptions();
    this.getAllEmployeeDetails();
    this.getAllRoles();
    this.getContractInfoFieldsConfigList();
  }

  getContractInfoFields() {
    const params = 'Job';
    const param = 'Contract Info';
    this.http.getDatabyentityvalueForFieldUpdate(`EmployeeInfoApprovalFields/getApprovalFields`, params, param).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.fieldOptions = data.data.filter((field: any) => field.isRequired !== false);
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  getContractInfoFieldsConfigList() {
    const params = {
      displayName: 'Job',
      moduleName: 'Contract Info'
    }
    this.http.getDataIncludeParams(`EmployeeInfoFieldConfig/getEmployeeInfoApprovals`, params).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.contractInfoFieldsConfigList = data.data
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  getAllEmployeeDetails() {
    const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  getAllRoles(): void {
    this.subscription = this.http.getData('FusionRole').subscribe({
      next: (data: any) => {
        this.roles = data as IRoles[];
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  // Method to save field configuration (handles both create and update)
  saveFieldConfig(modal: any) {
    if (this.fieldConfigForm.valid) {
      const formValue = this.isEditMode ? this.fieldConfigForm.getRawValue() : this.fieldConfigForm.value;
      let loggedInUser = this.authService.getToken();
      let approvalAuthority = formValue.approvalType == 'EMP' ? formValue.selectedEmployee : formValue.selectedRole || '';

      if (this.isEditMode) {
        // Update operation
        const request = {
          columnName: this.selectedFieldConfig.columnName,
          moduleName: this.selectedFieldConfig.moduleName,
          displayName: this.selectedFieldConfig.displayName,
          requiresApproval: true,
          approvalType: formValue.approvalType || "",
          approvalAuthority: approvalAuthority.toString() || '',
          updatedBy: loggedInUser.employeeId,
        };

        this.subscription = this.http.putData(`EmployeeInfoFieldConfig/${this.selectedFieldConfig.id}`, request).subscribe({
          next: () => {
            modal.close();
            this.conformationPopup.openSuccessModal('Field configuration updated successfully');
            this.resetFieldConfigForm();
            this.getContractInfoFieldsConfigList();
          },
          error: (error: any) => {
            const errorMessage = error.error?.Message;
            this.conformationPopup.openErrorModal(errorMessage);
          }
        });
      } else {
        // Create operation
        const selectedFields = formValue.fieldNames || [];
        const request = {
          columnNames: selectedFields,
          moduleName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.moduleName : "Contract Info",
          displayName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.tabName : "Job",
          requiresApproval: true,
          approvalType: formValue.approvalType || "",
          approvalAuthority: approvalAuthority.toString() || '',
          createdBy: loggedInUser.employeeId,
        };

        this.subscription = this.http.postdata('EmployeeInfoFieldConfig', request).subscribe({
          next: () => {
            modal.close();
            this.conformationPopup.openSuccessModal('Field configuration saved successfully');
            this.resetFieldConfigForm();
            this.getContractInfoFieldsConfigList();
          },
          error: (error: any) => {
            const errorMessage = error.error?.Message;
            this.conformationPopup.openErrorModal(errorMessage);
          }
        });
      }
    }
  }

  close(modal: any) {
    modal.close();
  }

  // Method to open the delete modal dialog
  // DELETE
  opendelete(configItem: any) {
    this.selectedDeleteConfigItem = configItem;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteConfigItem) return;

    this.subscription = this.http.deleteData(`EmployeeInfoFieldConfig/deleteApprovalConfig/${this.selectedDeleteConfigItem.id}`).subscribe({
      next: () => {
        modal.close();
        this.getContractInfoFieldsConfigList();
        this.conformationPopup.openSuccessModal('Field configuration deleted successfully');
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }
  closeDelete(modal: any) {
    modal.dismiss();
  };

  // Method to open field configuration popup
  openFieldConfigDialog() {
    this.isEditMode = false;
    this.selectedFieldConfig = null;
    this.fieldConfigForm.reset();
    this.fieldConfigForm.get('fieldNames')?.enable(); // Ensure it's enabled for create
    this.modalService.open(this.fieldConfigpopup, {
      backdrop: 'static',
      centered: true
    });
  }

  // Method to open update field configuration dialog
  openUpdateFieldConfigDialog(fieldConfig: any) {
    this.isEditMode = true;
    this.selectedFieldConfig = fieldConfig;
    this.fieldConfigForm.patchValue({
      fieldNames: [fieldConfig.columnName],
      approvalRequired: true,
      approvalType: fieldConfig.approvalType || '',
      selectedEmployee: fieldConfig.approvalType === 'EMP' ? Number(fieldConfig.approvalAuthority) : '',
      selectedRole: fieldConfig.approvalType === 'ROLE' ? fieldConfig.approvalAuthority : ''
    });
    // Disable fieldNames control to make it non-editable in edit mode
    this.fieldConfigForm.get('fieldNames')?.disable();
    this.modalService.open(this.fieldConfigpopup, {
      backdrop: 'static',
      centered: true
    });
  }

  // Setup form subscriptions for reactive changes
  setupFormSubscriptions() {
   

    // Watch for approval type changes
    this.fieldConfigForm.get('approvalType')?.valueChanges.subscribe(value => {
      // Reset employee/role selections when type changes
      this.fieldConfigForm.patchValue({
        selectedEmployee: '',
        selectedRole: ''
      });
      this.updateApprovalValidators(value);
    });
  }

  // Set validators for approval fields
  setApprovalValidators() {
    this.fieldConfigForm.get('approvalType')?.setValidators([Validators.required]);
    this.fieldConfigForm.get('approvalType')?.updateValueAndValidity();
  }

  // Clear validators for approval fields
    clearApprovalValidators() {
    this.fieldConfigForm.get('approvalType')?.clearValidators();
    this.fieldConfigForm.get('selectedEmployee')?.clearValidators();
    this.fieldConfigForm.get('selectedRole')?.clearValidators();
    this.fieldConfigForm.get('selectedManager')?.clearValidators();
    this.fieldConfigForm.get('approvalType')?.updateValueAndValidity();
    this.fieldConfigForm.get('selectedEmployee')?.updateValueAndValidity();
    this.fieldConfigForm.get('selectedRole')?.updateValueAndValidity();
    this.fieldConfigForm.get('selectedManager')?.clearValidators();
  }

  // Update validators based on approval type
   updateApprovalValidators(approvalType: string) {
    // Clear existing validators
    this.fieldConfigForm.get('selectedEmployee')?.clearValidators();
    this.fieldConfigForm.get('selectedRole')?.clearValidators();

    // Set validators based on approval type
    if (approvalType === 'EMP') {
      this.fieldConfigForm.get('selectedEmployee')?.setValidators([Validators.required]);
    } else if (approvalType === 'ROLE') {
      this.fieldConfigForm.get('selectedRole')?.setValidators([Validators.required]);
    } else if (approvalType === 'MANAGER') {
      this.fieldConfigForm.get('selectedManager')?.setValidators([Validators.required]);
    }
    this.fieldConfigForm.get('selectedManager')?.updateValueAndValidity();
    this.fieldConfigForm.get('selectedEmployee')?.updateValueAndValidity();
    this.fieldConfigForm.get('selectedRole')?.updateValueAndValidity();
  }

  // Reset field config form
  resetFieldConfigForm() {
    this.fieldConfigForm.reset();
    this.fieldConfigForm.get('fieldNames')?.enable();
    this.clearApprovalValidators();
    this.isEditMode = false;
    this.selectedFieldConfig = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
