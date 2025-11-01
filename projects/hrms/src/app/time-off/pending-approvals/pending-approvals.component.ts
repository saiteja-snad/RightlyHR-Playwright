import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { PendingApprovalsTabsComponent } from "../../shared/time-off-module-tabs/pending-approvals-tabs/pending-approvals-tabs.component";
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePicker } from 'primeng/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import dayjs, { Dayjs } from 'dayjs';
import { HttpService } from '../../services/http.service';
import { IResourceDetail } from '../../timesheetmodel';
@Component({
  selector: 'app-pending-approvals',
  imports: [RouterModule, PendingApprovalsTabsComponent, TranslateModule, Select, ModuleInformationComponent,
    NgbPopoverModule, MultiSelectModule, ReactiveFormsModule, DatePicker, TranslateModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class PendingApprovalsComponent implements OnInit {
  moduleinfo = '';

  employeeData: any[] = [];
  dataload = false;
  subscription!: Subscription;
  datepickerForm!: FormGroup;
  destroy$ = new Subject<boolean>();
  resourcesList: any[] = [];
  projectsData: any[] = [];
  empinfo: any;
  projectId: any[] = [];
  employeeid: any;
  selectedResourceIds: any[] = [];
  isSubmitEnabled = false;
  isDistinct = true;
  today: Date = new Date();
  constructor(public router: Router, private fb: FormBuilder, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.createDatepickerForm();
    this.updateModuleInfo();
    this.setupNavigationReset();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getResourceDetailsByManagerId();
    this.getAllActiveProjects();

    this.datepickerForm.valueChanges.subscribe(() => {
      this.isSubmitEnabled = this.isAnyFieldSelected();
    });
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/pending-approvals': MODULE_INFOS.TIME_OFF_PENDING_APPROVAL_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  navigate() {
    this.router.navigate(['/time-off/pending-approvals/probation-request']);
  }


  /** Create form and keep Project & Resource disabled initially */
  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null],
      projectId: [''],
      resourceId: ['']
    });
  }


  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any field has value
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) ||
      formValue?.projectId !== null && formValue?.projectId !== undefined ||
      (formValue?.resourceId && formValue?.resourceId?.length > 0)
    );
  }

  isAnyFieldSelected(): boolean {
    const formValue = this.datepickerForm?.value;
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) || // date selected
      formValue?.projectId !== null && formValue?.projectId !== undefined || // project selected (including 0)
      (formValue?.resourceId && formValue?.resourceId?.length > 0) // at least one resource selected
    );
  }

  onresourceChange(event: any) {
    const selectedResourceIds = event?.value ?? [];
    this.selectedResourceIds = selectedResourceIds;
    this.getAllActiveProjects();
  }
  /** Get all projects for the current employee */
  getAllActiveProjects() {
    let url = `Project/authorities/${this.empinfo.employeeId}/projects`;

    if (this.selectedResourceIds?.length > 0) {
      const resourceIds = this.selectedResourceIds.join(',');
      url += `?resourceIds=${resourceIds}`;
    }

    this.http.getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const projects = res?.data || [];
          this.projectsData = projects.map((p: any) => ({
            ...p,
            displayName: `${p.clientName } - ${p.projectName }`
          }));

          this.projectsData.unshift({
            projectId: 0,
            displayName: 'No Client - No Project'
          });

          // ✅ FIX: Prevent null values from appearing in dropdown
          let selectedProjects = this.datepickerForm.get('projectId')?.value;

          if (Array.isArray(selectedProjects)) {
            // Remove nulls
            selectedProjects = selectedProjects.filter((x: any) => x !== null);

            // Keep only valid projectIds
            selectedProjects = selectedProjects.filter((id: number) =>
              this.projectsData.some(p => p.projectId === id)
            );

            // ✅ Set cleaned value back
            this.datepickerForm.get('projectId')?.setValue(selectedProjects);
          }
        },
        error: () => this.projectsData = []
      });
  }


  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectId = event?.value ?? [];
    this.projectId = selectedProjectId;
    this.getResourceDetailsByManagerId();
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empinfo?.employeeId;
    let url = `Timesheet/authority/${EmployeeId}/employees`;

    if (this.projectId?.length > 0) {
      const projectIds = this.projectId.join(',');
      url += `?projectIds=${projectIds}`;
    }

    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp?.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp?.name
          }));

          // ✅ Check if selected resource is still valid and remove nulls
          let selectedResources = this.datepickerForm.get('resourceId')?.value || [];
          
          if (Array.isArray(selectedResources)) {
            // Remove nulls
            selectedResources = selectedResources.filter((x: any) => x !== null);
            
            // Keep only valid resource IDs
            selectedResources = selectedResources.filter((id: number) =>
              this.resourcesList.some(r => r.id === id)
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
      }
    });
  }


  /** Reset form when navigating to another component */
  setupNavigationReset() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      if (!this.router.url.includes('time-off/pending-approvals/time-sheets')) {
        this.resetForm();
      }
    });
  }



  /** On form submit */
  onSubmit() {
    console.log('Form submitted with values:', this.datepickerForm.value);
    const formValue = this.datepickerForm.value;
    const dateRange = formValue.dateRange;
    const projectIds = formValue.projectId || [];
    const resourceIds = formValue.resourceId || [];
    
    const projectId = projectIds.length > 0 ? projectIds.join(',') : null;
    const resourceId = resourceIds.length > 0 ? resourceIds.join(',') : null;
    
    const request: any = {
      projectId,
      resourceId,
    };
    console.log(request);

    // Add dateRange only if selected
    if (dateRange && dateRange.length === 2) {
      request.dateRange = {
        startDate: dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
      };
    }
    this.http.setEmployeeIdTimesheet(this.employeeid, projectId, request);
  }

  /** Reset dependent fields */
  resetDependentFields() {
    this.datepickerForm.get('projectId')?.reset();
    this.datepickerForm.get('projectId')?.disable();
    this.datepickerForm.get('resourceId')?.reset();
    this.datepickerForm.get('resourceId')?.disable();
    this.projectsData = [];
    this.employeeData = [];
    this.isSubmitEnabled = false;
  }

  /** Clear everything */
  resetForm() {

    this.datepickerForm.reset();

    this.datepickerForm.reset({
      dateRange: null,
      projectId: null,
      resourceId: []
    });
    this.employeeData = [];
    this.projectId = [];
    this.employeeid = null;
    this.selectedResourceIds = [];
    this.isSubmitEnabled = true;
    this.http.setEmployeeIdTimesheet(null, 0, 0);
    this.getResourceDetailsByManagerId();
    this.getAllActiveProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}