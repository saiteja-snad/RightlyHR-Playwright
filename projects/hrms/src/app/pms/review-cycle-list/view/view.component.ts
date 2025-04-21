import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-view',
  imports: [CommonModule, FormsModule, NgbPopoverModule, ReactiveFormsModule, Select, TranslateModule, MultiSelectModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  jobLocationDropDownData: any
  subLocationsDropdown: any
  departmentDetails: any
  reviewCycleForm!: FormGroup;
  reviewCycleupdateForm!: FormGroup;
  subDepartmentsDropdownValues: any;
  listofReviewTemplates: any;
  ReviewCycleTypes: any
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  dataload = false;
  searchText = '';
  reviewCyclesList: any[] = []
  filteredDetails: any[] = [];
  @ViewChild('viewreviewcycle') viewreviewcycle: any;
  @ViewChild('cancelationConfirmation') cancelationConfirmation: any;
  todayDate = new Date().toISOString().split('T')[0]

  constructor(private router: Router, private conformationPopup: OpenModalService, private fb: FormBuilder, private http: HttpService, private modalService: NgbModal) {

  }

  ngOnInit(): void {
    this.initializeReviewCycleupdateForm();
  }

  initializeReviewCycleupdateForm() {
    this.reviewCycleupdateForm = this.fb.group({
      reviewCycleName: [{ value: null, disabled: true }, Validators.required],
      startDate: [{ value: null, disabled: true }, Validators.required],
      endDate: [{ value: null, disabled: true }, Validators.required],
      dueDate: [null, [this.dueDateAfterStartDateValidator('startDate')]],
      reviewCycleType: [{ value: null, disabled: true }, Validators.required],
      applicableForIncrement: [{ value: null, disabled: true }, false],
      locationId: [{ value: null, disabled: true }, Validators.required],
      subLocationId: [{ value: null, disabled: true }, Validators.required],
      departmentId: [{ value: null, disabled: true }, Validators.required],
      subDepartmentId: [{ value: null, disabled: true }, Validators.required],
      applicableEmployeesJoinedBefore: [{ value: null, disabled: true }, Validators.required],
      description: [{ value: null, disabled: true }],
      status: ['draft'],
      id: [null]
    },
      { validators: this.startDateEndDateValidator() }
    );
    this.reviewCycleupdateForm.get('startDate')?.valueChanges.subscribe(() => {
      this.toggleDateFields();
      this.updateDueDateValidator();
      this.dueDateAfterStartDateValidator('startDate')
      this.startDateEndDateValidator()
    });
    this.toggleDateFields();
    this.updateDueDateValidator();
  }
  closeModal() {
    this.openCancelationPopUp()
  }
  openCancelationPopUp() {
    this.modalService.open(this.cancelationConfirmation, { centered: true });
  }
  updateDueDateValidator(): void {
    const startDate = this.reviewCycleForm.get('startDate')?.value;

    if (startDate) {
      this.reviewCycleForm.get('dueDate')?.enable();
      this.reviewCycleForm.get('dueDate')?.updateValueAndValidity();
    } else {
      this.reviewCycleForm.get('dueDate')?.reset();
      this.reviewCycleForm.get('dueDate')?.disable();
    }
  }

  toggleDateFields(): void {
    const startDateControl = this.reviewCycleForm.get('startDate');
    const startDateValid = !!startDateControl?.value && startDateControl.valid;

    if (startDateValid) {
      this.reviewCycleForm.get('endDate')?.enable();
      this.reviewCycleForm.get('dueDate')?.enable();
    } else {
      this.reviewCycleForm.get('endDate')?.reset();
      this.reviewCycleForm.get('endDate')?.disable();
      this.reviewCycleForm.get('dueDate')?.reset();
      this.reviewCycleForm.get('dueDate')?.disable();
    }
  }

  startDateEndDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        return { endDateInvalid: true };
      }
      return null;
    };
  }

  dueDateAfterStartDateValidator(startDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent; // Get the parent form group
      if (!formGroup) return null;
      const startDate = formGroup.get(startDateControlName)?.value;
      const dueDate = control.value;
      if (startDate && dueDate) {
        const start = new Date(startDate);
        const due = new Date(dueDate);
        if (due < start) {
          return { dueDateBeforeStartDate: true };
        }
        if (start.getTime() === due.getTime()) {
          return { startDateEqualsDueDate: true };
        }
      }
      return null;
    };
  }

  Viewintial(cycle: any) {
    this.openinitalView()
    let locationIds = cycle.locations.map((item: any) => item.locationId).join(',');
    let subLocationIds = cycle.sublocations.map((item: any) => item.subLocationId).join(',');
    let depIds = cycle.departments.map((item: any) => item.departmentId).join(',')
    let subDepIds = cycle.subdepartments.map((item: any) => item.subDepartmentId).join(',')
    const formatDate = (date: any) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };
    this.reviewCycleupdateForm.patchValue({
      reviewCycleName: cycle.reviewCycleName,
      startDate: formatDate(cycle.startDate), // Format to YYYY-MM-DD
      endDate: formatDate(cycle.endDate),
      //dueDate: formatDate(cycle.dueDate),
      reviewCycleType: cycle.reviewCycleType,
      applicableForIncrement: cycle.applicableForIncrement,
      applicableEmployeesJoinedBefore: formatDate(cycle.applicableEmployeesJoinedBefore),
      departmentId: depIds.split(',').map(Number),
      subDepartmentId: subDepIds.split(',').map(Number),
      locationId: locationIds.split(',').map(Number),
      subLocationId: subLocationIds.split(',').map(Number),
      reviewTemplateId: cycle.reviewTemplateId,
      status: cycle.status,
      description: cycle.description,
      id: cycle.id
    });
    this.getSubLocationByid(locationIds)
    this.getSubDepartmentsByDepID(depIds)
  }

  openinitalView() {
    this.getAllLocations()
    this.getAllDepartments()
    this.getAllReviewCycleTypes()
    this.getAllReviewTemplates()
    this.modalService.open(this.viewreviewcycle, {
      size: 'lg',
      centered: true,
    });
  }

  getAllLocations() {
    this.subscription = this.http.getData("JobLocation/getAllLocations").subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.map((location: any) => {
          return {
            ...location,
            fullName: `${location.jobLocationName}`,
            selectedAllGroup: 'Group 3',
          };
        });
      }
    })
  }

  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations.map((subLocation: any) => {
          return {
            ...subLocation,
            fullName: `${subLocation.subLocationName}`, // You can modify this based on the actual property
            selectedAllGroup: 'Group 4', // Add grouping or additional properties if needed
          };
        });
      }
    })
  }

  getAllReviewTemplates() {
    const params = {
      moduleid: environment.PMSrequestmoduleId,
    }
    this.subscription = this.http.getDataIncludeParams("Form/getAllFormDetails", params).subscribe({
      next: (data: any) => {
        this.listofReviewTemplates = data
      }
    })
  }

  getAllDepartments() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data.map((department: any) => {
          return {
            ...department,
            fullName: `${department.departmentName}`,
            selectedAllGroup: 'Group 1',
          };
        });
      }
    })
  }

  getSubDepartmentsByDepID(id: any) {
    this.subscription = this.http.getData(`Subdepartments/Getnames/V2/${id}`).subscribe({
      next: (data: any) => {
        this.subDepartmentsDropdownValues = data.map((subDepartment: any) => {
          return {
            ...subDepartment,
            fullName: `${subDepartment.subDepartmentName}`,
            selectedAllGroup: 'Group 2',
          };
        });
      }
    })
  }

  getAllReviewCycleTypes() {
    const params = {
      entity: "PMS",
      attribute: "reviewType"
    }
    this.subscription = this.http.getDataIncludeParams("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        console.log(data);
        this.ReviewCycleTypes = data
      }
    })
  }

  onReviewCycleintialUpdate() {

    // this.modalRef = this.modalService.open(this.loading, { centered: true });
    if (this.reviewCycleupdateForm.valid) {
      const reviewCycleData = {
        reviewCycleName: this.reviewCycleupdateForm.value.reviewCycleName,
        startDate: this.reviewCycleupdateForm.value.startDate,
        endDate: this.reviewCycleupdateForm.value.endDate,
        dueDate: null,
        reviewCycleType: this.reviewCycleupdateForm.value.reviewCycleType,
        applicableForIncrement: this.reviewCycleupdateForm.value.applicableForIncrement,
        locationId: this.reviewCycleupdateForm.value.locationId?.join(','),
        subLocationId: this.reviewCycleupdateForm.value.subLocationId?.join(','),
        departmentId: this.reviewCycleupdateForm.value.departmentId?.join(','),
        subDepartmentId: this.reviewCycleupdateForm.value.subDepartmentId?.join(','),
        applicableEmployeesJoinedBefore: this.reviewCycleupdateForm.value.applicableEmployeesJoinedBefore,
        description: this.reviewCycleupdateForm.value.description,
        reviewTemplateId: this.reviewCycleupdateForm.value.reviewTemplateId,
      };
      this.http.putData(`reviewCycleHeader/update/${this.reviewCycleupdateForm.value.id}`, reviewCycleData).subscribe({
        next: (response) => {
          // if (this.modalRef) {
          //   this.modalRef.close();  // or this.modalRef.dismiss();
          // }
          // console.log('Success:', response);
          this.closeModal()
          this.onCreateCycleFormSubmitted()
          // this.Status = 'Review Cycle Updated Successfully'
          this.conformationPopup.openSuccessModal('Review Cycle Updated Successfully')
          // this.modalService.open(this.success, { centered: true });
        },
        error: (error) => {
          // this.Status = error.error.reason
          this.conformationPopup.openSuccessModal(error.error.reason)
          // this.modalService.open(this.errormessage, { centered: true });
          // if (this.modalRef) {
          //   this.modalRef.close();  // or this.modalRef.dismiss();
          // }
          console.error('Error:', error);
        }
      });
    } else {
      this.reviewCycleForm.markAllAsTouched();
    }
  }
  onCreateCycleFormSubmitted() {
    this.page = 1
    this.pageSize = 10
    this.getAllReviewCyclesList(this.page, this.pageSize)
  }

  getAllReviewCyclesList(pagenum: number, pagesize: number, fetchAll: boolean = false): void {
    const pageSize = fetchAll ? 10000 : this.pageSize; // Fetch all records if fetchAll is true
    const params = {
      page: pagenum,
      pageSize: pageSize,
      searchQuery: this.searchText
    };
    this.dataload = true;

    this.subscription = this.http.getpagentiontData("reviewCycleHeader", params).subscribe({
      next: (data: any) => {
        this.collectionSize = data.totalCount;
        this.reviewCyclesList = data.items || [];
        this.filteredDetails = this.reviewCyclesList;
        if (this.searchText) {
          this.filterDetails();
        }
        this.dataload = false;
      },
      error: (err: any) => {
        console.log("errors", err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  filterDetails(): void {
    if (!this.searchText) {
      this.filteredDetails = this.reviewCyclesList.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
      this.collectionSize = this.reviewCyclesList.length;
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      const filtered = this.reviewCyclesList.filter(item => {
        return this.objectContainsText(item, searchTextLower);
      });
      this.collectionSize = filtered.length;
      this.filteredDetails = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    }
    this.page = 1; // Reset to the first page
  }

  objectContainsText(obj: any, text: string): boolean {
    if (typeof obj === 'string') {
      return obj.toLowerCase().includes(text);
    }
    if (typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(text);
    }
    if (Array.isArray(obj)) {
      return obj.some(item => this.objectContainsText(item, text));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(val => this.objectContainsText(val, text));
    }
    return false;
  }

  OnClickLocation(event: any) {
    const joinedIds = event.value.map((item: any) => item).join(',');
    this.reviewCycleForm.get('subLocationId')?.reset();
    if (joinedIds) {
      this.getSubLocationByid(joinedIds);
    }
    else {
      this.subLocationsDropdown = []
    }
  }
  
  onDepartmentNameChange(event: any) {
    console.log(event)
    const joinedIds = event.value.map((item: any) => item).join(',');
    this.reviewCycleForm.get('subDepartmentId')?.reset();
    if (joinedIds) {
      this.getSubDepartmentsByDepID(joinedIds);
    }
    else {
      this.subDepartmentsDropdownValues = []
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
