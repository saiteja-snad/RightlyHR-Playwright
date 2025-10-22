import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
@Component({
  selector: 'app-client-resources',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DataLoaderContentComponent, Select, DateformatPipe, NoDataFoundComponent, ConfirmationIconComponent],
  templateUrl: './client-resources.component.html',
  styleUrl: './client-resources.component.scss'
})

export class ClientResourcesComponent {
  resourcesData = [] as IResource[];
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
      resourcePhone: [null, Validators.required],
      designation: [null, Validators.required],
      projectName: [null, Validators.required],
      projectType: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      resourceAllocationhrs: [null, Validators.required],
      allocatedFrequencyType: [null, Validators.required],
      overtimeEligible: [false],
      billable: [false],
      allowweekendWork: [false],
      resourceRole: [null, Validators.required]
    });
  }

  getResourceData(id: any) {
    this.subscription = this.http.getDataIncludeParams(`ProjectResource?status=Active&entityType=Client&entityRefId=${id}&isProjectRequired=true`).subscribe({
      next: (data: any) => {
        this.resourcesData = data.data;
        this.loading = false;
      },
      error: (reason: any) => {
        this.loading = false;
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
          this.projectStartDate = new Date(project.startDate);
          this.projectEndDate = new Date(project.endDate);
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

  selectproject(projectId: any) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectId = res?.data[0]?.projectId,
          this.updateResourceForm.patchValue({
            projectType: res?.data[0]?.projectType,
          })
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
      },
    });
  }

  openModal(content: any, size: any, data: any) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    this.ResourceId = data?.resourceId;
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone: data?.employee?.workPhoneNumber ? `${data?.employee?.workPhoneCountryCode ?? ''} ${data?.employee?.workPhoneNumber ?? ''}` : '',
      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours,
      projectName: data.project.projectId,
      projectType: data.project.projectType,
      startDate: this.formatDateToLocal(data.startDate),
      endDate: this.formatDateToLocal(data.endDate),
      allocatedFrequencyType: data?.allocatedFrequencyType,
      billable: data.billable,
      allowweekendWork: data.weekendWorkAllowed,
      resourceRole: data.role
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
    const payload = {
      entityType: "project",
      entityRefId: formValue.projectName ?? this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs,
      allocatedFrequencyType: formValue.allocatedFrequencyType,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: "Active",
      allocatedBy: this.empinfo.employeeId,
      role: formValue.resourceRole
    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Resource updated successfully');
        this.getResourceData(this.clientID);
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
      entityRefId: this.clientID,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs,
      allocatedFrequencyType: formValue.allocatedFrequencyType,
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

  close() {
    this.modalService.dismissAll();
  }
}