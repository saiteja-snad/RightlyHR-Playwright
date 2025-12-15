import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
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
import { TooltipModule } from 'primeng/tooltip';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { EditIconComponent } from "../../../icons/edit-icon/edit-icon.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select, Skeleton, TooltipModule, NgbPopoverModule, ModuleInformationComponent, EditIconComponent, InfoIconComponent],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
})

export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  subscription!: Subscription;
  salutationValidationcheck: boolean = false;
  empinfo = {} as IJob;
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' },
  ];
  Gender: IGender[] = [];
  titledetails: ITitle[] = [];
  Maritaldetails: IMarital[] = [];
  empyployeedata = {} as any;
  buttons = false;
  dateofbirth: any;
  changeingdob: any;
  currentdata = new Date();
  loading: boolean = false;
  isMyInfoRoute = false;
  fieldOptions = [] as any;
  getFieldsApprovalStatusList: any[] = [];
  activeMessage: string = '';
  totalCount: any;

  constructor(private modalService: NgbModal, private fb: FormBuilder, public formValidation: FormValidationService, 
    private conformationPopup: OpenModalService, private http: HttpService, public rbac: RbacService, 
    public permission: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.getGender();
    this.getMaritaldetails();
    this.getTitle();
    this.getBasicInfoFields();
    this.getFieldsApprovalStatus();
    this.basicInfoForm.disable();
    this.basicInfoForm.get('dob')?.valueChanges.subscribe((data) => {
      this.empyployeedata.dob = null;
      this.changeingdob = data;
    });
  }

  getBasicInfoFields() {
    const params = 'Personal';
    const param = 'Basic Info';
    this.subscription = this.http.getDatabyentityvalueForFieldUpdate(`EmployeeInfoApprovalFields/getApprovalFields`, params, param).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.fieldOptions = data.data;
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });
  }

  getFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Basic Info',
      employeeId: parseInt(this.empinfo.employeeId),
    };
    this.subscription = this.http.getDataIncludeParams(`EmployeeInfoFieldUpdate/getLatestFieldApprovalStatus`, params).subscribe({
      next: (data: any) => {
        if (data.data.length > 0) {
          this.getFieldsApprovalStatusList = data.data;
        } else {
          console.log('No data found.');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });
  }

  isFieldPendingApproval(fieldName: string): boolean {
    return this.getFieldsApprovalStatusList.some(
      (item: any) =>
        item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
  }

  getPendingApprovalMessage(fieldName: string): string {
    const pendingItem = this.getFieldsApprovalStatusList.find(
      (item: any) => item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
    return (
      pendingItem?.message || 'This field change request is awaiting approval.'
    );
  }

  setActiveMessage(fieldName: string) {
    this.activeMessage = this.getPendingApprovalMessage(fieldName);
  }

  // Add this method
  isFieldDisabledDueToPending(fieldName: string): boolean {
    return this.isFieldPendingApproval(fieldName);
  }

  canAccessfield(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permission.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.isMyInfoRoute = false;
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.isMyInfoRoute = true;
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getEmployeeId();
    }
  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: [{ value: null, disable: true }, Validators.required],
      fusionEmpId: [null],
      salutation: [null, Validators.required],
      firstName: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$'),
        ],
      ],
      middleName: [null, [Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      lastName: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$'),
        ],
      ],
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
      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18 || age > 75) {
        return { invalidAge: true }; // Return an error object if age is invalid
      }
    }
    return null; // Return null if validation passes
  }

  onsalutationvalidation(): void {
    const gender = this.basicInfoForm.get('gender')?.value;
    const title = this.basicInfoForm.get('salutation')?.value?.titlename;
    const genderLower = typeof gender === 'string' ? gender.toLowerCase() : '';
    const titleLower = typeof title === 'string' ? title.toLowerCase() : '';
    if ((genderLower === 'male' && titleLower === 'mr.') || (genderLower === 'female' && 
      ['ms.', 'miss.', 'mrs.'].includes(titleLower)) || ((genderLower === 'other' || genderLower === 'others') && 
      (titleLower === 'others.' || titleLower === 'other.')) || ((genderLower === 'male' || genderLower === 'female') 
      && (titleLower == null || titleLower === ''))) {
      this.salutationValidationcheck = false; // Valid combination
    } else {
      this.salutationValidationcheck = true; // Invalid combination
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
        this.dateofbirth = this.formatDateToLocal(this.empyployeedata.dob);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
        this.changemaritalstatus();
      },
      error: (error: any) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getdateofbirth(): string | null {
    const startDateValue =
      this.formatDateToLocal(this.empyployeedata.dob) ||
      this.formatDateToLocal(this.basicInfoForm.get('dob')?.value);
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
      maritalStatus: this.Maritaldetails.find((item: any) => item.maritalstatus1 === data.maritalStatus) || data.maritalStatus,
    });
  }

  updateBasicInfo(): void {
    // const formValue = this.basicInfoForm.getRawValue();
    // Get list of pending field names
    // const targetStatuses = ['Pending', 'Cancelled'];
    // const pendingFieldNames = this.getFieldsApprovalStatusList
    //   .filter((item) => targetStatuses.includes(item.approvalStatus))
    //   .map((item) => item.fieldName);
    // Map fieldName (display) → form control name
    // const fieldToControlMap: { [key: string]: string } = {
    //   'First Name': 'firstName',
    //   'Last Name': 'lastName',
    //   'Middle Name': 'middleName',
    //   Salutation: 'salutation',
    //   Gender: 'gender',
    //   'Date of Birth': 'dob',
    //   'Blood Group': 'bloodGroup',
    //   'Marital Status': 'maritalStatus',
    //   'Married Date': 'marriageDate',
    // };
    // Build payload — only include fields that are NOT pending
    const formValue = this.basicInfoForm.value;
    const updatePayload: any = {
      ...this.empyployeedata,
      updatedby: this.empinfo.employeeId.toString(),
      employeeId: this.empinfo.employeeId,
      fusionEmpId: formValue.fusionEmpId || this.empyployeedata.fusionEmpId,
      title: this.basicInfoForm?.get('salutation')?.value?.titlename,
      firstName: this.basicInfoForm?.get('firstName')?.value,
      middleName: this.basicInfoForm?.get('middleName')?.value,
      lastName: this.basicInfoForm?.get('lastName')?.value,
      gender: this.basicInfoForm?.get('gender')?.value,
      dob: moment(this.basicInfoForm?.get('dob')?.value).format('YYYY-MM-DD'),
      bloodGroup: this.basicInfoForm?.get('bloodGroup')?.value?.name,
      maritalStatus: this.basicInfoForm?.get('maritalStatus')?.value?.maritalstatus1,
      marriedDate: this.basicInfoForm?.get('marriageDate')?.value,
      selfUpdate: this.isMyInfoRoute,
      moduleName: this.isMyInfoRoute ? 'Basic Info' : undefined,
      displayName: this.isMyInfoRoute ? 'Personal' : undefined,
    };
    // // Only add fields that are editable (not pending) and have changed
    // Object.keys(fieldToControlMap).forEach((displayFieldName) => {
    //   const controlName = fieldToControlMap[displayFieldName];
    //   if (!pendingFieldNames.includes(displayFieldName)) {
    //     const currentValue = formValue[controlName];
    //     const originalValue =
    //       this.empyployeedata[
    //       controlName === 'salutation'
    //         ? 'title'
    //         : controlName === 'bloodGroup'
    //           ? 'bloodGroup'
    //           : controlName === 'maritalStatus'
    //             ? 'maritalStatus'
    //             : controlName === 'marriageDate'
    //               ? 'marriedDate'
    //               : controlName === 'dob'
    //                 ? 'dob'
    //                 : controlName
    //       ];
    //     // Optional: only send if changed
    //     if (currentValue !== undefined && currentValue !== null) {
    //       if (controlName === 'salutation') {
    //         updatePayload.title = currentValue?.titlename || currentValue;
    //       } else if (controlName === 'bloodGroup') {
    //         updatePayload.bloodGroup = currentValue?.name || currentValue;
    //       } else if (controlName === 'maritalStatus') {
    //         updatePayload.maritalStatus =
    //           currentValue?.maritalstatus1 || currentValue;
    //       } else if (controlName === 'marriageDate') {
    //         updatePayload.marriedDate = currentValue;
    //       } else if (controlName === 'dob') {
    //         updatePayload.dob = currentValue;
    //       } else {
    //         updatePayload[controlName] = currentValue;
    //       }
    //     }
    //   }
    // });
    // Always include fusionEmpId if editable
    if (!this.basicInfoForm.get('fusionEmpId')?.disabled) {
      updatePayload.fusionEmpId = formValue.fusionEmpId || this.empyployeedata.fusionEmpId;
    }

    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload).subscribe({
      next: (data: any) => {
        if (data.statusCode === 200) {
          this.conformationPopup.openSuccessModal('Basic information updated successfully');
          this.getEmployeeId();
          this.getFieldsApprovalStatus(); // Refresh pending status
          this.http.setBasicDetails();
          this.basicInfoForm.disable();
          this.buttons = false;
        } else if (data.statusCode === 409) {
          this.conformationPopup.openErrorModal(data.message);
          this.patchForm(this.empyployeedata);
        }
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(
          reason.error.message || 'Basic info update failed'
        );
      },
    });
  }

  getGender() {
    this.subscription = this.http.getData('gender').subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
        this.getEmployeeId();
      },
    });
  }
 getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.pendingapprovalemployeid}&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
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
    const maritalStatus = this.basicInfoForm.get('maritalStatus')?.value?.maritalstatus1 || 
    this.basicInfoForm.get('maritalStatus')?.value || this.empyployeedata.maritalStatus;
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

  showButtons(): void {
    this.buttons = !this.buttons;
    const fullPath = this.router.url;
    if (this.buttons) {
      this.basicInfoForm.enable();
      // Always disable employeeId field
      this.basicInfoForm.get('employeeId')?.disable();
      // Disable fields that have pending approval
      this.disablePendingFields();
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

  // Add this new method
  private disablePendingFields(): void {
    const pendingFields = this.getFieldsApprovalStatusList
      .filter((item) => item.approvalStatus === 'Pending')
      .map((item) => item.fieldName);
    pendingFields.forEach((fieldName) => {
      const controlMap: { [key: string]: string } = {
        'First Name': 'firstName',
        'Last Name': 'lastName',
        'Middle Name': 'middleName',
        Salutation: 'salutation',
        Gender: 'gender',
        'Date of Birth': 'dob',
        'Blood Group': 'bloodGroup',
        'Marital Status': 'maritalStatus',
        'Married Date': 'marriageDate',
      };
      const controlName = controlMap[fieldName];
      if (controlName && this.basicInfoForm.get(controlName)) {
        this.basicInfoForm.get(controlName)?.disable();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}