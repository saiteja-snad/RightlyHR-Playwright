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
  projectsData: any[] = [];
  employeeData: any[] = [];
  dataload = false;
  subscription!: Subscription;
  datepickerForm!: FormGroup;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  projectId = 0;
  employeeid: any;
  isSubmitEnabled = false;
  isDistinct = true;

  constructor(public router: Router, private fb: FormBuilder, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveProjects();
    this.createDatepickerForm();
    this.updateModuleInfo();
    this.setupNavigationReset();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();

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
 isFilterApplied(): boolean {
    const formValue = this.datepickerForm.value;
    // Check if any field has value
    return (
      (formValue.dateRange && formValue.dateRange.length > 0) ||
      !!formValue.projectId ||
      (formValue.resourceId && formValue.resourceId.length > 0)
    );
  }
  /** Create form and keep Project & Resource disabled initially */
  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null],
      projectId: [null],
      resourceId: [{ value: [], disabled: true },]
    });
  }


isAnyFieldSelected(): boolean {
  const formValue = this.datepickerForm.value;
  return (
    (formValue.dateRange && formValue.dateRange.length > 0) || // date selected
    formValue.projectId !== null && formValue.projectId !== undefined || // project selected (including 0)
    (formValue.resourceId && formValue.resourceId.length > 0) // at least one resource selected
  );
}
  /** Get all projects for the current employee */

  getAllActiveProjects() {
    this.http
      .getData(`Project?status=Active&projectAuthorityId=${this.empinfo.employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const projects = res?.data || [];

          this.projectsData = projects.map((p: any) => ({
            ...p,
            displayName: `${p.client?.clientName || 'Unknown Client'} - ${p.projectName || 'Unnamed Project'}`
          }));

          this.projectsData.unshift({
            projectId: 0,
            displayName: 'No Client - No Project'
          });
        },
        error: (err) => {
          console.error('Error fetching projects:', err);

          this.projectsData = [
            {
              projectId: 0,
              displayName: 'No Client - No Project'
            }
          ];
        },
      });
  }

  /** When project selected */
  onProjectChange(event: any) {
    console.log('Project change event:', event);
    const selectedProjectId = event?.value ?? 0;
   
    // Resetemployee data
    this.employeeData = [];
    this.datepickerForm.get('resourceId')?.setValue([]);
     this.datepickerForm.get('resourceId')?.enable()
    this.projectId = selectedProjectId;
    if (selectedProjectId && selectedProjectId !== 0) {

      this.getAllActiveEmployees();
    } else {

      this.getTeamManagersDetails();

      // Wait briefly to ensure getTeamManagersDetails() completes (optional)
      setTimeout(() => {
        if (this.getEmployeeInfo?.length) {
          this.employeeData = this.getEmployeeInfo.map((emp: any) => ({
            id: emp.employeeId,
            name: emp.fullName
          }));
          this.datepickerForm.get('resourceId')?.enable();
        }
      }, 300);
    }
  }


  /** Reset form when navigating to another component */
  setupNavigationReset() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      if (!this.router.url.includes('time-off/pending-approvals/time-sheets')) {
        this.resetForm();
      }
    });
  }

  /** Get all active employees for selected project */
  getAllActiveEmployees() {
    this.http
      .getData(`ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.employeeData = res?.data?.map((x: any) => x.employee) ?? [];
          // if (this.employeeData.length > 0) {
          this.datepickerForm.get('resourceId')?.enable();
          // }
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.employeeData = [];
        }
      });
  }

  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.length) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => ({
              employeeId: employee.employeeId,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''}${employee.lastName ? ' ' + employee.lastName : ''}`,
            }));
          } else {
            this.getEmployeeInfo = [];
          }
        },
        error: (err) => {
          console.error('Error fetching team manager details:', err);
          this.getEmployeeInfo = [];
        }
      });
  }




  /** On form submit */
  onSubmit() {
    const dateRange = this.datepickerForm.value.dateRange;
    const projectId = this.datepickerForm.value.projectId || 0;
    const resourceIds = this.datepickerForm.value.resourceId || [];
    // Build request dynamically
    const request: any = {
      projectId,
      resourceId: resourceIds.length > 0 ? resourceIds : null,
    };
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
    this.datepickerForm.get('resourceId')?.disable();
    this.datepickerForm.reset({
      dateRange: null,
      projectId: null,
      resourceId: []
    });
    this.employeeData = [];
    this.projectId = 0;
    this.employeeid = null;
    this.isSubmitEnabled = true;
    this.http.setEmployeeIdTimesheet(null, 0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}