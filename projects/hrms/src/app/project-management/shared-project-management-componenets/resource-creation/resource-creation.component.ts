import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbOffcanvas, NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TooltipModule } from 'primeng/tooltip';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Project } from '../../../Interfaces/projects.model';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { CircularDeleteComponent } from '../../../icons/circular-delete/circular-delete.component';
import { Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProfileIconComponent } from '../../../icons/profile-icon/profile-icon.component';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-resource-creation',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, FormsModule, NgbPopover, SelectModule,
    MultiSelectModule, AvatarModule, AvatarGroupModule, TooltipModule, CircularDeleteComponent, ProfileIconComponent,
    NgbPopoverModule, NoDataFoundComponent],
  templateUrl: './resource-creation.component.html',
  styleUrl: './resource-creation.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class ResourceCreationComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  addResourceForm!: FormGroup;
  spinnerLoader = false;
  subscription!: Subscription;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  projectname: any;
  projectColor: any;
  employeeFullname!: string;
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' },
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
  resourceAuthorityid: any;
  phaseDropdown: any[] = [];
  selectedPhaseId: any;
  resourcesData = [] as IResource[];
  resoucesDropDownData = [] as any[];
  selectedAuthorityId: any;
  selectedRow: number | null = null;
  isAddAttempted = false;
  startndEndDateValidation: boolean = true;
  clientID: any;
  isClientFlow = false;
  clientColor: any;
  clientName: any;
  clientsdata = {} as any;
  tempSelectedEmployees: any[] = [];
  selectedEmployees: any[] = [];
  lastRowPreviousSelection: any[] = [];
  isEditMode: boolean = false;
  editingEmployeeId: number | null = null;
  highlightedEmployeeId: number | null = null;
  savedPayloadRows: any[] = [];
  maxVisibleAvatars = 15;
  offcanvasSearchQuery: string = '';
  currentEmployeePopover?: NgbPopover;
  private popoverCloseTimer?: ReturnType<typeof setTimeout>;

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateMaxVisibleAvatars();
  }

  private updateMaxVisibleAvatars(): void {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;

    if (width >= 1800) {
      this.maxVisibleAvatars = 30;
    } else if (width >= 1600) {
      this.maxVisibleAvatars = 25;
    }
    else if (width >= 1400) {
      this.maxVisibleAvatars = 20;
    } else if (width >= 1200) {
      this.maxVisibleAvatars = 18;
    } else if (width >= 992) {
      this.maxVisibleAvatars = 15;
    } else if (width >= 768) {
      this.maxVisibleAvatars = 10;
    } else {
      this.maxVisibleAvatars = 5;
    }
  }

  trackByIndex(index: number, item: any): any {
    return item.get('id')?.value; // ✅ stable identity
  }

  openEmployeePopover(popover: NgbPopover): void {
    this.cancelEmployeePopoverClose();
    if (this.currentEmployeePopover && this.currentEmployeePopover !== popover) {
      this.currentEmployeePopover.close();
    }
    this.currentEmployeePopover = popover;
    popover.open();
  }

  closeEmployeePopoverWithDelay(popover?: NgbPopover): void {
    this.cancelEmployeePopoverClose();
    const targetPopover = popover || this.currentEmployeePopover;
    if (!targetPopover) {
      return;
    }
    this.popoverCloseTimer = setTimeout(() => {
      if (this.currentEmployeePopover === targetPopover) {
        targetPopover.close();
        this.currentEmployeePopover = undefined;
      }
    }, 180);
  }

  onPopoverMouseEnter(): void {
    this.cancelEmployeePopoverClose();
  }

  onPopoverMouseLeave(): void {
    this.closeEmployeePopoverWithDelay(this.currentEmployeePopover);
  }

  cancelEmployeePopoverClose(): void {
    if (this.popoverCloseTimer) {
      clearTimeout(this.popoverCloseTimer);
      this.popoverCloseTimer = undefined;
    }
  }
  avatarClickTimestamp: number = 0;
  requiredArrayValidator = (control: any) => {
    // Skip validation when editing an existing avatar (resourceName is disabled/locked)
    if (this.editingEmployeeId !== null) return null;
    return control.value && control.value.length > 0 ? null : { required: true };
  };
  @ViewChild('releaseSummary') releaseSummaryModal!: any;

  responseSummary = {
    totalRecordCount: 0,
    successRecordsCount: 0,
    failureRecordsCount: 0,
  };
  @Output() employeesChanged = new EventEmitter<any[]>();

  get filteredOffcanvasEmployees(): any[] {
    const q = this.offcanvasSearchQuery.trim().toLowerCase();
    return q ? this.selectedEmployees.filter(e => e.fullName?.toLowerCase().includes(q)) : this.selectedEmployees;
  }

  openAvatarOffcanvas(content: any): void {
    this.offcanvasSearchQuery = '';
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  onOffcanvasAvatarClick(emp: any, offcanvas: any): void {
    offcanvas.close();
    const idx = this.selectedEmployees.findIndex((e: any) => e.employeeId === emp.employeeId);
    // Move clicked employee to index 0 so it appears first in the card
    if (idx > 0) {
      this.selectedEmployees.splice(idx, 1);
      this.selectedEmployees.unshift(emp);
    }
    this.highlightedEmployeeId = emp.employeeId;
    this.onAvatarClick(emp);
  }

  deleteOffcanvasEmployee(emp: any): void {
    const index = this.selectedEmployees.findIndex(
      (e) => e.employeeId === emp.employeeId
    );
    if (index > -1) {
      // ✅ Remove from selectedEmployees
      this.selectedEmployees.splice(index, 1);

      // ✅ Remove all savedPayloadRows for this employee
      this.savedPayloadRows = this.savedPayloadRows.filter(
        (row) => row.employeeId !== emp.employeeId
      );

      // ✅ If we were editing this employee, exit edit mode
      if (this.editingEmployeeId === emp.employeeId) {
        this.editingEmployeeId = null;
        this.highlightedEmployeeId = null;

        // Reset form
        this.resources.clear();
        this.resources.push(this.createResourceRow());
      }

      this.employeesChanged.emit(this.selectedEmployees);
    }
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public formValidation: FormValidationService,
    private http: HttpService,
    private route: ActivatedRoute,
    private conformationPopup: OpenModalService,
    private offcanvasService: NgbOffcanvas,
  ) { }

  ngOnInit() {
    this.updateMaxVisibleAvatars();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const fullPath = this.router.url;
    this.isClientFlow = fullPath.includes('/project-management/clients');
    this.getAllActiveEmployees();
    this.createResourceForm();
    this.getdatabaedonRoute();
    this.DepartmentList();
    this.addResourceForm
      .get('allocatedFrequencyType')
      ?.valueChanges.subscribe(() => {
        this.addResourceForm
          .get('resourceAllocationhrs')
          ?.updateValueAndValidity();
      });
  }

  onResourceChange(event: any) {
    this.tempSelectedEmployees = event.value || [];
  }

  onRowSave(index: number) {
    const row = this.resources.at(index) as FormGroup;
    if (row.invalid) {
      row.markAllAsTouched();
      return;
    }

    const selectedResources: any[] = row.get('resourceName')?.value || [];
    const rowData = row.getRawValue();

    const newAssignment = JSON.parse(JSON.stringify({
      phase: rowData.resourcePhase ?? null,
      role: rowData.resourceRole ?? null,
      startDate: rowData.startDate,
      endDate: rowData.endDate,
      hours: rowData.resourceAllocationhrs,
      billable: rowData.billable ?? false,
      overtimeEligible: rowData.overtimeEligible ?? false,
      allowweekendWork: rowData.allowweekendWork ?? false,
      authority: rowData.resourceAuthority ?? null,
      projectName: rowData.projectName ?? null,
      color: rowData.color || '#000000',
      resourceAuthority: rowData.resourceAuthority
        ? (typeof rowData.resourceAuthority === 'object'
          ? rowData.resourceAuthority.value
          : rowData.resourceAuthority)
        : null,
    }));

    // ================= EDIT MODE =================
    if (this.editingEmployeeId !== null) {

      const existingEmp = this.selectedEmployees.find(
        (e) => e.employeeId === this.editingEmployeeId
      );

      if (existingEmp) {
        if (existingEmp.assignments[index] !== undefined) {
          existingEmp.assignments[index] = newAssignment;
        } else {
          existingEmp.assignments.push(newAssignment);
        }
        existingEmp.count = existingEmp.assignments.length;
      }

      // ✅ FIX: Update payload using INDEX (not phaseId)
      const updatedPayloadRow = this.buildPayloadRow(newAssignment, this.editingEmployeeId);

      const employeeRows = this.savedPayloadRows
        .map((r, i) => ({ r, i }))
        .filter(x => x.r.employeeId === this.editingEmployeeId);

      const payloadIndex = employeeRows[index]?.i;

      if (payloadIndex !== undefined) {
        this.savedPayloadRows[payloadIndex] = updatedPayloadRow;
      } else {
        this.savedPayloadRows.push(updatedPayloadRow);
      }

      // Mark row as saved
      row.patchValue({ saved: true });

      // ✅ Check all rows saved
      const allSaved = this.resources.controls.every(
        (r) => r.get('saved')?.value === true
      );

      if (allSaved) {

        this.highlightedEmployeeId = this.editingEmployeeId;
        this.editingEmployeeId = null;

        // Reset all rows
        this.resources.controls.forEach((r: any) => {
          r.reset({
            projectName: null,
            projectType: null,
            resourceName: [],
            resourceRole: null,
            startDate: null,
            endDate: null,
            resourceAllocationhrs: null,
            resourcePhase: null,
            resourceAuthority: null,
            phaseDropdown: [],
            color: '#000000',
            dateError: false,
            saved: false,
          });
          r.get('resourceName')?.enable();
        });

        // Keep only 1 row
        while (this.resources.length > 1) {
          this.resources.removeAt(this.resources.length - 1);
        }

        const row0 = this.resources.at(0) as FormGroup;

        if (!this.isClientFlow) {
          const project = this.projectsDataDrown?.[0];
          if (project) {
            row0.patchValue({
              billable: project.isBillable ?? false,
              overtimeEligible: project.isOvertimeEligibile ?? false,
              allowweekendWork: project.isWeekendWorkAllowed ?? false,
            });

            project.isBillable
              ? row0.get('billable')?.enable()
              : row0.get('billable')?.disable();

            project.isOvertimeEligibile
              ? row0.get('overtimeEligible')?.enable()
              : row0.get('overtimeEligible')?.disable();

            project.isWeekendWorkAllowed
              ? row0.get('allowweekendWork')?.enable()
              : row0.get('allowweekendWork')?.disable();
          }
        } else {
          row0.patchValue({
            billable: false,
            overtimeEligible: false,
            allowweekendWork: false
          });
        }
      }

      this.employeesChanged.emit(this.selectedEmployees);
      return;
    }

    // ================= ADD MODE =================
    this.highlightedEmployeeId = null;

    selectedResources.forEach((emp: any) => {

      const empId = emp.employeeId;

      const existingEmp = this.selectedEmployees.find(
        (e) => e.employeeId === empId
      );

      if (!existingEmp) {
        this.selectedEmployees.push({
          employeeId: empId,
          fullName: emp.fullName,
          profileUrl: emp.profileUrl || null,
          assignments: [newAssignment],
          count: 1,
        });
      } else {
        existingEmp.assignments.push(JSON.parse(JSON.stringify(newAssignment)));
        existingEmp.count = existingEmp.assignments.length;
      }

      this.savedPayloadRows.push(
        this.buildPayloadRow(newAssignment, empId)
      );
    });

    // Reset row
    row.reset({
      projectName: null,
      projectType: null,
      resourceName: [],
      resourceRole: null,
      startDate: null,
      endDate: null,
      resourceAllocationhrs: null,
      resourcePhase: null,
      resourceAuthority: null,
      phaseDropdown: [],
      color: '#000000',
      dateError: false,
      saved: false,
    });

    if (!this.isClientFlow) {
      const project = this.projectsDataDrown?.[0];
      if (project) {
        row.patchValue({
          billable: project.isBillable ?? false,
          overtimeEligible: project.isOvertimeEligibile ?? false,
          allowweekendWork: project.isWeekendWorkAllowed ?? false,
        });

        project.isBillable
          ? row.get('billable')?.enable()
          : row.get('billable')?.disable();

        project.isOvertimeEligibile
          ? row.get('overtimeEligible')?.enable()
          : row.get('overtimeEligible')?.disable();

        project.isWeekendWorkAllowed
          ? row.get('allowweekendWork')?.enable()
          : row.get('allowweekendWork')?.disable();
      }
    } else {
      row.patchValue({
        billable: false,
        overtimeEligible: false,
        allowweekendWork: false
      });
    }

    row.get('resourceName')?.enable();

    this.employeesChanged.emit(this.selectedEmployees);
  }

  private buildPayloadRow(assignment: any, employeeId: number): any {
    const startDate = new Date(assignment.startDate);
    const today = new Date();
    return {
      entityType: 'project',
      entityRefId: this.isClientFlow
        ? (assignment.projectName?.projectId ?? assignment.projectName)
        : this.projectId,
      employeeId,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      projectRoleId: assignment.role?.value?.roleId ?? assignment.role?.roleId ?? null,
      projectDepartmentId:
        assignment.role?.value?.entityReferenceId ??
        assignment.role?.entityReferenceId ??
        null,
      allocatedHours: assignment.hours,
      overtimeEligibile: assignment.overtimeEligible,
      billable: assignment.billable,
      weekendWorkAllowed: assignment.allowweekendWork,
      status: startDate > today ? 'Assigned' : 'Active',
      allocatedBy: this.empinfo.employeeId,
      phaseId:
        typeof assignment.phase === 'object'
          ? (assignment.phase?.value ?? null)
          : (assignment.phase ?? null),
      pendingApprovalAuthority:
        assignment.authority?.value ??
        (typeof assignment.authority === 'number' ? assignment.authority : null) ??
        this.resourceAuthorityid ??
        null,
      meta: { graphData: { color: assignment.color || '#000000' } },
    };
  }

  onAvatarClick(emp: any) {
    if (!emp.assignments?.length) return;

    this.editingEmployeeId = emp.employeeId;
    this.highlightedEmployeeId = emp.employeeId;
    this.avatarClickTimestamp = Date.now();

    const matchedEmployee = this.employeeDetails.find(
      (e) => e.employeeId === emp.employeeId,
    );

    const assignments: any[] = JSON.parse(JSON.stringify(emp.assignments));

    // Ensure FormArray has exactly the right number of rows — no clear()
    while (this.resources.length < assignments.length) {
      const r = this.createResourceRow();
      r.get('resourceName')?.disable();
      this.resources.push(r);
    }
    while (this.resources.length > assignments.length) {
      this.resources.removeAt(this.resources.length - 1);
    }

    if (this.isClientFlow) {
      assignments.forEach((assignment: any, idx: number) => {
        const targetRow = this.resources.at(idx) as FormGroup;
        targetRow.get('resourceName')?.disable();
        const projectId = assignment.projectName?.projectId ?? assignment.projectName;
        if (!projectId) return;
        this.http.getData(`Project?projectId=${projectId}`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: any) => {
              const project = res?.data?.[0];
              if (!project) return;
              const params = { projectId: project.projectId, status: 'yet to start,in progress,extended' };
              this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe((data: any) => {
                const phases = data?.data?.map((p: any) => ({
                  label: p.phaseName, value: p.phaseId,
                  startDate: p.startDate, endDate: p.endDate,
                  pendingApprovalAuthority: p.pendingApprovalAuthority?.id,
                })) || [];
                const phaseId = typeof assignment.phase === 'object' ? assignment.phase?.value : assignment.phase;
                const matchedPhase = phases.find((p: any) => p.value === phaseId) ?? null;
                targetRow.get('resourceName')?.enable();
                targetRow.patchValue({
                  projectName: project, projectType: project.projectType,
                  phaseDropdown: phases,
                  resourceName: matchedEmployee ? [matchedEmployee] : [],
                  resourcePhase: matchedPhase,
                  resourceRole: assignment.role,
                  resourceAuthority: assignment.authority,
                  startDate: assignment.startDate, endDate: assignment.endDate,
                  resourceAllocationhrs: assignment.hours,
                  billable: assignment.billable,
                  overtimeEligible: assignment.overtimeEligible,
                  allowweekendWork: assignment.allowweekendWork,
                  saved: false,
                });
                targetRow.get('resourceName')?.disable();
              });
            },
          });
      });
    } else {
      // Project flow: patch all non-dropdown fields immediately
      assignments.forEach((assignment: any, idx: number) => {
        const targetRow = this.resources.at(idx) as FormGroup;
        const phaseId = typeof assignment.phase === 'object' ? assignment.phase?.value : assignment.phase;
        const matchedPhase = this.phaseDropdown.find((p: any) => p.value === phaseId) ?? null;
        const storedRoleId = assignment.role?.value?.roleId ?? assignment.role?.roleId;
        const matchedRole = this.projectRoleDropdown.find((r: any) => r.value?.roleId === storedRoleId) ?? null;

        targetRow.get('resourceName')?.enable();
        targetRow.patchValue({
          resourceName: matchedEmployee ? [matchedEmployee] : [],
          resourcePhase: matchedPhase,
          resourceRole: matchedRole,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          resourceAuthority: assignment.authority,
          resourceAllocationhrs: assignment.hours,
          billable: assignment.billable,
          overtimeEligible: assignment.overtimeEligible,
          allowweekendWork: assignment.allowweekendWork,
          saved: false,
        });
        targetRow.get('resourceName')?.disable();
      });
    }
  }

    closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  onCancel(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // ✅ Exit edit mode safely
    this.isEditMode = false;

    // ✅ Navigate back to resources list
    if (this.router.url.includes('/project-management/clients')) {
      this.router.navigate(['/project-management/clients/details/resources'], {
        queryParams: { id: this.clientID },
      });
    } else {
      this.router.navigate(['/project-management/projects/details/resources'], {
        queryParams: { id: this.projectId },
      });
    }
  }
  isRowValid(index: number): boolean {
    const row = this.resources.at(index) as FormGroup;
    return row.valid;
  }

  DepartmentList() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
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
            const newDropdown = response.data.map((item: any) => ({
              label: `${item.roleName}`,
              value: {
                roleId: item.id,
                entityReferenceId: item.entity?.entityReferenceId || 0,
              },
            }));
            // Only replace if not in edit mode to avoid PrimeNG re-render wiping selections
            if (this.editingEmployeeId === null) {
              this.projectRoleDropdown = newDropdown;
            } else {
              // In edit mode: update array in-place to preserve PrimeNG references
              this.projectRoleDropdown.length = 0;
              newDropdown.forEach((item: any) => this.projectRoleDropdown.push(item));
            }
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

  onPhaseChange(selectedValue: any, index: number) {
    const row = this.resources.at(index);

    row.get('startDate')?.setValue(null);
    row.get('endDate')?.setValue(null);

    if (selectedValue?.value) {
      const phase = selectedValue?.value;
      this.resourceAuthorityid = phase?.pendingApprovalAuthority ?? null;
      this.selectedPhaseId = phase.value ?? null;
      this.projectStartDate = phase.startDate ?? null;
      this.projectEndDate = phase.endDate ?? null;

      // Update row-level authority control
      const resourceAuthorityControl = row.get('resourceAuthority');
      if (resourceAuthorityControl) {
        resourceAuthorityControl.patchValue(null);
        resourceAuthorityControl.enable();
      }

      // Get projectId: client flow reads from row's projectName, project flow uses this.projectId
      const projectId = this.isClientFlow
        ? (row.get('projectName')?.value?.projectId ?? null)
        : this.projectId;

      const phaseId = phase.value;

      if (projectId && phaseId) {
        this.getResourceData(projectId, phaseId);
      }
    }
  }

  onAuthorityChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedAuthorityId = selectedValue?.value;
    }
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.route.queryParams.subscribe((params) => {
        const projectId = params['id'];
        if (projectId) {
          this.getProjects(projectId);
          this.projectId = parseInt(projectId);
          this.getPhaseData();
        }
      });
      //   } else if (fullPath.startsWith('/project-management/clients')) {
      //     this.projectId = null;
      //     this.route.queryParams.subscribe((params) => {
      //       const clientID = params['id'];
      //       if (clientID) {
      //         this.addResourceForm.get('projectName')?.enable();
      //         this.getclientProjects(clientID);
      //       }
      //     });
      //   }
      // }
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.route.queryParams.subscribe((params) => {
        const clientID = params['id'];
        if (clientID) {
          this.clientID = parseInt(clientID);
          this.addResourceForm.get('projectName')?.enable();
          this.getClientsData(clientID);
          this.getclientProjects(clientID);
          // 🔥 ADD THIS
          setTimeout(() => {
            if (this.projectsDataDrown?.length > 0) {
              this.projectId = this.projectsDataDrown[0].projectId;
              this.getPhaseData(); // ✅ now phases will come
            }
          }, 300); // small delay for API load
        }
      });
    }
  }

  //resource form
  createResourceForm() {
    this.addResourceForm = this.fb.group({
      projectName: [
        { value: null, disabled: false },
        this.isClientFlow ? Validators.required : null, // ✅ FIX
      ],
      projectType: [null],
      billable: [false],
      overtimeEligible: [false],
      allowweekendWork: [false],
      resources: this.fb.array([this.createResourceRow()]),
    });
  }

  //   this.addResourceForm = this.fb.group({
  //     resourceName: [null, Validators.required],
  //     resourceEmail: [null, [Validators.required, Validators.email]],
  //     resourceRole: [null, [Validators.required, Validators.maxLength(50),
  //     Validators.minLength(2),
  //     ]],
  //     resourcePhone: [null],
  //     designation: [null, Validators.required],
  //     projectName: [{ value: null, disabled: true }, Validators.required],
  //     projectType: [null, Validators.required],
  //     startDate: [null, Validators.required],
  //     endDate: [null, Validators.required],
  //     resourceAllocationhrs: [null, Validators.required],
  //     // allocatedFrequencyType: [null, Validators.required],
  //     overtimeEligible: [false],
  //     billable: [false],
  //     allowweekendWork: [false],
  //     color: ['#000000', Validators.required],
  //     resourcePhase: [null, Validators.required],
  //     resourceAuthority: [{ value: null, disabled: true }]
  //   }, { validators: [this.DateValidator()] },);
  // }

  get resources(): FormArray {
    return this.addResourceForm.get('resources') as FormArray;
  }

  createResourceRow(): FormGroup {
    const row = this.fb.group({
      id: [Date.now() + Math.random()], // ✅ UNIQUE ID
      projectName: [
        null,
        this.isClientFlow ? Validators.required : null, // ✅ FIX
      ], // already handled
      projectType: [null],
      resourceName: [[], this.requiredArrayValidator],
      resourceRole: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      resourceAllocationhrs: [null, Validators.required],
      resourcePhase: [null, Validators.required],
      resourceAuthority: [null],
      billable: [false],
      overtimeEligible: [false],
      allowweekendWork: [false],
      phaseDropdown: [[]],
      color: ['#000000'],
      dateError: [false],

      saved: [false],
    });

    // row.get('startDate')?.valueChanges.subscribe(() => {
    //   this.StartndendDateValidation(row);
    // });

    // row.get('endDate')?.valueChanges.subscribe(() => {
    //   this.StartndendDateValidation(row);
    // });

    return row;
  }

  // resetfrom() {
  //    this.resources.clear();
  //       this.resources.push(this.createResourceRow());
  // }

  addResourceRow() {
    this.isAddAttempted = true;

    const lastRow = this.resources.at(this.resources.length - 1) as FormGroup;

    if (this.isClientFlow) {
      if (lastRow.invalid) {
        lastRow.markAllAsTouched();
        return;
      }
    } else {
      const projectControl = this.addResourceForm.get('projectName');

      if (!projectControl?.value) {
        projectControl?.markAsTouched();
        return;
      }

      if (lastRow.invalid) {
        lastRow.markAllAsTouched();
        return;
      }
    }

    const selected = this.tempSelectedEmployees;

    // Replace current row's employees — remove unchecked, add newly checked
    const newEmployees = selected.map((emp: any) => ({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      profileUrl: emp.profileUrl || null,
    }));

    // Get employees from previous rows (not current row)
    const previousRowsEmployees = this.selectedEmployees.filter(
      (e: any) =>
        !this.tempSelectedEmployees.some(
          (t: any) => t.employeeId === e.employeeId,
        ) &&
        !this.lastRowPreviousSelection?.some(
          (p: any) => p.employeeId === e.employeeId,
        ),
    );

    this.selectedEmployees = [...previousRowsEmployees, ...newEmployees];
    this.lastRowPreviousSelection = newEmployees;
    this.employeesChanged.emit(this.selectedEmployees);
    const newRow = this.createResourceRow();

    if (!this.isClientFlow) {
      const project = this.projectsDataDrown?.[0];

      if (project) {
        newRow.patchValue({
          projectType: project.projectType,
          overtimeEligible: project.isOvertimeEligibile,
          billable: project.isBillable,
          allowweekendWork: project.isWeekendWorkAllowed,
        });
      }
    }

    this.isAddAttempted = false;
  }
  addNewResourceRow() {
    this.editingEmployeeId = null;
    this.highlightedEmployeeId = null;
    const newRow = this.createResourceRow();
    if (!this.isClientFlow) {
      const project = this.projectsDataDrown?.[0];
      if (project) {
        newRow.patchValue({
          projectType: project.projectType,
          overtimeEligible: project.isOvertimeEligibile,
          billable: project.isBillable,
          allowweekendWork: project.isWeekendWorkAllowed,
        });
      }
    }
    this.resources.push(newRow);
  }


  removeResource(index: number) {

    if (this.editingEmployeeId !== null) {

      const empIndex = this.selectedEmployees.findIndex(
        (e) => e.employeeId === this.editingEmployeeId
      );

      const existingEmp = this.selectedEmployees[empIndex];

      // ✅ Remove from payload
      let matchCount = 0;
      const payloadIdx = this.savedPayloadRows.findIndex((r) => {
        if (r.employeeId !== this.editingEmployeeId) return false;
        if (matchCount === index) return true;
        matchCount++;
        return false;
      });

      if (payloadIdx !== -1) {
        this.savedPayloadRows.splice(payloadIdx, 1);
      }

      // ✅ Remove from assignments
      if (existingEmp) {
        existingEmp.assignments.splice(index, 1);
        existingEmp.count = existingEmp.assignments.length;

        // 🔥 REMOVE EMPLOYEE CARD IF NO ASSIGNMENTS LEFT
        if (existingEmp.assignments.length === 0) {
          this.selectedEmployees.splice(empIndex, 1); // ✅ remove card
          this.editingEmployeeId = null;
        }
      }

      // ✅ Remove from FormArray
      this.resources.removeAt(index);

      // ✅ If no rows left in UI
      if (this.resources.length === 0) {
        this.resources.push(this.createResourceRow());
      }

      this.employeesChanged.emit(this.selectedEmployees);

    } else {
      // ➕ Add mode
      if (this.resources.length > 1) {
        this.resources.removeAt(index);
      }
    }
  }
  getProjects(projectId: string) {
    this.http
      .getData(`Project?projectId=${projectId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsDataDrown = res?.data ?? [];
          this.projectname = this.projectsDataDrown[0]?.projectName;
          this.projectColor = this.projectsDataDrown[0]?.meta?.graphData?.color;

          this.departmentIds =
            this.projectsDataDrown[0]?.departments?.map(
              (d: any) => d.departmentId,
            ) || [];
          // this.addResourceForm.patchValue({
          //   projectName: this.projectsDataDrown[0]?.projectId,
          //   projectType: this.projectsDataDrown[0]?.projectType,
          // });

          this.addResourceForm.patchValue({
            projectName: this.projectsDataDrown[0]?.projectId,
            projectType: this.projectsDataDrown[0]?.projectType,
          });
          // Only patch rows when NOT in edit mode to avoid overwriting avatar-patched rows
          if (this.editingEmployeeId === null) {
            this.resources.controls.forEach((row) => {
              row.patchValue({
                overtimeEligible: this.projectsDataDrown[0]?.isOvertimeEligibile,
                billable: this.projectsDataDrown[0]?.isBillable,
                allowweekendWork: this.projectsDataDrown[0]?.isWeekendWorkAllowed,
              });
            });
            this.updateProjectDependentFields(this.projectsDataDrown[0]);
          }
          this.getJobrole();
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.projectsDataDrown = [];
        },
      });
  }

  private updateProjectDependentFields(project: any): void {
    if (this.editingEmployeeId !== null) return; // skip during edit mode
    this.resources.controls.forEach((row) => {
      project.isOvertimeEligibile
        ? row.get('overtimeEligible')?.enable()
        : row.get('overtimeEligible')?.disable();
      project.isBillable
        ? row.get('billable')?.enable()
        : row.get('billable')?.disable();
      project.isWeekendWorkAllowed
        ? row.get('allowweekendWork')?.enable()
        : row.get('allowweekendWork')?.disable();
    });
  }

  getclientProjects(clientId: any) {
    this.http
      .getData(`Project?clientId=${clientId}&status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsDataDrown = res?.data ?? [];

          this.projectStartDate = this.projectsDataDrown[0]?.startDate;
          this.projectEndDate = this.projectsDataDrown[0]?.endDate;

          // ✅ ADD THIS BLOCK
          // if (this.projectsDataDrown.length > 0) {
          //   const firstProject = this.projectsDataDrown[0];
          //   this.selectproject(firstProject.projectId, 0);
          // }
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.projectsDataDrown = [];
        },
      });
  }

  selectproject(projectId: any, index: number) {
    this.http
      .getData(`Project?projectId=${projectId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const project = res?.data[0];

          if (project) {
            const row = this.resources.at(index);

            // ✅ set toggles
            row.patchValue({
              projectType: project.projectType,
              overtimeEligible: project.isOvertimeEligibile,
              billable: project.isBillable,
              allowweekendWork: project.isWeekendWorkAllowed,
            });

            // ✅ ENABLE/DISABLE
            project.isOvertimeEligibile
              ? row.get('overtimeEligible')?.enable()
              : row.get('overtimeEligible')?.disable();

            project.isBillable
              ? row.get('billable')?.enable()
              : row.get('billable')?.disable();

            project.isWeekendWorkAllowed
              ? row.get('allowweekendWork')?.enable()
              : row.get('allowweekendWork')?.disable();

            // ✅ FETCH PHASES ONLY FOR THIS ROW
            const params = {
              projectId: project.projectId,
              status: 'yet to start,in progress,extended',
            };

            this.http
              .getDataIncludeParams('ProjectPhases/list', params)
              .subscribe((data: any) => {
                const phases =
                  data?.data?.map((p: any) => ({
                    label: p.phaseName,
                    value: p.phaseId,
                    startDate: p.startDate,
                    endDate: p.endDate,
                    pendingApprovalAuthority: p.pendingApprovalAuthority?.id,
                  })) || [];

                // ✅ ONLY THIS ROW
                row.get('phaseDropdown')?.setValue(phases);
              });

            this.getJobrole();
          }
        },
      });
  }
  onProjectChange(project: any, index: number) {
    const row = this.resources.at(index);

    // 🔥 CLEAR EVERYTHING RELATED TO PROJECT
    row.get('resourcePhase')?.setValue(null);
    row.get('startDate')?.setValue(null);
    row.get('endDate')?.setValue(null);
    row.get('resourceAuthority')?.setValue(null);

    this.selectproject(project.projectId, index);
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
    const statuses: string = 'Active,Trainee Active,Active Contract';
    this.subscription = this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe({
        next: (data: any) => {
          this.employeeDetails = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + '' : ''} ${employee.lastName}`,
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
      phaseId: phaseId,
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
                label: `${r.employee.fusionEmployeeId ? r.employee.fusionEmployeeId + ' - ' : ''}  ${r.employee.name}`,
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
        ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''}
      ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-'
        : '-',
    });
    this.getJobdetails(this.selectedEmployee.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee}`)
      .subscribe({
        next: (data: any) => {
          const jobRole = Array.isArray(data)
            ? data[0]?.jobRole
            : data?.jobRole;
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

  // addResources() {
  //   if (this.addResourceForm.invalid) {
  //     this.addResourceForm.markAllAsTouched();
  //     return;
  //   }
  //   this.spinnerLoader = true;
  //   const formValue = this.addResourceForm.getRawValue();
  //   // Convert startDate to a Date object for comparison
  //   const startDate = new Date(formValue.startDate);
  //   const today = new Date();
  //   // Determine status based on start date
  //   const status = startDate > today ? 'Assigned' : 'Active';
  //   const payload = {
  //     entityType: 'project',
  //     entityRefId: this.projectId,
  //     employeeId: this.selectedEmployee.employeeId,
  //     startDate: formValue.startDate,
  //     endDate: formValue.endDate,
  //     projectRoleId: formValue.resourceRole.value.roleId,
  //     projectDepartmentId: formValue.resourceRole.value.entityReferenceId,
  //     allocatedHours: formValue.resourceAllocationhrs,
  //     allocatedFrequencyType: formValue.allocatedFrequencyType?.value || null,
  //     overtimeEligibile: formValue.overtimeEligible,
  //     billable: formValue.billable,
  //     weekendWorkAllowed: formValue.allowweekendWork,
  //     status: status,
  //     // role: formValue.resourceRole,
  //     allocatedBy: this.empinfo.employeeId,
  //     phaseId: this.selectedPhaseId,
  //     pendingApprovalAuthority:
  //       this.addResourceForm.get('resourceAuthority')?.value ||
  //       this.resourceAuthorityid,
  //     meta: {
  //       graphData: {
  //         color: formValue.color || '#000000',
  //       },
  //     },
  //   };
  //   console.log(payload);

  //   this.http.postdata(`ProjectResource`, payload).subscribe({
  //     next: (res) => {
  //       this.modalService.dismissAll();
  //       this.addResourceForm.reset();
  //       this.resourceAuthorityid = null;
  //       this.http.setnewresourceDetails();
  //       this.http.setnewcountfornewresourcecount();
  //       this.spinnerLoader = false;
  //       this.conformationPopup.openSuccessModal('Resource added successfully');
  //     },
  //     error: (err) => {
  //       this.spinnerLoader = false;
  //       this.conformationPopup.openErrorModal(
  //         err?.error?.message || 'Failed to update project',
  //       );
  //     },
  //   });
  // }

  addResources() {
    if (this.savedPayloadRows.length === 0) {
      this.conformationPopup.openErrorModal('Please save at least one resource row before submitting.');
      return;
    }
    this.spinnerLoader = true;
    const totalSelected = this.savedPayloadRows.length;
    const payload = this.savedPayloadRows;
    this.http.postdata(`ProjectResource/multiple`, payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;

        const successCount = res?.data?.length || 0;
        const failureCount = totalSelected - successCount;

        this.responseSummary = {
          totalRecordCount: totalSelected,
          successRecordsCount: successCount,
          failureRecordsCount: failureCount,
        };

        this.modalService.dismissAll();

        const modalRef = this.modalService.open(this.releaseSummaryModal, {
          centered: true,
          size: 'lg',
        });

        setTimeout(() => {
          modalRef.close();
          if (successCount > 0) {
            this.close.emit(); // ✅ MOVE HERE
          }
        }, 3000);
        this.addResourceForm.reset();
        this.resources.clear();
        this.resources.push(this.createResourceRow());
        this.savedPayloadRows = [];
        this.selectedEmployees = [];
        this.maxVisibleAvatars = 10;
        if (this.router.url.includes('project-management/clients')) {
          this.router.navigate(
            ['/project-management/clients/details/resources'],
            {
              queryParams: { id: this.clientID },
            },
          );
        } else if (this.router.url.includes('project-management/projects')) {
          this.router.navigate(
            ['/project-management/projects/details/resources'],
            {
              queryParams: { id: this.projectId },
            },
          );
        }

        this.http.setnewresourceDetails();
        this.http.setnewcountfornewresourcecount();
      },

      error: (err) => {
        this.spinnerLoader = false;

        this.responseSummary = {
          totalRecordCount: totalSelected,
          successRecordsCount: 0,
          failureRecordsCount: totalSelected,
        };

        const modalRef = this.modalService.open(this.releaseSummaryModal, {
          centered: true,
          size: 'lg',
        });

        setTimeout(() => {
          modalRef.close();
          // this.conformationPopup.openErrorModal(
          //   err?.error?.message,
          // );
        }, 3000);
      },
    });
  }

  // StartndendDateValidation() {
  //   const StartDate = this.addResourceForm.get('startDate')?.value;
  //   const EndDate = this.addResourceForm.get('endDate')?.value;
  //   if (StartDate && EndDate) {
  //     const startedDate = new Date(StartDate);
  //     const endedDate = new Date(EndDate);
  //     this.startndEndDateValid = endedDate > startedDate;
  //   } else {
  //     this.startndEndDateValid = true;
  //   }
  // }

  StartndendDateValidation(row: FormGroup) {
    const startDate = row.get('startDate')?.value;
    const endDate = row.get('endDate')?.value;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      this.startndEndDateValid = end > start;
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateResourceStartDate = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!this.projectStartDate || !control.value) {
      return null; // nothing to validate yet
    }
    const resourceDate = new Date(control.value);
    const projectStart = new Date(this.projectStartDate);
    return resourceDate < projectStart ? { beforeProjectStart: true } : null;
  };

  validateResourceEndDate = (
    control: AbstractControl,
  ): ValidationErrors | null => {
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
      const frequency =
        frequencyControl?.value?.value || frequencyControl?.value; // support object or string
      if (hours != null && frequency) {
        if (frequency === 'Per week' && hours > 168)
          return { maxHoursWeek: true };
        if (frequency === 'Per month' && hours > 744)
          return { maxHoursMonth: true };
        if (frequency === 'Per project' && hours > 99999)
          return { maxHoursProject: true };
      }
      return null;
    };
  }



  closeModal() {
    this.modalService.dismissAll();
    this.addResourceForm.reset();
  }

  getPhaseData() {
    const params = {
      projectId: this.projectId,
      status: 'yet to start,in progress,extended',
    };
    this.subscription = this.http
      .getDataIncludeParams('ProjectPhases/list', params)
      .subscribe({
        next: (data: any) => {
          this.phaseData = data?.data || [];
          this.phaseDropdown = this.phaseData?.map((p) => ({
            label: p?.phaseName,
            value: p?.phaseId,
            projectId: p?.project?.projectId,
            clientId: p?.project?.clientId,
            startDate: p?.startDate,
            endDate: p?.endDate,
            pendingApprovalAuthority: p?.pendingApprovalAuthority?.id,
          }));
          this.spinnerLoader = false;
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
        },
      });
  }



  getImageUrl(imagePath: string): string | null {
    if (!imagePath) return '';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.startsWith('Profilepics/')) {
      return environment.viewUrl + imagePath;
    }

    return (
      environment.ApiUrl +
      'EmployeeData/DownloadProfilePic?filename=' +
      imagePath
    );
  }

  getClientsData(clientID: any): void {
    this.http
      .getData(`Client/${clientID}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.clientsdata = res?.data || {};
          this.clientName = this.clientsdata.clientName;
          this.clientColor = this.clientsdata?.meta?.graphData?.color;
        },
        error: (err) => {
          this.clientsdata = {};
          console.error('Error fetching clients:', err);
        },
      });
  }

  isShowClientRoute(): boolean {
    const showPaths = ['/project-management/clients'];
    return showPaths.some((path) => this.router.url.startsWith(path));
  }
  isShowProjectRoute(): boolean {
    const showPaths = ['/project-management/projects'];
    return showPaths.some((path) => this.router.url.startsWith(path));
  }

  navigationtoclients() {
    this.router.navigate(['/project-management/clients/details/resources'], {
      queryParams: { id: this.clientID },
    });
  }

  navigationtoproject() {
    this.router.navigate(['/project-management/projects/details/resources'], {
      queryParams: { id: this.projectId },
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