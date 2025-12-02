import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { IRoles } from '../../../roles-permissions/permissions/permission.model';
import { AuthService } from '../../../../services/auth.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-addresses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    MultiSelectModule,
    ToggleSwitchModule,
    DataLoaderContentComponent,
    NoDataFoundComponent,
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddressesComponent {
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
  addressesFieldsConfigList = [] as any;
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
  addressTypeOptions = [
    { label: 'Current Address', value: 'CURRENT' },
    { label: 'Permanent Address', value: 'PERMANENT' },
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
  ) { }
  ngOnInit(): void {
    this.initializeFormControls();
    this.fieldConfigForm.get('fieldNames')?.valueChanges.subscribe(val => {
      const approval = this.fieldConfigForm.get('approvalType');

      // If field names selected → approval type must be required
      if (val && val.length > 0) {
        approval?.setValidators([Validators.required]);
      } else {
        approval?.clearValidators();
      }

      approval?.updateValueAndValidity();
    });
    this.getAddressesFields();
    this.setupFormSubscriptions();
    this.getAllEmployeeDetails();
    this.getAllRoles();
    this.getAddressesFieldsConfigList();

    //     this.fieldConfigForm.get('addressType')?.valueChanges.subscribe(() => {
    //   this.updateFieldOptionsDisableStatus();
    // });

  }
  //function to intialize form control
  initializeFormControls() {
    this.fieldConfigForm = this.fb.group({
      addressType: ['', Validators.required],
      fieldNames: [[], Validators.required],
      approvalRequired: [true],
      approvalType: [null, Validators.required],
      selectedEmployee: [''],
      selectedRole: [''],
      selectedManager: [''],
    });
    this.fieldConfigForm.get('approvalType')?.valueChanges.subscribe(value => {
      this.updateConditionalValidators(value);
    });

  }
  //function to handle approval type changes
  updateConditionalValidators(type: string) {

    const role = this.fieldConfigForm.get('selectedRole');
    const emp = this.fieldConfigForm.get('selectedEmployee');
    const mgr = this.fieldConfigForm.get('selectedManager');

    // clear previous validators
    role?.clearValidators();
    emp?.clearValidators();
    mgr?.clearValidators();

    if (type === 'ROLE') {
      role?.setValidators([Validators.required]);
    }

    if (type === 'EMP') {
      emp?.setValidators([Validators.required]);
    }

    if (type === 'MANAGER') {
      mgr?.setValidators([Validators.required]);
    }

    role?.updateValueAndValidity();
    emp?.updateValueAndValidity();
    mgr?.updateValueAndValidity();
  }


  //   isFieldAlreadyUsedForSelectedAddressType(fieldName: string): boolean {
  //   const selectedAddressType = this.fieldConfigForm.get('addressType')?.value;

  //   return this.addressesFieldsConfigList.some((item: any) =>
  //     item.displayName === 'Personal' &&
  //     item.moduleName === 'Address' &&
  //     item.referenceCategory === (selectedAddressType === 'CURRENT' ? 'C' : 'P') &&
  //     item.columnName === fieldName
  //   );
  // }

  // updateFieldOptionsDisableStatus() {
  //   const addressType = this.fieldConfigForm.get('addressType')?.value;

  //   this.fieldOptions = this.fieldOptions.map((option: any) => ({
  //     ...option,
  //     optionDisabled: this.isFieldAlreadyUsedForSelectedAddressType(option.fieldName)
  //   }));
  // }


  get allOptionsDisabled(): boolean {
    return this.fieldOptions?.every((o: any) => o.optionDisabled === true);
  }

  get isReadOnlyMode(): boolean {
    return this.allOptionsDisabled;
  }

  allFieldOptions: any[] = [];
  getAddressesFields() {
    const params = 'Personal';
    const param = 'Addresses';
    this.http
      .getDatabyentityvalueForFieldUpdate(
        `EmployeeInfoApprovalFields/getApprovalFields`,
        params,
        param
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.allFieldOptions = data.data
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

  filterFieldsByAddressType() {
    this.fieldConfigForm.get('fieldNames')?.reset();
    this.fieldOptions = [];
    const selectedType = this.fieldConfigForm.get('addressType')?.value;
    if (!selectedType) {
      this.fieldOptions = [];
      return;
    }

    const prefix = selectedType === 'CURRENT' ? 'Current' : 'Permanent';

    this.fieldOptions = this.allFieldOptions.filter((f: any) =>
      f.fieldName.startsWith(prefix)
    );
    console.log(this.fieldConfigForm)
  }


  getAddressesFieldsConfigList() {
    this.loader = true;
    const params = {
      displayName: 'Personal',
      moduleName: 'Addresses',
    };
    this.http
      .getDataIncludeParams(
        `EmployeeInfoFieldConfig/getEmployeeInfoApprovals`,
        params
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.addressesFieldsConfigList = data.data;
          } else {
            this.addressesFieldsConfigList = [];
            console.log('No data found.');
          }
          this.loader = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.addressesFieldsConfigList = [];
          }
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
            label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''
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

      const referenceCategory =
        formValue.addressType === 'CURRENT'
          ? 'C'
          : formValue.addressType === 'PERMANENT'
            ? 'P'
            : '';

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
        approvalTypeToSend = 'EMP';
        approvalAuthority = ''; // always empty
      }

      if (this.isEditMode) {
        // Update operation
        const request = {
          columnName: this.selectedFieldConfig.columnName,
          sourceFieldName: this.fieldOptions.find(
            (x: any) => x.fieldName === this.selectedFieldConfig.columnName
          )?.actualFieldName,

          moduleName: this.selectedFieldConfig.moduleName,
          displayName: this.selectedFieldConfig.displayName,
          requiresApproval: true,
          approvalType: approvalTypeToSend,
          approvalAuthority: approvalAuthority.toString(),
          approvalEntity:
            formValue.approvalType === 'MANAGER'
              ? formValue.selectedManager
              : '',
          referenceCategory: referenceCategory,
          updatedBy: loggedInUser.employeeId,
          ApprovalScope:'Field'
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
              this.getAddressesFields();
              this.getAddressesFieldsConfigList();
            },
            error: (error: any) => {
              const errorMessage = error.error?.message;
              this.conformationPopup.openErrorModal(errorMessage);
              this.loader = false;
            },
            complete: () => {
              this.fieldConfigForm.reset({ fieldNames: [] });
            },
          });
      } else {
        // Create operation
        const selectedFields = formValue.fieldNames || [];
        const items = selectedFields.map((fieldName: string) => {
          const field = this.fieldOptions.find(
            (x: any) => x.fieldName === fieldName
          );
          return {
            ColumnName: fieldName,
            SourceFieldName: field?.actualFieldName ?? '',
            ApprovalScope:'Field'
          };
        });
        const request = {
          Items: items,
          moduleName:
            this.fieldOptions.length > 0
              ? this.fieldOptions[0]?.moduleName
              : 'Addresses',
          displayName:
            this.fieldOptions.length > 0
              ? this.fieldOptions[0]?.tabName
              : 'Personal',
          requiresApproval: true,
          approvalType: approvalTypeToSend,
          approvalAuthority: approvalAuthority.toString(),
          approvalEntity:
            formValue.approvalType === 'MANAGER'
              ? formValue.selectedManager
              : '',
          referenceCategory: referenceCategory,
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
              this.getAddressesFields();
              this.getAddressesFieldsConfigList();
            },
            error: (error: any) => {
              const errorMessage = error.error?.message;
              this.conformationPopup.openErrorModal(errorMessage);
              this.loader = false;
            },
            complete: () => {
              this.fieldConfigForm.reset({ fieldNames: [] });
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
          this.loader = false;
          this.getAddressesFields();
          this.getAddressesFieldsConfigList();
          this.conformationPopup.openSuccessModal(
            'Field configuration deleted successfully'
          );
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
    this.clearApprovalValidators();
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
      fieldNames: [fieldConfig.columnName],
      approvalRequired: true,
      approvalType:
        fieldConfig.approvalEntity === 'TM' ||
          fieldConfig.approvalEntity === 'RM'
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
        fieldConfig.approvalEntity === 'TM' ||
          fieldConfig.approvalEntity === 'RM'
          ? fieldConfig.approvalEntity
          : '',
      addressType:
        fieldConfig.referenceCategory === 'C'
          ? 'CURRENT'
          : fieldConfig.referenceCategory === 'P'
            ? 'PERMANENT'
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
        // this.fieldConfigForm.patchValue({
        //   selectedEmployee: '',
        //   selectedRole: '',
        //   selectedManager: '',
        // });
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
    this.fieldConfigForm.get('selectedManager')?.clearValidators();

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

  getApprovalTypeDisplay(config: any): string {
    if (config.approvalType === 'ROLE') {
      return 'ROLE';
    }

    if (config.approvalType === 'EMP') {
      if (config.approvalEntity === 'RM') {
        return 'RM';
      } else if (config.approvalEntity === 'TM') {
        return 'TM';
      } else {
        return 'N/A';
      }
    }

    return 'N/A';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
