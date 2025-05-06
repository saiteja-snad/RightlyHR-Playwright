import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
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
  @ViewChild('updatenodue') updatenodue: any;
  @ViewChild('deletepopup') deletepopup: any;
  noDueForm!: FormGroup;
  updateDueForm!: FormGroup;
  customLabelTemplate: string | undefined;
  selectedUsersCount!: number;
  employeeData = {} as any;
  noDueList: INoDue[] = [];
  roles: IRoles[] = [];
  selectedDeleteRole: any = null;
  departmentList: IDepartment[] = [];
  usersList: IActiveEmployee[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  managerOptions = [
    { label: 'Reporting Manager', value: 'RM' },
    { label: 'Team Manager', value: 'TM' }
  ];
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal,
    private http: HttpService,
    private fb: FormBuilder,
    private modal: OpenModalService,
    public rbac: RbacService,
    private conformationPopup: OpenModalService
  ) { }
  currentItem: any;
  ngOnInit(): void {
    this.employeeData = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
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
  intializeForm2() {
    this.updateDueForm = this.fb.group({
      UpdateselectedType: ['', Validators.required],
      Updatedepartment: [''],
      UpdateselectedEmpRole: [''],
      Updateemployee: [],
      role: [''],
      managerType: ['']
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

  // getUsers() {
  //   const payload = {
  //     status: 'Active'
  //   };
  //   this.http.getData(`Employeedata/getAll?status=${payload.status}`).pipe(takeUntil(this.destroy$)).subscribe({
  //     next: (res: any) => {
  //       this.usersList = res.map((user: any) => ({
  //         ...user,
  //         fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
  //       }));

  //       if (this.currentItem) {
  //         this.patchUpdateDueForm(this.currentItem);
  //       }
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   });
  // }
  getUsers(): Promise<any> {
    const payload = {
      status: 'Active'
    };

    return new Promise((resolve, reject) => {
      this.http.getData(`Employeedata/getAll?status=${payload.status}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Process and format users
          this.usersList = res.map((user: any) => ({
            ...user,
            fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
          }));

          // Resolve the promise when users are loaded
          resolve(this.usersList);
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          reject(err);  // Reject if there's an error
        }
      });
    });
  }

  selectedUserDetails(event: any) {
    // this.noDueForm.get('role')?.clearValidators();
    // this.noDueForm.get('selectedType')?.clearValidators();

    this.selectedUsersCount = event?.length;
    if (this.selectedUsersCount > 0) {
      this.customLabelTemplate = `${this.selectedUsersCount} ${this.selectedUsersCount === 1 ? 'user' : 'users'} selected`;
    } else {
      this.customLabelTemplate = 'Select Users';
    }

    console.log(this.noDueForm);

  }

  watchTypeChange() {
    const deptControl = this.noDueForm.get('department');
    const empRoleControl = this.noDueForm.get('selectedEmpRole');
    const managerControl = this.noDueForm.get('managerType');
    const roleControl = this.noDueForm.get('role');
    const employeeControl = this.noDueForm.get('employee');

    this.noDueForm.get('selectedType')?.valueChanges.subscribe(value => {
      if (value === 'DEPT') {
        deptControl?.setValidators(Validators.required);
        empRoleControl?.setValidators(Validators.required);
        managerControl?.clearValidators();
        managerControl?.reset();
      } else if (value === 'EMPMNGR') {
        managerControl?.setValidators(Validators.required);
        deptControl?.clearValidators();
        deptControl?.reset();
        empRoleControl?.clearValidators();
        empRoleControl?.reset();
        roleControl?.reset();
        employeeControl?.clearValidators();
        employeeControl?.reset();

        this.noDueForm.get('selectedEmpRole')?.reset();
      }

      deptControl?.updateValueAndValidity();
      managerControl?.updateValueAndValidity();
    });

    this.noDueForm.get('selectedEmpRole')?.valueChanges.subscribe(value => {
      if (value === 'EMPLOYEE') {
        employeeControl?.setValidators(Validators.required);
        roleControl?.clearValidators();
        roleControl?.reset();
        console.log(this.noDueForm);

      } else if (value === 'ROLE') {
        roleControl?.setValidators(Validators.required);
        employeeControl?.clearValidators();
        employeeControl?.reset();
      }

      roleControl?.updateValueAndValidity();
      employeeControl?.updateValueAndValidity();
    });
  }

  watchTypeupdateChange() {
    const deptControl = this.updateDueForm.get('Updatedepartment');
    const managerControl = this.updateDueForm.get('managerType');

    const roleControl = this.updateDueForm.get('role');
    const employeeControl = this.updateDueForm.get('Updateemployee');

    this.updateDueForm.get('UpdateselectedType')?.valueChanges.subscribe(value => {
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
        this.updateDueForm.get('UpdateselectedEmpRole')?.reset();
      }

      deptControl?.updateValueAndValidity();
      managerControl?.updateValueAndValidity();
    });

    this.updateDueForm.get('UpdateselectedEmpRole')?.valueChanges.subscribe(value => {
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
        this.modal.openSuccessModal('No Due Clearance Added Successfully');
      },
      error: (err) => {
        this.modal.openErrorModal(err.error.message);
      },
      complete: () => {
        this.noDueForm.reset();
        this.getAllNoDues();
      }
    });
  }

  updateNoDue(form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const formValues = this.updateDueForm.value;
    const currentDate = new Date().toISOString();
    let authorityEntity = '';
    let authorityEntityValue = '';
    const postData: any = {
      id: this.currentItem.id,
      moduleId: 16,
      departmentId: this.currentItem.departmentId,
      status: 'Published'.toString(),
      createdBy: this.employeeData.employeeId,
      updatedBy: this.employeeData.employeeId,
      createdAt: currentDate,
      updatedAt: currentDate,
      approverType: formValues.UpdateselectedType.toString(),
    };
    if (formValues.UpdateselectedType === 'DEPT') {
      authorityEntity = 'DEPT'.toString();
      postData.departmentId = formValues.Updatedepartment?.sno;
      if (formValues.UpdateselectedEmpRole === 'EMPLOYEE') {
        authorityEntityValue = (formValues.Updateemployee || [])
          .map((emp: any) => emp.employeeId)
          .join(',');
      } else if (formValues.UpdateselectedEmpRole === 'ROLE') {
        authorityEntityValue = formValues.role?.id ?? '';
      }
    } else if (formValues.UpdateselectedType === 'EMPMNGR') {
      authorityEntity = 'EMPMNGR'.toString();
      authorityEntityValue = formValues.managerType?.value ?? '';
    }
    postData.authorityEntity = authorityEntity;
    postData.authorityEntityValue = authorityEntityValue;
    this.http.putData(`NoDueCleranceConfiguration/UpdateNoDueConfig/${this.currentItem.id}`, postData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal('No Due Clearance Updated Successfully');
      },
      error: (err) => {
        console.log(err);
        this.modal.openErrorModal("Failed to Update No Due Clearance");
      },
      complete: () => {
        this.updateDueForm.reset();
        this.getAllNoDues();
      }
    });
  }

  // Method to open the update modal dialog
  openupdateDialog(item: any) {
    this.currentItem = item;
    this.intializeForm2();
    this.watchTypeupdateChange();
    this.getAllRoles();
    this.getAllDepartments();
    this.getUsers().then(() => {
      this.patchUpdateDueForm(this.currentItem);
    }).catch(err => {
      console.error('Failed to load users:', err);
    });
  }

  patchUpdateDueForm(item: any) {
    const approverEmpRoleValue = item.roleType === 'Employee' ? 'EMPLOYEE' : 'ROLE';
    let selectedEmployees: any[] = [];
    if (item.approverType === 'DEPT' && approverEmpRoleValue === 'EMPLOYEE') {
      const employeeIds = (item.authorityEntityValue || '').split(',').map((id: string) => id.trim());
      selectedEmployees = this.usersList.filter(user => employeeIds.includes(String(user.employeeId)));
    }
    const selectedDepartment = this.departmentList.find(dept => dept.departmentName === item.departmentName) || null;
    const selectedManager = this.managerOptions.find(opt => opt.value === item.authorityEntityValue) || null;
    const selectedRole = this.roles.find(r => r.name.toLowerCase() === item.roleName.toLowerCase()) || null;
    this.updateDueForm.patchValue({
      UpdateselectedType: item.approverType,
      Updatedepartment: selectedDepartment || '',
      UpdateselectedEmpRole: approverEmpRoleValue,
      Updateemployee: selectedEmployees,
      role: approverEmpRoleValue === 'ROLE' ? selectedRole : '',
      managerType: item.approverType === 'EMPMNGR' ? selectedManager : ''
    });

    this.modalService.open(this.updatenodue, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete() {
    if (!this.selectedDeleteRole) return;
    this.subscription = this.http.deleteData(`NoDueCleranceConfiguration/DeleteNoDueConfig/${this.selectedDeleteRole.id}`).subscribe({
      next: (response) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('NoDueClerance deleted successfully');

      },
      error: (error: any) => {
        console.log('Delete failed', error);
        this.conformationPopup.openErrorModal('Insertion of data failed');
      },
      complete: () => {
        this.getAllNoDues();
      }
    });
  }

  closeDelete(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  };

  clearData() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
