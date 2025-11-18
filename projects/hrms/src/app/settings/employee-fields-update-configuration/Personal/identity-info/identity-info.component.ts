import {
  Component,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { AuthService } from '../../../../services/auth.service';
import { IRoles } from '../../../roles-permissions/permissions/permission.model';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-identity-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MultiSelectModule,
    SelectModule,
    ToggleSwitchModule,
    DataLoaderContentComponent,
    NoDataFoundComponent,
  ],
  templateUrl: './identity-info.component.html',
  styleUrl: './identity-info.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class IdentityInfoComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loader = false;
  isEditMode = false;
  selectedFieldConfig: any = null;
  selectedDeleteConfigItem: any = null;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('fieldConfigpopup') fieldConfigpopup: any;
  fieldConfigForm!: FormGroup;
  // Static data for the popup fields
  fieldOptions = [
    { label: 'Add', value: 'Add' },
    { label: 'Update', value: 'Update' },
    { label: 'Delete', value: 'Delete' },
  ];

  identityInfoFieldsConfigList = [] as any;
  approvalTypeOptions = [
    // { label: 'Employee', value: 'EMP' },
    { label: 'Role', value: 'ROLE' },
    { label: 'Manager', value: 'MANAGER' },
  ];
  activeEmplist = [] as any;
  managerOptions = [
    { label: 'Reporting Manager', value: 'RM' },
    { label: 'Team Manager', value: 'TM' },
  ];
  roles = [] as any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.fieldConfigForm = this.fb.group({
      fieldNames: [[], Validators.required],
      approvalRequired: [true],
      approvalType: ['', Validators.required],
      selectedEmployee: [''],
      selectedRole: [''],
      selectedManager: [''],
    });
    // this.getIdentityInfoFields();
    this.setupFormSubscriptions();
    this.getAllEmployeeDetails();
    this.getAllRoles();
    this.getIdentityInfoFieldsConfigList();
  }

  getIdentityInfoFields() {
    const params = 'Personal';
    const param = 'Identity Info';
    this.http
      .getDatabyentityvalueForFieldUpdate(
        `EmployeeInfoApprovalFields/getApprovalFields`,
        params,
        param
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.fieldOptions = data.data.filter(
              (field: any) => field.isRequired !== false
            );
          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
      });
  }

  getIdentityInfoFieldsConfigList() {
    this.loader = true;
    const params = {
      displayName: 'Personal',
      moduleName: 'Identity Info',
    };
    this.http
      .getDataIncludeParams(
        `EmployeeInfoFieldConfig/getEmployeeInfoApprovals`,
        params
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.identityInfoFieldsConfigList = data.data;
          } else {
            console.log('No data found.');
          }
          this.loader = false;
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.loader = false;
        },
      });
  }

  getAllEmployeeDetails() {
    const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${status}`)
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            }  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
            value: employee.employeeId,
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
      },
    });
  }

  // Method to save field configuration (handles both create and update)
  saveFieldConfig(modal: any) {
    if (this.fieldConfigForm.valid) {
      this.loader = true;
      const formValue = this.isEditMode
        ? this.fieldConfigForm.getRawValue()
        : this.fieldConfigForm.value;
      let loggedInUser = this.authService.getToken();
      let approvalTypeToSend = formValue.approvalType;
      let approvalAuthority = '';

      // EMP
      if (formValue.approvalType === 'EMP') {
        approvalAuthority = formValue.selectedEmployee;
      }

      // ROLE
      else if (formValue.approvalType === 'ROLE') {
        approvalAuthority = formValue.selectedRole;
      }

      // MANAGER
      else if (formValue.approvalType === 'MANAGER') {
        approvalTypeToSend = formValue.selectedManager; // TM / RM
        approvalAuthority = ''; // always empty
      }

      if (this.isEditMode) {
        // Update operation
        const request = {
          columnName: this.selectedFieldConfig.columnName,
          approvalEntity: this.selectedFieldConfig.approvalEntity,
          moduleName: this.selectedFieldConfig.moduleName,
          displayName: this.selectedFieldConfig.displayName,
          requiresApproval: true,
          approvalType: approvalTypeToSend,
          approvalAuthority: approvalAuthority.toString(),
          updatedBy: loggedInUser.employeeId,
        };

        this.subscription = this.http
          .putData(
            `EmployeeInfoFieldConfig/${this.selectedFieldConfig.id}`,
            request
          )
          .subscribe({
            next: () => {
              modal.close();
              this.conformationPopup.openSuccessModal(
                'Field configuration updated successfully'
              );
              this.loader = false;
              this.resetFieldConfigForm();
              // this.getIdentityInfoFields();
              this.getIdentityInfoFieldsConfigList();
            },
            error: (error: any) => {
              const errorMessage = error.error?.message;
              this.conformationPopup.openErrorModal(errorMessage);
              this.loader = false;
            },
          });
      } else {
        // Create operation
        const selectedFields = formValue.fieldNames || [];
        const request = {
          approvalEntity: selectedFields[0], // Add / Update / Delete
          moduleName: 'Identity Info',
          displayName: 'Personal',
          requiresApproval: true,
          approvalType: approvalTypeToSend,
          approvalAuthority: approvalAuthority.toString(),
          createdBy: loggedInUser.employeeId,
        };

        this.subscription = this.http
          .postdata('EmployeeInfoFieldConfig', request)
          .subscribe({
            next: () => {
              modal.close();
              this.conformationPopup.openSuccessModal(
                'Field configuration saved successfully'
              );
              this.loader = false;
              this.resetFieldConfigForm();
              // this.getIdentityInfoFields();
              this.getIdentityInfoFieldsConfigList();
            },
            error: (error: any) => {
              const errorMessage = error.error?.message;
              this.conformationPopup.openErrorModal(errorMessage);
              this.loader = false;
            },
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
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteConfigItem) return;
    this.loader = true;

    this.subscription = this.http
      .deleteData(
        `EmployeeInfoFieldConfig/deleteApprovalConfig/${this.selectedDeleteConfigItem.id}`
      )
      .subscribe({
        next: () => {
          modal.close();
          // this.getIdentityInfoFields();
          this.getIdentityInfoFieldsConfigList();
          this.conformationPopup.openSuccessModal(
            'Field configuration deleted successfully'
          );
          this.loader = false;
        },
        error: (error: any) => {
          const errorMessage = error.error?.message;
          this.conformationPopup.openErrorModal(errorMessage);
          this.loader = false;
        },
      });
  }
  closeDelete(modal: any) {
    modal.dismiss();
  }

  // Method to open field configuration popup
  openFieldConfigDialog() {
    this.isEditMode = false;
    this.selectedFieldConfig = null;
    this.fieldConfigForm.reset();
    this.fieldConfigForm.get('fieldNames')?.enable(); // Ensure it's enabled for create
    this.modalService.open(this.fieldConfigpopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  // Method to open update field configuration dialog
  openUpdateFieldConfigDialog(fieldConfig: any) {
    this.isEditMode = true;
    this.selectedFieldConfig = fieldConfig;
    this.fieldConfigForm.patchValue({
      fieldNames: [fieldConfig.approvalEntity],
      approvalRequired: true,
      approvalType:
        fieldConfig.approvalType === 'TM' || fieldConfig.approvalType === 'RM'
          ? 'MANAGER'
          : fieldConfig.approvalType,
      selectedEmployee:
        fieldConfig.approvalType === 'EMP'
          ? Number(fieldConfig.approvalAuthority)
          : '',
      selectedRole:
        fieldConfig.approvalType === 'ROLE'
          ? fieldConfig.approvalAuthority
          : '',
      selectedManager:
        fieldConfig.approvalType === 'TM' || fieldConfig.approvalType === 'RM'
          ? fieldConfig.approvalType
          : '',
    });
    // Disable fieldNames control to make it non-editable in edit mode
    this.fieldConfigForm.get('fieldNames')?.disable();
    this.modalService.open(this.fieldConfigpopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  // Setup form subscriptions for reactive changes
  setupFormSubscriptions() {
    // Watch for approval type changes
    this.fieldConfigForm
      .get('approvalType')
      ?.valueChanges.subscribe((value) => {
        // Reset employee/role selections when type changes
        this.fieldConfigForm.patchValue({
          selectedEmployee: '',
          selectedRole: '',
          selectedManager: '',
        });
        this.updateApprovalValidators(value);
      });
  }

  // Set validators for approval fields
  setApprovalValidators() {
    this.fieldConfigForm
      .get('approvalType')
      ?.setValidators([Validators.required]);
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
      this.fieldConfigForm
        .get('selectedEmployee')
        ?.setValidators([Validators.required]);
    } else if (approvalType === 'ROLE') {
      this.fieldConfigForm
        .get('selectedRole')
        ?.setValidators([Validators.required]);
    } else if (approvalType === 'MANAGER') {
      this.fieldConfigForm
        .get('selectedManager')
        ?.setValidators([Validators.required]);
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
