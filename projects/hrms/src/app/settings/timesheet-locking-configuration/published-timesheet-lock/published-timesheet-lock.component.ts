import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Category, ITimesheetLockItem} from '../timesheet-lock.modal';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { PaginatorModule } from 'primeng/paginator';
import { Ipersonal } from '../../../Interfaces/personal-modal';

@Component({
  selector: 'app-published-timesheet-lock',
    imports: [ReactiveFormsModule, FormsModule, CommonModule, DataLoaderContentComponent, NoDataFoundComponent, TranslateModule, Select, DateformatPipe, PaginatorModule],
  templateUrl: './published-timesheet-lock.component.html',
  styleUrl: './published-timesheet-lock.component.scss'
})
export class PublishedTimesheetLockComponent {
//export class AttendanceLockPanelConfigurationComponent implements OnInit, OnDestroy {
  TimesheetLockForm!: FormGroup;
  updateTimesheetLockForm!: FormGroup;
  publishTimesheetLockForm!: FormGroup;
  dataLoad = false;
  spinnerLoader = false;
  todayString: string = '';
  fromDateString: string | null = null;
  toDateString: string | null = null;
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
    @ViewChild('errormodal') errormodal!: TemplateRef<any>;
  totalRecords = 0;
  currentDate: Date = new Date();
  yearDetails: number[] = [];
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  /* Subject to manage component destruction */
  /* This subject is used to unsubscribe from observables when the component is destroyed */
  destroy$: Subject<boolean> = new Subject<boolean>();
  updatedisablebtn = false;
  /* Options for page size selection */
  /* This array contains the options for the number of records displayed per page */
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
categoriesList = [
    {moduleName:'Timesheet', value:'30'}
  ];
  errormodaldata: any;
  /* OnInit Lifecycle Hook */
  /* This method initializes the component, fetching necessary data and setting up the form */
  ngOnInit(): void {
    this.http.triggerRefresh();
    this.getAllYears();
    this.empInfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.todayString = this.formatDate(new Date());
    this.getTimesheetLocks(this.page, this.pageSize);
    this.initializeTimesheetLockForm('add');
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
  /* Get All Years */
  getAllYears() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.yearDetails.push(i);
    }
  }
  // track for published data
  get publishedSubmissionData(): ITimesheetLockItem[] {
    return this.TimesheetLockData?.filter(att => att.status === 'Published') || [];
  }
 
  /* Get timesheet Locks */
  /* This method fetches the attendance locks based on pagination and search query */
  getTimesheetLocks(pagenum: number, pagesize: number, year?: number) {
      const categoryIds = '30';
    // const params: { pageNumber: number; pageSize: number; search?: string; year?: number } = {
      
      const params: any = {
    pageNumber: pagenum,
    pageSize: pagesize,
    categoryIds: categoryIds,
  };

    if (this.searchText) {
      params.search = this.searchText;
    }
  
    this.dataLoad = true;
     const queryString = `?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}&categoryIds=${encodeURIComponent(params.categoryIds)}`;

    this.http.getpagentiontData(`AttendanceLockConfigurations/getall${queryString}`, '').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.TimesheetLockData = response.items;
           this.TimesheetLockDatacount = response.statusCounts.Published;
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

  /* Initialize timesheet Lock Form */
  /* This method initializes the form for adding or updating attendance locks */
  initializeTimesheetLockForm(formType: 'add' | 'update') {
    const formGroup = this.fb.group({
      categoryType: ['', Validators.required],
      fromDate: ['', [Validators.required, this.noFutureDateValidator]],
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
    this.TimesheetLockForm.get('toDate')?.enable();
    // date change show error 
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
    // date change show error 
    const toDate = form.get('toDate')?.value;
    const effectiveDate = form.get('effectiveDate')?.value;
    const fromDate = form.get('fromDate')?.value;
    this.toDateInvalid = !!fromDate && !!toDate && new Date(toDate) < new Date(fromDate);
    if (toDate >= effectiveDate) {
      this.effectiveDateInvalid = true;
    } else {
      this.effectiveDateInvalid = false;
    }
  }
  /* This method handles changes in the 'effectiveDate' field */
  onEffectiveDateChange(form: FormGroup): void {
    const toDate = form.get('toDate')?.value;
    const effectiveDate = form.get('effectiveDate')?.value;
    if (toDate >= effectiveDate) {
      this.effectiveDateInvalid = true;
    } else {
      this.effectiveDateInvalid = false;
    }
  }
  /* Get Effective Date Minimum Value */
  /* This method calculates the minimum effective date based on the 'toDate' */
  getEffectiveDateMin(): string | null {
    if (!this.toDateString) return null;
  const toDate = new Date(this.toDateString);
  toDate.setDate(toDate.getDate() + 2);
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());
  // Get the later date
  const minDate = toDate > currentDate ? toDate : currentDate;
  return this.formatDate(minDate);
  }

  /* Open Add timesheet Lock Modal */
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  /* Close Add timesheet Lock Modal */
  /* This method resets the form and closes the modal */
  close() {
    this.TimesheetLockForm.get('toDate')?.disable();
    this.TimesheetLockForm.get('effectiveDate')?.disable();
    this.TimesheetLockForm.reset();
    this.modalService.dismissAll();
  }

  /* Open Update timesheet Lock Modal */
  /* This method opens the modal for updating an existing attendance lock */
  isPublished = false;
  openUpdateModal(content: any, selectedtimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedtimesheet;
    this.isPublished = selectedtimesheet.status === 'Published';
    this.initializeTimesheetLockForm('update');
    this.patchTimesheetlock();
       this.toDateInvalid = false;
    this.effectiveDateInvalid = false;
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse fromDate and toDate from the selected attendance lock
    const fromDate = new Date(selectedtimesheet.startDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(selectedtimesheet.endDate);
    toDate.setHours(0, 0, 0, 0);
    const effectivedate = new Date(selectedtimesheet.effectiveDate);
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
        //this.updateAttendanceLockForm.get('toDate')?.disable();
      }
      if (effectivedate > today) {
        this.updateTimesheetLockForm.get('effectiveDate')?.enable();
      } else {
        //this.updateAttendanceLockForm.get('effectiveDate')?.disable();
      }
    }
    else {
      this.updateTimesheetLockForm.get('categoryType')?.enable();
      this.updateTimesheetLockForm.get('fromDate')?.enable();
      this.updateTimesheetLockForm.get('toDate')?.enable();
      this.updateTimesheetLockForm.get('effectiveDate')?.enable();
    }
    this.openModal(content);
  }
  // if all fieldas are disable update show disable
  AllFieldsDisabled(): boolean {
    const controls = this.updateTimesheetLockForm.controls;
    return (
      
      controls['fromDate'].disabled &&
      controls['toDate'].disabled &&
      controls['effectiveDate'].disabled
    );
  }
  /* Patch timesheet Lock */
  /* This method patches the form with the selected attendance lock data */
patchTimesheetlock() {
  if (!this.selectedTimesheetLock) return;

  // Find the category that matches the selected moduleId
  const matchedCategory = this.categoriesList.find(
    cat => cat.value === this.selectedTimesheetLock?.module?.moduleId?.toString()
  );

  this.updateTimesheetLockForm.patchValue({
    categoryType: matchedCategory || null,
    fromDate: this.formatDate(new Date(this.selectedTimesheetLock.startDate)),
    toDate: this.formatDate(new Date(this.selectedTimesheetLock.endDate)),
    effectiveDate: this.formatDate(new Date(this.selectedTimesheetLock.effectiveDate)),
  });
}

  /* Update timesheet Lock */
  /* This method updates the selected attendance lock */
  updateTimesheetLock(form: FormGroup) {
   // if (form.valid) {
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
        moduleId: formData.categoryType.value || 0,
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
          this.errormodaldata = error.error.message;
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
   // }
  }

  // Publish timesheet Lock
  /* This method publishes the selected timesheet lock */
  statuspublish = true;
  PublishTimesheetceLock() {
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
        this.confirmationModal.openSuccessModal('Timesheet lock published successfully');
        this.statuspublish = false;
      },
      error: (error: any) => {
        this.spinnerLoader = false;
        this.errormodaldata = error?.error?.message || 'Failed to publish Timesheet lock';
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
  /* Open Delete timesheet Lock Modal */
  /* This method opens the modal for deleting an timesheet lock */
  openDeleteModal(content: any, selectedTimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedTimesheet;
    this.openModal(content);
  }
  /* Open Publish timesheet Lock Modal */
  /* This method opens the modal for publishing an timesheet lock */
  openPublishModal(content: any, selectedTimesheet: ITimesheetLockItem) {
    this.selectedTimesheetLock = selectedTimesheet;
    this.openModal(content);
  }

  /* Delete timesheet Lock */
  /* This method deletes the selected timesheet lock */
  deleteTimesheetLock() {
    if (this.selectedTimesheetLock) {
      this.spinnerLoader = true;
      this.http.deleteData(`AttendanceLockConfigurations/${this.selectedTimesheetLock.id}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.confirmationModal.openSuccessModal('Timesheet lock deleted successfully');
        },
        error: (error: any) => {
          this.spinnerLoader = false;
          this.errormodaldata = error?.error?.message || 'Failed to delete Timesheet lock';
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
