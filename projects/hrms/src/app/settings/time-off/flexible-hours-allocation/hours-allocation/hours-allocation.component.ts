import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { ILocation, ISubLocation, IShiftHeader, IEmployees } from '../../flexible-leave-allocation/leave-allocation.model';

@Component({
  selector: 'app-hours-allocation',
  imports: [CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    MultiSelectModule,
    NoDataFoundComponent,
    DateformatPipe,],
  templateUrl: './hours-allocation.component.html',
  styleUrl: './hours-allocation.component.scss'
})
export class HoursAllocationComponent {
 hoursAllocationForm!: FormGroup;
  selectedEmployees: any[] = [];
  isSubmitting = false;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  categoryDetails = [{ name: 'WFH', value: 'WFH' }];
  employeeDetails = [] as IEmployees[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  isloading = false;
  minEffectiveDate!: string;
  maxEffectiveDate!: string;
  selectedYear: number | null = null;
  minYearDate!: string;
  maxYearDate!: string;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.yearsList = this.getYears();
    this.minEffectiveDate = moment().startOf('month').format('YYYY-MM-DD');
    this.maxEffectiveDate = moment().endOf('month').format('YYYY-MM-DD');
    this.inititializeForm();
    this.getAllLocations();
    this.handleFormValueChanges();
  }

  inititializeForm() {
    this.hoursAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      categoryName: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      employees: this.fb.array([]) as FormArray,
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
        const employees = this.hoursAllocationForm.get('employees') as FormArray;
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
      this.hoursAllocationForm.get('categoryName')?.enable();
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
    const payload = {
      locationId: this.hoursAllocationForm.get('location')?.value?.id,
      subLocationId: this.hoursAllocationForm.get('subLocation')?.value?.id,
      shiftId: this.hoursAllocationForm.get('shift')?.value?.id,
    };
    this.http
      .getDataWithQueryParams('Employeedata/getAll', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.employeeDetails = res.map((employee: any) => ({
            ...employee,
            fullName: `${employee.firstName} ${
              employee.middleName ? employee.middleName + ' ' : ''
            }${employee.lastName}`,
          }));
          this.hoursAllocationForm.get('employeeName')?.enable();
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.hoursAllocationForm.get('employeeName')?.reset();
          this.hoursAllocationForm.get('employeeName')?.disable();
        },
      });
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
    const employeeArray = this.fb.array<FormGroup>([]);
    // Loop through all selected employees
    employeeIds.forEach((selectedEmp: any) => {
      // Push either existing or blank form
      employeeArray?.push(
        this.fb.group(
          {
            employeeId: [selectedEmp?.employeeId],
            fullName: [selectedEmp?.name || selectedEmp?.fullName || '-'],
            days: ['', [Validators.required]],
            effectivedate: [
             { value: '', disabled: !this.hoursAllocationForm.get('year')?.value },
              [Validators.required, this.validateEffectiveDate?.bind(this)],
            ],
            effectiveto: [{ value: '', disabled: !this.hoursAllocationForm.get('year')?.value }, [Validators.required]],
            createdBy: [loggedInUserName],
            createdOn: [moment()?.format('YYYY-MM-DD') || ''],
          },
          {
            validators: [
              this.validateEffectiveToDate,
              this.validateDaysWithinRange(),
            ],
          }
        )
      );
    });

    // Set the updated employee list in form
    form.setControl('employees', employeeArray);
  }
validateEffectiveDate(control: any) {
  if (!control.value) return null;
  const selectedDate = moment(control.value, 'YYYY-MM-DD');
  const startOfCurrentMonth = moment().startOf('month'); // 1st day of current month
  //  If selected date is before the start of current month → invalid
  if (selectedDate.isBefore(startOfCurrentMonth, 'day')) {
    return { invalidDate: true };
  }
  // Otherwise valid (current or future)
  return null;
}

  // Validator to ensure effectiveToDate is not before effectiveFromDate
  validateEffectiveToDate(formGroup: FormGroup) {
    const fromDate = formGroup.get('effectivedate')?.value;
    const toDate = formGroup.get('effectiveto')?.value;

    if (!fromDate || !toDate) return null;

    const from = moment(fromDate, 'YYYY-MM-DD');
    const to = moment(toDate, 'YYYY-MM-DD');

    if (to.isBefore(from, 'day')) {
      return { invalidEffectiveToDate: true };
    }

    return null;
  }
  // Validator to ensure days do not exceed the range between effective dates
  validateDaysWithinRange(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const fromDate = group.get('effectivedate')?.value;
      const toDate = group.get('effectiveto')?.value;
      const days = group.get('days')?.value;

      if (!fromDate || !toDate || !days) {
        return null; // skip validation if values are missing
      }

      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (end < start) {
        return { invalidEffectiveToDate: true }; // Already handled in your template
      }

      const diffInMs = end.getTime() - start.getTime();
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1; // include both dates

      if (days > diffInDays) {
        return { invalidDaysRange: true }; // custom error key
      }

      return null;
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
      .get('employeeName')
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

    form
      .get('year')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable([
          'subLocation',
          'shift',
          'categoryName',
          'employeeName',
        ]);
      });

    form
      .get('location')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable([
          'subLocation',
          'shift',
          'categoryName',
          'employeeName',
        ]);
      });

    form
      .get('subLocation')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['shift', 'categoryName', 'employeeName']);
      });

    form
      .get('categoryName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['employeeName', 'employees']);
        (this.hoursAllocationForm.get('employees') as FormArray).clear();
      });

    form
      .get('employeeName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['days']);
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
      employeeId: emp.employeeId,
      allowedDays: Number(emp.days) || 0,
      effectiveFromDate: emp.effectivedate
        ? moment(emp.effectivedate).format('YYYY-MM-DD')
        : null,
      effectiveToDate: emp.effectiveto
        ? moment(emp.effectiveto).format('YYYY-MM-DD')
        : null,
      createdBy: loggedInUserId.employeeId,
      frequency: 'Monthly',
      flexibleAllocation: true,
      updatedBy: loggedInUserId.employeeId,
      status: 'Active',
    }));
    if (!payload.length) {
      this.modal.openErrorModal('No employees to allocate.');
      return;
    }
    this.http
      .postdata('FlexibleWfhAllocation/create', payload)
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
          this.hoursAllocationForm.get('categoryName')?.disable();
          this.hoursAllocationForm.get('shift')?.disable();
          this.modal.openSuccessModal('Flexible WFH allocated successfully');
        },
        error: (err: any) => {
          this.isloading = false;
          this.modalService.dismissAll();
          this.modal.openErrorModal(
            err.error.message
              ? err.error.message
              : 'Failed to allocate WFH. Please try again later'
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
    this.hoursAllocationForm.get('categoryName')?.disable();
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
