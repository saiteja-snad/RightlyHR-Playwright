import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { Select } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { color } from 'html2canvas/dist/types/css/types/color';
@Component({
  selector: 'app-client-resources',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,NgbPopover, DataLoaderContentComponent, Select, DateformatPipe, NoDataFoundComponent, ConfirmationIconComponent, InfoIconComponent],
  templateUrl: './client-resources.component.html',
  styleUrl: './client-resources.component.scss'
})

export class ClientResourcesComponent {
  resourcesData = [] as IResource[];
  resourcesDataByPhase = [] as IResource[];
  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  projectsDataDrown: Project[] = [];
  loading: boolean = true;
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' }
  ];
  clientID: any;
  ResourceId: any;
  projectId: any
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  inactiveClientStatus: any;
  projectRoleDropdown: any[] = [];
  resoucesDropDownData = [] as any[];
  phaseDropdown: any[] = [];
  phaseData = [] as IPhases[];
  selectedPhaseId : any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, public formValidation: FormValidationsService,
    private http: HttpService, public rbac: RbacService, private router: Router, private route: ActivatedRoute, 
    private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = parseInt(clientID);
        this.getResourceData(this.clientID);
        this.getclientProjects(this.clientID);
        this.getClientsData(clientID);
      }
    });
    this.http.resourceDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getResourceData(parseInt(this.clientID));
    });
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  initializeForms() {
    this.updateResourceForm = this.fb.group({
      resourceName: [null, Validators.required],
      resourceEmail: [null, Validators.required],
      resourcePhone: [null],
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
      color: ['#FFFFFF'],
      resourceRole: [null, Validators.required],
      resourcePhase: [null,Validators.required],
      resourceAuthority : [{value:null,disabled:true}]
    });
  }

  getResourceData(id: any) {
    this.subscription = this.http.getDataIncludeParams(`ProjectResource?status=Active&entityType=Client&entityRefId=${id}&isProjectRequired=true&isGroupedByProject=true`).subscribe({
      next: (data: any) => {
        if (data?.data?.length > 0) {
          this.resourcesData = data.data;
        } else {
          this.resourcesData = [];
        }
        this.loading = false;
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

getResourceDataByPhaseId(projectId: number, phaseId: number, pendingApprovalId?: number) {
  const params = {
    status: 'Active',
    entityType: 'project',
    entityRefId: projectId,
    phaseId: phaseId
  };

  this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
    next: (data: any) => {
      if (data?.data?.length > 0) {
          this.resourcesDataByPhase = data.data;
          this.resoucesDropDownData = this.resourcesDataByPhase
        .filter(r => r.employee)
        .map(r => ({
          label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
          value: r.employee.id
        }));

      if (this.resoucesDropDownData?.length > 0 || pendingApprovalId) {
        this.updateResourceForm.get('resourceAuthority')?.enable();
        this.updateResourceForm.get('resourceAuthority')?.setValidators([Validators.required]);
        this.updateResourceForm.patchValue({
          resourceAuthority: this.resoucesDropDownData.find(
            (res: any) => res.value === pendingApprovalId
          )?.value || null
        });
      
        } 
      } else {
          this.resourcesDataByPhase= [];
        this.updateResourceForm.get('resourceAuthority')?.disable();
      }
    
    },
    error: (reason: any) => {
      console.error(reason);
      this.updateResourceForm.get('resourceAuthority')?.disable();
    }
  });
}

  projectStartDate!: Date;
  projectEndDate!: Date;
  getclientProjects(clientId: any) {
    this.http.getData(`Project?clientId=${clientId}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = res?.data ?? []; // Extract "data" array
             const project = this.projectsData[0];
            if (project) {
         
          // this.updateResourceForm.setValidators(this.validateAllocationHours(project));
          // this.updateResourceForm.updateValueAndValidity();
        }
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsDataDrown = [];
      },
    });
  }

onPhaseChange(selectedValue: any) {
  if (selectedValue) {
    const phase = selectedValue.value;
    this.selectedPhaseId = phase.value ?? null;
    this.projectStartDate = new Date(phase.startDate) ?? null;
    this.projectEndDate = new Date(phase.endDate) ?? null;

    // this.projectStartDate = new Date(project.startDate);
    // this.projectEndDate = new Date(project.endDate);
    // Reset approval authority
    this.updateResourceForm.patchValue({ resourceAuthority: null });
    this.updateResourceForm.get('resourceAuthority')?.disable();
    

    this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId);
  }
}

  

  getJobrole(departmentIds?: number[],roleId?:number) {
    if(!departmentIds) return ;
    const departmentParam = departmentIds?.join(',') || '';
    this.subscription = this.http
    .getData(`ProjectRoles?isActive=true&departmentIds=${departmentParam}`)
    .subscribe({
      next: (response: any) => {
        // this.loader = false;
        if (response && response.success && Array.isArray(response.data)) {
          this.projectRoleDropdown = response.data.map((item: any) => ({
            label: `${item.roleName}`,
            value: {
              roleId: item.id,
              entityReferenceId: item.entity?.entityReferenceId || 0
            }
          }));
          const selectedRole = this.projectRoleDropdown.find(
            (r: any) => r.value.roleId === roleId
          );
          this.updateResourceForm.patchValue({
          resourceRole: selectedRole ? selectedRole.value : null
          });
        } else {
          this.projectRoleDropdown = [];
        }
      },
      error: () => {
        // this.loader = false;
      },
    });
  }

  getPhaseData(projectId:number,phaseId?:number,pendingApprovalId?:number) {
    console.log(projectId);
    const params = {
    projectId: projectId
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = data.data;
        this.phaseDropdown = this.phaseData.map(p => ({
        label: p?.phaseName,
        value: p?.phaseId,
        projectId:p?.project?.projectId,
        clientId:p?.project?.clientId,
        startDate: p?.startDate,
        endDate: p?.endDate,
      }));

      if(phaseId){
        const selectedPhase = this.phaseDropdown.find(
          (p: any) => p.value === phaseId
        );
        this.updateResourceForm.patchValue({
          resourcePhase: selectedPhase ? selectedPhase : null
        });
        this.projectStartDate = new Date(selectedPhase.startDate) ?? null;
        this.projectEndDate = new Date(selectedPhase.endDate) ?? null;

        this.getResourceDataByPhaseId(this.projectId,phaseId,pendingApprovalId);
      }

      
      },
      error: (reason: any) => {
      }
    });
  }

selectProject(projectId: any) {
  this.http.getData(`Project?projectId=${projectId}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const project = res?.data[0];
        if (project) {
          this.projectId = project.projectId;

          // Reset dependent dropdowns
          this.phaseDropdown = [];
          this.updateResourceForm.patchValue({
            resourcePhase: null,
            resourceAuthority: null
          });

          this.updateResourceForm.get('resourcePhase')?.reset();
          this.updateResourceForm.get('resourceAuthority')?.reset();
          this.updateResourceForm.get('resourceAuthority')?.disable();

          // Set project type or other info
          this.updateResourceForm.patchValue({
            projectType: project.projectType,
          });

          // Fetch phases for selected project
          this.getPhaseData(this.projectId);
        }
      },
      error: (err) => {
        console.error('Error fetching project data:', err);
      }
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
  openModal(content: any, size: any, data: any) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    console.log(data);
    const departmentIds = data?.project?.departments?.map((d: any) => d.departmentId) || [];
    this.getJobrole(departmentIds, data?.projectRoleId);
    this.ResourceId = data?.resourceId;
    this.projectId = data?.project?.projectId;
    this.getPhaseData(this.projectId, data?.phase?.phaseId, data?.pendingApprovalAuthority?.id);
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone:
  data?.employee
    ? `${data.employee.mobilePhoneCountryCode ?? ''} ${data.employee.mobilePhoneNumber ?? ''}`.trim() || '-'
    : '-',

      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours,
      projectName: data.project.projectId,
      projectType: data.project.projectType,
      startDate: this.formatDateToLocal(data.startDate),
      endDate: this.formatDateToLocal(data.endDate),
      // allocatedFrequencyType: data?.allocatedFrequencyType,
      billable: data.billable,
      allowweekendWork: data.weekendWorkAllowed,
      color: data?.meta?.graphData?.color || '#FFFFFF',
      // resourceRole: selectedRole ? selectedRole.value : null,
      // resourcePhase: [null,Validators.required],
      // resourceAuthority : [null]
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
            id: employee.employeeId,
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
    this.selectedEmployee = this.employeeDetails?.find(employeeId);
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee
  ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-'
  : '-'

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
      entityRefId: formValue.projectName ?? this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs,
      // allocatedFrequencyType: formValue.allocatedFrequencyType,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: "Active",
      allocatedBy: this.empinfo.employeeId,
      projectRoleId: projectRoleId,
      projectDepartmentId: projectDepartmentId,
      phaseId : formValue?.resourcePhase?.value,
      pendingApprovalAuthority : formValue.resourceAuthority,
      meta: {
      graphData: {
        color: formValue.color
      }
      }
    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Resource updated successfully');
        this.getResourceData(this.clientID);
        this.close(false);
      },
      error: (err) => {
        console.error('Error occured:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
      }
    });
  }

  deleteResources() {
    const formValue = this.updateResourceForm.value;
    const payload = {
      entityType: "project",
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs,
      // allocatedFrequencyType: formValue.allocatedFrequencyType,
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
        this.getResourceData(this.clientID);
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

  close(closePopup?:boolean) {
    if(closePopup){
    this.modalService.dismissAll();

    }
    this.updateResourceForm.reset();

    this.updateResourceForm.get('resourceAuthority')?.reset();
    this.updateResourceForm.get('resourceAuthority')?.setValidators(null);
    this.updateResourceForm.get('resourceAuthority')?.disable();
    this.resoucesDropDownData = [];
    this.resourcesDataByPhase = [];
    this.phaseDropdown = [];
    this.updateResourceForm.patchValue({
       color: ['#FFFFFF']
    });
    this.phaseData = [];
  }
}