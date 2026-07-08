import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import {
  combineLatest,
  Subject,
  Subscription,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Select } from 'primeng/select';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ClientResourceTabComponent } from '../../../shared/project-management-tabs/client-resource-tab/client-resource-tab.component';
import { ProfileIconComponent } from '../../../icons/profile-icon/profile-icon.component';
import { environment } from '../../../../environments/environment';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-client-resources-waiting-for-approval',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClientResourceTabComponent,
    TranslateModule,
    NgbPopover,
    DataLoaderContentComponent,
    Select,
    DateformatPipe,
    NoDataFoundComponent,
    InfoIconComponent,
    ProfileIconComponent,
    PaginatorModule,
  ],
  templateUrl: './client-resources-waiting-for-approval.component.html',
  styleUrl: './client-resources-waiting-for-approval.component.scss',
})
export class ClientResourcesWaitingForApprovalComponent implements OnInit, OnDestroy {
  searchValue: string = '';
  resourcesData = [] as IResource[];
  filteredResourcesData = [] as IResource[];

  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  projectsDataDrown: Project[] = [];
  loading: boolean = false;
  clientID: any;
  ResourceId: any;
  projectId: any;
  empinfo: any = {};
  destroy$: Subject<boolean> = new Subject<boolean>();
  inactiveClientStatus: any;
  projectRoleDropdown: any[] = [];
  resoucesDropDownData = [] as any[];
  phaseDropdown: any[] = [];
  phaseData = [] as IPhases[];
  projectStartDate!: string | null;
  projectEndDate!: string | null;
  selectedPhaseId: any;
  startndEndDateValid: any;
  startDatevalidate: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  pendingAuthorityIdForUpdate: any = null;
  @ViewChild('updateResourcemodal') updateResourcemodal!: any;
  @ViewChild('confirmationpopupfornodue') confirmationpopupfornodue!: any;
  selectedResource: any;
  selectedRoleId: number = 0;
  selectedEntityRefId: number = 0;
  // Pagination
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 },
  ];

  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];
  selectedAuthorityIds: number[] = [];
  selectedProjectIds: number[] = [];
  private searchTimeout: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public formValidation: FormValidationsService,
    private http: HttpService,
    public rbac: RbacService,
    private router: Router,
    private route: ActivatedRoute,
    private conformationPopup: OpenModalService,
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe((params) => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = parseInt(clientID);
        this.getclientProjects(this.clientID);
        this.getClientsData(clientID);
      }
    });

    combineLatest([
      this.http.resourceRoleFilter$,
      this.http.resourcePhaseFilter$,
      this.http.resourceAuthorityFilter$,
      this.http.resourceProjectFilter$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      )
      .subscribe(([roleIds, phaseIds, authorityIds, projectIds]) => {
        this.selectedRoleIds = roleIds || [];
        this.selectedPhaseIds = phaseIds || [];
        this.selectedAuthorityIds = authorityIds || [];
        this.selectedProjectIds = projectIds || [];
        if (this.clientID) {
          this.getResourceData(this.clientID, this.searchValue);
        }
      });

    this.http.resourceDetailesadded$
      .pipe(takeUntil(this.destroy$), debounceTime(50))
      .subscribe(() => {
        if (this.clientID) {
          this.getResourceData(this.clientID, this.searchValue);
        }
      });

    this.updateResourceForm.get('startDate')?.valueChanges.subscribe(() => this.StartndendDateValidation());
    this.updateResourceForm.get('endDate')?.valueChanges.subscribe(() => this.StartndendDateValidation());
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.inactiveClientStatus = res.data.status.toLowerCase(); },
      error: (err) => { console.error('Error fetching clients:', err); },
    });
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
        color: ['#FFFFFF', Validators.required],
        resourceRole: [null, Validators.required],
        resourcePhase: [null, Validators.required],
        resourceAuthority: [null],
      },
      { validators: [this.DateValidator()] },
    );
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getResourceData(this.clientID, this.searchValue);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getResourceData(this.clientID, this.searchValue);
  }

  getResourceData(id: any, searchTerm?: string) {
    let url = `ProjectResource?status=waiting for approval&entityType=Client&entityRefId=${id}&isProjectRequired=true&isGroupedByProject=true&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    if (this.selectedRoleIds?.length > 0) url += `&roleIds=${this.selectedRoleIds.join(',')}`;
    if (this.selectedPhaseIds?.length > 0) url += `&phaseId=${this.selectedPhaseIds.join(',')}`;
    if (this.selectedAuthorityIds?.length > 0) url += `&timesheetApprovalAuthorityIds=${this.selectedAuthorityIds.join(',')}`;
    if (this.selectedProjectIds?.length > 0) url += `&projectIds=${this.selectedProjectIds.join(',')}`;

    this.loading = true;
    this.subscription = this.http.getDataIncludeParams(url).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.resourcesData = Array.isArray(data?.data) ? data.data : [];
        this.collectionSize = data?.pagination?.totalRecords || 0;
        this.resourcesData = this.resourcesData.map((item: any) => ({
          ...item,
          employee: { ...item.employee, profileUrl: this.getImageUrl(item.employee?.profileUrl) },
        }));
        this.filteredResourcesData = this.resourcesData;
      },
      error: () => { this.loading = false; },
    });
  }

  getImageUrl(imagePath: string): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.viewUrl}${imagePath}`;
  }

  getResourceDataByPhaseId(projectId: number, phaseId: number) {
    const params: any = { entityType: 'project', entityRefId: projectId };
    if (phaseId) params.phaseId = phaseId;

    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        const popupData = data.data ?? [];
        const uniqueEmployees = Array.from(new Map(popupData.map((r: any) => [r.employee.id, r])).values());
        this.resoucesDropDownData = (uniqueEmployees as any[]).map((r: any) => ({
          label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
          value: r.employee.id,
        }));
        const defaultPendingAuthorityId = popupData[0]?.pendingApprovalAuthority?.id ?? null;

        const authorityControl = this.updateResourceForm.get('resourceAuthority');
        if (this.resoucesDropDownData.length === 0) {
          authorityControl?.disable();
          authorityControl?.reset();
        } else {
          const authorityToPatch = this.pendingAuthorityIdForUpdate ?? defaultPendingAuthorityId ?? null;
          const isInDropdown = this.resoucesDropDownData.some((r: any) => r.value === authorityToPatch);
          authorityControl?.patchValue(isInDropdown ? authorityToPatch : null);
          authorityControl?.enable();
        }
      },
      error: () => { this.updateResourceForm.get('resourceAuthority')?.disable(); },
    });
  }

  getclientProjects(clientId: any) {
    this.http.getData(`Project?clientId=${clientId}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = res?.data ?? [];
        this.getPhaseData();
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsDataDrown = [];
      },
    });
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
      this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId);
    }
  }

  onRoleChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedRoleId = selectedValue.roleId;
      this.selectedEntityRefId = selectedValue.entityReferenceId;
    }
  }

  selectProject(projectId: any) {
    this.projectId = projectId;
    const selectedProject = this.projectsDataDrown.find((p) => p.projectId === projectId);
    if (selectedProject) {
      this.departmentIds = selectedProject?.departments?.map((d: any) => d.departmentId) || [];
      this.projectStartDate = this.formatDateToLocal(selectedProject.startDate);
      this.projectEndDate = this.formatDateToLocal(selectedProject.endDate);
      this.updateResourceForm.patchValue({ projectType: selectedProject.projectType });
      this.getProjects(projectId);
      this.getJobrole();
      this.getPhaseDataByProject(projectId);
    }
  }

  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.updateProjectDependentFields(res?.data[0]); },
      error: (err) => { console.error('Error fetching projects data:', err); },
    });
  }

  private updateProjectDependentFields(project: any): void {
    project.isOvertimeEligibile
      ? this.updateResourceForm.get('overtimeEligible')?.enable()
      : this.updateResourceForm.get('overtimeEligible')?.disable();
    project.isBillable
      ? this.updateResourceForm.get('billable')?.enable()
      : this.updateResourceForm.get('billable')?.disable();
    project.isWeekendWorkAllowed
      ? this.updateResourceForm.get('allowweekendWork')?.enable()
      : this.updateResourceForm.get('allowweekendWork')?.disable();
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

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return null;
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
    const start = this.updateResourceForm.get('startDate')?.value;
    const end = this.updateResourceForm.get('endDate')?.value;
    this.startndEndDateValid = (start && end) ? new Date(end) > new Date(start) : true;
  }

  oncheckdates(value: any) {
    if (value) this.startDatevalidate = value;
  }

  getPhaseData() {
    if (!this.clientID) return;
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', { clientId: this.clientID }).subscribe({
      next: (data: any) => { this.phaseDropdown = this.mapPhaseDropdown(data?.data || []); },
      error: (reason: any) => { console.error(reason); },
    });
  }

  getPhaseDataByProject(projectId: any) {
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', { projectId }).subscribe({
      next: (data: any) => { this.phaseDropdown = this.mapPhaseDropdown(data?.data || []); },
      error: (reason: any) => { console.error(reason); },
    });
  }

  private mapPhaseDropdown(phases: any[]): any[] {
    this.phaseData = phases.filter(
      (p: any) => p?.status?.toLowerCase() === 'in progress' || p?.status?.toLowerCase() === 'extended',
    );
    return this.phaseData.map((p) => ({
      label: p.phaseName,
      value: p.phaseId,
      projectId: p?.project?.projectId,
      clientId: p?.project?.clientId,
      startDate: p?.startDate,
      endDate: p?.endDate,
      pendingApprovalAuthority: p?.pendingApprovalAuthority?.id,
    }));
  }

  openModal(content: any, size: any, data: any) {
    this.selectedResource = data;
    this.ResourceId = data?.resourceId;
    this.modalService.open(content, { centered: true, size, backdrop: 'static' });

    this.projectId = data?.project?.projectId;
    const selectedProject = this.projectsDataDrown.find((p) => p.projectId === this.projectId);
    if (selectedProject) {
      this.departmentIds = selectedProject?.departments?.map((d: any) => d.departmentId) || [];
      this.projectStartDate = this.formatDateToLocal(selectedProject.startDate);
      this.projectEndDate = this.formatDateToLocal(selectedProject.endDate);
    }
    this.getJobrole();
    this.getPhaseDataByProject(this.projectId);
    if (data?.project?.projectId) this.getProjects(data.project.projectId);

    const selectedPhase = this.phaseDropdown.find((r: any) => r.value === data?.phase?.phaseId);

    // Store authority to pre-select after async dropdown population
    this.pendingAuthorityIdForUpdate = data?.pendingApprovalAuthority?.id
      ?? selectedPhase?.pendingApprovalAuthority
      ?? null;

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId);
    }

    const selectedRole = this.projectRoleDropdown.find((r: any) => r.value.roleId === data.projectRoleId);
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone: data?.employee
        ? `${data.employee.mobilePhoneCountryCode ?? ''} ${data.employee.mobilePhoneNumber ?? ''}`.trim() || '-'
        : '-',
      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours || null,
      projectName: data?.project?.projectId,
      projectType: data?.project?.projectType,
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

  updateResources() {
    if (this.updateResourceForm.invalid) {
      this.updateResourceForm.markAllAsTouched();
      return;
    }
    this.loader = true;
    const formValue = this.updateResourceForm.getRawValue();
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
      projectRoleId: formValue.resourceRole?.roleId,
      projectDepartmentId: formValue.resourceRole?.entityReferenceId,
      pendingApprovalAuthority: formValue.resourceAuthority || null,
      phaseId: typeof formValue.resourcePhase === 'number' ? formValue.resourcePhase : null,
      projectId: formValue.projectName,
      meta: { graphData: { color: formValue.color } },
    };
    this.updateResourceStatus(payload, 'Resource updated successfully');
  }

  updateResourceStatus(payload: any, successMessage?: string) {
    const resourceId = payload.resourceId || this.ResourceId;
    if (!resourceId) return;
    this.http.putData(`ProjectResource/${resourceId}`, payload).subscribe({
      next: () => {
        this.loader = false;
        this.modalService.dismissAll();
        this.http.setnewcountfornewresourcecount();
        this.conformationPopup.openSuccessModal(successMessage || 'Resource updated successfully');
        this.getResourceData(this.clientID, this.searchValue);
      },
      error: (err) => {
        this.loader = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
      },
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

  closepopup(content: any) {
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close(dismiss?: boolean) {
    if (dismiss) this.modalService.dismissAll();
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
      error: (reason: any) => { console.log(reason); },
    });
  }

  onClickEmployee(event: any) {
    const employeeId = event.value;
    this.selectedEmployee = this.employeeDetails?.find((emp) => emp.employeeId === employeeId);
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee
        ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${(this.selectedEmployee as any).contactnumber ?? ''}`.trim() || '-'
        : '-',
    });
    this.getJobdetails(this.selectedEmployee?.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee}`).subscribe({
      next: (data: any) => {
        this.updateResourceForm.patchValue({ designation: Array.isArray(data) ? data[0]?.jobRole : data?.jobRole });
      },
      error: (reason: any) => { console.log(reason); },
    });
  }

  closePopup() {
    this.modalService.dismissAll();
    this.updateResourceForm.reset();
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.getResourceData(this.clientID, this.searchValue);
    }, 300);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) this.subscription.unsubscribe();
    clearTimeout(this.searchTimeout);
  }
}
