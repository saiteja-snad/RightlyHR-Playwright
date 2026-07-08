import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormsModule } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, Subject, Subscription, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { FormValidationsService } from '../../../services/form-validations.service';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ProjectResourceTabComponent } from '../../../shared/project-management-tabs/project-resource-tab/project-resource-tab.component';
import { environment } from '../../../../environments/environment';
import { ProfileIconComponent } from '../../../icons/profile-icon/profile-icon.component';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-project-waiting-for-approval-resources',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule, FormsModule, DateformatPipe,
    Select, DataLoaderContentComponent, NoDataFoundComponent, InfoIconComponent, NgbPopover, ProjectResourceTabComponent,
    ProfileIconComponent, PaginatorModule],
  templateUrl: './project-waiting-for-approval-resources.component.html',
  styleUrl: './project-waiting-for-approval-resources.component.scss'
})
export class ProjectWaitingForApprovalResourcesComponent implements OnInit, OnDestroy {
  searchValue: string = '';
  resourcesData = [] as IResource[];
  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];
  selectedAuthorityIds: number[] = [];
  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  loading: boolean = false;
  projectRoleDropdown: any[] = [];
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  projectId: any;
  ResourceId: any;
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  startndEndDateValid: any;
  startDatevalidate: any;
  inactiveStatus: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  phaseData = [] as IPhases[];
  phaseDropdown: any[] = [];
  selectedPhaseId: any;
  projectStartDate!: string | null;
  projectEndDate!: string | null;
  resoucesDropDownData = [] as any[];
  defaultPendingAuthorityId: any;
  pendingAuthorityIdForUpdate: any = null;
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  selectedResource: any;
  resourceName: any;
  private searchTimeout: any;
  selectedRoleId: number = 0;
  selectedEntityRefId: number = 0;

  @ViewChild('updateResourcemodal') updateResourcemodal!: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public rbac: RbacService,
    private modalService: NgbModal,
    private http: HttpService,
    private route: ActivatedRoute,
    private conformationPopup: OpenModalService,
    public formValidation: FormValidationsService,
  ) { }

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getProjects(this.projectId);
      }
    });
    this.getPhaseData();

    combineLatest([
      this.http.resourceRoleFilter$,
      this.http.resourcePhaseFilter$,
      this.http.resourceAuthorityFilter$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe(([roleIds, phaseIds, authorityIds]) => {
        this.selectedRoleIds = roleIds || [];
        this.selectedPhaseIds = phaseIds || [];
        this.selectedAuthorityIds = authorityIds || [];
        if (this.projectId) {
          this.getResourceData(this.projectId, undefined, false, this.searchValue, this.page, this.pageSize);
        }
      });

    this.http.resourceDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getResourceData(parseInt(this.projectId), undefined, false, this.searchValue);
    });

    this.updateResourceForm.get('startDate')?.valueChanges.subscribe(() => this.StartndendDateValidation());
    this.updateResourceForm.get('endDate')?.valueChanges.subscribe(() => this.StartndendDateValidation());
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.getResourceData(this.projectId, undefined, false, this.searchValue, this.page, this.pageSize);
    }, 300);
  }

  onRoleChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedRoleId = selectedValue.roleId;
      this.selectedEntityRefId = selectedValue.entityReferenceId;
    }
  }

  onPhaseChange(event: any) {
    if (!event?.value) return;
    const selectedPhase = this.phaseDropdown.find((p) => p.value === event.value);
    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.projectStartDate = selectedPhase.startDate ?? null;
      this.projectEndDate = selectedPhase.endDate ?? null;
      this.pendingAuthorityIdForUpdate = selectedPhase?.pendingApprovalAuthority ?? null;
      this.updateResourceForm.get('startDate')?.updateValueAndValidity();
      this.updateResourceForm.get('endDate')?.updateValueAndValidity();
      this.getResourceData(this.projectId, this.selectedPhaseId, true);
    }
  }

  initializeForms() {
    this.updateResourceForm = this.fb.group(
      {
        resourceName: [null, Validators.required],
        resourceEmail: [null, [Validators.required, Validators.email]],
        resourcePhone: [null],
        designation: [null, Validators.required],
        projectName: [null, Validators.required],
        projectType: [null, Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        resourceAllocationhrs: [null, Validators.required],
        overtimeEligible: [false],
        billable: [false],
        allowweekendWork: [false],
        color: ['', Validators.required],
        resourceRole: [null, Validators.required],
        resourcePhase: [null, Validators.required],
        resourceAuthority: [null],
      },
      { validators: [this.DateValidator()] },
    );
  }

  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
        this.updateProjectDependentFields(res?.data[0]);
        this.departmentIds = this.projectsData[0]?.departments?.map((d: any) => d.departmentId) || [];
        this.getJobrole();
        this.inactiveStatus = (res?.data ?? []).some(
          (p: any) => p.status?.toLowerCase() === 'inactive' || p.client?.status?.toLowerCase() === 'inactive',
        ) ? 'inactive' : 'active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsData = [];
      },
    });
  }

  private updateProjectDependentFields(project: any): void {
    project.isOvertimeEligibile ? this.updateResourceForm.get('overtimeEligible')?.enable() : this.updateResourceForm.get('overtimeEligible')?.disable();
    project.isBillable ? this.updateResourceForm.get('billable')?.enable() : this.updateResourceForm.get('billable')?.disable();
    project.isWeekendWorkAllowed ? this.updateResourceForm.get('allowweekendWork')?.enable() : this.updateResourceForm.get('allowweekendWork')?.disable();
  }

  getJobrole() {
    this.loader = true;
    const departmentParam = this.departmentIds?.join(',') || '';
    this.subscription = this.http.getData(`ProjectRoles?isActive=true&departmentIds=${departmentParam}`).subscribe({
      next: (response: any) => {
        this.loader = false;
        this.projectRoleDropdown = (response?.success && Array.isArray(response.data))
          ? response.data.map((item: any) => ({
              label: item.roleName,
              value: { roleId: item.id, entityReferenceId: item.entity?.entityReferenceId || 0 },
            }))
          : [];
      },
      error: () => { this.loader = false; },
    });
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getResourceData(this.projectId, undefined, false, this.searchValue, this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getResourceData(this.projectId, undefined, false, this.searchValue, this.page, this.pageSize);
  }

  getResourceData(projectId: number, phaseId?: number, isPopupCall: boolean = false, searchTerm?: string, pageNumber?: any, pageSize?: any) {
    const params: any = {
      entityType: 'project',
      entityRefId: projectId,
      status: 'waiting for approval',
      pageNumber: pageNumber || this.page,
      pageSize: pageSize || this.pageSize,
    };
    if (phaseId) params.phaseId = phaseId;
    if (searchTerm) params.searchTerm = searchTerm;
    if (this.selectedRoleIds?.length > 0 && !isPopupCall) params.roleIds = this.selectedRoleIds.join(',');
    if (this.selectedPhaseIds?.length > 0 && !isPopupCall) params.phaseId = this.selectedPhaseIds.join(',');
    if (this.selectedAuthorityIds?.length > 0 && !isPopupCall) params.timesheetApprovalAuthorityIds = this.selectedAuthorityIds.join(',');

    if (!isPopupCall) {
      this.loading = true;
    }
    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        this.collectionSize = data?.pagination?.totalRecords || 0;
        if (isPopupCall) {
          const popupData = data.data ?? [];
          const uniqueEmployees = Array.from(new Map(popupData.map((r: any) => [r.employee.id, r])).values());
          this.resoucesDropDownData = (uniqueEmployees as any[]).map((r: any) => ({
            label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
            value: r.employee.id,
          }));
          const authorityControl = this.updateResourceForm.get('resourceAuthority');
          const authorityToPatch = this.pendingAuthorityIdForUpdate ?? null;
          const isInDropdown = this.resoucesDropDownData.some((r: any) => r.value === authorityToPatch);
          authorityControl?.patchValue(isInDropdown ? authorityToPatch : null);
          authorityControl?.enable();
        } else {
          this.resourcesData = Array.isArray(data?.data) ? data.data : [];
          this.loading = false;
          this.resourcesData = this.resourcesData.map((item: any) => ({
            ...item,
            employee: { ...item.employee, profileUrl: this.getImageUrl(item.employee?.profileUrl) }
          }));
          this.resoucesDropDownData = this.resourcesData.filter((r) => r.employee.id).map((r) => ({
            label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
            value: r.employee.id,
          }));
        }
      },
      error: (reason: any) => {
        this.loading = false;
        console.error(reason);
      },
    });
  }

  getImageUrl(imagePath: string): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.viewUrl}${imagePath}`;
  }

  openModal(content: any, size: any, data: any) {
    this.selectedResource = data;
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    const selectedRole = this.projectRoleDropdown.find((r: any) => r.value.roleId === data.projectRoleId);
    const selectedPhase = this.phaseDropdown.find((r: any) => r.value === data?.phase?.phaseId);

    this.pendingAuthorityIdForUpdate = data?.pendingApprovalAuthority?.id
      ?? selectedPhase?.pendingApprovalAuthority
      ?? null;

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.getResourceData(this.projectId, this.selectedPhaseId, true);
    }
    this.ResourceId = data?.resourceId;
    this.resourceName = data?.employee?.fusionEmployeeId + ' - ' + data?.employee?.name;
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone: data?.employee
        ? `${data.employee.mobilePhoneCountryCode ?? ''} ${data.employee.mobilePhoneNumber ?? ''}`.trim() || '-'
        : '-',
      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours || null,
      projectName: this.projectsData[0]?.projectName,
      projectType: this.projectsData[0]?.projectType,
      startDate: this.formatDateToLocal(data?.startDate),
      endDate: this.formatDateToLocal(data?.endDate),
      billable: data.billable,
      allowweekendWork: data.weekendWorkAllowed,
      resourceRole: selectedRole ? selectedRole.value : null,
      color: data?.meta?.graphData?.color,
      resourcePhase: selectedPhase ? selectedPhase.value : null,
      resourceAuthority: null,
    });
  }

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => ({
          ...employee,
          id: employee.employeeId,
          fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
        }));
      },
      error: (reason: any) => console.log(reason),
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
    this.loader = true;
    const formValue = this.updateResourceForm.getRawValue();
    const projectRoleId = formValue.resourceRole.roleId;
    const projectDepartmentId = formValue.resourceRole.entityReferenceId;
    const payload = {
      entityType: 'project',
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      overtimeEligibile: formValue.overtimeEligible || false,
      billable: formValue.billable || false,
      weekendWorkAllowed: formValue.allowweekendWork || false,
      status: 'waiting for approval',
      allocatedBy: this.empinfo.employeeId,
      projectRoleId,
      projectDepartmentId,
      pendingApprovalAuthority: formValue.resourceAuthority,
      phaseId: formValue.resourcePhase,
      meta: { graphData: { color: formValue.color } },
    };
    this.updateResourceStatus(payload, null, 'Resource updated successfully');
  }

  updateResourceStatus(payload: any, modal?: any, successMessage?: string) {
    const resourceId = payload.resourceId || this.ResourceId;
    if (!resourceId) return;
    this.http.putData(`ProjectResource/${resourceId}`, payload).subscribe({
      next: () => {
        this.loader = false;
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(successMessage || 'Resource updated successfully');
        this.getResourceData(this.projectId);
        this.http.setnewcountfornewresourcecount();
      },
      error: (err) => {
        this.loader = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
      },
    });
  }

  oncheckdates(value: any) {
    if (value) this.startDatevalidate = value;
  }

  DateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return { endBeforeStart: true };
      }
      return null;
    };
  }

  StartndendDateValidation() {
    const StartDate = this.updateResourceForm.get('startDate')?.value;
    const EndDate = this.updateResourceForm.get('endDate')?.value;
    this.startndEndDateValid = (StartDate && EndDate) ? new Date(EndDate) > new Date(StartDate) : true;
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  getPhaseData() {
    const params = { projectId: this.projectId };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = (data?.data || []).filter(
          (p: any) => ['in progress', 'extended', 'yet to start'].includes(p?.status?.toLowerCase()),
        );
        this.phaseDropdown = this.phaseData.map((p) => ({
          label: p.phaseName,
          value: p.phaseId,
          startDate: p?.startDate,
          endDate: p?.endDate,
          pendingApprovalAuthority: p?.pendingApprovalAuthority?.id,
        }));
      },
      error: () => { this.phaseData = []; this.phaseDropdown = []; },
    });
  }

  handleAction(data: any) {
    this.openModal(this.updateResourcemodal, 'lg', data);
    const phaseDate = data?.phase;
    if (phaseDate) {
      this.projectStartDate = phaseDate.startDate ?? null;
      this.projectEndDate = phaseDate.endDate ?? null;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) this.subscription.unsubscribe();
  }
}
