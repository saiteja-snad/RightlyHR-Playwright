import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { IGender, IMarital, ITitle } from '../../../Interfaces/personal-modal';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IJob } from '../../../Interfaces/letters-model';
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select, Skeleton, Tooltip],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  subscription!: Subscription
  salutationValidationcheck: boolean = false
  empinfo = {} as IJob;
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' }
  ];
  Gender: IGender[] = [];
  titledetails: ITitle[] = [];
  Maritaldetails: IMarital[] = [];
  empyployeedata = {} as any;
  buttons = false
  dateofbirth: any
  changeingdob: any;
  currentdata = new Date()
  loading: boolean = false;
  fieldOptions = [] as any;
  getFieldsApprovalStatusList: any[] = [];

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    public formValidation: FormValidationService,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public rbac: RbacService,
    public permission: AccessForEmployeeinfoService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.getGender();
    this.getMaritaldetails();
    this.getTitle();
    this.getBasicInfoFields();
    this.basicInfoForm.disable();
    this.getFieldsApprovalStatus();
    this.basicInfoForm.get('dob')?.valueChanges.subscribe((data) => {
      console.log(data)
      // this.empyployeedata.dob = null
      this.changeingdob = data
    });

  }

  getBasicInfoFields() {
    const params = 'Personal';
    const param = 'Basic Info';
    this.http.getDatabyentityvalueForFieldUpdate(`EmployeeInfoApprovalFields/getApprovalFields`, params, param).subscribe({
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

  getFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Basic Info',
      employeeId: parseInt(this.empinfo.employeeId)
    }
    this.http.getDataIncludeParams(`EmployeeInfoFieldUpdate/getLatestFieldApprovalStatus`, params).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.getFieldsApprovalStatusList = data.data
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  canAccessfield(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permission.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
    }
  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: [{ value: null, disable: true }, Validators.required],
      fusionEmpId: [null],
      salutation: [null, Validators.required],
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      middleName: [null, [Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      gender: [null, Validators.required],
      dob: [null, [Validators.required, this.validateAge.bind(this)]],
      bloodGroup: [null],
      maritalStatus: [null, Validators.required],
      marriageDate: [null],
    });

  }

  validateAge(control: AbstractControl): { [key: string]: boolean } | null {
    const dob = control.value;
    if (dob) {
      const currentDate = new Date();
      const birthDate = new Date(dob);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18 || age > 75) {
        return { invalidAge: true }; // Return an error object if age is invalid
      }
    }
    return null; // Return null if validation passes
  }

  onsalutationvalidation(): void {
    console.log("CALL")
    const gender = this.basicInfoForm.get('gender')?.value
    console.log(gender);

    const title = this.basicInfoForm.get('salutation')?.value?.titlename;
    console.log(title)

    const genderLower = typeof gender === 'string' ? gender.toLowerCase() : '';
    const titleLower = typeof title === 'string' ? title.toLowerCase() : '';

    if (
      (genderLower === 'male' && titleLower === 'mr.') ||
      (genderLower === 'female' && ['ms.', 'miss.', 'mrs.'].includes(titleLower)) ||
      ((genderLower === 'other' || genderLower === 'others') && (titleLower === 'others.' || titleLower === 'other.')) ||
      ((genderLower === 'male' || genderLower === 'female') && (titleLower == null || titleLower === ''))
    ) {
      this.salutationValidationcheck = false; // Valid combination
    } else {
      this.salutationValidationcheck = true; // Invalid combination
      console.log(this.salutationValidationcheck)
    }
  }


  getEmployeeId(): void {
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.empyployeedata = data;
        this.patchForm(data);
        this.dateofbirth = this.formatDateToLocal(this.empyployeedata.dob)
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
        this.changemaritalstatus();
      },
      error: (error: any) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getdateofbirth(): string | null {
    const startDateValue = this.formatDateToLocal(this.empyployeedata.dob) || this.formatDateToLocal(this.basicInfoForm.get('dob')?.value);
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null;
  }

  // Helper method to format a date to 'YYYY-MM-DD'
  formatDateToLocal(date: string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  patchForm(data: any): void {
    console.log('data', data)
    this.basicInfoForm.patchValue({
      employeeId: data.employeeId,
      fusionEmpId: data.fusionEmpId,
      salutation: this.titledetails.find((item: any) => item.titlename === data.title) || data.title,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
      marriageDate: this.formatDateToLocal(data.marriedDate) || null,
      dob: this.formatDateToLocal(data.dob),
      bloodGroup: this.bloodGroups.find((item: any) => item.name === data.bloodGroup),
      maritalStatus: this.Maritaldetails.find(((item: any) => item.maritalstatus1 === data.maritalStatus)) || data.maritalStatus,
    });
  }

  constructModulesPayload(formValue: any): any {
    const fields = this.fieldOptions
      .map((field: any) => {
        const oldValue = this.getOldValue(field.actualFieldName);
        const newValue = this.getNewValue(field.actualFieldName, formValue);
        return {
          fieldName: field.fieldName,
          displayName: field.tabName,
          actualFieldName: field.actualFieldName,
          oldValue: oldValue?oldValue.toString():'',
          newValue: newValue,
          referenceCategory: "",
          isFieldRequired: field.isRequired,
        };
      })
      .filter((field: any) => (field.oldValue.trim() !== field.newValue.trim()));

    return {
      employeeId: this.empinfo.employeeId,
      createdBy: this.empinfo.employeeId,
      modules: [{
        displayName: "Personal",
        moduleName: "Basic Info",
        fields: fields
      }]
    };
  }

  private getOldValue(actualFieldName: string): string {
    const mapping: any = {
      'Title': this.empyployeedata.title,
      'FirstName': this.empyployeedata.firstName,
      'MiddleName': this.empyployeedata.middleName,
      'LastName': this.empyployeedata.lastName,
      'Gender': this.empyployeedata.gender,
      'DOB': this.dateofbirth,
      'BloodGroup': this.empyployeedata.bloodGroup,
      'MaritalStatus': this.empyployeedata.maritalStatus,
      'marriedDate': this.formatDateToLocal(this.empyployeedata.marriedDate) || null,
    };
    return mapping[actualFieldName] || '';
  }

  private getNewValue(actualFieldName: string, formValue: any): string {
    const mapping: any = {
      'Title': formValue.salutation?.titlename,
      'FirstName': formValue.firstName,
      'MiddleName': formValue.middleName,
      'LastName': formValue.lastName,
      'Gender': formValue.gender,
      'DOB': formValue.dob,
      'BloodGroup': formValue.bloodGroup?.name,
      'MaritalStatus': formValue.maritalStatus?.maritalstatus1,
      'marriedDate': formValue.marriageDate
    };
    return mapping[actualFieldName] || '';
  }

  updateBasicInfo(): void {
    const formValue = this.basicInfoForm.getRawValue();
    const modulesPayload = this.constructModulesPayload(formValue);
    this.subscription = this.http.putData(`EmployeeInfoFieldUpdate/updateEmployeeInfo`, modulesPayload).subscribe({
      next: (data: any) => {
        if (data.statusCode === 200) {
          // Success case
          this.conformationPopup.openSuccessModal('Basic information updated successfully');
          this.getEmployeeId();
          this.getFieldsApprovalStatus();
          this.http.setBasicDetails();
          this.basicInfoForm.disable();
          console.log('Data updated successfully:', data);
          this.buttons = !this.buttons;
        } else if (data.statusCode === 409) {

          console.log('Conflict:', data.message);
          this.conformationPopup.openErrorModal(data.message);
          this.patchForm(this.empyployeedata);
        }
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message || 'Basic info update failed')
      },
    });
  }

  getGender() {
    this.subscription = this.http.getData('gender').subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
        this.getEmployeeId()
      },
    });
  }

  // Fetch titles from the API
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titledetails = data as ITitle[];
      },
    });
  }

  // Fetch marital status from the API
  getMaritaldetails() {
    this.subscription = this.http.getData('Maritalstatus').subscribe({
      next: (data: any) => {
        this.Maritaldetails = data as IMarital[];
      },
    });
  }

  changemaritalstatus(): void {
    const maritalStatus = this.basicInfoForm.get('maritalStatus')?.value?.maritalstatus1 || this.basicInfoForm.get('maritalStatus')?.value || this.empyployeedata.maritalStatus;

    console.log('Marital Status:', maritalStatus);
    if (maritalStatus === 'Married') {
      // Add the required validator to the marriageDate field
      this.basicInfoForm.get('marriageDate')?.setValidators([Validators.required]);
    } else {
      // Clear the validators if marital status is not "Married"
      this.basicInfoForm.get('marriageDate')?.clearValidators();
      this.basicInfoForm.get('marriageDate')?.setValue(null); // Reset the marriage date field
    }
    // Update the validation state of the marriageDate field
    this.basicInfoForm.get('marriageDate')?.updateValueAndValidity();
  }




  isFieldPendingApproval(fieldName: string): boolean {
    return this.getFieldsApprovalStatusList.some(item =>
      item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
  }

  getPendingApprovalMessage(fieldName: string): string {
    const pendingField = this.getFieldsApprovalStatusList.find(item =>
      item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
    return pendingField?.message || 'This field change request is awaiting approval.';
  }

  showButtons(): void {
    this.buttons = !this.buttons;
    const fullPath = this.router.url;

    if (this.buttons) {
      this.basicInfoForm.enable();

      // Always disable employeeId field
      this.basicInfoForm.get('employeeId')?.disable();

      // Disable fields that are pending approval
      this.disablePendingApprovalFields();

      // Handle different route cases
      if (fullPath.startsWith('/myinfo')) {
        this.basicInfoForm.get('fusionEmpId')?.disable();
      }

      // Personal info route specific logic for fusionEmpId
      if (fullPath.startsWith('/personalinfo/personal')) {
        if (!this.rbac.allowedToAccess('Employee Info Basic Information.view')) {
          this.basicInfoForm.get('fusionEmpId')?.disable();
        }
        if (this.rbac.allowedToAccess('Employee Info Basic Information.update')) {
          this.basicInfoForm.get('fusionEmpId')?.enable();
        }
      }
    } else {
      this.basicInfoForm.get('employeeId')?.disable();
      this.basicInfoForm.disable();
      this.basicInfoForm.reset();
      this.getEmployeeId();
    }
  }

  private disablePendingApprovalFields(): void {
    const fieldMapping: { [key: string]: string } = {
      'Salutation': 'salutation',
      'First Name': 'firstName',
      'Middle Name': 'middleName',
      'Last Name': 'lastName',
      'Gender': 'gender',
      'Date of Birth': 'dob',
      'Blood Group': 'bloodGroup',
      'Marital Status': 'maritalStatus',
      'Married Date': 'marriageDate'
    };

    this.getFieldsApprovalStatusList.forEach(item => {
      if (item.approvalStatus === 'Pending') {
        const formControlName = fieldMapping[item.fieldName];
        if (formControlName) {
          this.basicInfoForm.get(formControlName)?.disable();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
