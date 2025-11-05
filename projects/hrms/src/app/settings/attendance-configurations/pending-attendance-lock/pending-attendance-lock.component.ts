import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Subject, takeUntil } from 'rxjs';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Category, IAttendanceLockItem } from '../attendance.model';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { PaginatorModule } from 'primeng/paginator';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";

@Component({
  selector: 'app-pending-attendance-lock',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DataLoaderContentComponent, NoDataFoundComponent, TranslateModule, Select, DateformatPipe, PaginatorModule, ConfirmationIconComponent],
  templateUrl: './pending-attendance-lock.component.html',
  styleUrl: './pending-attendance-lock.component.scss'
})
export class PendingAttendanceLockComponent implements OnInit, OnDestroy {
  attendanceLockForm!: FormGroup;
  updateAttendanceLockForm!: FormGroup;
  publishAttendanceLockForm!: FormGroup;
  dataLoad = false;
  spinnerLoader = false;
  todayString: string = '';
  fromDateString: string | null = null;
  toDateString: string | null = null;
  categoriesList: Category[] = [];
  attendanceLockData: IAttendanceLockItem[] = [];
  attendanceLockDatacount: number = 0;
  selectedAttedanceLock: IAttendanceLockItem | undefined;
  searchText = '';
  empInfo = {} as Ipersonal;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  searchQuery = '';
  first = 0;
  totalRecords = 0;
  currentDate: Date = new Date();
  yearDetails: number[] = [];
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  /* Subject to manage component destruction */
  /* This subject is used to unsubscribe from observables when the component is destroyed */
  destroy$: Subject<boolean> = new Subject<boolean>();

  /* Options for page size selection */
  /* This array contains the options for the number of records displayed per page */
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  /* OnInit Lifecycle Hook */
  /* This method initializes the component, fetching necessary data and setting up the form */
  ngOnInit(): void {
    this.http.triggerRefresh();
    this.empInfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.todayString = this.formatDate(new Date());
    this.getAttendanceLocks(this.page, this.pageSize);
    this.initializeAttendanceLockForm('add');
    this.getCategoriesList();
    this.attendanceLockForm.get('toDate')?.disable();
    this.attendanceLockForm.get('effectiveDate')?.disable();
  }

  /* Constructor */
  /* This method injects the necessary services for the component */
  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private confirmationModal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService
  ) { }
  // track for pending for submession data
  get pendingSubmissionData(): IAttendanceLockItem[] {
    return this.attendanceLockData?.filter(att => att.status === 'Pending for Submission') || [];
  }
  /* Get Categories List */
  /* This method fetches the list of categories for attendance locks */
  getCategoriesList(): void {
    this.http.getData(`AttendanceLockConfigurations/get?section=timeoff`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.categoriesList = response;
      },
      error: (err) => {
        this.categoriesList = [];
      }
    });
  }

  /* Get Attendance Locks */
  /* This method fetches the attendance locks based on pagination and search query */
  getAttendanceLocks(pagenum: number, pagesize: number, year?: number) {
     const categoryIds = '1,2,3,17,18';
    // const params: { pageNumber: number; pageSize: number; search?: string; year?: number } = {
      
      const params: any = {
    pageNumber: pagenum,
    pageSize: pagesize,
    categoryIds: categoryIds,
  };

    // if (this.searchText) {
    //   params.search = this.searchText;
    // }
    // if (year) {
    //   params.year = year;
    // }
    this.dataLoad = true;
     const queryString = `?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}&categoryIds=${encodeURIComponent(params.categoryIds)}`;

    this.http.getpagentiontData(`AttendanceLockConfigurations/getall${queryString}`, '').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.attendanceLockData = response.items;
            this.attendanceLockDatacount = response.statusCounts.PendingforSubmission;
          this.collectionSize = response.totalCount;
          this.page = response.page;
          this.pageSize = response.pageSize;
          this.first = (response.page - 1) * response.pageSize;
        },
        error: (err: any) => {
          this.dataLoad = false;
        },
        complete: () => {
          this.dataLoad = false;
        }
      });
  }

  /* Search Text Change */
  /* This method is triggered when the search text changes */
  onSearchTextChange(): void {
    this.getAttendanceLocks(this.page, this.pageSize);
  }
  // This method is triggered when the year  changes
  onYearChange(year: number) {
    this.selectedYear = year;
    this.getAttendanceLocks(this.page, this.pageSize, this.selectedYear);
  }
  /* Pagination */
  /* This method handles the pagination changes */
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getAttendanceLocks(this.page, this.pageSize);
  }

  /* Page Size Change */
  /* This method handles the change in page size */
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getAttendanceLocks(this.page, this.pageSize);
  }

  /* Initialize Attendance Lock Form */
  /* This method initializes the form for adding or updating attendance locks */
  initializeAttendanceLockForm(formType: 'add' | 'update') {
    const formGroup = this.fb.group({
      categoryType: ['', Validators.required],
      fromDate: ['', [Validators.required]],
      toDate: ['', Validators.required],
      effectiveDate: ['', Validators.required]
    });

    formGroup.get('fromDate')?.valueChanges.subscribe((value) => {
      this.fromDateString = value;
      formGroup.get('toDate')?.updateValueAndValidity();
    });

    formGroup.get('toDate')?.valueChanges.subscribe((value) => {
      this.toDateString = value;
      formGroup.get('effectiveDate')?.updateValueAndValidity();
    });

    formGroup.get('effectiveDate')?.setValidators([Validators.required, this.effectiveAfterToDateValidator.bind(this, formGroup)]);

    if (formType === 'add') {
      this.attendanceLockForm = formGroup;
    } else {
      this.updateAttendanceLockForm = formGroup;
    }
  }

  /* Format Date */
  /* This method formats a date to 'YYYY-MM-DD' format */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /* Validators */
  /* This method checks if the selected date is not in the future */
  noFutureDateValidator(control: AbstractControl): { [key: string]: any } | null {
    const selected = new Date(control.value);
    const today = new Date();
    return selected > today ? { futureDate: true } : null;
  }

  /* Effective Date Validator */
  /* This method checks if the effective date is after the 'toDate' */
  effectiveAfterToDateValidator(formGroup: FormGroup, control: AbstractControl): { [key: string]: any } | null {
    const toDateValue = formGroup.get('toDate')?.value;
    const toDate = new Date(toDateValue);
    const effective = new Date(control.value);
    return effective < toDate ? { effectiveBeforeToDate: true } : null;
  }

  /* Check if Effective Date is Future */
  /* This method checks if the effective date is in the future */
  isEffectiveDateFuture(effectiveDateString: string): boolean {
    const effectiveDate = new Date(effectiveDateString);
    return effectiveDate > this.currentDate;
  }

  /* Form Change Handlers */
  /* These methods handle changes in the form fields */
  toDateInvalid: boolean = false;
  effectiveDateInvalid: boolean = false;
  onFromDateChange(form: FormGroup) {

    this.fromDateString = form.get('fromDate')?.value;
    this.toDateString = form.get('toDate')?.value;
    this.attendanceLockForm.get('toDate')?.enable();
    const fromDate = form.get('fromDate')?.value;
    const toDate = form.get('toDate')?.value;
    this.toDateInvalid = !!fromDate && !!toDate && new Date(toDate) < new Date(fromDate);
  }

  /* This method handles changes in the 'toDate' field */
  onToDateChange(form: FormGroup) {
    this.toDateString = form.get('toDate')?.value;
    this.attendanceLockForm.get('effectiveDate')?.enable();
    const toDate = form.get('toDate')?.value;
    const effectiveDate = form.get('effectiveDate')?.value;
    const fromDate = form.get('fromDate')?.value;
    this.toDateInvalid = !!fromDate && !!toDate && new Date(toDate) < new Date(fromDate);
      if (effectiveDate) {
        if (toDate >= effectiveDate) {
          this.effectiveDateInvalid = true;
        } else {
          this.effectiveDateInvalid = false;
        }
     }
  }
  /* This method handles changes in the 'effectiveDate' field */
  onEffectiveDateChange(form: FormGroup): void {
    const toDate = form.get('toDate')?.value;
    const effectiveDate = form.get('effectiveDate')?.value;
    if (effectiveDate) {
      if (toDate >= effectiveDate) {
        this.effectiveDateInvalid = true;
      } else {
        this.effectiveDateInvalid = false;
      }
    }
  }
  /* Get Effective Date Minimum Value */
  /* This method calculates the minimum effective date based on the 'toDate' */
  getEffectiveDateMin(): string | null {
    // if (!this.toDateString) return null;
    // const toDate = new Date(this.toDateString);
    // toDate.setDate(toDate.getDate() + 1);
    // return this.formatDate(toDate);
    if (!this.toDateString) return null;

  const toDate = new Date(this.toDateString);
  toDate.setDate(toDate.getDate() + 2);

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());

  // Get the later date
  const minDate = toDate > currentDate ? toDate : currentDate;

  return this.formatDate(minDate);

  }
  /* Open Add Attendance Lock Modal */
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.toDateInvalid = false;
    this.effectiveDateInvalid = false;
  }

  /* Close Add Attendance Lock Modal */
  /* This method resets the form and closes the modal */
  close() {
    this.attendanceLockForm.get('toDate')?.disable();
    this.attendanceLockForm.get('effectiveDate')?.disable();
    this.attendanceLockForm.reset();
    this.modalService.dismissAll();
  }

  /* Add Attendance Lock */
  /* This method adds a new attendance lock */
  addAttendanceLock(form: FormGroup) {
    if (form.valid) {
      this.spinnerLoader = true;
      const formData = form.value;
      const payload = {
        startDate: new Date(formData.fromDate).toISOString(),
        endDate: new Date(formData.toDate).toISOString(),
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        moduleId: formData.categoryType.id || 0,
        status: 'Pending for Submission',
        addedBy: this.empInfo.employeeId || 0,
        addedDate: new Date().toISOString()
      };

      this.http.postdata(`AttendanceLockConfigurations`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
          this.confirmationModal.openSuccessModal('Attendance Lock added successfully');
        },
        error: (error: any) => {
          this.spinnerLoader = false;
          this.confirmationModal.openErrorModal(error.error.message ? error.error.message : 'Failed to add Attendance Lock');
        },
        complete: () => {
          this.spinnerLoader = false;
          this.attendanceLockForm.reset();
          this.getAttendanceLocks(this.page, this.pageSize);
        }
      });
    }
  }

  /* Open Update Attendance Lock Modal */
  /* This method opens the modal for updating an existing attendance lock */
  isPublished = false;
  openUpdateModal(content: any, selectedAttendance: IAttendanceLockItem) {
    this.selectedAttedanceLock = selectedAttendance;
    this.isPublished = selectedAttendance.status === 'Published';
    this.initializeAttendanceLockForm('update');
    this.patchAttendancelock();
    this.toDateInvalid = false;
    this.effectiveDateInvalid = false;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse fromDate and toDate from the selected attendance lock
    const fromDate = new Date(selectedAttendance.startDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(selectedAttendance.endDate);
    toDate.setHours(0, 0, 0, 0);

    // Disable/Enable form controls based on status
    if (this.isPublished) {
      this.updateAttendanceLockForm.get('categoryType')?.disable();
      // this.updateAttendanceLockForm.get('fromDate')?.disable();
      // this.updateAttendanceLockForm.get('toDate')?.disable();

      if (fromDate > today) {
        this.updateAttendanceLockForm.get('fromDate')?.enable();
      } else {
        this.updateAttendanceLockForm.get('fromDate')?.disable();
      }
      // Enable toDate if it's in the future
      if (toDate > today) {
        this.updateAttendanceLockForm.get('toDate')?.enable();
      } else {
        this.updateAttendanceLockForm.get('toDate')?.disable();
      }
      this.updateAttendanceLockForm.get('effectiveDate')?.enable();
    }
    else {
      this.updateAttendanceLockForm.get('categoryType')?.enable();
      this.updateAttendanceLockForm.get('fromDate')?.enable();
      this.updateAttendanceLockForm.get('toDate')?.enable();
      this.updateAttendanceLockForm.get('effectiveDate')?.enable();
    }
    this.openModal(content);
  }

  /* Patch Attendance Lock */
  /* This method patches the form with the selected attendance lock data */
  patchAttendancelock() {
    if (!this.selectedAttedanceLock) return;

    const matchedCategory = this.categoriesList.find(
      (cat: any) => cat.id === this.selectedAttedanceLock?.module?.moduleId
    );

    this.updateAttendanceLockForm.patchValue({
      categoryType: matchedCategory || '',
      fromDate: this.formatDate(new Date(this.selectedAttedanceLock.startDate)),
      toDate: this.formatDate(new Date(this.selectedAttedanceLock.endDate)),
      effectiveDate: this.formatDate(new Date(this.selectedAttedanceLock.effectiveDate)),
    });
  }

  /* Update Attendance Lock */
  /* This method updates the selected attendance lock */
  updateAttendanceLock(form: FormGroup) {
    if (form.valid) {
      this.spinnerLoader = true;

      // Use getRawValue() to retrieve values from both enabled and disabled fields
      const formData = form.getRawValue();

      // Validate dates explicitly before using them
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      const effectiveDate = new Date(formData.effectiveDate);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || isNaN(effectiveDate.getTime())) {
        this.spinnerLoader = false;
        this.confirmationModal.openErrorModal('Please ensure all date fields have valid values.');
        return;
      }

      const payload = {
        startDate: fromDate.toISOString(),
        endDate: toDate.toISOString(),
        effectiveDate: effectiveDate.toISOString(),
        moduleId: formData.categoryType?.id || 0,
        updatedBy: this.empInfo.employeeId || 0,
      };

      this.http.putData(`AttendanceLockConfigurations/${this.selectedAttedanceLock?.id}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.confirmationModal.openSuccessModal('Attendance Lock updated successfully');
          },
          error: (error: any) => {
            this.modalService.dismissAll();
            this.spinnerLoader = false;
            this.confirmationModal.openErrorModal(error?.error?.message || 'Failed to update Attendance Lock');
          },
          complete: () => {
            this.spinnerLoader = false;
            this.updateAttendanceLockForm.reset();
            this.selectedAttedanceLock = undefined;
            this.getAttendanceLocks(this.page, this.pageSize);
          }
        });
    }
  }

  // Publish Attendance Lock
  /* This method publishes the selected attendance lock */
  statuspublish = true;
  PublishAttendanceLock() {
    if (!this.selectedAttedanceLock) return;
    this.spinnerLoader = true;
    const payload = {
      startDate: (this.selectedAttedanceLock.startDate),
      endDate: (this.selectedAttedanceLock.endDate),
      effectiveDate: (this.selectedAttedanceLock.effectiveDate),
      moduleId: this.selectedAttedanceLock.module?.moduleId || 0,
      status: 'Published',
      updatedBy: this.empInfo.employeeId || 0,
    };

    this.http.putData(`AttendanceLockConfigurations/${this.selectedAttedanceLock.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.http.triggerRefresh();
        this.confirmationModal.openSuccessModal('Attendance Lock published successfully');
        this.statuspublish = false;
      },
      error: (error: any) => {
        this.spinnerLoader = false;
        this.confirmationModal.openErrorModal(error.error.message ? error.error.message : 'Failed to publish Attendance Lock');
      },
      complete: () => {
        this.spinnerLoader = false;
        this.attendanceLockForm.reset();
        this.getAttendanceLocks(this.page, this.pageSize);
      }
    });
  }
  /* Open Delete Attendance Lock Modal */
  /* This method opens the modal for deleting an attendance lock */
  openDeleteModal(content: any, selectedAttendance: IAttendanceLockItem) {
    this.selectedAttedanceLock = selectedAttendance;
    this.openModal(content);
  }
  /* Open Publish Attendance Lock Modal */
  /* This method opens the modal for publishing an attendance lock */
  openPublishModal(content: any, selectedAttendance: IAttendanceLockItem) {
    this.selectedAttedanceLock = selectedAttendance;
    this.openModal(content);
  }

  /* Delete Attendance Lock */
  /* This method deletes the selected attendance lock */
  deleteAttendanceLock() {
    if (this.selectedAttedanceLock) {
      this.spinnerLoader = true;
      this.http.deleteData(`AttendanceLockConfigurations/${this.selectedAttedanceLock.id}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
          this.confirmationModal.openSuccessModal('Attendance Lock deleted successfully');
        },
        error: (error: any) => {
          this.spinnerLoader = false;
          this.confirmationModal.openErrorModal(error.error.message ? error.error.message : 'Failed to delete Attendance Lock');
        },
        complete: () => {
          this.spinnerLoader = false;
          this.getAttendanceLocks(this.page, this.pageSize);
          this.selectedAttedanceLock = undefined;
        }
      });
    }
  }

  /* Destroy Method */
  /* This method cleans up subscriptions to prevent memory leaks */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
