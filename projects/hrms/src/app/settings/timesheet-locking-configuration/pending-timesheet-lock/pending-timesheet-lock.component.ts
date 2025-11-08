import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { PaginatorModule } from 'primeng/paginator';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { Category, ITimesheetLockItem} from '../timesheet-lock.modal';

@Component({
  selector: 'app-pending-timesheet-lock',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DataLoaderContentComponent, NoDataFoundComponent, TranslateModule, Select, DateformatPipe, PaginatorModule, ConfirmationIconComponent],
  templateUrl: './pending-timesheet-lock.component.html',
  styleUrl: './pending-timesheet-lock.component.scss'
})
export class PendingTimesheetLockComponent {
TimesheetLockForm!: FormGroup;
  updateTimesheetLockForm!: FormGroup;
  publishTimesheetLockForm!: FormGroup;
  dataLoad = false;
  spinnerLoader = false;
  todayString: string = '';
  fromDateString: string | null = null;
  toDateString: string | null = null;
  @ViewChild('errormodal') errormodal!: TemplateRef<any>;

  // categoriesList: Category[] = [];
  TimesheetLockData: ITimesheetLockItem[] = [];
  TimesheetLockDatacount: number = 0;
  selectedTimesheetLock: ITimesheetLockItem | undefined;
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
  categoriesList = [
    {moduleName:'Timesheet', value:'30'}
  ];
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
  errormodaldata: any;

  /* OnInit Lifecycle Hook */
  /* This method initializes the component, fetching necessary data and setting up the form */
  ngOnInit(): void {
    this.http.triggerRefresh();
    this.empInfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.todayString = this.formatDate(new Date());
    this.getTimesheetLocks(this.page, this.pageSize);
    this.initializeTimesheetLockForm('add');
  //  this.getCategoriesList();
    this.TimesheetLockForm.get('toDate')?.disable();
    this.TimesheetLockForm.get('effectiveDate')?.disable();
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
  get pendingSubmissionData(): ITimesheetLockItem[] {
    return this.TimesheetLockData?.filter(att => att.status === 'Pending for Submission') || [];
  }
  /* Get Categories List */
  /* This method fetches the list of categories for timesheet locks *
  /* Get Timesheet Locks */
  /* This method fetches the timesheet locks based on pagination and search query */
  getTimesheetLocks(pagenum: number, pagesize: number, year?: number) {
     const categoryIds = '30';
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
          this.TimesheetLockData = response.items;
            this.TimesheetLockDatacount = response.statusCounts.PendingforSubmission;
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
    this.getTimesheetLocks(this.page, this.pageSize);
  }
  // This method is triggered when the year  changes
  onYearChange(year: number) {
    this.selectedYear = year;
    this.getTimesheetLocks(this.page, this.pageSize, this.selectedYear);
  }
  /* Pagination */
  /* This method handles the pagination changes */
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getTimesheetLocks(this.page, this.pageSize);
  }

  /* Page Size Change */
  /* This method handles the change in page size */
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getTimesheetLocks(this.page, this.pageSize);
  }

  /* Initialize Timesheet Lock Form */
  /* This method initializes the form for adding or updating timesheet locks */
  initializeTimesheetLockForm(formType: 'add' | 'update') {
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
      this.TimesheetLockForm = formGroup;
    } else {
      this.updateTimesheetLockForm = formGroup;
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
    this.TimesheetLockForm.get('toDate')?.enable();
    const fromDate = form.get('fromDate')?.value;
    const toDate = form.get('toDate')?.value;
    this.toDateInvalid = !!fromDate && !!toDate && new Date(toDate) < new Date(fromDate);
  }

  /* This method handles changes in the 'toDate' field */
  onToDateChange(form: FormGroup) {
    this.toDateString = form.get('toDate')?.value;
    this.TimesheetLockForm.get('effectiveDate')?.enable();
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
  /* Open Add Timesheet Lock Modal */
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.toDateInvalid = false;
    this.effectiveDateInvalid = false;
  }

  /* Close Add Timesheet Lock Modal */
  /* This method resets the form and closes the modal */
  close() {
    this.TimesheetLockForm.get('toDate')?.disable();
    this.TimesheetLockForm.get('effectiveDate')?.disable();
    this.TimesheetLockForm.reset();
    this.modalService.dismissAll();
  }

  /* Add Timesheet Lock */
  /* This method adds a new Timesheet lock */
  addTimesheetLock(form: FormGroup) {
    if (form.valid) {
      this.spinnerLoader = true;
      const formData = form.value;
      const payload = {
        startDate: new Date(formData.fromDate).toISOString(),
        endDate: new Date(formData.toDate).toISOString(),
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        moduleId: formData.categoryType.value || 0,
        status: 'Pending for Submission',
        addedBy: this.empInfo.employeeId || 0,
        addedDate: new Date().toISOString()
      };

      this.http.postdata(`AttendanceLockConfigurations`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
          this.confirmationModal.openSuccessModal('Timesheet lock added successfully');
        },
        error: (error: any) => {
          this.spinnerLoader = false;
          this.errormodaldata = error.error.message || 'Failed to add Timesheet lock';
         const modalRef = this.modalService.open(this.errormodal, { centered: true });
         // Auto close the error modal after 3 seconds
          setTimeout(() => {
            modalRef.close();
          }, 3000);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.TimesheetLockForm.reset();
          this.getTimesheetLocks(this.page, this.pageSize);
        }
      });
    }
  }

  /* Open Update Timesheet Lock Modal */
  /* This method opens the modal for updating an existing Timesheet lock */
  isPublished = false;
  openUpdateModal(content: any, selectedTimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedTimesheet;
    this.isPublished = selectedTimesheet.status === 'Published';
    this.initializeTimesheetLockForm('update');
    this.patchTimesheetlock();
    this.toDateInvalid = false;
    this.effectiveDateInvalid = false;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse fromDate and toDate from the selected timesheet lock
    const fromDate = new Date(selectedTimesheet.startDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(selectedTimesheet.endDate);
    toDate.setHours(0, 0, 0, 0);

    // Disable/Enable form controls based on status
    if (this.isPublished) {
      this.updateTimesheetLockForm.get('categoryType')?.disable();
      if (fromDate > today) {
        this.updateTimesheetLockForm.get('fromDate')?.enable();
      } else {
        this.updateTimesheetLockForm.get('fromDate')?.disable();
      }
      // Enable toDate if it's in the future
      if (toDate > today) {
        this.updateTimesheetLockForm.get('toDate')?.enable();
      } else {
        this.updateTimesheetLockForm.get('toDate')?.disable();
      }
      this.updateTimesheetLockForm.get('effectiveDate')?.enable();
    }
    else {
      this.updateTimesheetLockForm.get('categoryType')?.enable();
      this.updateTimesheetLockForm.get('fromDate')?.enable();
      this.updateTimesheetLockForm.get('toDate')?.enable();
      this.updateTimesheetLockForm.get('effectiveDate')?.enable();
    }
    this.openModal(content);
  }

  /* Patch Timesheet Lock */
  /* This method patches the form with the selected timesheet lock data */
patchTimesheetlock() {
  if (!this.selectedTimesheetLock) return;

  // Find the category that matches the selected moduleId
  const matchedCategory = this.categoriesList.find(
    cat => cat.value === this.selectedTimesheetLock?.module?.moduleId?.toString()
  );

  this.updateTimesheetLockForm.patchValue({
    categoryType: matchedCategory ? matchedCategory.value : '',
    fromDate: this.formatDate(new Date(this.selectedTimesheetLock.startDate)),
    toDate: this.formatDate(new Date(this.selectedTimesheetLock.endDate)),
    effectiveDate: this.formatDate(new Date(this.selectedTimesheetLock.effectiveDate))
  });
}

  /* Update Timesheet Lock */
  /* This method updates the selected timesheet lock */
  updateTimesheetLock(form: FormGroup) {
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
        moduleId: formData.categoryType || 0,
        updatedBy: this.empInfo.employeeId || 0,
      };

      this.http.putData(`AttendanceLockConfigurations/${this.selectedTimesheetLock?.id}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.confirmationModal.openSuccessModal('Timesheet lock updated successfully');
          },
          error: (error: any) => {
            this.modalService.dismissAll();
            this.spinnerLoader = false;
           this.errormodaldata = error.error.message || 'Failed to update Timesheet lock';          
        const modalRef = this.modalService.open(this.errormodal, { centered: true });
         // Auto close the error modal after 3 seconds
          setTimeout(() => {
            modalRef.close();
          }, 3000);
          },
          complete: () => {
            this.spinnerLoader = false;
            this.updateTimesheetLockForm.reset();
            this.selectedTimesheetLock = undefined;
            this.getTimesheetLocks(this.page, this.pageSize);
          }
        });
    }
  }

  // Publish Timesheet Lock
  /* This method publishes the selected timesheet lock */
  statuspublish = true;
  PublishTimesheetLock() {
    if (!this.selectedTimesheetLock) return;
    this.spinnerLoader = true;
    const payload = {
      startDate: (this.selectedTimesheetLock.startDate),
      endDate: (this.selectedTimesheetLock.endDate),
      effectiveDate: (this.selectedTimesheetLock.effectiveDate),
      moduleId: this.selectedTimesheetLock.module?.moduleId || 0,
      status: 'Published',
      updatedBy: this.empInfo.employeeId || 0,
    };

    this.http.putData(`AttendanceLockConfigurations/${this.selectedTimesheetLock.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.http.triggerRefresh();
        this.confirmationModal.openSuccessModal('Timesheet lock published successfully');
        this.statuspublish = false;
      },
      error: (error: any) => {
        this.spinnerLoader = false;
            this.errormodaldata = error.error.message || 'Failed to publish Timesheet lock';
         const modalRef = this.modalService.open(this.errormodal, { centered: true });
         // Auto close the error modal after 3 seconds
          setTimeout(() => {
            modalRef.close();
          }, 3000);
      },
      complete: () => {
        this.spinnerLoader = false;
        this.TimesheetLockForm.reset();
        this.getTimesheetLocks(this.page, this.pageSize);
      }
    });
  }
  /* Open Delete Timesheet Lock Modal */
  /* This method opens the modal for deleting an Timesheet lock */
  openDeleteModal(content: any, selectedTimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedTimesheet;
    this.openModal(content);
  }
  /* Open Publish Timesheet Lock Modal */
  /* This method opens the modal for publishing an Timesheet lock */
  openPublishModal(content: any, selectedTimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedTimesheet;
    this.openModal(content);
  }

  /* Delete Timesheet Lock */
  /* This method deletes the selected Timesheet lock */
  deleteTimesheetLock() {
    if (this.selectedTimesheetLock) {
      this.spinnerLoader = true;
      this.http.deleteData(`AttendanceLockConfigurations/${this.selectedTimesheetLock.id}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
          this.confirmationModal.openSuccessModal('Timesheet lock deleted successfully');
        },
        error: (error: any) => {
          this.spinnerLoader = false;
            this.errormodaldata = error.error.message ||  'Failed to delete Timesheet lock' ;
        const modalRef = this.modalService.open(this.errormodal, { centered: true });
         // Auto close the error modal after 3 seconds
          setTimeout(() => {
            modalRef.close();
          }, 3000);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.getTimesheetLocks(this.page, this.pageSize);
          this.selectedTimesheetLock = undefined;
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
