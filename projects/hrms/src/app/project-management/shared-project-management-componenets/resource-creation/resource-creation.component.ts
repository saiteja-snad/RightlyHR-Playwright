import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Project } from '../../../Interfaces/projects.model';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-resource-creation',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, NgbPopover, SelectModule, InfoIconComponent],
  templateUrl: './resource-creation.component.html',
  styleUrl: './resource-creation.component.scss'
})

export class ResourceCreationComponent implements OnInit, OnDestroy {
  addResourceForm!: FormGroup;
  spinnerLoader = false
  subscription!: Subscription;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' }
  ];
  departmentlist = [] as any;
  projectId: any;
  empinfo: any = {};
  projectsDataDrown: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  startDatevalidate: any;
  startndEndDateValid: any;
  ProjectstartndEndDateValid: any;
  projectStartDate: any;
  projectEndDate: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  phaseData = [] as IPhases[];
  resourceAuthorityid: any
  phaseDropdown: any[] = [];
  selectedPhaseId: any;
  resourcesData = [] as IResource[];
  resoucesDropDownData = [] as any[];
  selectedAuthorityId: any;
  constructor(private router: Router, private fb: FormBuilder, private modalService: NgbModal, public formValidation: FormValidationService,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.createResourceForm();
    this.getdatabaedonRoute();

    this.DepartmentList();
    this.addResourceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.addResourceForm.get('allocatedFrequencyType')?.valueChanges.subscribe(() => {
      this.addResourceForm.get('resourceAllocationhrs')?.updateValueAndValidity();
    });
  }
  DepartmentList() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.departmentlist = data;
      },
    });
  }
  projectRoles: any[] = [];

  projectRoleDropdown: any[] = [];

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

  selectedRoleId: number = 0;
  selectedEntityRefId: number = 0;

  onRoleChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedRoleId = selectedValue.roleId;
      this.selectedEntityRefId = selectedValue.entityReferenceId;
    }
  }

  onPhaseChange(selectedValue: any) {
    if (selectedValue?.value) {
      const phase = selectedValue?.value;
      this.resourceAuthorityid = selectedValue?.value?.pendingApprovalAuthority;
      console.log(this.resourceAuthorityid);

      this.selectedPhaseId = phase.value ?? null;
      this.projectStartDate = phase.startDate ?? null;
      this.projectEndDate = phase.endDate ?? null;

      // Update validators safely
      this.addResourceForm.get('startDate')?.updateValueAndValidity();
      this.addResourceForm.get('endDate')?.updateValueAndValidity();
      console.log(this.projectStartDate, this.projectEndDate);

      // Reset approval authority safely
      const resourceAuthorityControl = this.addResourceForm.get('resourceAuthority');
      console.log(resourceAuthorityControl);

      if (resourceAuthorityControl) {
        resourceAuthorityControl.patchValue(phase?.pendingApprovalAuthority);
        resourceAuthorityControl.disable();
      }

      if (this.projectId != null && this.selectedPhaseId != null) {
        this.getResourceData(this.projectId, this.selectedPhaseId);
      }
    }
  }


  onAuthorityChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedAuthorityId = selectedValue?.value?.value;
    }
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.route.queryParams.subscribe(params => {
        const projectId = params['id'];
        if (projectId) {
          this.getProjects(projectId);
          this.projectId = parseInt(projectId);
          this.getPhaseData();

        }
      });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.projectId = null
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          this.addResourceForm.get('projectName')?.enable();
          this.getclientProjects(clientID);
        }
      });
    }
  }

  //resource form
  createResourceForm() {
    this.addResourceForm = this.fb.group({
      resourceName: [null, Validators.required],
      resourceEmail: [null, [Validators.required, Validators.email]],
      resourceRole: [null, [Validators.required, Validators.maxLength(50),
      Validators.minLength(2),
      ]],
      resourcePhone: [null],
      designation: [null, Validators.required],
      projectName: [{ value: null, disabled: true }, Validators.required],
      projectType: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      resourceAllocationhrs: [null, Validators.required],
      // allocatedFrequencyType: [null, Validators.required],
      overtimeEligible: [false],
      billable: [false],
      allowweekendWork: [false],
      color: ['#000000', Validators.required],
      resourcePhase: [null, Validators.required],
      resourceAuthority: [{ value: null, disabled: true }]
    }, { validators: [this.DateValidator()] },);
  }

  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = res?.data ?? [];
        this.departmentIds = this.projectsDataDrown[0]?.departments?.map((d: any) => d.departmentId) || [];
        this.addResourceForm.patchValue({
          projectName: this.projectsDataDrown[0]?.projectId,
          projectType: this.projectsDataDrown[0]?.projectType,
          overtimeEligible: this.projectsDataDrown[0]?.isOvertimeEligibile,
          billable: this.projectsDataDrown[0]?.isBillable,
          allowweekendWork: this.projectsDataDrown[0]?.isWeekendWorkAllowed
        })
        this.getJobrole();
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsDataDrown = [];
      },
    });
  }

  getclientProjects(clientId: any) {
    this.http.getData(`Project?clientId=${clientId}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = res?.data ?? []; // Extract "data" array
        this.projectStartDate = this.projectsDataDrown[0]?.startDate;
        this.projectEndDate = this.projectsDataDrown[0]?.endDate;
        this.addResourceForm.get('startDate')?.updateValueAndValidity();
        this.addResourceForm.get('startDate')?.updateValueAndValidity();
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsDataDrown = [];
      },
    });
  }

  selectproject(projectId: any) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const project = res?.data[0];
        if (project) {
          this.departmentIds = project?.departments?.map((d: any) => d.departmentId) || [];
          this.projectId = project.projectId;
          this.addResourceForm.patchValue({
            projectType: project.projectType,
            overtimeEligible: project.isOvertimeEligibile,
            billable: project.isBillable,
            allowweekendWork: project.isWeekendWorkAllowed
          });

          // Reset dependent dropdowns
          this.phaseDropdown = [];
          this.resoucesDropDownData = [];
          this.addResourceForm.patchValue({
            resourcePhase: null,
            resourceAuthority: null
          });

          this.addResourceForm.get('resourcePhase')?.reset();
          this.addResourceForm.get('resourceAuthority')?.reset();
          this.addResourceForm.get('resourceAuthority')?.disable();

          this.getJobrole();
          this.getPhaseData();

        }
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
      },
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



  getResourceData(projectId: number, phaseId: number) {

    const params = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId,
      phaseId: phaseId
    };
    this.subscription = this.http
      .getDataIncludeParams('ProjectResource', params)
      .subscribe({
        next: (data: any) => {
          if (data?.data?.length > 0) {
            this.resourcesData = data.data;
            this.resoucesDropDownData = this.resourcesData
              .filter((r) => r.employee)
              .map((r) => ({
                label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
                value: r.employee.id,
              }));

            if (this.resoucesDropDownData?.length > 0) {
              this.addResourceForm.get('resourceAuthority')?.enable();
              this.addResourceForm
                .get('resourceAuthority')
                ?.setValidators([Validators.required]);
            }
          } else {
            this.resoucesDropDownData = [];
            this.addResourceForm.get('resourceAuthority')?.disable();
          }
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }

  onClickEmployee(event: any) {
    this.selectedEmployee = event.value;
    this.addResourceForm.patchValue({
      resourceEmail: this.selectedEmployee.workEmail,
      resourcePhone: this.selectedEmployee
        ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-'
        : '-',

    });
    this.getJobdetails(this.selectedEmployee.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee}`).subscribe({
      next: (data: any) => {
        const jobRole = Array.isArray(data) ? data[0]?.jobRole : data?.jobRole;
        this.addResourceForm.patchValue({
          designation: jobRole,
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  addResources() {
    if (this.addResourceForm.invalid) {
      this.addResourceForm.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true;
    const formValue = this.addResourceForm.value;
    // Convert startDate to a Date object for comparison
    const startDate = new Date(formValue.startDate);
    const today = new Date();
    // Determine status based on start date
    const status = startDate > today ? 'Assigned' : 'Active';
    const payload = {
      entityType: "project",
      entityRefId: this.projectId,
      employeeId: this.selectedEmployee.employeeId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      projectRoleId: formValue.resourceRole.value.roleId,
      projectDepartmentId: formValue.resourceRole.value.entityReferenceId,
      allocatedHours: formValue.resourceAllocationhrs,
      allocatedFrequencyType: formValue.allocatedFrequencyType?.value || null,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: status,
      // role: formValue.resourceRole,
      allocatedBy: this.empinfo.employeeId,
      phaseId: this.selectedPhaseId,
      pendingApprovalAuthority: this.addResourceForm.get('resourceAuthority')?.value || this.resourceAuthorityid,
      meta: {
        graphData: {
          color: formValue.color || '#000000'
        }
      }
    };
    console.log(payload);

    this.http.postdata(`ProjectResource`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.addResourceForm.reset();
        this.resourceAuthorityid = null
        this.http.setnewresourceDetails();
        this.http.setnewcountfornewresourcecount();
        this.spinnerLoader = false;
        this.conformationPopup.openSuccessModal('Resource added successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update project');
      }
    });
  }

  StartndendDateValidation() {
    const StartDate = this.addResourceForm.get('startDate')?.value;
    const EndDate = this.addResourceForm.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateResourceStartDate = (control: AbstractControl): ValidationErrors | null => {
    if (!this.projectStartDate || !control.value) {
      return null; // nothing to validate yet
    }
    const resourceDate = new Date(control.value);
    const projectStart = new Date(this.projectStartDate);
    return resourceDate < projectStart ? { beforeProjectStart: true } : null;
  };

  validateResourceEndDate = (control: AbstractControl): ValidationErrors | null => {
    if (!this.projectEndDate || !control.value) {
      return null;
    }
    const resourceDate = new Date(control.value);
    const projectEnd = new Date(this.projectEndDate);
    return resourceDate > projectEnd ? { afterProjectEnd: true } : null;
  };

  oncheckdates(value: any) {
    if (value) {
      this.startDatevalidate = value; // block earlier dates
      // reset end date limit
    }
  }

  DateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      if (startDate && endDate) {
        if (moment(endDate).isBefore(moment(startDate))) {
          return { endBeforeStart: true };
        }
      }
      return null;
    };
  }

  get minEffectiveDate(): string | null {
    const startDate = this.addResourceForm.get('startDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + 1); // +1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  allocationHoursValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const hours = control.value;
      const frequencyControl = control.parent.get('allocatedFrequencyType');
      const frequency = frequencyControl?.value?.value || frequencyControl?.value; // support object or string
      if (hours != null && frequency) {
        if (frequency === 'Per week' && hours > 168) return { maxHoursWeek: true };
        if (frequency === 'Per month' && hours > 744) return { maxHoursMonth: true };
        if (frequency === 'Per project' && hours > 99999) return { maxHoursProject: true };
      }
      return null;
    };
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    this.addResourceForm.reset();
  }

  getPhaseData() {
    const params = {
      projectId: this.projectId,
      status: 'yet to start,in progress,extended'
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = data?.data || [];
        this.phaseDropdown = this.phaseData?.map(p => ({
          label: p?.phaseName,
          value: p?.phaseId,
          projectId: p?.project?.projectId,
          clientId: p?.project?.clientId,
          startDate: p?.startDate,
          endDate: p?.endDate,
          pendingApprovalAuthority: p?.pendingApprovalAuthority?.id
        }));
        this.spinnerLoader = false;
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}