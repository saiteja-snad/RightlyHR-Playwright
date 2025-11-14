import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import {
  ILocation,
  ISubLocation,
  IShiftHeader,
  IEmployees,
} from '../../flexible-leave-allocation/leave-allocation.model';
import { IRoles } from '../../../roles-permissions/permissions/permission.model';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-hours-allocation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    MultiSelectModule,
    NoDataFoundComponent,
    DateformatPipe,
  ],
  templateUrl: './hours-allocation.component.html',
  styleUrl: './hours-allocation.component.scss',
})
export class HoursAllocationComponent {
  hoursAllocationForm!: FormGroup;
  selectedEmployees: any[] = [];
  isSubmitting = false;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  categoryDetails = [{ name: 'Employee', value: 'Employee' }];
  // { name: 'Role', value: 'Role' },
  employeeDetails = [] as IEmployees[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  isloading = false;
  minEffectiveDate!: string;
  maxEffectiveDate!: string;
  selectedYear: number | null = null;
  minYearDate!: string;
  maxYearDate!: string;
  roles: IRoles[] = [];
  pastdatesalloweddata = [] as any;
  futureDaysAllowed!: number;
  pastDaysAllowed!: number;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    // this.yearsList = this.getYears();
    this.inititializeForm();
    this.getAllLocations();
    this.handleFormValueChanges();
    this.getAllroles();
    const currentYear = moment().year();
    this.minEffectiveDate = moment(`${currentYear}-01-01`).format('YYYY-MM-DD');
    this.maxEffectiveDate = moment(`${currentYear}-12-31`).format('YYYY-MM-DD');
  }
  //get past dates allowed for the work hours effective from
  getpastdatesallowed() {
    this.http
      .getData('entityAttributeValues?entity=FlexibleWorkhours')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.pastdatesalloweddata = data;
          const past = data.find(
            (x: any) => x.attribute === 'pastDatesAllowed'
          );
          const future = data.find(
            (x: any) => x.attribute === 'futureDatesAllowed'
          );

          this.pastDaysAllowed = Number(past?.value ?? 0);
          this.futureDaysAllowed = Number(future?.value ?? 0);
          this.setEffectiveDateRange();
          // After loading API → update form validator
          this.hoursAllocationForm
            .get('effectivedate')
            ?.updateValueAndValidity();
        },
        error: (error: any) => {},
      });
  }
  //to set the effective date range
  setEffectiveDateRange() {
    const today = moment().startOf('day');
    this.minEffectiveDate = today.clone().subtract(this.pastDaysAllowed, 'days').format('YYYY-MM-DD');
    this.maxEffectiveDate = today.clone().add(this.futureDaysAllowed, 'days').format('YYYY-MM-DD');
  }
  //to initalize the form
  inititializeForm() {
    this.hoursAllocationForm = this.fb.group({
      // year: ['', Validators.required],
      location: [{ value: ''}, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      type: [{ value: '', disabled: true }, Validators.required],
      employeeId: [{ value: '', disabled: true }, Validators.required],
      roleId: [{ value: '', disabled: true }, Validators.required],
      employees: this.fb.array([]) as FormArray,
    });
  }
  getAllroles(): void {
    this.http
      .getData('FusionRole')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.roles = data as IRoles[];
          console.log(this.roles);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    let yearsList: number[] = [];
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  enableLocation(): void {
    if (this.hoursAllocationForm.get('year')?.value) {
      this.hoursAllocationForm.get('location')?.enable();
      const selectedYear = this.hoursAllocationForm.get('year')?.value;
      if (selectedYear) {
        this.minYearDate = `${selectedYear}-01-01`;
        this.maxYearDate = `${selectedYear}-12-31`;

        // Re-validate all employees’ effective dates
        const employees = this.hoursAllocationForm.get(
          'employees'
        ) as FormArray;
        employees.controls.forEach((emp) => {
          emp.get('effectivedate')?.updateValueAndValidity();
          emp.get('effectiveto')?.updateValueAndValidity();
        });
      }
    }
  }

  //method to enable the category name
  categoryenable() {
    if (this.hoursAllocationForm.get('shift')?.value) {
      this.hoursAllocationForm.get('employeeId')?.enable();
      this.getAllEmployees();
    }
  }

  private getAllLocations(): void {
    this.http
      .getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => (this.locationDetails = res.jobLocations || []),
        error: (err) => console.error('Error fetching locations:', err),
      });
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.hoursAllocationForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.hoursAllocationForm.get('subLocation')?.enable();
      this.hoursAllocationForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };
    //orgShifts/getshiftlocation?locationId=4&subLocationId=5&year=2025

    this.http
      .getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap(
            (header: any) => header.orgShiftsItems || []
          );
          this.hoursAllocationForm.get('shift')?.enable();
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.hoursAllocationForm.get('shift')?.reset();
          this.hoursAllocationForm.get('shift')?.disable();
        },
      });
  }

  getAllEmployees() {
    // if (this.hoursAllocationForm?.get('type')?.value === 'Employee') {
    const selectedShifts = this.hoursAllocationForm.get('shift')?.value || [];  
    const shiftIdsString = selectedShifts.map((s: any) => s.id).join(',');
    const payload = {
      locationId: this.hoursAllocationForm.get('location')?.value?.id,
      subLocationId: this.hoursAllocationForm.get('subLocation')?.value?.id,
      shiftIds: shiftIdsString,
    };
    this.http
      .getDataWithQueryParams('Employeedata/getAllByShifts', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.length > 0) {
            this.employeeDetails = res.map((employee: any) => ({
              ...employee,
              fullName: `${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
            }));
            this.hoursAllocationForm.get('employeeId')?.enable();
          } else {
            this.employeeDetails = [];
            this.hoursAllocationForm.get('employeeId')?.reset();
            // this.hoursAllocationForm.get('employeeId')?.disable();
          }
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.hoursAllocationForm.get('employeeId')?.reset();
          this.hoursAllocationForm.get('employeeId')?.disable();
        },
      });
    // } else {
    //   this.hoursAllocationForm.get('roleId')?.enable();
    // }
  }

  get employeeFormArray(): FormArray {
    return this.hoursAllocationForm.get('employees') as FormArray;
  }
  // get by employee wfh allocations
  getByEmployeehoursallocations(employeeIds: any, form: FormGroup): void {
    this.isloading = false;
    const loggedInUserId = this.auth.getToken();
    const loggedInUserName = `${loggedInUserId.firstName ?? ''} ${
      loggedInUserId.middleName ?? ''
    } ${loggedInUserId.lastName}`;
    // const employeeArray = this.fb.array<FormGroup>([]);
    // // Loop through all selected employees
    // employeeIds.forEach((selectedEmp: any) => {
    //   // Push either existing or blank form
    //   employeeArray?.push(
    //     this.fb.group(
    //       {
    //         employeeId: [
    //           selectedEmp?.employeeId
    //             ? selectedEmp?.employeeId
    //             : selectedEmp?.id,
    //         ],
    //         fullName: [selectedEmp?.name || selectedEmp?.fullName || '-'],
    //         halfminhours: ['', [Validators.required]],
    //         fullminhours: ['', [Validators.required]],
    //         effectivedate: [
    //           {
    //             value: '',
    //             disabled: !this.hoursAllocationForm.get('year')?.value,
    //           },
    //           [Validators.required, this.validateEffectiveDate?.bind(this)],
    //         ],
    //         effectiveto: [
    //           {
    //             value: '',
    //             disabled: !this.hoursAllocationForm.get('year')?.value,
    //           },
    //           [Validators.required],
    //         ],
    //         createdBy: [loggedInUserName],
    //         createdOn: [moment()?.format('YYYY-MM-DD') || ''],
    //       },
    //       {
    //         validators: [
    //           this.validateEffectiveToDate,
    //           this.validateDaysWithinRange(),
    //         ],
    //       }
    //     )
    //   );
    // });

    // Set the updated employee list in form
    // form.setControl('employees', employeeArray);

    // const ids = employeeIds.map((emp: any) => emp.employeeId);
    // let params = new HttpParams().set('year', this.hoursAllocationForm.get('year')?.value);
    // ids.forEach((id: any) => {
    //   params = params.append('entityValues', id.employeeId);
    // });
    const ids = employeeIds.map((emp: any) => emp.employeeId);
    let params = new HttpParams()
      .set('entityType', 'employee');
    ids.forEach((id: number) => {
      params = params.append('entityValues', id);
    });
    this.http
      .getDataIncludeParams(`FlexibleWorkhoursAllocation/GetAll`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isloading = false;
          const apiData = res?.data || [];
          const employeeArray = this.fb.array<FormGroup>([]);
          // Loop through all selected employees
          employeeIds.forEach((selectedEmp: any) => {
            // Try to find matching allocation data from API
            console.log(apiData);
            const existing = apiData?.find(
              (x: any) =>
                parseInt(x.entityValue?.id) ===
                parseInt(selectedEmp?.employeeId)
            );
            console.log(existing);
            // Push either existing or blank form
            employeeArray?.push(
              this.fb.group({
                createdBy: [loggedInUserName],
                createdOn: [moment()?.format('YYYY-MM-DD') || ''],
                employeeId: [selectedEmp?.employeeId],
                fullName: [selectedEmp?.name || selectedEmp?.fullName || '-'],
                halfminhours: [
                  existing?.shiftDetails?.halfDayMinHrs || '',
                  [Validators.required],
                ],
                fullminhours: [
                  existing?.shiftDetails?.fullDayMinHrs || '',
                  [Validators.required],
                ],
                effectivedate: [
                  {
                    value: '',
                  },
                  [
                    Validators.required,
                    this.validateEffectiveFromDate?.bind(this),
                  ],
                ],
                effectiveto: [
                  {
                    value: '',
                  },
                  [
                    Validators.required,
                    this.validateEffectiveToDate?.bind(this),
                  ],
                ],
              })
            );
          });

          // Set the updated employee list in form
          form.setControl('employees', employeeArray);
        },
        error: (err) => {
          this.isloading = false;
          console.error('Error fetching shifts:', err);
        },
      });
  }
  validateDynamicEffectiveDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const selected = moment(control.value, 'YYYY-MM-DD').startOf('day');
      const today = moment().startOf('day');

      // Allowed range
      const minDate = today.clone().subtract(this.pastDaysAllowed, 'days');
      const maxDate = today.clone().add(this.futureDaysAllowed, 'days');

      if (selected.isBefore(minDate) || selected.isAfter(maxDate)) {
        return { invalidDynamicDate: true };
      }

      return null;
    };
  }
  validateEffectiveFromDate(control: any) {
  if (!control.value) return null;

  const selectedDate = moment(control.value, 'YYYY-MM-DD');
  const currentYear = moment().year();

  // Check if year is not equal to current year
  if (selectedDate.year() !== currentYear) {
    return { invalidDate: true };
  }

  return null; // Valid date

}
  // validateEffectiveDate(control: any) {
  //   if (!control.value) return null;
  //   const selectedDate = moment(control.value, 'YYYY-MM-DD');
  //   const startOfCurrentMonth = moment().startOf('day').subtract(this.pastDaysAllowed, 'days').format('YYYY-MM-DD'); // 1st day of current month
  //   //  If selected date is before the start of current month → invalid
  //   if (selectedDate.isBefore(startOfCurrentMonth, 'day')) {
  //     return { invalidDate: true };
  //   }
  //   // Otherwise valid (current or future)
  //   return null;
  // }

  // Validator to ensure effectiveToDate is not before effectiveFromDate
  validateEffectiveToDate(control: AbstractControl): ValidationErrors | null {
  const group = control.parent;
  if (!group) return null;

  const from = group.get('effectivedate')?.value;
  const to = control.value;

  if (!from || !to) return null;

  const fromDate = moment(from, 'YYYY-MM-DD');
  const toDate = moment(to, 'YYYY-MM-DD');

  if (toDate.isBefore(fromDate, 'day')) {
    return { invalidEffectiveToDate: true };
  }

  return null;
}
  // Validator to ensure days do not allow invalide hours
  validateDays(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const days = control.value;

      if (days === null || days === undefined || days === '') {
        return null; // allow empty
      }

      // Allow only digits (0–9)
      const validPattern = /^[0-9]+$/;

      // ❌ Reject: -, +, _, letters, decimals, spaces
      if (!validPattern.test(days)) {
        return { invalidDaysFormat: true };
      }

      return null; // valid
    };
  }
  //method to handle selected employees from multi select
  onSelectedEmployee(selectedList: any[], form: FormGroup) {
    this.selectedEmployees = selectedList || [];
    this.getByEmployeehoursallocations(this.selectedEmployees, form);
  }

  removeEmployee(index: number, employeeId: number) {
    //  Remove from FormArray
    const employeeArray = this.employeeFormArray;
    employeeArray.removeAt(index);
    // Remove from selectedEmployees array (used by p-multiSelect)
    this.selectedEmployees = this.selectedEmployees.filter(
      (emp) => emp.employeeId !== employeeId
    );
    //Update the multiSelect FormControl so the checkbox deselects
    this.hoursAllocationForm
      .get('employeeId')
      ?.setValue(this.selectedEmployees);
  }

  validateInput(event: KeyboardEvent) {
    const input = event.key;
    const numericInput = /^[0-9]$/;
    if (!numericInput.test(input)) {
      event.preventDefault();
    }
    const currentValue = (event.target as HTMLInputElement).value;
    const newValue = currentValue + input;
    if (newValue.length > 3 || +newValue > 365) {
      event.preventDefault();
    }
  }

  private handleFormValueChanges(): void {
    const form = this.hoursAllocationForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach((control) => {
        form.get(control)?.reset();
        form.get(control)?.disable();
      });
    };

    const resetOnly = (controls: string[]) => {
      controls.forEach((control) => {
        form.get(control)?.reset();
      });
    };

    // form
    //   .get('year')
    //   ?.valueChanges.pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     form.get('location')?.reset();
    //     resetAndDisable(['subLocation', 'shift', 'type', 'employeeId']);
    //   });

    form
      .get('location')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation', 'shift', 'employeeId']);
      });

    form
      .get('subLocation')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['shift', 'employeeId']);
      });

    form
      .get('shift')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['employeeId', 'employees']);
        (this.hoursAllocationForm.get('employees') as FormArray).clear();
      });

    form
      .get('employeeId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['fullminhours','halfminhours']);
      });
  }

  publishWFHAllocation(form: FormGroup): void {
    this.isloading = true;
    const loggedInUserId = this.auth.getToken();
    if (form.invalid) return;
    // this.modalService.open(this.stagingLoadingModal, { centered: true });
    const formData = form.value;
    // Build payload array from employees FormArray
    const employees = formData.employees || [];
    const payload = employees.map((emp: any) => ({
      entityType: 'Employee',
      entityValue: emp.employeeId ? emp.employeeId?.toString() : null,
      halfDayMinHrs: Number(emp.halfminhours) || 0,
      fullDayMinHrs: Number(emp.fullminhours) || 0,
      effectiveFromDate: emp.effectivedate
        ? moment(emp.effectivedate).format('YYYY-MM-DD')
        : null,
      effectiveToDate: emp.effectiveto
        ? moment(emp.effectiveto).format('YYYY-MM-DD')
        : null,
      createdBy: loggedInUserId.employeeId,
      updatedBy: loggedInUserId.employeeId,
      status: 'Active',
    }));
    if (!payload.length) {
      this.modal.openErrorModal('No employees to allocate.');
      return;
    }
    this.http
      .postdata('FlexibleWorkhoursAllocation/create', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isloading = false;
          this.selectedEmployees = [];
          this.hoursAllocationForm.reset();
          (this.hoursAllocationForm.get('employees') as FormArray).clear();
          this.hoursAllocationForm.get('location')?.disable();
          this.hoursAllocationForm.get('subLocation')?.disable();
          this.hoursAllocationForm.get('shiftName')?.disable();
          this.hoursAllocationForm.get('type')?.disable();
          this.hoursAllocationForm.get('shift')?.disable();
          this.modal.openSuccessModal(
            'Flexible Work Hours allocated successfully'
          );
        },
        error: (err: any) => {
          this.isloading = false;
          this.modalService.dismissAll();
          this.modal.openErrorModal(
            err.error.message
              ? err.error.message
              : 'Failed to allocate Work Hours. Please try again later'
          );
        },
        complete: () => {
          form.reset();
        },
      });
  }
  //to reset the form
  cancle() {
    this.hoursAllocationForm.reset();
    // clear employees array
    (this.hoursAllocationForm.get('employees') as FormArray).clear();
    this.hoursAllocationForm.get('subLocation')?.disable();
    this.hoursAllocationForm.get('location')?.disable();
    this.hoursAllocationForm.get('shiftName')?.disable();
    this.hoursAllocationForm.get('type')?.disable();
    this.hoursAllocationForm.get('shift')?.disable();
  }
  //to open the confirmation popup
  resetForm(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
