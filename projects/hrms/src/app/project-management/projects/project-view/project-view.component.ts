import { Component, OnInit } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { ProjectTabsComponent } from '../../../shared/project-management-tabs/project-tabs/project-tabs.component';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import isoWeek from 'dayjs/plugin/isoWeek';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
import { ResourceCreationComponent } from '../../shared-project-management-componenets/resource-creation/resource-creation.component';
import { ProjectDocumentCreationComponent } from '../../shared-project-management-componenets/project-document-creation/project-document-creation.component';
import { ProjectContactInfoCreationComponent } from '../../shared-project-management-componenets/project-contact-info-creation/project-contact-info-creation.component';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { DatePicker } from 'primeng/datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { PhasesCreationComponent } from '../../shared-project-management-componenets/phases-creation/phases-creation.component';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-project-view',
  imports: [
    ProjectManagementModuleInfoComponent,
    DatePicker,
    ProjectTabsComponent,
    RouterModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    ProjectContactInfoCreationComponent,
    Select,
    PhasesCreationComponent,
    MultiSelectModule,
    FormsModule,
  ],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss',
})
export class ProjectViewComponent implements OnInit {
  empdata = {} as any;
  projectId!: number;
  addContactForm!: FormGroup;
  addDocumentForm!: FormGroup;
  datepickerFormData!: FormGroup;
  ranges: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  resourcesData = [] as IResource[];
  clientsId!: any;
  projectsData: any[] = [];
  inactiveStatus: any;
  datepickerFormDataforsummary!: FormGroup;

  selectedActivePhaseStatuses: string[] = [];
  selectedInActivePhaseStatuses: string[] = [];

  phaseDateRange: Date[] = [];

  selectedAuthorities: number[] = [];
  authorityOptions: { label: string; value: number }[] = [];
  authorityLoading = false;

  selectedResourceRoles: number[] = [];
  selectedResourcePhases: number[] = [];
  selectedResourceAuthorities: number[] = [];
  resourceRoleOptions: any[] = [];
  resourcePhaseOptions: any[] = [];
  resourceAuthorityOptions: any[] = [];

  activePhaseStatusOptions = [
    { label: 'Yet to Start', value: 'yet to start' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Extended', value: 'extended' },
  ];

  inactivePhaseStatusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Closed', value: 'closed' },
  ];

  departmentlist = [] as any;

  selectedDepartmentIds: number[] = [];
  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public formValidation: FormValidationsService,
    private route: ActivatedRoute,
    public rbac: RbacService,
    private http: HttpService
  ) {}

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.createContactForm();
    this.createDocumentForm();
    this.DepartmentList();

    // this.setDefaultRanges();
    // this.setDefaultWeek();
    this.datepickerFormdata();
    this.setDefaultmounth();
    this.datepickerforsummaryview();
    this.loadAuthorities();
    this.route.queryParams.subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = projectId;
        this.getProjects(projectId);
        this.getAllresourcesData();
        this.loadResourceFilters();
      }
    });

    this.http.clickingonresource$.subscribe((triggered) => {
      if (triggered) {
        this.setDefaultmounth();
        this.getAllresourcesData();
      }
    });
    this.enableResourceOnDateChange();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (
          this.router.url.includes(
            '/project-management/projects/details/timesheet'
          )
        ) {
          this.resetForm();
        }
      });
  }

  loadAuthorities() {
    const EmployeeId = this.empdata?.employeeId;
    this.authorityLoading = true;
    this.http
      .getData(`Timesheet/get-resources?employeeId=${EmployeeId}`)
      .subscribe({
        next: (res: any) => {
          this.authorityOptions = (res?.data || []).map((item: any) => ({
            label: `${item.fusionEmpId} - ${item.name}`,
            value: item.id,
          }));
          this.authorityLoading = false;
        },
        error: () => {
          this.authorityOptions = [];
          this.authorityLoading = false;
        },
      });
  }

  onPhaseStatusChange(event: any) {
    const selected = event.value || [];
    if (this.isActive('/project-management/projects/details/inactive-phases')) {
      this.selectedInActivePhaseStatuses = selected;
      this.selectedActivePhaseStatuses = [];
    } else {
      this.selectedActivePhaseStatuses = selected;
      this.selectedInActivePhaseStatuses = [];
    }
    this.http.setPhaseStatusFilter(selected);
  }

  onPhaseDateChange() {
    const [start, end] = this.phaseDateRange || [];

    const startDate = start ? dayjs(start).startOf('day').toISOString() : null;
    const endDate = end ? dayjs(end).endOf('day').toISOString() : null;

    this.http.setPhaseDateFilter({ startDate, endDate });
  }

  onAuthorityChange() {
    this.http.setPhaseAuthorityFilter(this.selectedAuthorities);
  }

  clearPhaseFilters() {
    this.selectedInActivePhaseStatuses = [];
    this.selectedActivePhaseStatuses = [];
    this.phaseDateRange = [];
    this.selectedAuthorities = [];
    this.http.setPhaseStatusFilter([]);
    this.http.setPhaseDateFilter({ startDate: null, endDate: null });
    this.http.setPhaseAuthorityFilter([]);
  }

  loadResourceFilters() {
    if (!this.projectId) return;
    this.loadResourceRoles();
    this.loadResourcePhases();
    this.loadResourceAuthorities();
  }

  loadResourceRoles() {
    this.http.getData('ProjectRoles?isActive=true').subscribe({
      next: (res: any) => {
        this.resourceRoleOptions = (res?.data || []).map((item: any) => ({
          label: item.roleName,
          value: item.id,
        }));
      },
      error: () => {
        this.resourceRoleOptions = [];
      },
    });
  }

  loadResourcePhases() {
    if (!this.projectId) return;
    const params = { projectId: this.projectId };
    this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (res: any) => {
        this.resourcePhaseOptions = (res?.data || []).map((item: any) => ({
          label: item.phaseName,
          value: item.phaseId,
        }));
      },
      error: () => {
        this.resourcePhaseOptions = [];
      },
    });
  }

  DepartmentList() {
    this.http.getData('Department').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.departmentlist = data;
      },
    });
  }

  loadResourceAuthorities() {
    if (!this.projectId) return;
    this.http
      .getData(
        `ProjectResource/timesheet-approval-authorities?entityType=Project&entityRefId=${this.projectId}`
      )
      .subscribe({
        next: (res: any) => {
          this.resourceAuthorityOptions = (res?.data || []).map(
            (item: any) => ({
              label: `${item.fusionEmployeeId} - ${item.name}`,
              value: item.id,
            })
          );
        },
        error: () => {
          this.resourceAuthorityOptions = [];
        },
      });
  }

  onResourceRoleChange() {
    this.http.setResourceRoleFilter(this.selectedResourceRoles);
  }

  onResourcePhaseChange() {
    this.http.setResourcePhaseFilter(this.selectedResourcePhases);
  }

  onResourceAuthorityChange() {
    this.http.setResourceAuthorityFilter(this.selectedResourceAuthorities);
  }

  clearResourceFilters() {
    this.selectedResourceRoles = [];
    this.selectedResourcePhases = [];
    this.selectedResourceAuthorities = [];
    this.http.clearResourceRoleFilter();
    this.http.clearResourcePhaseFilter();
    this.http.clearResourceAuthorityFilter();
  }

  isResourceFilterApplied(): boolean {
    return (
      this.selectedResourceRoles.length > 0 ||
      this.selectedResourcePhases.length > 0 ||
      this.selectedResourceAuthorities.length > 0
    );
  }

  resetForm() {
    this.datepickerFormData.get('dateRange')?.reset();
    this.datepickerFormData.get('resourceId')?.reset();
    this.http.setRequest(null);
    this.http.setDateRange(null, null);
    this.setDefaultmounth();
  }

  createContactForm() {
    this.addContactForm = this.fb.group({
      contacts: this.fb.array([this.createContactGroup()]),
    });
  }

  createDocumentForm() {
    this.addDocumentForm = this.fb.group({
      documentName: [null, Validators.required],
      createdDate: [null, Validators.required],
      documentType: [null, Validators.required],
      documentattachment: [null, Validators.required],
    });
  }

  datepickerFormdata() {
    this.datepickerFormData = this.fb.group({
      dateRange: [null],
      resourceId: [null],
    });
    // detect when user selects date range
  }

  datepickerforsummaryview() {
    this.datepickerFormDataforsummary = this.fb.group({
      dateRange: [null],
    });
    // detect when user selects date range
  }

  setDefaultmounth() {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    this.datepickerFormData.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });
    this.datepickerFormDataforsummary?.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });
  }

  // Create a single contact form group
  createContactGroup(): FormGroup {
    return this.fb.group({
      contactName: [null, Validators.required],
      contactEmail: [null, Validators.required, Validators.email],
      contactPhone: [null, Validators.required],
      contactRole: [null, Validators.required],
    });
  }

  // Getter for easy access
  get contacts(): FormArray {
    return this.addContactForm.get('contacts') as FormArray;
  }

  // Add a new row
  addContact() {
    this.contacts.push(this.createContactGroup());
  }

  // Remove a row
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  openDocumentModal() {
    this.modalService.open(ProjectDocumentCreationComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  openResourceModal() {
    this.modalService.open(ResourceCreationComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  openPhaseModal() {
    this.modalService.open(PhasesCreationComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  // isFormCompletelyValid(): boolean {
  //   const formValue = this.datepickerFormData.getRawValue(); // includes disabled controls
  //   return !!formValue.dateRange && !!formValue.resourceId;
  // }

  isFormCompletelyValid(): boolean {
    const formValue = this.datepickerFormData.getRawValue();
    return !!formValue.dateRange;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerFormData.value;
    // Check if any field has value
    return (
      (formValue.dateRange && formValue.dateRange.length > 0) ||
      (formValue.resourceId && formValue.resourceId.length > 0)
    );
  }

  isFilterAppliedforsummary(): boolean {
    const formValue = this.datepickerFormDataforsummary?.value;
    // Check if any field has value
    return formValue?.dateRange && formValue?.dateRange?.length > 0;
  }

  getAllresourcesData() {
    this.http
      .getData(
        `ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=true`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.resourcesData = res?.data?.map((x: any) => x.employee) ?? []; // Extract "data" array
        },
        error: (err) => {
          console.error('Error fetching employee data:', err);
          this.resourcesData = [];
        },
        complete: () => {},
      });
  }

  getProjects(projectId: string) {
    this.http
      .getData(`Project?projectId=${projectId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsData = Array.isArray(res?.data) ? res.data : [];
          if (this.projectsData?.length > 0) {
            const project = this.projectsData[0];
            this.datepickerFormData
              .get('projectName')
              ?.enable({ emitEvent: false });
            this.datepickerFormData.patchValue({
              projectName: project?.projectName,
            });
            this.datepickerFormData
              .get('projectName')
              ?.disable({ emitEvent: false });
            //  this.datepickerFormData.get('projectName')?.disable();
            this.clientsId = project?.client?.clientId ?? null;
            this.inactiveStatus = (res?.data ?? []).some(
              (p: any) =>
                p.status?.toLowerCase() === 'inactive' ||
                p.client?.status?.toLowerCase() === 'inactive'
            )
              ? 'inactive'
              : 'active';
            console.log(this.inactiveStatus);
          } else {
            this.clientsId = null; // No projects returned
          }
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.projectsData = [];
        },
      });
  }

  // Enable resourceId when dateRange is selected
  enableResourceOnDateChange() {
    this.datepickerFormData
      .get('dateRange')
      ?.valueChanges.subscribe((value) => {
        if (value && value[0] && value[1]) {
          this.getAllresourcesData();
          this.datepickerFormData.get('resourceId')?.enable();
        } else {
          this.datepickerFormData.get('resourceId')?.disable();
        }
      });
  }

  // Define predefined ranges
  setDefaultRanges() {
    this.ranges = {
      Today: [dayjs().toDate(), dayjs().toDate()],
      Yesterday: [
        dayjs().subtract(1, 'day').toDate(),
        dayjs().subtract(1, 'day').toDate(),
      ],
      'Last 7 Days': [dayjs().subtract(6, 'day').toDate(), dayjs().toDate()],
      'This Month': [
        dayjs().startOf('month').toDate(),
        dayjs().endOf('month').toDate(),
      ],
      'Last Month': [
        dayjs().subtract(1, 'month').startOf('month').toDate(),
        dayjs().subtract(1, 'month').endOf('month').toDate(),
      ],
    };
  }

  // Getter to retrieve range keys
  get rangeKeys(): string[] {
    return this.ranges ? Object.keys(this.ranges) : [];
  }

  setDefaultWeek() {
    const startOfWeek = dayjs().startOf('isoWeek').toDate();
    const endOfWeek = dayjs().endOf('isoWeek').toDate();
    this.datepickerFormData.patchValue({
      dateRange: [startOfWeek, endOfWeek],
    });
  }

  selectRange(range: string) {
    if (this.ranges[range]) {
      this.datepickerFormData.patchValue({
        dateRange: this.ranges[range],
      });
    }
  }

  onSubmit() {
    const dateRangeArray = this.datepickerFormData.value.dateRange || [];
    // const resourceID=this.datepickerFormData.get('resourceId')?.value?.id
    const startDate = dateRangeArray[0]
      ? dayjs(dateRangeArray[0]).format('YYYY-MM-DDTHH:mm:ss')
      : null;
    const endDate = dateRangeArray[1]
      ? dayjs(dateRangeArray[1]).format('YYYY-MM-DDTHH:mm:ss')
      : null;

    const request = {
      dateRange: { startDate, endDate },
      resourceId: this.datepickerFormData.value.resourceId,
    };
    this.http.setRequest(request);
  }

  onSubmitforsummary() {
    const dateRangeArray =
      this.datepickerFormDataforsummary.value.dateRange || [];
    const startDate = dateRangeArray[0]
      ? dayjs(dateRangeArray[0]).format('YYYY-MM-DDTHH:mm:ss')
      : null;
    const endDate = dateRangeArray[1]
      ? dayjs(dateRangeArray[1]).format('YYYY-MM-DDTHH:mm:ss')
      : null;
    this.http.setDateRange(startDate, endDate);
  }

  navigationtoinactivedocuments() {
    this.router.navigate(
      ['/project-management/projects/details/inactivedocuments'],
      { queryParams: { id: this.projectId } } // using query params
    );
  }

  navigationtoactivedocuments() {
    this.router.navigate(
      ['/project-management/projects/details/documents'],
      { queryParams: { id: this.projectId } } // using query params
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
