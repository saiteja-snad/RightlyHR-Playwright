import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MyInfoTeamNumbersTabComponent } from "../../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccessForEmployeeinfoService } from '../../../../services/access-for-employeeinfo.service';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IDepartment } from '../../../../Interfaces/letters-model';
import { Iteammembers } from '../../../../Interfaces/members-model';
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { MultiSelect } from "primeng/multiselect";
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { Iactive } from '../../../../admin/active-employees/active-model';
import { ActiveEmployeePipe } from "../../../../Pipes/active-employee.pipe";
import { SearchfilterPipe } from '../../../../pipes/searchfilter.pipe';

@Component({
  selector: 'app-bulk-location-change',
  imports: [DataLoaderContentComponent, FormsModule, TranslateModule, NoDataFoundComponent, ReactiveFormsModule, MyInfoTeamNumbersTabComponent, TeamMembersTabsComponent, CommonModule, SearchfilterPipe, MultiSelect, Select, ActiveEmployeePipe],
  templateUrl: './bulk-location-change.component.html',
  styleUrl: './bulk-location-change.component.scss'
})
export class BulkLocationChangeComponent implements OnInit, OnDestroy{

  empinfo = {} as Ipersonal;
  headerName!: string
  searchValue: any;
  loading = false
  subscription!: Subscription;
  TeamMemberArray: Iteammembers[] = [];
  getAllEmployeesDetails: Iactive[] = []; 
   requestForm!: FormGroup;
  departmentDetails = [] as IDepartment[];
  teamDetails = [] as any;
  employees: any[] = [];
  minDate!: string;
  maxDate!: string;
  errorMessage!: string;
  spinnerLoader = false
  modalRef!: NgbModalRef;
  appcomment = [] as any;
  teamWiseEmployeesDetails = [] as any;
  list: any;
  subLocationList: any;
  sublocation: any;
  locationid: any;
  locationList: any[] = [];
  shiftsAvailable: any[] = [];
  selectTypes = [
    { sno: 1, Value: 'Location/Sublocation', item_text: 'Select by Location/Sublocation', selectedAllGroup: 'Group 1' },
    { sno: 2, Value: 'Department/Team', item_text: 'Select by Department/Team', selectedAllGroup: 'Group 1' },
    { sno: 3, Value: 'Employees', item_text: 'Select by Employees', selectedAllGroup: 'Group 1' }

  ];
  // getAllEmployeesDetails: any;
  shiftid: any;
  payload: any;

  constructor(private http: HttpService, private accessNav: AccessNavigationService, private modalService: NgbModal,
    private fb: FormBuilder, private conformationPopup: OpenModalService, public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }



  ngOnInit(): void {
    this.getEmpInfoFromRoute()
    this.subLocationList = [];
    this.shiftsAvailable = [];

  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.getAllTeammembersList();
      this.getLocation();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getAllTeammembersList();
      this.getLocation();
    }
  }

  openModel(content: any) {
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true, backdrop: 'static' });
    this.requestForm = this.fb.group({
      selectType: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      selectedOptions: [[], Validators.required], // Initializes the form control for multi-select
      teamEmpselectedOptions: [[], Validators.required],
      location: [null, Validators.required],
      sublocation: [null, Validators.required],
      locationId: [null, Validators.required],
      subLocationId: [null, Validators.required],
      shiftId: [null, Validators.required],
      department: [null, Validators.required],
      teamSelectedOptions: [null, Validators.required], // Initializes the form control for multi-select
      // name: [null, Validators.required,],
    });
    this.validationCheck();
    console.log(this.requestForm.get('selectedOptions')?.value);

  }

  confirmClose() {
    this.modalService.dismissAll();
  }
  resetDestinationFields() {
    ['locationId', 'subLocationId', 'shiftId', 'effectiveDate'].forEach(control => {
      const formControl = this.requestForm.get(control);
      formControl?.reset(null, { emitEvent: false });
      formControl?.setErrors(null);
    });

    this.subLocationList = [];
    this.shiftsAvailable = [];
  }

  clearErrorState(control: AbstractControl | null) {
    if (!control) return;

    control.setErrors(null);
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity({ emitEvent: false });
  }
  //function to check the validations
  validationCheck() {
    const selectType = this.requestForm.get('selectType')?.value;
    const departmentControl = this.requestForm.get('department');
    const teamControl = this.requestForm.get('teamSelectedOptions');
    const employees = this.requestForm.get('teamEmpselectedOptions');
    const location = this.requestForm.get('locationId');
    const sublocation = this.requestForm.get('subLocationId');
    const sourcelocation = this.requestForm.get('location');
    const sourcesublocation = this.requestForm.get('sublocation');
    const shift = this.requestForm.get('shiftId');
    const locationEmployees = this.requestForm.get('selectedOptions');
    const effectiveDate = this.requestForm.get('effectiveDate');
    this.resetDestinationFields();
    // 2️⃣ clear previous errors & touched state
    [
      departmentControl,
      teamControl,
      employees,
      location,
      sublocation,
      sourcelocation,
      sourcesublocation,
      shift,
      locationEmployees,
      effectiveDate
    ].forEach(c => this.clearErrorState(c));

    if (selectType === 'Department/Team') {
      this.getDepartment();
      departmentControl?.setValidators([Validators.required]);
      teamControl?.setValidators([Validators.required]);
      employees?.setValidators([Validators.required]);
      sourcelocation?.clearValidators();
      sourcesublocation?.clearValidators();
      locationEmployees?.clearValidators();

      // effectiveDate?.clearValidators();
    } else if (selectType === 'Location/Sublocation') {
      location?.setValidators([Validators.required]);
      sublocation?.setValidators([Validators.required]);
      sourcelocation?.setValidators([Validators.required]);
      sourcesublocation?.setValidators([Validators.required]);
      shift?.setValidators([Validators.required]);
      locationEmployees?.setValidators([Validators.required]);
      effectiveDate?.setValidators([Validators.required]);
      departmentControl?.clearValidators();
      teamControl?.clearValidators();
      employees?.clearValidators();

    } else {
      // Clear all validators if no specific type is selected
      departmentControl?.clearValidators();
      teamControl?.clearValidators();
      employees?.clearValidators();
      sourcelocation?.clearValidators();
      sourcesublocation?.clearValidators();
      this.jobLocationList();
      this.getLocation();
    }

    // Update the validity of the form controls
    departmentControl?.updateValueAndValidity();
    teamControl?.updateValueAndValidity();
    employees?.updateValueAndValidity();
    location?.updateValueAndValidity();
    sublocation?.updateValueAndValidity();
    locationEmployees?.updateValueAndValidity();
  }
  //function to get the location data

  getDepartment() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data as IDepartment[];
        //this.allDepartments = this.departmentDetails.map(item => item.departmentName)
      },
      error: (err: any) => {
        console.log(err)
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

        this.teamWiseEmployeesDetails = data.map((e: any) => ({
          ...e,
          fullName: [
            e.fusionEmpId ? `${e.fusionEmpId} -` : '',
            e.firstName,
            e.middleName,
            e.lastName
          ]
            .filter(v => v && v.toString().trim() !== '')
            .join(' '),
          selectedAllGroup: 'Group 1'
        }));

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
  //function to get the subdepartment data
  getTeamData() {
    this.requestForm.get('teamEmpselectedOptions')?.setValue(null);
    this.requestForm.get('teamSelectedOptions')?.setValue(null);
    const value = this.requestForm.get('department')?.value;
    this.subscription = this.http.getData(`Subdepartments/Getnames/V2/${value}`).subscribe({
      next: (data: any) => {
        //console.log(data)
        this.teamDetails = data;

      },
      error: (err: any) => {
        console.log(err)
        this.teamWiseEmployeesDetails = [];
        this.teamDetails = [];
        this.requestForm.get('teamEmpselectedOptions')?.setValue(null);
        this.requestForm.get('teamSelectedOptions')?.setValue(null);
      },
    })
  }

  /* ---------------- TEAM MEMBERS ---------------- */

  getAllTeammembersList() {
    this.loading = true;
    const status ="Active, Trainee Active, Active Contract"
    this.subscription = this.http.getData(`Employeedata/GetallemployeeswithJobdetails?statuses=${status}`).subscribe({
      next: (data: any) => {
        this.loading = false
        console.log(data);
        this.getAllEmployeesDetails = data.map((e: any) => ({
          ...e,
          fullName: [e.fusionEmpId ? `${e.fusionEmpId} -` : '', e.firstName, e.middleName, e.lastName].filter(v => v && v.toString().trim() !== '').join(' '),
          selectedAllGroup: 'Group 1'
        }));

        console.log(this.getAllEmployeesDetails)
        const selectedIds: any = [];
        this.getAllEmployeesDetails.forEach((ele: any) => {
          selectedIds.push(ele.employeeId)
        })

      },
      error: (err: any) => {
        this.loading = false
        this.requestForm.get('selectedOptions')?.setValue(null);
      },
    })


  }

  /* ---------------- LOCATION FLOW ---------------- */

  getLocation() {
    this.http.getData('JobLocation/getAllLocations').subscribe({
      next: (data: any) => (this.locationList = data),
      error: err => console.error(err)
    });
  }

  onLocationChange(location: any) {
    console.log(location);

    if (!location) {
      this.resetSubLocationAndShift();
      return;
    }

    this.locationid = location.value;
    this.resetSubLocationAndShift();

    const selectedLocation = this.locationList.find(loc => loc.id === location.value);
    this.subLocationList = selectedLocation?.subLocations || [];
  }

  onSubLocationChange(subLocation: any) {
    console.log(subLocation);

    if (!subLocation) {
      this.shiftsAvailable = [];
      this.requestForm.patchValue({ shiftId: null });
      return;
    }

    this.sublocation = subLocation.value;
    this.requestForm.patchValue({ shiftId: null });
    this.getAllShifts();
  }

  resetSubLocationAndShift() {
    this.subLocationList = [];
    this.shiftsAvailable = [];
    this.requestForm.patchValue({
      subLocationId: null,
      shiftId: null
    });
  }
  // get all shift based on location and sublocation
  getAllShifts() {
    this.http
      .getData(`orgShifts/getshiftlocation?locationId=${this.locationid}&subLocationId=${this.sublocation}`)
      .subscribe({
        next: (data: any) => {
          this.shiftsAvailable =
            data?.[0]?.orgShiftsItems?.map((s: any) => ({
              id: s.id,
              shiftName: s.shiftName
            })) || [];
          //  this.shiftid = this.shiftsAvailable[0]?.id || null;
        },

        error: err => console.error(err)
      });
  }
  //function to get employees based on the location and sublocation
  locationWiseEmployeesDetails = [] as any;
  subLocationsDropdown = [] as any;
  getEmployeesLocationwise() {
    const locationId = this.requestForm.get('location')?.value;
    const subLocationId = this.requestForm.get('sublocation')?.value;
    this.subscription = this.http.getData(`Employeedata/getbylocationandsublocation/${locationId}/${subLocationId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.locationWiseEmployeesDetails = data.map((e: any) => ({
          ...e,
          fullName: [
            e.fusionEmpId ? `${e.fusionEmpId} -` : '',
            e.firstName,
            e.middleName,
            e.lastName
          ]
            .filter(v => v && v.toString().trim() !== '')
            .join(' '),
          selectedAllGroup: 'Group 1'
        }));


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
  //get lobations
  jobLocationDropDownData = [] as any;
  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        console.log(data);
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
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation} `).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations
        console.log(this.subLocationsDropdown);
      },
      error: (err: any) => {
        this.locationWiseEmployeesDetails = [];
        this.subLocationsDropdown = [];
        this.requestForm.get('location')?.setValue(null);
        this.requestForm.get('sublocation')?.setValue(null);
      }
    })
  }
  /* ---------------- SUBMIT ---------------- */

  changelocation() {
    // this.modalService.open(this.loading, { centered: true });

    const payload = {
      locationId: this.locationid,
      subLocationId: this.requestForm.value.subLocationId,
      shiftId: this.requestForm.value.shiftId,
      effectiveDate: this.requestForm.value.effectiveDate
    };

    const apiUrl =
      `JobDetails/JobInfoBulkUpdate` +
      `?locationId=${payload.locationId}` +
      `&sublocationId=${payload.subLocationId}` +
      `&shiftId=${payload.shiftId}` +
      `&effectiveDate=${payload.effectiveDate}`;
    const selectType = this.requestForm.get('selectType')?.value;

    if (selectType === 'Department/Team') {
      this.payload = this.requestForm.value.teamEmpselectedOptions;
    } else if (selectType === 'Location/Sublocation') {
      this.payload = this.requestForm.value.selectedOptions;
    } else {
      this.payload = this.requestForm.value.selectedOptions;
    }
    this.spinnerLoader = true;
    this.subscription = this.http.postdata(apiUrl, this.payload)
      .subscribe({
        next: (res) => {
          if(res){
            this.spinnerLoader = false;
            this.modalService.dismissAll();
          this.getAllTeammembersList();
          this.conformationPopup.openSuccessModal('Location updated successfully for selected employees')
          }

        },
        error: (error) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(error.error.message)
        }
      });
  }

  /* ---------------- COMMON ---------------- */
  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true });
  }
  close1() {
    this.modalService.dismissAll();
    this.requestForm.reset();
    window.location.reload();
  }
  close() {
    this.modalService.dismissAll();
    this.requestForm.reset();

  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
