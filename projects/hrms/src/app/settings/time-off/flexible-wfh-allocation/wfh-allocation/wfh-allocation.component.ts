import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
@Component({
  selector: 'app-wfh-allocation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    MultiSelectModule,
    NoDataFoundComponent,
    DateformatPipe,
  ],
  templateUrl: './wfh-allocation.component.html',
  styleUrl: './wfh-allocation.component.scss',
})
export class WfhAllocationComponent implements OnInit, OnDestroy {
  wfhAllocationForm!: FormGroup;
  selectedEmployees: any[] = [];
  isSubmitting = false;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  categoryDetails = [{ name: 'WFH', value: 'WFH' }];
  employeeDetails = [] as IEmployees[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  // @ViewChild('stagingLoadingModal') stagingLoadingModal: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.yearsList = this.getYears();
    this.inititializeForm();
    this.getAllLocations();
    this.handleFormValueChanges();
  }

  inititializeForm() {
    this.wfhAllocationForm = this.fb.group({
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
    if (this.wfhAllocationForm.get('year')?.value) {
      this.wfhAllocationForm.get('location')?.enable();
    }
  }

  //method to enable the category name
  categoryenable() {
    if (this.wfhAllocationForm.get('shift')?.value) {
      this.wfhAllocationForm.get('categoryName')?.enable();
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
      this.wfhAllocationForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.wfhAllocationForm.get('subLocation')?.enable();
      this.wfhAllocationForm.get('subLocation')?.reset();
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
          this.wfhAllocationForm.get('shift')?.enable();
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.wfhAllocationForm.get('shift')?.reset();
          this.wfhAllocationForm.get('shift')?.disable();
        },
      });
  }

  getAllEmployees() {
    const payload = {
      locationId: this.wfhAllocationForm.get('location')?.value?.id,
      subLocationId: this.wfhAllocationForm.get('subLocation')?.value?.id,
      shiftId: this.wfhAllocationForm.get('shift')?.value?.id,
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
          this.wfhAllocationForm.get('employeeName')?.enable();
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.wfhAllocationForm.get('employeeName')?.reset();
          this.wfhAllocationForm.get('employeeName')?.disable();
        },
      });
  }

  get employeeFormArray(): FormArray {
    return this.wfhAllocationForm.get('employees') as FormArray;
  }

  onSelectedEmployee(selectedList: any[], form: FormGroup) {
    this.selectedEmployees = selectedList || [];
    const employeeArray = form.get('employees') as FormArray;
    //  Clear existing entries
    employeeArray.clear();
    this.selectedEmployees.forEach((emp: any) => {
      employeeArray.push(
        this.fb.group({
          employeeId: [emp.employeeId],
          fullName: [emp.fullName],
          days: ['', Validators.required],
          effectivedate: ['', Validators.required],
          createdBy: [''],
          createdOn: [''],
          lastUpdatedBy: [''],
          lastUpdatedOn: [''],
        })
      );
    });
    //  Tell TypeScript explicitly this is a FormArray
    form.setControl('employees', employeeArray as FormArray);
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
    this.wfhAllocationForm
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
    const form = this.wfhAllocationForm;

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
        resetAndDisable(['employeeName']);
      });

    form
      .get('employeeName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['days']);
      });
  }

  publishLeaveAllocation(form: FormGroup): void {
    if (form.invalid) return;
    // this.modalService.open(this.stagingLoadingModal, { centered: true });
    const formData = form.value;
    const payload = [
      {
        year: formData.year,
        locationId: formData.location.id,
        subLocationId: formData.subLocation.id,
        shiftId: formData.shift.id,
        categoryId: formData.categoryName.id,
        employeeId: formData.employeeName.employeeId,
        allowedDays: +formData.days,
        entityReferenceId: formData.employeeName.employeeId,
        status: 'Published',
        entityType: 'Employee',
      },
    ];

    this.http
      .postdata('LeavePolicy', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.wfhAllocationForm.get('subLocation')?.disable();
          this.wfhAllocationForm.get('location')?.disable();
          this.wfhAllocationForm.get('shiftName')?.disable();
          this.wfhAllocationForm.get('categoryName')?.disable();
          this.wfhAllocationForm.get('shift')?.disable();
          this.selectedEmployees = [];
          this.modal.openSuccessModal('WFH allocation published successfully!');
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          this.modal.openErrorModal(
            err.error.message
              ? err.error.message
              : 'Failed to publish wfh allocation!'
          );
        },
        complete: () => {
          form.reset();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
