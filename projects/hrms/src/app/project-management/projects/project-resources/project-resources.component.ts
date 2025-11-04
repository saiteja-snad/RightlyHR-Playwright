import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-project-resources',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule, DateformatPipe,
    Select, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './project-resources.component.html',
  styleUrl: './project-resources.component.scss'
})

export class ProjectResourcesComponent implements OnInit, OnDestroy {
  resourcesData = [] as IResource[];
  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  loading: boolean = true;
  projectRoleDropdown: any[] = [];
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' }
  ];
  projectId: any;
  ResourceId: any;
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  startndEndDateValid: any;
  startDatevalidate: any;
  endDatevalidate: any;
  inactiveStatus: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  constructor(private router: Router, private fb: FormBuilder, public rbac: RbacService, private modalService: NgbModal,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService, 
    public formValidation: FormValidationsService,) { }

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getProjects(this.projectId)
        this.getResourceData(this.projectId);
      }
    });
    this.http.resourceDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getResourceData(parseInt(this.projectId));
    });
    this.updateResourceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.updateResourceForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
  }
selectedRoleId: number = 0;
selectedEntityRefId: number = 0;

onRoleChange(selectedValue: any) {
  if (selectedValue) {
    this.selectedRoleId = selectedValue.roleId;
    this.selectedEntityRefId = selectedValue.entityReferenceId;
  }
}

  initializeForms() {
    this.updateResourceForm = this.fb.group({
      resourceName: [null, Validators.required],
      resourceEmail: [null, [Validators.required, Validators.email]],
      resourcePhone: [null, Validators.required],
      designation: [null, Validators.required],
      projectName: [null, Validators.required],
      projectType: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      resourceAllocationhrs: [null, Validators.required],
      // allocatedFrequencyType: [null, Validators.required],
      overtimeEligible: [false],
      billable: [false],
      allowweekendWork: [false],
      resourceRole: [null,Validators.required]
    }, { validators: [this.DateValidator()] },);
  }

  projectStartDate!: Date;
  projectEndDate!: Date;
  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
          this.departmentIds = this.projectsData[0].departments?.map((d: any) => d.departmentId) || [];
        const project = this.projectsData[0];
        if (project) {
          this.projectStartDate = new Date(project.startDate);
          this.projectEndDate = new Date(project.endDate);
          // this.updateResourceForm.setValidators(this.validateAllocationHours(project));
          // this.updateResourceForm.updateValueAndValidity();
        }
         this.getJobrole();
        this.inactiveStatus = (res?.data ?? []).some((p: any) =>
          p.status?.toLowerCase() === 'inactive' || p.client?.status?.toLowerCase() === 'inactive'
        ) ? 'inactive' : 'active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsData = [];
      },
    });
  }
getJobrole() {
  this.loader = true;
  const departmentParam = this.departmentIds?.join(',') || '';

  this.subscription = this.http
    .getData(`ProjectRoles?isActive=true&departmentIds=${departmentParam}`)
    .subscribe({
      next: (response: any) => {
        this.loader = false;
        if (response && response.success && Array.isArray(response.data)) {
          this.projectRoleDropdown = response.data.map((item: any) => ({
            label: `${item.roleName}`,
            value: {
              roleId: item.id,
              entityReferenceId: item.entity?.entityReferenceId || 0
            }
          }));
        } else {
          this.projectRoleDropdown = [];
        }
      },
      error: () => {
        this.loader = false;
      },
    });
}
  // validateAllocationHours(project: any): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const form = control as FormGroup;
  //     const hours = form.get('resourceAllocationhrs')?.value;
  //     const frequency = form.get('allocatedFrequencyType')?.value;
  //     if (!hours || !frequency || !this.projectStartDate || !this.projectEndDate) {
  //       return null;
  //     }
  //     // calculate working days between start & end
  //     const workingDays = this.getWorkingDays(
  //       this.projectStartDate,
  //       this.projectEndDate,
  //       project.isWeekendWorkAllowed
  //     );
  //     // allowed hours = workingDays × 8
  //     const allowedHours = workingDays * 8;
  //     // validation
  //     if (hours > allowedHours) {
  //       return { invalidAllocation: { maxAllowed: allowedHours } };
  //     }
  //     return null;
  //   };
  // }

  getWorkingDays(startDate: Date, endDate: Date, allowWeekend: boolean): number {
    let workingDays = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6; // Sun / Sat
      if (allowWeekend || !isWeekend) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1); // move to next day
    }
    return workingDays;
  }

  getResourceData(id: any) {
    const projectId = id;
    const params = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId,
    };
    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        this.resourcesData = data.data;
        this.loading = false;
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

  openModal(content: any, size: any, data: any) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    const selectedRole = this.projectRoleDropdown.find(
  (r: any) => r.label === data.role
);

    this.ResourceId = data?.resourceId;
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone: data?.employee?.workPhoneNumber ? `${data?.employee?.workPhoneCountryCode ?? ''} ${data?.employee?.workPhoneNumber ?? ''}` : '',
      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours || null,
      projectName: this.projectsData[0]?.projectName,
      projectType: this.projectsData[0]?.projectType,
      startDate: this.formatDateToLocal(data.startDate),
        endDate: this.formatDateToLocal(data.endDate),
        // allocatedFrequencyType: data?.allocatedFrequencyType,
      billable: data.billable,

      allowweekendWork: data.weekendWorkAllowed,
        resourceRole: selectedRole ? selectedRole.value : null
    });
  }

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            id: employee.employeeId, // ✅ force number
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  onClickEmployee(event: any) {
    const employeeId = event.value; // just the ID
    this.selectedEmployee = this.employeeDetails.find(employeeId);
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${this.selectedEmployee.contactnumber ?? ''}` : ''
    });
    this.getJobdetails(this.selectedEmployee?.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee}`).subscribe({
      next: (data: any) => {
        const jobRole = Array.isArray(data) ? data[0]?.jobRole : data?.jobRole;
        this.updateResourceForm.patchValue({
          designation: jobRole,
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  closePopup() {
    this.modalService.dismissAll();
    this.updateResourceForm.reset();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  updateResources() {
    if (this.updateResourceForm.invalid) {
      this.updateResourceForm.markAllAsTouched();
      return;
    }
    const formValue = this.updateResourceForm.value;
    const projectRoleId = formValue.resourceRole.roleId;
    const  projectDepartmentId =formValue.resourceRole.entityReferenceId;
    const payload = {
      entityType: "project",
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      // allocatedFrequencyType: formValue.allocatedFrequencyType || null,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: "Active",
      allocatedBy: this.empinfo.employeeId,
      //role: formValue.resourceRole,
    projectRoleId: projectRoleId,
    projectDepartmentId: projectDepartmentId,

    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Resource updated successfully');
        this.getResourceData(this.projectId);
      },
      error: (err) => {
        console.error('Error occured:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
      }
    });
  }

  oncheckdates(value: any) {
    if (value) {
      this.startDatevalidate = value; // block earlier dates
      // reset end date limit
    }
  }

  DateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
          return { endBeforeStart: true };
        }
      }
      return null;
    };
  }

  StartndendDateValidation() {
    const StartDate = this.updateResourceForm.get('startDate')?.value;
    const EndDate = this.updateResourceForm.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  deleteResources() {
    const formValue = this.updateResourceForm.value;
    const payload = {
      entityType: "project",
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      // allocatedFrequencyType: formValue.allocatedFrequencyType || null,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: "Inactive",
      allocatedBy: this.empinfo.employeeId,
    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Resource deleted successfully');
        this.getResourceData(this.projectId);
      },
      error: (err) => {
        console.error('Error occured:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete resource');
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    // this.router.navigate(['/project-management/clients/active'])
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}