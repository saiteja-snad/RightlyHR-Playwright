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
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, MultiSelectModule, ToggleSwitchModule, DataLoaderContentComponent],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BasicInfoComponent {
  subscription!: Subscription;
  gradedetails = [] as any;
  loader = false;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('fieldConfigpopup') fieldConfigpopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  fieldConfigForm!: FormGroup;

  // Static data for the popup fields
  fieldOptions = [] as any;
  basicInfoFieldsConfigList = [] as any;
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
    this.AddForm = this.fb.group({
      Addjobrole: ['', [Validators.required, this.formValidations.maxCharactersValidator(101), Validators.pattern(/^[^\s].*$/)]],
      gradeId: ['', Validators.required],
    });

    this.updateForm = this.fb.group({
      Updatejobrole: ['', [Validators.required, this.formValidations.maxCharactersValidator(101), Validators.pattern(/^[^\s].*$/)]],
      updategradeId: ['', Validators.required],
    });

    this.fieldConfigForm = this.fb.group({
      fieldNames: [[], Validators.required],
      approvalRequired: [false],
      approvalType: [''],
      selectedEmployee: [''],
      selectedRole: ['']
    });
    this.getgradeid();
    this.getJobrole();
    this.getBasicInfoFields();
    this.getAllEmployeeDetails();
    this.getAllRoles();
    this.getBasicInfoFieldsConfigList();
  }

  getJobrole() {
    this.loader = true;
    this.subscription = this.http
      .getData('DesignationGradeMapper?sort=designationName')
      .subscribe({
        next: (data: any) => {
          this.loader = false;
          this.JobroleDetails = data;
        },
        error: (error: any) => {
          this.loader = false;

        }
      });
  }
  getgradeid() {
    this.subscription = this.http.getData('GradeTable').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.gradedetails = data;
      },
    });
  }

  getBasicInfoFields() {
    const params = 'Personal';
    const param = 'Basic Info';
    this.http.getDatabyentityvalueForFieldUpdate(`EmployeeApprovalFields/getApprovalFields`, params, param).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.fieldOptions = data.data
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  getBasicInfoFieldsConfigList() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Basic Info'
    }
    this.http.getDataIncludeParams(`EmployeeInfoApproval/getEmployeeInfoApprovals`, params).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.basicInfoFieldsConfigList = data.data
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
        this.roles = data as IRoles[]
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }


  // Method to save field configuration
  saveFieldConfig(modal: any) {
    if (this.fieldConfigForm.valid) {
      const formValue = this.fieldConfigForm.value;
      const selectedFields = formValue.fieldNames || [];
      let loggedInUser = this.authService.getToken();
      let approvalAuthority = formValue.approvalType == 'EMP' ? formValue.selectedEmployee : formValue.selectedRole;

      const request = {
        columnNames: selectedFields,
        moduleName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.moduleName : "Basic Info",
        displayName: this.fieldOptions.length > 0 ? this.fieldOptions[0]?.tabName : "Personal",
        requiresApproval: formValue.approvalRequired || false,
        approvalType: formValue.approvalType || "",
        approvalAuthority: approvalAuthority.toString() || '',
        createdBy: loggedInUser.employeeId,
      };

      this.subscription = this.http.postdata('EmployeeInfoApproval', request).subscribe({
        next: () => {
          modal.close();
          this.conformationPopup.openSuccessModal('Field configuration saved successfully');
          this.fieldConfigForm.reset();
          this.getBasicInfoFieldsConfigList();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }

  close(modal: any) {
    modal.close();
  }

  // Method to open the update modal dialog
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.id;
    this.updateForm.patchValue({ Updatejobrole: jobroletypelist.designationName });
    this.updateForm.patchValue({ updategradeId: jobroletypelist.gradeId });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: jobRoleDATA = {
        id: this.selectedId,
        designationName: this.updateForm.value.Updatejobrole.trim(),
        gradeId: Number(this.updateForm.value.updategradeId)
      };

      this.subscription = this.http.postdata('DesignationGradeMapper/UPDATER', request).subscribe({
        next: () => {

          this.getJobrole();
          modal.close();
          this.conformationPopup.openSuccessModal('Job Role updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;

    this.subscription = this.http
      .getData(`DesignationGradeMapper/deleteById/${this.selectedDeleteRole.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getJobrole();
          this.conformationPopup.openSuccessModal('Job Role deleted successfully');

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


  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  // Method to open field configuration popup
  openFieldConfigDialog() {
    this.modalService.open(this.fieldConfigpopup, {
      backdrop: 'static',
      centered: true
    });
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}