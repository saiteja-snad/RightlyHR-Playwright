import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IDepartment, INoDue } from './no-due.model';
import { CommonModule } from '@angular/common';
import { IRoles } from '../../roles-permissions/permissions/permission.model';
import { IActiveEmployee } from '../../roles-permissions/role-assignee/active-employees.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-no-due-clearance-configurations',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule, SelectModule, MultiSelectModule],
  templateUrl: './no-due-clearance-configurations.component.html',
  styleUrl: './no-due-clearance-configurations.component.scss'
})
export class NoDueClearanceConfigurationsComponent implements OnInit, OnDestroy {
  noDueForm!: FormGroup;
  customLabelTemplate: string | undefined;
  selectedUsersCount!: number;
  employeeData = {} as any;
  noDueList: INoDue[] = [];
  roles: IRoles[] = [];
  departmentList: IDepartment[] = [];
  usersList: IActiveEmployee[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  managerOptions = [
    { label: 'Reporting Manager', value: 'RM' },
    { label: 'Team Manager', value: 'TM' }
  ];

  constructor(
    private modalService: NgbModal,
    private http: HttpService,
    private fb: FormBuilder,
    private modal: OpenModalService,
    public rbac: RbacService,
  ) { }

  ngOnInit(): void {
    this.employeeData = JSON.parse(localStorage.getItem('rightlyHrUser')||'{}')
    this.getAllNoDues();
    
  }

  getAllNoDues() {
    this.http.getData('NoDueCleranceConfiguration').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.noDueList = res as INoDue[];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openModal(content: any) {
    this.intializeForm();
    this.watchTypeChange();
    this.getAllRoles();
    this.getAllDepartments();
    this.getUsers();
    this.modalService.open(content,
      { centered: true, size: 'lg', backdrop: 'static' });
  }


  intializeForm() {
    this.noDueForm = this.fb.group({
      selectedType: ['', Validators.required],
      department: [''],
      managerType: [''],
      selectedEmpRole: [''],
      role: [''],
      employee: [''],
    });
  }

  getAllRoles(): void {
    this.http.getData('FusionRole').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.roles = data as IRoles[]
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  getAllDepartments(): void {
    this.http.getData('Department').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.departmentList = data as IDepartment[]
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  getUsers() {
    const payload = {
      status: 'Active'
    };
    this.http.getData(`Employeedata/getAll?status=${payload.status}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.usersList = res.map((user: any) => ({
          ...user,
          fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
        }));
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  selectedUserDetails(event: any) {
    this.selectedUsersCount = event.length;
    if (this.selectedUsersCount > 0) {
      this.customLabelTemplate = `${this.selectedUsersCount} ${this.selectedUsersCount === 1 ? 'user' : 'users'} selected`;
    } else {
      this.customLabelTemplate = 'Select Users';
    }
  }

  watchTypeChange() {
    const deptControl = this.noDueForm.get('department');
    const managerControl = this.noDueForm.get('managerType');

    const roleControl = this.noDueForm.get('role');
    const employeeControl = this.noDueForm.get('employee');

    this.noDueForm.get('selectedType')?.valueChanges.subscribe(value => {
      if (value === 'DEPT') {
        deptControl?.setValidators(Validators.required);
        managerControl?.clearValidators();
        managerControl?.reset();

      } else if (value === 'EMPMNGR') {
        managerControl?.setValidators(Validators.required);
        deptControl?.clearValidators();
        deptControl?.reset();
        roleControl?.reset();
        employeeControl?.reset();
        this.noDueForm.get('selectedEmpRole')?.reset();
      }

      deptControl?.updateValueAndValidity();
      managerControl?.updateValueAndValidity();
    });

    this.noDueForm.get('selectedEmpRole')?.valueChanges.subscribe(value => {
      if (value === 'EMPLOYEE') {
        employeeControl?.setValidators(Validators.required);
        employeeControl?.clearValidators();
        roleControl?.reset();
      } else if (value === 'ROLE') {
        roleControl?.setValidators(Validators.required);
        roleControl?.clearValidators();
        employeeControl?.reset();
      }

      roleControl?.updateValueAndValidity();
      employeeControl?.updateValueAndValidity();
    });
  }

  addNoDue(form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
  
    const formValues = this.noDueForm.value;
    const currentDate = new Date().toISOString();
    let authorityEntity = '';
    let authorityEntityValue = '';
    const postData: any = {
      moduleId: 16,
      status: 'Published'.toString(),
      createdBy: this.employeeData.employeeId,
      updatedBy: this.employeeData.employeeId,
      createdAt: currentDate,
      updatedAt: currentDate,
      approverType: formValues.selectedType.toString(),
    };
  
    if (formValues.selectedType === 'DEPT') {
      authorityEntity = 'DEPT'.toString();
  
      postData.departmentId = formValues.department?.sno;
  
      if (formValues.selectedEmpRole === 'EMPLOYEE') {
        authorityEntityValue = (formValues.employee || [])
          .map((emp: any) => emp.employeeId)
          .join(',');
      } else if (formValues.selectedEmpRole === 'ROLE') {
        authorityEntityValue = formValues.role?.id ?? '';
      }
  
    } else if (formValues.selectedType === 'EMPMNGR') {
      authorityEntity = 'EMPMNGR'.toString();
      authorityEntityValue = formValues.managerType?.value ?? '';
    }
  
    postData.authorityEntity = authorityEntity;
    postData.authorityEntityValue = authorityEntityValue;
  
    this.http.postdata('NoDueCleranceConfiguration', postData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal('No Due Clearance Added Successfully!');
      },
      error: (err) => {
        this.modal.openErrorModal("Failed to add No Due Clearance");
      },
      complete: () =>{
        this.noDueForm.reset();
        this.getAllNoDues();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
