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
import { jobRoleDATA } from '../../../employee-fields/job/jobrole/jobrole-model';
import { IRoles } from '../../../roles-permissions/permissions/permission.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-onboarding-info',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, MultiSelectModule, ToggleSwitchModule, DataLoaderContentComponent],
  templateUrl: './onboarding-info.component.html',
  styleUrl: './onboarding-info.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OnboardingInfoComponent {
  subscription!: Subscription;
  loader = false;
  isEditMode = false;
  selectedFieldConfig: any = null;
  selectedDeleteConfigItem: any = null;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('fieldConfigpopup') fieldConfigpopup: any;
  fieldConfigForm!: FormGroup;
  // Static data for the popup fields
  fieldOptions = [] as any;
  onboardingInfoFieldsConfigList = [] as any;
  approvalTypeOptions = [
    { label: 'Employee', value: 'EMP' },
    { label: 'Role', value: 'ROLE' }
  ];
  activeEmplist = [] as any;
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
      approvalRequired: [false],
      approvalType: [''],
      selectedEmployee: [''],
      selectedRole: ['']
    });
    this.getOnboardingInfoFields();
    this.getAllEmployeeDetails();
    this.getAllRoles();
    this.getOnboardingInfoFieldsConfigList();
  }

  getOnboardingInfoFields() {
    const params = 'Job';
    const param = 'Onboarding Info';
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

  getOnboardingInfoFieldsConfigList() {
    const params = {
      displayName: 'Job',
      moduleName: 'Onboarding Info'
    }
    this.http.getDataIncludeParams(`EmployeeInfoFieldConfig/getEmployeeInfoApprovals`, params).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.onboardingInfoFieldsConfigList = data.data
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
      let approvalAuthority = formValue.approvalType == 'EMP' ? formValue.selectedEmployee : formValue.selectedRole;

      if (this.isEditMode) {
        // Update operation
        const request = {
          columnName: this.selectedFieldConfig.columnName,
          moduleName: this.selectedFieldConfig.moduleName,
          displayName: this.selectedFieldConfig.displayName,
          requiresApproval: formValue.approvalRequired || false,
          approvalType: formValue.approvalType || "",
          approvalAuthority: approvalAuthority.toString() || '',
          updatedBy: loggedInUser.employeeId,
        };

        this.subscription = this.http.putData(`EmployeeInfoFieldConfig/${this.selectedFieldConfig.id}`, request).subscribe({
          next: () => {
            modal.close();
            this.conformationPopup.openSuccessModal('Field configuration updated successfully');
            this.resetFieldConfigForm();
            this.getOnboardingInfoFieldsConfigList();
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
          moduleName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.moduleName : "Onboarding Info",
          displayName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.tabName : "Job",
          requiresApproval: formValue.approvalRequired || false,
          approvalType: formValue.approvalType || "",
          approvalAuthority: approvalAuthority.toString() || '',
          createdBy: loggedInUser.employeeId,
        };

        this.subscription = this.http.postdata('EmployeeInfoFieldConfig', request).subscribe({
          next: () => {
            modal.close();
            this.conformationPopup.openSuccessModal('Field configuration saved successfully');
            this.resetFieldConfigForm();
            this.getOnboardingInfoFieldsConfigList();
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
        this.getOnboardingInfoFieldsConfigList();
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
      approvalRequired: fieldConfig.requiresApproval || false,
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

  // Reset field config form
  resetFieldConfigForm() {
    this.fieldConfigForm.reset();
    this.fieldConfigForm.get('fieldNames')?.enable();
    this.isEditMode = false;
    this.selectedFieldConfig = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
