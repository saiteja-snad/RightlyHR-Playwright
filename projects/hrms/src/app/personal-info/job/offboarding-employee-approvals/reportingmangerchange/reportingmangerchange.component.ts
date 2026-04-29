import { CommonModule } from "@angular/common";
import { Component, ViewChild, TemplateRef, OnInit, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { NgbModal, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { Paginator } from "primeng/paginator";
import { SelectModule } from "primeng/select";
import { TabsModule } from "primeng/tabs";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MultiSelectModule } from "primeng/multiselect";
import { HttpService } from "../../../../services/http.service";
import { OpenModalService } from "../../../../services/open-modal.service";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { OffboardingReloadService } from "../../../../services/offboarding-reload.service";
import { environment } from '../../../../../environments/environment';



@Component({
  selector: 'app-reportingmangerchange',
  imports: [CommonModule,
      ReactiveFormsModule,
      TranslateModule,
      SelectModule,
      TabsModule,
      NoDataFoundComponent,
      DateformatPipe,
      DataLoaderContentComponent,
      FormsModule,
      Paginator,
      InfoIconComponent,
      NgbPopoverModule, MultiSelectModule],
  templateUrl: './reportingmangerchange.component.html',
  styleUrl: './reportingmangerchange.component.scss'
})
export class ReportingmangerchangeComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  selectedChangeAssignment: any = null;
  changeManagerSelection: any = null;
  changeModalTeamDropdown: any[] = [];
  changeModalTeamManagerId: any = null;
  changeModalForm!: FormGroup;

  @ViewChild('changeManagerModal') changeManagerModal!: TemplateRef<any>;

  employees: any[] = [];
  managers: any[] = [];
  empinfo: any = {};
  personalinfo: any = {};
  activeTab: string = 'RM';
  tmRecords: any[] = [];
  rmRecords: any[] = [];
  historyLoading = false;

  assignForm!: FormGroup;
  departmentDetails: any[] = [];
  teamDropdownValues: any[] = [];
  teammangerid: any;
  joiningDate: any;

  changeTypeOptions = [
    { label: 'RM', value: 'RM' },
    { label: 'TM', value: 'TM' }
  ];

  viewUrl = environment.viewUrl;

  constructor(private http: HttpService, public router: Router, private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.personalinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initForm();
    this.getManagers();
    this.getDepartment();
    this.getJoiningDate();
    this.getReportingHistory();
  }

  initForm(): void {
    this.assignForm = this.fb.group({
      selectedEmployees: [[], Validators.required],
      changeType: [null, Validators.required],
      newReportingManager: [null],
      effectiveDate: [null],
      department: [null],
      team: [null],
      teamManagerName: [{ value: null, disabled: true }]
    });
    this.changeModalForm = this.fb.group({
      effectiveDate: [null, Validators.required],
      newReportingManager: [null],
      department: [null],
      team: [null],
      teamManagerName: [{ value: null, disabled: true }]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.assignForm.controls;
  }

  get isFormValid(): boolean {
    const type = this.assignForm.get('changeType')?.value;
    const employees = this.assignForm.get('selectedEmployees')?.value;
    if (!type || !employees?.length) return false;
    if (type === 'RM') {
      return !!this.assignForm.get('newReportingManager')?.value &&
        !!this.assignForm.get('effectiveDate')?.value;
    }
    if (type === 'TM') {
      return !!this.assignForm.get('effectiveDate')?.value &&
        !!this.assignForm.get('department')?.value &&
        !!this.assignForm.get('team')?.value &&
        !!this.teammangerid;
    }
    return false;
  }

  onChangeTypeChange(): void {
    // Clear validators and errors
    this.assignForm.get('newReportingManager')?.clearValidators();
    this.assignForm.get('effectiveDate')?.clearValidators();
    this.assignForm.get('department')?.clearValidators();
    this.assignForm.get('team')?.clearValidators();

    // Reset touched state to prevent error messages from showing
    this.assignForm.get('selectedEmployees')?.markAsUntouched();
    this.assignForm.get('newReportingManager')?.markAsUntouched();
    this.assignForm.get('effectiveDate')?.markAsUntouched();
    this.assignForm.get('department')?.markAsUntouched();
    this.assignForm.get('team')?.markAsUntouched();

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
    this.teammangerid = null;
    this.employees = [];
    if (type) this.getEmployeesByManagerType(type);
  }

  getEmployeesByManagerType(managerType: string): void {
    const employeeId = this.personalinfo?.employeeId;
    if (!employeeId) return;
    this.http.getData(`v2/Employeedata/GetEmployeesDataBasedonManager?EmployeeId=${employeeId}&managerType=${managerType}`).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];
        const filterdata=list.filter((item:any)=>item.employeeId !=this.personalinfo.employeeId);
        this.employees = filterdata.map((emp: any) => {
          const fullName = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ');
          const name = emp.fusionEmpId ? `${emp.fusionEmpId} - ${fullName}` : fullName;
          return { ...emp, employeeName: fullName, name };
        });
      },
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  getDepartment(): void {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => { this.departmentDetails = data || []; },
      error: (err: any) => console.error(err)
    });
  }

  getJoiningDate(): void {
    const employeeId = this.empinfo?.employeeId;
    if (!employeeId) return;
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        const d = new Date(data.dateOfJoining);
        this.joiningDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      },
      error: () => {}
    });
  }

  onDepartmentChange(selectedDepartment: any): void {
    this.assignForm.patchValue({ team: null, teamManagerName: null });
    this.teamDropdownValues = [];
    this.teammangerid = null;
    const id = selectedDepartment?.sno;
    if (!id) return;
    this.subscription = this.http.getData(`Subdepartments/Getnames/${id}`).subscribe({
      next: (data: any) => { this.teamDropdownValues = data || []; },
      error: () => { this.teamDropdownValues = []; }
    });
  }

  onSubDepartmentChange(selectedSubDepartment: any): void {
    this.assignForm.patchValue({ teamManagerName: null });
    this.teammangerid = null;
    const id = selectedSubDepartment?.subdepartmentId;
    if (!id) return;
    this.subscription = this.http.getData(`Subdepartments/${id}`).subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const manager = data[0];
          this.teammangerid = manager.reportingmanagerId;
          const name = manager.middleName
            ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
            : `${manager.firstName} ${manager.lastName}`;
          this.assignForm.patchValue({ teamManagerName: name });
        }
      },
      error: () => { this.assignForm.patchValue({ teamManagerName: null }); }
    });
  }

  onAssign(): void {
    this.assignForm.markAllAsTouched();
    if (!this.isFormValid) return;
    const type = this.assignForm.get('changeType')?.value;
    if (type === 'RM') {
      this.assignRM();
    } else if (type === 'TM') {
      this.assignTM();
    }
  }

  private assignRM(): void {
    const selectedEmps: any[] = this.assignForm.get('selectedEmployees')?.value ?? [];
    const ManagerId = this.assignForm.get('newReportingManager')?.value?.employeeId;
    const newManagerName = this.assignForm.get('newReportingManager')?.value?.name;
    const effectiveDate = this.assignForm.get('effectiveDate')?.value;
    const loggedInId = this.empinfo?.employeeId;
    const selectedempId = this.personalinfo?.employeeId;
    const requestBody = selectedEmps.map((emp: any) => ({
      id: emp.jobId ?? 0,
      employeeId: emp.employeeId,
      firstName: emp.firstName ?? emp.employeeName,
      middleName: emp.middleName ?? '',
      lastName: emp.lastName ?? '',
      jobRole: emp.jobRole ?? '',
      workEmail: emp.workEmail ?? '',
      contactnumber: emp.contactnumber ?? emp.contactNumber ?? 0,
      effectiveDate:effectiveDate
    }));
    this.subscription = this.http.postText(`JobDetails/joblist/updater?ManagerId=${ManagerId}`, requestBody).subscribe({
      next: () => {
        const historyPayload = selectedEmps.map((emp: any) => ({
          employeeId: emp.employeeId,
          newManagerId: ManagerId,
          effectiveDate: new Date(effectiveDate).toISOString(),
          createdBy: loggedInId,
          createdAt: new Date().toISOString(),
          updatedBy: loggedInId,
          updatedAt: new Date().toISOString(),
          reportingType: 'RM',
          reportingEmployeeId: selectedempId
        }));
        this.http.postdata('EmployeeReportingHistory/CreateReportingHistory', historyPayload).subscribe({
          error: (err: any) => console.error('History API error:', err)
        });
        this.activeTab = 'RM';
        this.conformationPopup.openSuccessModal('Reporting manager updated successfully');
        this.assignForm.reset();
        this.employees = [];
        setTimeout(()=>
          this.getReportingHistory()
        ,100)

      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal(err?.error?.Message || 'Reporting manager update failed');
      }
    });
  }

  private assignTM(): void {
    const selectedEmps: any[] = this.assignForm.get('selectedEmployees')?.value ?? [];
    const employeeIds: number[] = selectedEmps.map((emp: any) => emp.employeeId);
    const effectiveDate = this.assignForm.get('effectiveDate')?.value;
    const deptId = this.assignForm.get('department')?.value?.sno;
    const deptName = this.assignForm.get('department')?.value?.departmentName;
    const teamName = this.assignForm.get('team')?.value?.subdepartmentName;
    const teamManagerName = this.assignForm.get('teamManagerName')?.value;
    const subDeptId = this.assignForm.get('team')?.value?.subdepartmentId;
    const loggedInId = this.empinfo?.employeeId;
    const selectedempId = this.personalinfo?.employeeId;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}&DeptId=${deptId}&SubdeptId=${subDeptId}`;
    this.subscription = this.http.postText(url, employeeIds).subscribe({
      next: () => {
        const historyPayload = selectedEmps.map((emp: any) => ({
          employeeId: emp.employeeId,
          newManagerId: this.teammangerid,
          effectiveDate: new Date(effectiveDate).toISOString(),
          createdBy: loggedInId,
          createdAt: new Date().toISOString(),
          updatedBy: loggedInId,
          updatedAt: new Date().toISOString(),
          reportingType: 'TM',
          reportingEmployeeId: selectedempId
        }));
        this.http.postdata('EmployeeReportingHistory/CreateReportingHistory', historyPayload).subscribe({
          error: (err: any) => console.error('History API error:', err)
        });
        this.activeTab = 'TM';
        this.conformationPopup.openSuccessModal('Team manager updated successfully');
        this.assignForm.reset();
        this.teamDropdownValues = [];
        this.teammangerid = null;
        this.employees = [];
        this.getReportingHistory();
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal(err?.error?.Message || 'Team manager update failed');
      }
    });
  }

  get activeRecordsCount(): number {
    return this.activeTab === 'TM' ? this.tmRecords.length : this.rmRecords.length;
  }

  onNext() {
    this.router.navigate(['/personalinfo/job/employmentType/initate-offboarding/employee-off-boarding']);
  }

  onChangeManager(record: any) {
    this.selectedChangeAssignment = record;
    this.changeModalTeamDropdown = [];
    this.changeModalTeamManagerId = null;
    this.changeModalForm.reset();

    const effectiveDateStr = record.effectiveDate ? record.effectiveDate.split('T')[0] : null;

    if (record.reportingType === 'RM') {
      const preselectedManager = this.managers.find(m => m.employeeId === record.newManagerId) ?? null;
      this.changeModalForm.patchValue({
        effectiveDate: effectiveDateStr,
        newReportingManager: preselectedManager
      });
      this.modalService.open(this.changeManagerModal, { centered: true, backdrop: 'static', size: 'lg' });
    } else if (record.reportingType === 'TM') {
      const deptId = record.empJobData?.departmentId;
      // Load teams for the pre-populated department, then set team and manager
      if (deptId) {
        const preselectedDept = this.departmentDetails.find(d => d.sno === deptId) ?? null;
        this.changeModalForm.patchValue({ effectiveDate: effectiveDateStr, department: preselectedDept });
        this.http.getData(`Subdepartments/Getnames/${deptId}`).subscribe({
          next: (data: any) => {
            this.changeModalTeamDropdown = data || [];
            const preselectedTeam = this.changeModalTeamDropdown.find(
              (t: any) => t.subdepartmentId === record.empJobData?.subdepartmentId
            ) ?? null;
            if (preselectedTeam) {
              this.changeModalForm.patchValue({ team: preselectedTeam });
              // Load team manager for the pre-selected team
              this.http.getData(`Subdepartments/${preselectedTeam.subdepartmentId}`).subscribe({
                next: (sd: any) => {
                  if (Array.isArray(sd) && sd.length > 0) {
                    const mgr = sd[0];
                    this.changeModalTeamManagerId = mgr.reportingmanagerId;
                    const mgrName = mgr.middleName
                      ? `${mgr.firstName} ${mgr.middleName} ${mgr.lastName}`
                      : `${mgr.firstName} ${mgr.lastName}`;
                    this.changeModalForm.patchValue({ teamManagerName: mgrName });
                  }
                },
                error: () => {}
              });
            }
            this.modalService.open(this.changeManagerModal, { centered: true, backdrop: 'static', size: 'lg' });
          },
          error: () => {
            this.changeModalTeamDropdown = [];
            this.modalService.open(this.changeManagerModal, { centered: true, backdrop: 'static', size: 'lg' });
          }
        });
      } else {
        this.changeModalForm.patchValue({ effectiveDate: effectiveDateStr });
        this.modalService.open(this.changeManagerModal, { centered: true, backdrop: 'static', size: 'lg' });
      }
    }
  }

  onModalDepartmentChange(selectedDepartment: any): void {
    this.changeModalForm.patchValue({ team: null, teamManagerName: null });
    this.changeModalTeamDropdown = [];
    this.changeModalTeamManagerId = null;
    const id = selectedDepartment?.sno;
    if (!id) return;
    this.http.getData(`Subdepartments/Getnames/${id}`).subscribe({
      next: (data: any) => { this.changeModalTeamDropdown = data || []; },
      error: () => { this.changeModalTeamDropdown = []; }
    });
  }

  onModalSubDepartmentChange(selectedSubDepartment: any): void {
    this.changeModalForm.patchValue({ teamManagerName: null });
    this.changeModalTeamManagerId = null;
    const id = selectedSubDepartment?.subdepartmentId;
    if (!id) return;
    this.http.getData(`Subdepartments/${id}`).subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const manager = data[0];
          this.changeModalTeamManagerId = manager.reportingmanagerId;
          const name = manager.middleName
            ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
            : `${manager.firstName} ${manager.lastName}`;
          this.changeModalForm.patchValue({ teamManagerName: name });
        }
      },
      error: () => { this.changeModalForm.patchValue({ teamManagerName: null }); }
    });
  }

  get isModalFormValid(): boolean {
    const type = this.selectedChangeAssignment?.reportingType;
    const effectiveDate = this.changeModalForm.get('effectiveDate')?.value;
    if (!effectiveDate) return false;
    if (type === 'RM') return !!this.changeModalForm.get('newReportingManager')?.value;
    if (type === 'TM') return !!this.changeModalTeamManagerId;
    return false;
  }

  onAssignChange(): void {
    if (!this.isModalFormValid) return;
    const record = this.selectedChangeAssignment;
    const effectiveDate = this.changeModalForm.get('effectiveDate')?.value;
    const loggedInId = this.empinfo?.employeeId;
    const selectedempId = this.personalinfo?.employeeId;

    if (record.reportingType === 'RM') {
      const manager = this.changeModalForm.get('newReportingManager')?.value;
      const jobData = record.empJobData ?? {};
      const requestBody = [{
        id: jobData.id ?? 0,
        employeeId: record.employeeId,
        firstName: jobData.fName ?? record.employeeName,
        middleName: jobData.mName ?? '',
        lastName: jobData.lName ?? '',
        jobRole: jobData.jobRole ?? '',
        workEmail: record.workEmail ?? '',
        contactnumber: record.contactnumber ?? 0,
        effectiveDate:effectiveDate
      }];
      this.http.postText(`JobDetails/joblist/updater?ManagerId=${manager.employeeId}`, requestBody).subscribe({
        next: () => {
          const historyPayload = {
            id: record.id,
            employeeId: record.employeeId,
            oldManagerId: record.newManagerId,
            newManagerId: manager.employeeId,
            effectiveDate: new Date(effectiveDate).toISOString(),
            changeReason: '',
            createdBy: loggedInId,
            createdAt: new Date().toISOString(),
            updatedBy: loggedInId,
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            reportingType: 'RM',
            reportingEmployeeId: selectedempId
          };
          this.http.putData(`EmployeeReportingHistory/UpdateReportingHistory/${record.id}`, historyPayload).subscribe({
            error: (err: any) => console.error('History update error:', err)
          });
          this.modalService.dismissAll();
          setTimeout(() => this.conformationPopup.openSuccessModal('Reporting manager updated successfully'), 150);
          this.getReportingHistory();
        },
        error: (err: any) => this.conformationPopup.openErrorModal(err?.error?.Message || 'Update failed')
      });
    } else if (record.reportingType === 'TM') {
      const deptId = this.changeModalForm.get('department')?.value?.sno;
      const subDeptId = this.changeModalForm.get('team')?.value?.subdepartmentId;
      const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.changeModalTeamManagerId}&effectiveDate=${effectiveDate}&DeptId=${deptId}&SubdeptId=${subDeptId}`;
      this.http.postText(url, [record.employeeId]).subscribe({
        next: () => {
          const historyPayload = {
            id: record.id,
            employeeId: record.employeeId,
            oldManagerId: record.newManagerId,
            newManagerId: this.changeModalTeamManagerId,
            effectiveDate: new Date(effectiveDate).toISOString(),
            changeReason: '',
            createdBy: loggedInId,
            createdAt: new Date().toISOString(),
            updatedBy: loggedInId,
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            reportingType: 'TM',
            reportingEmployeeId: selectedempId
          };
          this.http.putData(`EmployeeReportingHistory/UpdateReportingHistory/${record.id}`, historyPayload).subscribe({
            error: (err: any) => console.error('History update error:', err)
          });
          this.modalService.dismissAll();
          setTimeout(() => this.conformationPopup.openSuccessModal('Team manager updated successfully'), 150);
          this.getReportingHistory();
        },
        error: (err: any) => this.conformationPopup.openErrorModal(err?.error?.Message || 'Update failed')
      });
    }
  }

  // get activeRecordsCount(): number {
  //   return this.tmRecords.length + this.rmRecords.length;
  // }

  getReportingHistory(): void {
    const employeeId = this.personalinfo?.employeeId;
    if (!employeeId) return;
    this.historyLoading = true;
    this.http.getData(`EmployeeReportingHistory/GetReportingHistoryByEmployeeId?employeeId=${employeeId}`).subscribe({
      next: (res: any) => {
        const data: any[] = res?.data || [];
        this.tmRecords = data.filter((r: any) => r.reportingType === 'TM');
        this.rmRecords = data.filter((r: any) => r.reportingType === 'RM');
        this.historyLoading = false;
      },
      error: () => { this.historyLoading = false; }
    });
  }

  getManagers(): void {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
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
      error: (err) => console.error('Error fetching managers:', err)
    });
  }

  navigationtoPrevious(){
    this.router.navigate(['/personalinfo/job/employmentType/approval-requests/no-approvals-screen']);
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
