import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePicker } from 'primeng/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import dayjs, { Dayjs } from 'dayjs';
import { HttpService } from '../../services/http.service';
import { IResourceDetail } from '../../timesheetmodel';
import { TimeoffApprovalTabsComponent } from '../../shared/time-off-module-tabs/pending-approvals-tabs/timeoff-approval-tabs/timeoff-approval-tabs.component';
import { ContractorApprovalTabsComponent } from '../../shared/time-off-module-tabs/pending-approvals-tabs/contractor-approval-tabs/contractor-approval-tabs.component';
import { SeparationApprovalTabsComponent } from '../../shared/time-off-module-tabs/pending-approvals-tabs/separation-approval-tabs/separation-approval-tabs.component';
import { OnboardingApprovalTabsComponent } from '../../shared/time-off-module-tabs/pending-approvals-tabs/onboarding-approval-tabs/onboarding-approval-tabs.component';
import { RbacService } from '../../services/rbac.service';
import { Select } from 'primeng/select';
import { ApplicablePoliciesTriggerComponent } from '../../shared/policies/applicable-policies-trigger/applicable-policies-trigger.component';
import { APPLICABLE_POLICIES_KEYS } from '../../shared/policies/policy-visibility.catalog';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ProjectManagementApprovalTabsComponent } from "../../shared/time-off-module-tabs/pending-approvals-tabs/project-management-approval-tabs/project-management-approval-tabs.component";
@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, TranslateModule, ModuleInformationComponent, NgbPopoverModule, MultiSelectModule, ReactiveFormsModule,
    DatePicker, TranslateModule, TimeoffApprovalTabsComponent, ContractorApprovalTabsComponent, SeparationApprovalTabsComponent,
    OnboardingApprovalTabsComponent, CommonModule, Select, ModuleInfoIconComponent, ApplicablePoliciesTriggerComponent, ProjectManagementApprovalTabsComponent],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PendingApprovalsComponent implements OnInit {
  readonly applicablePoliciesKeys = APPLICABLE_POLICIES_KEYS;
  moduleinfo = '';
  employeeData: any[] = [];
  dataload = false;
  subscription!: Subscription;
  componentName: any
  datepickerForm!: FormGroup;
  destroy$ = new Subject<boolean>();
  resourcesList: any[] = [];
  projectsData: any[] = [];
  empinfo: any;
  phaseIds: any[] = [];
  employeeid: any;
  selectedResourceIds: any[] = [];
  isSubmitEnabled = false;
  isDistinct = true;
  today: Date = new Date();

  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  selectedEmployeeId: number | null = null;

  headerRightTemplate: TemplateRef<any> | null = null;
  tastType: any[] = [];
  spinnerLoader1 = false;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    public http: HttpService,
    public rbac: RbacService,
    private cdr: ChangeDetectorRef,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDatepickerForm();
    this.updateModuleInfo();
    this.setupNavigationReset();
    this.updateModuleInfo();
    this.ComponentnameDisplay();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.ComponentnameDisplay();
    });
    this.initiateUpdateModuleInfo();
    this.getResourceDetailsByManagerId();
    this.getAllActiveProjects();
    this.datepickerForm.valueChanges.subscribe(() => {
      this.isSubmitEnabled = this.isAnyFieldSelected();
    });
    if (this.isKraKpiRoute()) {
      if (this.rbac.allowedToAccess('All Employees (Expenses).view')) {
        this.loadAllActiveEmployees();
      }
      if (this.rbac.allowedToAccess('My Team (Expenses).view')) {
        this.loadMyTeamEmployees();
      }
    }
    this.getTaskType();
  }

  getTaskType() {
    this.subscription = this.http.getData('TaskType').subscribe({
      next: (res: any) => {
        this.tastType = res
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/pending-approvals/time-off':
        MODULE_INFOS.PENDING_APPROVALS_TIMEOFF_MODULE_INFO,
      '/pending-approvals/on-boarding':
        MODULE_INFOS.PENDING_APPROVALS_ONBOARDING_MODULE_INFO,
      '/pending-approvals/contractors':
        MODULE_INFOS.PENDING_APPROVALS_CONTRACTOR_MODULE_INFO,
      '/pending-approvals/off-boarding':
        MODULE_INFOS.PENDING_APPROVALS_OFFBOARDING_MODULE_INFO,
      '/pending-approvals/desk-approval':
        MODULE_INFOS.PENDING_APPROVALS_DESK_MODULE_INFO,
      '/pending-approvals/claimsandexpenses-request':
        MODULE_INFOS.PENDING_APPROVALS_EXPENSES_MODULE_INFO,
      '/pending-approvals/time-sheets':
        MODULE_INFOS.PENDING_APPROVALS_TIMESHEET_MODULE_INFO,
      '/pending-approvals/assessmentform':
        MODULE_INFOS.PENDING_APPROVALS_ASSESSMENT_FORM_MODULE_INFO,
      '/pending-approvals/employeeinfo-request':
        MODULE_INFOS.PENDING_APPROVALS_EMPLOYEEINFO_MODULE_INFO,
      '/pending-approvals/kra-kpi':
        MODULE_INFOS.PENDING_APPROVALS_KRA_KPI_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  navigate() {
    if (this.http.getIsFromOnBehalfOfProbation()) {
      this.router.navigate(['/on-behalf-of/on-behalf-of-approvals/time-off']);
    } else {
      this.router.navigate(['/pending-approvals/on-boarding/probation-request']);
    }
    
  }
  /** Create form and keep Phase & Resource disabled initially */
  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null],
      phaseId: [[]],
      resourceId: [[]],
      taskId: [[]]
    });
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) ||
      (Array.isArray(formValue?.phaseId) && formValue.phaseId.length > 0) ||
      (Array.isArray(formValue?.resourceId) && formValue.resourceId.length > 0) ||
      (Array.isArray(formValue?.taskId) && formValue.taskId.length > 0)
    );
  }

  isAnyFieldSelected(): boolean {
    const formValue = this.datepickerForm?.value;
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) ||
      (Array.isArray(formValue?.phaseId) && formValue.phaseId.length > 0) ||
      (Array.isArray(formValue?.resourceId) && formValue.resourceId.length > 0) ||
      (Array.isArray(formValue?.taskId) && formValue.taskId.length > 0)
    );
  }  

  onresourceChange(event: any) {
    const selectedResourceIds = event?.value ?? [];
    this.selectedResourceIds = selectedResourceIds;
    this.getAllActiveProjects();
  }

  /** Get all phases for the current employee */
  getAllActiveProjects() {
    let url = `Project/authorities/${this.empinfo.employeeId}/projects`;
    if (this.selectedResourceIds?.length > 0) {
      const resourceIds = this.selectedResourceIds.join(',');
      url += `?resourceIds=${resourceIds}`;
    }
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res: any) => {
        const projects = res?.data || [];
        this.projectsData = projects.map((p: any) => ({
          ...p,
          displayName: `${p.clientName} - ${p.projectName} - ${p.phaseName}`,
        }));
        this.projectsData.unshift({
          phaseId: 0,
          displayName: 'No Client - No Project',
        });
        // FIX: Prevent null values from appearing in dropdown
        let selectedPhases = this.datepickerForm.get('phaseId')?.value;
        if (Array.isArray(selectedPhases)) {
          // Remove nulls
          selectedPhases = selectedPhases.filter((x: any) => x !== null);
          // Keep only valid phaseIds
          selectedPhases = selectedPhases.filter((id: number) =>
            this.projectsData.some((p) => p.phaseId === id)
          );
          // Set cleaned value back
          this.datepickerForm.get('phaseId')?.setValue(selectedPhases);
        }
      },
      error: () => (this.projectsData = []),
    });
  }

  /** When phase selected */
  onProjectChange(event: any) {
    const selectedPhaseIds = event?.value ?? [];
    this.phaseIds = selectedPhaseIds;
    this.getResourceDetailsByManagerId();
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empinfo?.employeeId;
    let url = `Timesheet/authority/${EmployeeId}/employees`;
    if (this.phaseIds?.length > 0) {
      const phaseIds = this.phaseIds.join(',');
      url += `?phaseIds=${phaseIds}`;
    }
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp?.fusionEmpId
              ? `${emp.fusionEmpId} - ${emp.name}`
              : emp?.name,
          }));
          // Check if selected resource is still valid and remove nulls
          let selectedResources =
            this.datepickerForm.get('resourceId')?.value || [];
          if (Array.isArray(selectedResources)) {
            // Remove nulls
            selectedResources = selectedResources.filter(
              (x: any) => x !== null
            );
            // Keep only valid resource IDs
            selectedResources = selectedResources.filter((id: number) =>
              this.resourcesList.some((r) => r.id === id)
            );
            // Set cleaned value back
            this.datepickerForm.get('resourceId')?.setValue(selectedResources);
            // Update component property to match form
            this.selectedResourceIds = selectedResources;
          }
        } else {
          this.resourcesList = [];
          this.datepickerForm.get('resourceId')?.setValue([]);
          this.selectedResourceIds = [];
        }
      },
      error: () => {
        this.resourcesList = [];
        this.datepickerForm.get('resourceId')?.setValue([]);
        this.selectedResourceIds = [];
      },
    });
  }

  /** Reset form when navigating to another component */
  setupNavigationReset() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
      if (!this.router.url.includes('/pending-approvals/time-sheets')) {
        this.resetForm();
      }
    });
  }

  /** On form submit */
  onSubmit() {
    this.spinnerLoader1 = true;
    const formValue = this.datepickerForm.value;
    const dateRange = formValue.dateRange;
    const phaseIds = formValue.phaseId || [];
    const resourceIds = formValue.resourceId || [];
    const phaseId = phaseIds.length > 0 ? phaseIds.join(',') : null;
    const resourceId = resourceIds.length > 0 ? resourceIds.join(',') : null;
    const taskIds = formValue.taskId || [];
    const taskId = taskIds.length > 0 ? formValue.taskId.join(', ') : null;
    const request: any = {
      phaseId,
      resourceId,
      taskId
    };
    // Add dateRange only if selected
    if (dateRange && dateRange.length === 2) {
      request.dateRange = {
        startDate: dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
      };
    }
    // Pass the request data to the timesheet component
    this.http.setEmployeeIdTimesheet(this.employeeid, phaseId || 0, request);
    this.spinnerLoader1 = false;
    if (this.isTimeOffRoute()) {
      this.closeCanvas();
    }
  }

  /** Reset dependent fields */
  resetDependentFields() {
    this.datepickerForm.get('phaseId')?.reset();
    this.datepickerForm.get('phaseId')?.disable();
    this.datepickerForm.get('resourceId')?.reset();
    this.datepickerForm.get('resourceId')?.disable();
    this.datepickerForm.get('taskId')?.reset();
    this.datepickerForm.get('taskId')?.disable();
    this.projectsData = [];
    this.employeeData = [];
    this.isSubmitEnabled = false;
  }

  /** Clear everything */
  resetForm() {
    this.datepickerForm.reset({
      dateRange: null,
      phaseId: [],
      resourceId: [],
      taskId: []
    });
    this.phaseIds = [];
    this.selectedResourceIds = [];
    this.employeeData = [];
    this.employeeid = null;
    this.isSubmitEnabled = false;
    this.http.setEmployeeIdTimesheet(null, 0, null);
    this.getResourceDetailsByManagerId();
    this.getAllActiveProjects();
  }
  ComponentnameDisplay() {
    const url = this.router.url;
    const routeToNameMap: { [key: string]: string } = {
      '/pending-approvals/time-off/leaves': 'Leaves',
      '/pending-approvals/time-off/wfh': 'WFH',
      '/pending-approvals/time-off/remote': 'Remote Login',
      '/pending-approvals/time-off/comp-off': 'Comp-off',
      '/pending-approvals/time-off/permissions': 'Permissions',
      '/pending-approvals/time-off/regularization-request': 'Regularizations',
      '/pending-approvals/time-off/extra-hours-request': 'Extra Hours',
    };
    const matched = Object.entries(routeToNameMap).find(([route]) => url.startsWith(route));
    this.componentName = matched ? matched[1] : '';
  }
  // route based hide of content
  isTimeOffRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/time-off');
  }

  isContractRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/contractors');
  }

  isOffboardingRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/off-boarding');
  }

  isDeskRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/desk-approval');
  }

  isExpensesRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith(
      '/pending-approvals/claimsandexpenses-request'
    );
  }

  isOnboardingRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/on-boarding');
  }

  isEmployeeInfoRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/employeeinfo-request');
  }

  isKraKpiRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/kra-kpi');
  }

  isImpersonationUsersRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/impersonation-users');
  }

  isRecruitmentRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/recruitment');
  }

  isProjectManagementRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/pending-approvals/project-management');
  }

  get applicablePoliciesModuleKey(): string {
    return this.applicablePoliciesKeys.PENDING_APPROVALS_TIME_OFF.moduleKey;
  }

  get applicablePoliciesSubModuleKey(): string {
    if (this.isTimeOffRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_TIME_OFF.subModuleKey;
    }

    if (this.isOnboardingRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_ONBOARDING.subModuleKey;
    }

    if (this.isContractRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_CONTRACTORS.subModuleKey;
    }

    if (this.isOffboardingRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_OFFBOARDING.subModuleKey;
    }

    if (this.isDeskRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_DESKS.subModuleKey;
    }

    if (this.isExpensesRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_EXPENSES.subModuleKey;
    }

    if (this.isProjectManagementRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_TIMESHEETS.subModuleKey;
    }

    if (this.isEmployeeInfoRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_EMPLOYEE_INFO.subModuleKey;
    }

    if (this.isKraKpiRoute()) {
      return this.applicablePoliciesKeys.PENDING_APPROVALS_KRA_KPI.subModuleKey;
    }

    return '';
  }

  loadMyTeamEmployees(): void {
    const employeeId = this.empinfo?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((res: any) => {
        const data = res || [];

        this.myTeamEmployees = data
          .filter((emp: any) => emp.isAccess)
          .map((emp: any) => {
            const fusion = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusion}${emp.firstName ?? ''} ${
              emp.middleName ? emp.middleName + ' ' : ''
              }${emp.lastName ?? ''}`.trim();
            return { ...emp, fullName };
          })
          .sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', {
              sensitivity: 'base',
            })
          );
      });
  }

  loadAllActiveEmployees(): void {
    const currentEmployeeId = this.empinfo?.employeeId;
    const statuses = ['Active', 'Trainee Active'];

    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe((res: any) => {
        const employees = res || [];
        this.activeEmplist = employees
          .filter((emp: any) => emp.employeeId !== this.empinfo?.employeeId)
          .map((emp: any) => ({
            label: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${
              emp.middleName ?? ''
              } ${emp.lastName ?? ''}`.trim(),
            value: emp.employeeId,
          }));
      });
  }

  onEmployeeChange(employeeId: number | null): void {
    this.selectedEmployeeId = employeeId || null;

    // 🔁 Call your KRA/KPI API here
    // Example:
    // this.loadPendingKraKpi(this.selectedEmployeeId);
  }

  setHeaderTemplate(template: TemplateRef<any>) {
    this.headerRightTemplate = template;
    this.cdr.detectChanges();
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}