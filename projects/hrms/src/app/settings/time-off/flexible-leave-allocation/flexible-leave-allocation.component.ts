import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { ICategoryDetails, IEmployees, ILocation, IShiftHeader, ISubLocation } from './leave-allocation.model';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-flexible-leave-allocation',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule],
  templateUrl: './flexible-leave-allocation.component.html',
  styleUrl: './flexible-leave-allocation.component.scss'
})
export class FlexibleLeaveAllocationComponent implements OnInit, OnDestroy {
  leaveAllocationForm!: FormGroup;
  selectedEmployee!: string;
  isSubmitting = false;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  categoryDetails = [] as ICategoryDetails[];
  employeeDetails = [] as IEmployees[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
     private modal: OpenModalService,
     private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.yearsList = this.getYears();
    this.inititializeForm();
    this.getAllLocations();
    this.handleFormValueChanges();
  }

  inititializeForm() {
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      categoryName: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      days: ['', Validators.required]
    });
  }

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    let yearsList: number[] = []
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  enableLocation(): void {
    if (this.leaveAllocationForm.get('year')?.value) {
      this.leaveAllocationForm.get('location')?.enable();
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => this.locationDetails = res.jobLocations || [],
        error: err => console.error('Error fetching locations:', err)
      });
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.leaveAllocationForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.leaveAllocationForm.get('subLocation')?.enable();
      this.leaveAllocationForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };

    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
          this.leaveAllocationForm.get('shift')?.enable();
        },
        error: err => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.leaveAllocationForm.get('shift')?.reset();
          this.leaveAllocationForm.get('shift')?.disable();
        }
      });
  }

  getCategoryDetails(shift: any): void {
    const payload = {
      year: this.leaveAllocationForm.get('year')?.value,
      locationId: this.leaveAllocationForm.get('location')?.value?.id,
      subLocationId: this.leaveAllocationForm.get('subLocation')?.value?.id,
      shiftId: shift.id,
      leaveType: 0,
      status: 'Published',
    };

    this.http.getDataWithQueryParams("OrgLeavesCategories", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.categoryDetails = res;
        this.leaveAllocationForm.get('categoryName')?.enable();
      },
      error: err => {
        console.error('Error fetching categories:', err);
        this.leaveAllocationForm.get('categoryName')?.reset();
        this.leaveAllocationForm.get('categoryName')?.disable();
      }
    });
  }

  getAllEmployees() {
    const payload = {
      locationId: this.leaveAllocationForm.get('location')?.value?.id,
      subLocationId: this.leaveAllocationForm.get('subLocation')?.value?.id,
      shiftId: this.leaveAllocationForm.get('shift')?.value?.id,
    };
    this.http.getDataWithQueryParams("Employeedata/getAll", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.employeeDetails = res.map((employee: any) => ({
          ...employee,
          fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));
        this.leaveAllocationForm.get('employeeName')?.enable();
      },
      error: err => {
        console.error('Error fetching employees:', err);
        this.leaveAllocationForm.get('employeeName')?.reset();
        this.leaveAllocationForm.get('employeeName')?.disable();
      }
    });
  }

  onSelectedEmployee(event: any, form: FormGroup) {
    this.selectedEmployee = event.fullName;
    
    const formData = form.value;
    const payload = {
      categoryId: formData.categoryName.id,
      entityReferenceId: event.employeeId,
      year: formData.year,
      status: 'Published',
      shiftId: formData.shift.id,
      locationId: formData.location.id,
      subLocationId: formData.subLocation.id,
      entityType: "Employee"
    }

    this.http.postdata("LeavePolicy/getallemployeeid", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        form.get('days')?.setValue(res.allowedDays, { emitEvent: false });
      },
      error: err => {
        console.error('Error fetching employee ID:', err);
      }
    });
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
    const form = this.leaveAllocationForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
        form.get(control)?.disable();
      });
    };

    const resetOnly = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
      });
    };

    form.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable(['subLocation', 'shift', 'categoryName', 'employeeName']);
      });

    form.get('location')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation', 'shift', 'categoryName', 'employeeName']);
      });

    form.get('subLocation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['shift', 'categoryName', 'employeeName']);
      });

    form.get('categoryName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['employeeName']);
      });

    form.get('employeeName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetOnly(['days']);
      });
  }

  publishLeaveAllocation(form: FormGroup): void {
    if (form.invalid) return;
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    const formData = form.value;
    const payload = [{
      year: formData.year,
      locationId: formData.location.id,
      subLocationId: formData.subLocation.id,
      shiftId: formData.shift.id,
      categoryId: formData.categoryName.id,
      employeeId: formData.employeeName.employeeId,
      allowedDays: +formData.days,
      entityReferenceId: formData.employeeName.employeeId,
      status: 'Published',
      entityType: "Employee",
    }];

    this.http.postdata("LeavePolicy", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.modal.openSuccessModal('Leave allocation published successfully!');
      },
      error: (err: any) => {
        this.modalService.dismissAll();
        this.modal.openErrorModal(err.error.message? err.error.message: 'Failed to publish leave allocation!');
      },
      complete: () => {
        this.modalService.dismissAll();
        form.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
