import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-setup-wizard-manager-assignment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    MultiSelectModule
  ],
  templateUrl: './setup-wizard-manager-assignment.component.html',
  styleUrl: './setup-wizard-manager-assignment.component.scss'
})
export class SetupWizardManagerAssignmentComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly confirmation = inject(OpenModalService);

  assignForm!: FormGroup;

  employees: any[] = [];
  managers: any[] = [];
  departmentDetails: any[] = [];
  teamDropdownValues: any[] = [];

  teamManagerId: number | null = null;
  assigning = false;

  readonly changeTypeOptions = [
    { label: 'RM', value: 'RM' },
    { label: 'TM', value: 'TM' }
  ];

  private subscriptions: Subscription[] = [];
  private loggedInUserId = 0;

  ngOnInit(): void {
    this.loggedInUserId = this.authService.getToken()?.employeeId ?? 0;
    this.initForm();
    this.loadManagers();
    this.loadDepartments();
    this.subscriptions.push(
      this.http.refresh$.subscribe(() => {
        if (this.assignForm.get('changeType')?.value) {
          this.loadEmployees();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get f(): Record<string, AbstractControl> {
    return this.assignForm.controls;
  }

  get isFormValid(): boolean {
    const type = this.assignForm.get('changeType')?.value;
    const selectedEmployees = this.assignForm.get('selectedEmployees')?.value;
    if (!type || !selectedEmployees?.length) {
      return false;
    }

    if (type === 'RM') {
      return !!this.assignForm.get('newReportingManager')?.value &&
        !!this.assignForm.get('effectiveDate')?.value;
    }

    return !!this.assignForm.get('effectiveDate')?.value &&
      !!this.assignForm.get('department')?.value &&
      !!this.assignForm.get('team')?.value &&
      !!this.teamManagerId;
  }

  private initForm(): void {
    this.assignForm = this.fb.group({
      selectedEmployees: [[], Validators.required],
      changeType: [null, Validators.required],
      newReportingManager: [null],
      effectiveDate: [null],
      department: [null],
      team: [null],
      teamManagerName: [{ value: null, disabled: true }]
    });
  }

  onChangeTypeChange(): void {
    this.assignForm.get('newReportingManager')?.clearValidators();
    this.assignForm.get('effectiveDate')?.clearValidators();
    this.assignForm.get('department')?.clearValidators();
    this.assignForm.get('team')?.clearValidators();

    const type = this.assignForm.get('changeType')?.value;
    if (type === 'RM') {
      this.assignForm.get('newReportingManager')?.setValidators(Validators.required);
      this.assignForm.get('effectiveDate')?.setValidators(Validators.required);
    } else if (type === 'TM') {
      this.assignForm.get('effectiveDate')?.setValidators(Validators.required);
      this.assignForm.get('department')?.setValidators(Validators.required);
      this.assignForm.get('team')?.setValidators(Validators.required);
    }

    this.assignForm.patchValue({
      selectedEmployees: [],
      newReportingManager: null,
      effectiveDate: null,
      department: null,
      team: null,
      teamManagerName: null
    });

    this.assignForm.get('newReportingManager')?.updateValueAndValidity();
    this.assignForm.get('effectiveDate')?.updateValueAndValidity();
    this.assignForm.get('department')?.updateValueAndValidity();
    this.assignForm.get('team')?.updateValueAndValidity();

    this.teamDropdownValues = [];
    this.teamManagerId = null;
    this.employees = [];

    if (type) {
      this.loadEmployees();
    }
  }

  onAssign(): void {
    this.assignForm.markAllAsTouched();
    if (!this.isFormValid || this.assigning) {
      return;
    }

    const type = this.assignForm.get('changeType')?.value;
    this.assigning = true;

    if (type === 'RM') {
      this.assignRM();
      return;
    }

    this.assignTM();
  }

  onDepartmentChange(selectedDepartment: any): void {
    this.assignForm.patchValue({ team: null, teamManagerName: null });
    this.teamDropdownValues = [];
    this.teamManagerId = null;

    const id = selectedDepartment?.sno;
    if (!id) {
      return;
    }

    const sub = this.http.getData(`Subdepartments/Getnames/${id}`).subscribe({
      next: (data: any) => {
        this.teamDropdownValues = data || [];
      },
      error: () => {
        this.teamDropdownValues = [];
      }
    });
    this.subscriptions.push(sub);
  }

  onSubDepartmentChange(selectedSubDepartment: any): void {
    this.assignForm.patchValue({ teamManagerName: null });
    this.teamManagerId = null;

    const id = selectedSubDepartment?.subdepartmentId;
    if (!id) {
      return;
    }

    const sub = this.http.getData(`Subdepartments/${id}`).subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const manager = data[0];
          this.teamManagerId = manager.reportingmanagerId;
          const name = manager.middleName
            ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
            : `${manager.firstName} ${manager.lastName}`;
          this.assignForm.patchValue({ teamManagerName: name });
        }
      },
      error: () => {
        this.assignForm.patchValue({ teamManagerName: null });
      }
    });
    this.subscriptions.push(sub);
  }

  private assignRM(): void {
    const selectedEmployees: any[] = this.assignForm.get('selectedEmployees')?.value ?? [];
    const manager = this.assignForm.get('newReportingManager')?.value;
    const managerId = manager?.employeeId;
    const effectiveDate = this.assignForm.get('effectiveDate')?.value;
    const requestBody = selectedEmployees.map(emp => ({
      id: emp.jobId ?? emp.id ?? 0,
      employeeId: emp.employeeId,
      firstName: emp.firstName ?? emp.employeeName,
      middleName: emp.middleName ?? '',
      lastName: emp.lastName ?? '',
      jobRole: emp.jobRole ?? '',
      workEmail: emp.workEmail ?? emp.emailaddress ?? '',
      contactnumber: emp.contactnumber ?? emp.contactNumber ?? 0,
      effectiveDate
    }));

    const sub = this.http.postText(`JobDetails/joblist/updater?ManagerId=${managerId}`, requestBody).subscribe({
      next: () => {
        const historyPayload = selectedEmployees.map(emp => ({
          employeeId: emp.employeeId,
          newManagerId: managerId,
          effectiveDate: new Date(effectiveDate).toISOString(),
          createdBy: this.loggedInUserId,
          createdAt: new Date().toISOString(),
          updatedBy: this.loggedInUserId,
          updatedAt: new Date().toISOString(),
          reportingType: 'RM',
          reportingEmployeeId: this.loggedInUserId
        }));

        this.http.postdata('EmployeeReportingHistory/CreateReportingHistory', historyPayload).subscribe({
          error: () => {}
        });

        this.confirmation.openSuccessModal('Reporting manager updated successfully');
        this.resetAssignForm();
        this.http.triggerRefresh();
        this.assigning = false;
      },
      error: (err: any) => {
        this.assigning = false;
        this.confirmation.openErrorModal(err?.error?.Message || 'Reporting manager update failed');
      }
    });
    this.subscriptions.push(sub);
  }

  private assignTM(): void {
    const selectedEmployees: any[] = this.assignForm.get('selectedEmployees')?.value ?? [];
    const employeeIds = selectedEmployees.map(emp => emp.employeeId);
    const effectiveDate = this.assignForm.get('effectiveDate')?.value;
    const deptId = this.assignForm.get('department')?.value?.sno;
    const subDeptId = this.assignForm.get('team')?.value?.subdepartmentId;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teamManagerId}&effectiveDate=${effectiveDate}&DeptId=${deptId}&SubdeptId=${subDeptId}`;

    const sub = this.http.postText(url, employeeIds).subscribe({
      next: () => {
        const historyPayload = selectedEmployees.map(emp => ({
          employeeId: emp.employeeId,
          newManagerId: this.teamManagerId,
          effectiveDate: new Date(effectiveDate).toISOString(),
          createdBy: this.loggedInUserId,
          createdAt: new Date().toISOString(),
          updatedBy: this.loggedInUserId,
          updatedAt: new Date().toISOString(),
          reportingType: 'TM',
          reportingEmployeeId: this.loggedInUserId
        }));

        this.http.postdata('EmployeeReportingHistory/CreateReportingHistory', historyPayload).subscribe({
          error: () => {}
        });

        this.confirmation.openSuccessModal('Team manager updated successfully');
        this.resetAssignForm();
        this.http.triggerRefresh();
        this.assigning = false;
      },
      error: (err: any) => {
        this.assigning = false;
        this.confirmation.openErrorModal(err?.error?.Message || 'Team manager update failed');
      }
    });
    this.subscriptions.push(sub);
  }

  private resetAssignForm(): void {
    const changeType = this.assignForm.get('changeType')?.value;
    this.assignForm.reset({
      changeType,
      selectedEmployees: [],
      newReportingManager: null,
      effectiveDate: null,
      department: null,
      team: null,
      teamManagerName: null
    });
    this.teamDropdownValues = [];
    this.teamManagerId = null;
    this.employees = [];
    if (changeType) {
      this.loadEmployees();
    }
  }

  private loadEmployees(): void {
    const statuses = encodeURIComponent('Prospective,Active,Trainee Active,Active Contract');
    const sub = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];
        this.employees = list.map((emp: any) => {
          const fullName = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ');
          const name = emp.fusionEmpId ? `${emp.fusionEmpId} - ${fullName}` : fullName;
          return { ...emp, employeeName: fullName, name };
        });
      },
      error: () => {
        this.employees = [];
      }
    });
    this.subscriptions.push(sub);
  }

  private loadManagers(): void {
    const sub = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];
        this.managers = list
          .map((emp: any) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const name = `${fusionPart}${emp.firstName?.trim() ?? ''} ${emp.middleName ? emp.middleName.trim() + ' ' : ''}${emp.lastName?.trim() ?? ''}`.trim();
            return { ...emp, name };
          })
          .sort((a: any, b: any) => (a.firstName?.toLowerCase() || '').localeCompare(b.firstName?.toLowerCase() || ''));
      },
      error: () => {
        this.managers = [];
      }
    });
    this.subscriptions.push(sub);
  }

  private loadDepartments(): void {
    const sub = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data || [];
      },
      error: () => {
        this.departmentDetails = [];
      }
    });
    this.subscriptions.push(sub);
  }
}
