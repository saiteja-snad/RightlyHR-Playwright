import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { IPermissionType } from '../../../Interfaces/timoff-model';
import { IDepartment } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
@Component({
  selector: 'app-add-global-permissions',
  imports: [CommonModule, ReactiveFormsModule, MultiSelectModule, FormsModule, Select, TranslateModule],
  templateUrl: './add-global-permissions.component.html',
  styleUrl: './add-global-permissions.component.scss'
})

export class AddGlobalPermissionsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  issubmitdiable = false;
  requestForm!: FormGroup;
  selectTypes = [
    { sno: 1, Value: 'Location/Sub Location', item_text: 'Select by Location/Sub Location', selectedAllGroup: 'Group 1' },
    { sno: 2, Value: 'Department/Team', item_text: 'Select by Department/Team', selectedAllGroup: 'Group 1' },
    { sno: 3, Value: 'Employees', item_text: 'Select by Employees', selectedAllGroup: 'Group 1' }

  ];
  private modalRef: NgbModalRef | null = null;
  permissionTypes = [{ item_text: 'Permission' }];
  // Options for the multi-select dropdown
  minDate!: string;  // Using definite assignment assertion
  maxDate!: string;  // Using definite assignment assertion
  dropdownList = [
    { item_id: 1, item_text: 'Option 1', selectedAllGroup: 'Group 1' },
    { item_id: 2, item_text: 'Option 2', selectedAllGroup: 'Group 1' },
    { item_id: 3, item_text: 'Option 3', selectedAllGroup: 'Group 1' },
    { item_id: 4, item_text: 'Option 4', selectedAllGroup: 'Group 1' }
  ];
  private modalRef: NgbModalRef | null = null;
  dropdownSettings = {};
  permissionHours: { duration: number }[] = [];
  selectedPermissionId!: any;
  permissionsType = [] as IPermissionType[];
  jobLocationDropDownData = [] as any;
  subLocationsDropdown = [] as any;
  departmentDetails = [] as IDepartment[];
  teamDetails = [] as any;
  locationWiseEmployeesDetails = [] as any;
  getAllEmployeesDetails = [] as any;
  wasEmployeeDropdownTouched = false;
  teamWiseEmployeesDetails = [] as any;
  requestcount!: number;
  isLoader = false;

  constructor(
    private authService: AuthService,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public rbac: RbacService,
    public formValidation: FormValidationService
  ) { }

  ngOnInit(): void {
    this.initalizingForm();
    this.getAllEmployees();
    this.getPermissionTypes();
    this.permissionsDuration();
    this.setupValidationOnClear();
  }

  setupValidationOnClear() {
    const control = this.requestForm.get('selectedOptions');
    control?.valueChanges.subscribe(value => {
      // Always check for empty and manually touched
      if (this.wasEmployeeDropdownTouched && (!value || value.length === 0)) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  onEmployeeDropdownTouched() {
    this.wasEmployeeDropdownTouched = true;
    const control = this.requestForm.get('selectedOptions');
    if (!control?.value || control.value.length === 0) {
      control?.markAsTouched();
      control?.updateValueAndValidity();
    }
  }

  openModal() {
    this.requestForm.reset();
    this.wasEmployeeDropdownTouched = false;
  }

  initalizingForm() {
    this.requestForm = this.fb.group({
      selectType: [null, Validators.required],
      selectedOptions: [[], Validators.required], // Initializes the form control for multi-select
      teamEmpselectedOptions: [[], Validators.required],
      location: [null, Validators.required],
      sublocation: [null, Validators.required],
      department: [null, Validators.required],
      teamSelectedOptions: [null, Validators.required], // Initializes the form control for multi-select
      requestType: [null, Validators.required],
      // permissionRequestedDate: [null, Validators.required],
      permissionDate: [null, Validators.required,],
      duration: [null, Validators.required],
      // this.maxDuration(2),Validators.max(2)]
      name: [null, Validators.required,],
      notes: [null, [Validators.required, Validators.maxLength(250)]]
    });
    this.validationCheck();
  }

  //function to get lenghtof the globalpermissions
  addItem(Value: any) {
    this.requestcount = Value;
  }

  //function to check the validations
  validationCheck() {
    const selectType = this.requestForm.get('selectType')?.value;
    const departmentControl = this.requestForm.get('department');
    const teamControl = this.requestForm.get('teamSelectedOptions');
    const employees = this.requestForm.get('teamEmpselectedOptions');
    const location = this.requestForm.get('location');
    const sublocation = this.requestForm.get('sublocation');
    const locationEmployees = this.requestForm.get('selectedOptions');
    if (selectType === 'Department/Team') {
      this.getDepartment();
      departmentControl?.setValidators([Validators.required]);
      teamControl?.setValidators([Validators.required]);
      employees?.setValidators([Validators.required]);
      location?.clearValidators();
      sublocation?.clearValidators();
      locationEmployees?.clearValidators();
    } else if (selectType === 'Location/Sub Location') {
      location?.setValidators([Validators.required]);
      sublocation?.setValidators([Validators.required]);
      locationEmployees?.setValidators([Validators.required]);
      departmentControl?.clearValidators();
      teamControl?.clearValidators();
      employees?.clearValidators();
    } else {
      // Clear all validators if no specific type is selected
      departmentControl?.clearValidators();
      teamControl?.clearValidators();
      employees?.clearValidators();
      location?.clearValidators();
      sublocation?.clearValidators();
      locationEmployees?.clearValidators();
      this.jobLocationList();
    }
    // Update the validity of the form controls
    departmentControl?.updateValueAndValidity();
    teamControl?.updateValueAndValidity();
    employees?.updateValueAndValidity();
    location?.updateValueAndValidity();
    sublocation?.updateValueAndValidity();
    locationEmployees?.updateValueAndValidity();
  }

  //function to get the permissions duration
  permissionsDuration() {
    this.subscription = this.http.getData("entityAttributeValues?entity=Permissions").subscribe({
      next: (data: any) => {
        console.log(data);
        const permissionsDurationDetails = data.find((ele: any) => {
          return ele.attribute === 'globalPermissionsDuration'
        });
        this.generatePermissionHours(permissionsDurationDetails.value);
      },
      error: (err: any) => {
        console.log(err)
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      complete: () => {
      }
    })
  }

  //function to get the duration values splitwise
  generatePermissionHours(maxDuration: number) {
    this.permissionHours = []; // clear existing values
    for (let i = 0.5; i <= maxDuration; i += 0.5) {
      this.permissionHours.push({ duration: i });
    }
    console.log(this.permissionHours);
  }

  //function to check the null values
  onReasonInput() {
    this.ifreasonnull();
  }

  ifreasonnull() {
    const Value = this.requestForm.get('notes')?.value;
    // console.log(Value)
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  //get lobations
  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //function to get sublocation by id
  getSubLocationByid() {
    this.requestForm.get('sublocation')?.setValue(null);
    this.requestForm.get('selectedOptions')?.setValue(null);
    const ValuesForSublocation = this.requestForm.get('location')?.value;
    console.log(ValuesForSublocation);
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation} `).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
      },
      error: (err: any) => {
        this.locationWiseEmployeesDetails = [];
        this.subLocationsDropdown = [];
        this.requestForm.get('location')?.setValue(null);
        this.requestForm.get('sublocation')?.setValue(null);
      }
    })
  }

  //function to get employees based on the location and sublocation
  getEmployeesLocationwise() {
    const locationId = this.requestForm.get('location')?.value;
    const subLocationId = this.requestForm.get('sublocation')?.value;
    this.subscription = this.http.getData(`Employeedata/getbylocationandsublocation/${locationId}/${subLocationId}`).subscribe({
      next: (data: any) => {
        this.locationWiseEmployeesDetails = data.map((employee: any) => {
          return {
            ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            selectedAllGroup: 'Group 1'
            // Concatenate first, middle (if present), and last name
          };
        });
        console.log(this.locationWiseEmployeesDetails)
        const selectedIds: any = [];
        this.locationWiseEmployeesDetails.forEach((ele: any) => {
          selectedIds.push(ele.employeeId)
        })
        const locationEmployees = this.requestForm.get('selectedOptions');
        locationEmployees?.setValue(selectedIds);
        //this.allDepartments = this.departmentDetails.map(item => item.departmentName)
      },
      error: (err: any) => {
        console.log(err)
        this.locationWiseEmployeesDetails = [];
        this.requestForm.get('selectedOptions')?.setValue(null);
      },
    })
  }

  getAllEmployees() {
    this.subscription = this.http.getData(`Employeedata/ActiveEmployeeswithJobDetails`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getAllEmployeesDetails = data.map((employee: any) => {
          return {
            ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            selectedAllGroup: 'Group 1'
            // Concatenate first, middle (if present), and last name
          };
        });
        console.log(this.getAllEmployeesDetails)
        const selectedIds: any = [];
        this.getAllEmployeesDetails.forEach((ele: any) => {
          selectedIds.push(ele.employeeId)
        })
      },
      error: (err: any) => {
        console.log(err)
        this.requestForm.get('selectedOptions')?.setValue(null);
      },
    })
  }

  //function to get employees based on the location and sublocation
  getEmployeesTeamwise() {
    //const locationId=this.requestForm.get('departmentName')?.value;
    const team = this.requestForm.get('teamSelectedOptions')?.value;
    //console.log(team)
    this.subscription = this.http.getData(`Employeedata/getbyteam/${team}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.teamWiseEmployeesDetails = data.map((employee: any) => {
          return {
            ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            selectedAllGroup: 'Group 1'
            // Concatenate first, middle (if present), and last name
          };
        });
        const selectedIds: any = [];
        this.teamWiseEmployeesDetails.forEach((ele: any) => {
          selectedIds.push(ele.employeeId)
        })
        const teamEmployees = this.requestForm.get('teamEmpselectedOptions');
        teamEmployees?.setValue(selectedIds);
        //this.allDepartments = this.departmentDetails.map(item => item.departmentName)
      },
      error: (err: any) => {
        console.log(err)
        this.requestForm.get('teamEmpselectedOptions')?.setValue(null);
      },
    })
  }

  //function to get the location data
  getDepartment() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
        //this.allDepartments = this.departmentDetails.map(item => item.departmentName)
      },
      error: (err: any) => {
        console.log(err)
      },
    })
  }

  //function to get the subdepartment data
  getTeamData() {
    this.requestForm.get('teamEmpselectedOptions')?.setValue(null);
    this.requestForm.get('teamSelectedOptions')?.setValue(null);
    const value = this.requestForm.get('department')?.value;
    this.subscription = this.http.getData(`Subdepartments/Getnames/V2/${value}`).subscribe({
      next: (data: any) => {
        this.teamDetails = data;
      },
      error: (err: any) => {
        this.teamWiseEmployeesDetails = [];
        this.teamDetails = [];
        this.requestForm.get('teamEmpselectedOptions')?.setValue(null);
        this.requestForm.get('teamSelectedOptions')?.setValue(null);
      },
    })
  }

  close() {
    this.modalService.dismissAll();
  }

  // Handle form submission
  onSubmit() {
    this.isLoader = true;
    const loggedinuser = this.authService.getToken();
    const currentDate = new Date();
    if (this.requestForm.valid) {
      // console.log(this.requestForm.value);
      const formData = this.requestForm.value;
      let deptId_locationId = '';
      let teamId_sublocationId = '';

      if (formData.selectType === 'Location/Sub Location') {
        deptId_locationId = Array.isArray(formData.location) ? formData.location.join(',') : String(formData.location);
        teamId_sublocationId = Array.isArray(formData.sublocation) ? formData.sublocation.join(',') : String(formData.sublocation);
      } else if (formData.selectType === 'Department/Team') {
        deptId_locationId = Array.isArray(formData.department) ? formData.department.join(',') : String(formData.department);
        teamId_sublocationId = Array.isArray(formData.teamSelectedOptions) ? formData.teamSelectedOptions.join(',') : String(formData.teamSelectedOptions);
      }
      const payLoad = {
        "requestedBy": loggedinuser.employeeId,
        "requestedDate": currentDate,
        "type": formData.requestType,
        "permissionRequestedDate": formData.permissionDate,
        "moduleId": environment.permissionsModuleId,
        "referenceTypeId": this.selectedPermissionId,
        "duration": formData.duration?.toString(),
        // "8888888888888888": formData.notes,
        "requestType": formData.name,
        "requestTypeEntityId": formData.sublocation ? formData.location + "," + formData.sublocation : formData.department + "," + formData.teamSelectedOptions,
        "employeeIds": formData.selectedOptions.length > 0 ? formData.selectedOptions.toString() : formData.teamEmpselectedOptions.toString(),
        "meta": formData.notes,
        "selectedType": formData.selectType,
        "deptId_locationId": deptId_locationId,
        "teamId_sublocId": teamId_sublocationId,
      }
      this.http.postdata(`GlobalPermissions/postGlobalPermissions`, payLoad).subscribe({
        next: (response: any) => {
          this.isLoader = false;
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Request submitted sucessfully')
        },
        error: (err: any) => {
          if (this.modalRef) {
            this.modalRef.close(); // or this.modalRef.dismiss();
            this.modalRef = null;
          }
          this.conformationPopup.openErrorModal(err.error.message);
          this.isLoader = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        complete: () => {
          this.requestForm.reset();
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            global: true,
          }));

        },
      })
    }
  }

  //function to open the model popup
  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openconfirmationModelNew(content: any) {
    this.modalRef = this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  //function to open the confirmation model popup before submitting the request 
  openconfirmationModelforsubmit(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  //function to close the lists
  closelist() {
    this.modalService.dismissAll();
    this.locationWiseEmployeesDetails = [];
    this.jobLocationDropDownData = [];
    this.subLocationsDropdown = [];
    this.departmentDetails = [];
    this.teamDetails = [];
    this.teamWiseEmployeesDetails = [];
    this.maxDate = moment().endOf('month').format('YYYY-MM-DD');
  }

  //function to get the global permission types
  getPermissionTypes() {
    this.subscription = this.http.getData(`PermissionTypes?type=${'global permissions'}`).subscribe({
      next: (response: any) => {
        this.permissionsType = response as IPermissionType[];
      }, error(err: any) {
        console.log("errors", err)
      },
    })
  }

  onTypeChange(): void {
    const selectedType = this.requestForm.get('name')?.value;
    this.selectedPermissionId = this.permissionsType.find((t) => t.name === selectedType)?.id;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}