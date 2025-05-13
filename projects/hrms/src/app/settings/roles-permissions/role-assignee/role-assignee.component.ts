import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { IRoles } from '../permissions/permission.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserRoleInfo } from './assigne-users.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { IActiveEmployee } from './active-employees.model';
import { SelectModule } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { SettingsRolePermissionsModuleTabsComponent } from "../../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-role-assignee',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MultiSelectModule, SelectModule, DataLoaderContentComponent, NoDataFoundComponent,
    SettingsRolePermissionsModuleTabsComponent, TranslateModule
  ],
  templateUrl: './role-assignee.component.html',
  styleUrl: './role-assignee.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class RoleAssigneeComponent implements OnInit, OnDestroy {
  roleId: string | undefined;
  userId: number | undefined;
  selectedUsersCount!: number;
  customLabelTemplate: string | undefined;
  selectedRole: IRoles | undefined;
  usersList: IActiveEmployee[] = [];
  createAssigneeForm!: FormGroup;
  roleAssigneeUsers: IUserRoleInfo[] = [];
  roles: IRoles[] = [];
  dataLoad= false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('confirmationModal') confirmationModal: TemplateRef<any> | undefined;
  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.getAllroles();
    this.getUsers();
    this.intializeForm();
  }

  intializeForm() {
    this.createAssigneeForm = this.fb.group({
      selected_user: [null, [Validators.required]],
    });
  }

  getAllroles(): void {
    this.http.getData('FusionRole').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.roles = data as IRoles[];
        if (this.roles.length > 0) {
          this.onRoleClick(this.roles[0]);
        }
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
        this.usersList = res.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          };
        });
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

  onRoleClick(role: IRoles) {
    this.createAssigneeForm.get('selected_user')?.reset();
    this.roleId = role.id;
    this.getUsersByRoleId(role.id);
    this.selectedRole = role;
  }

  getUsersByRoleId(id: any) {
    this.dataLoad= true;
    this.http.getData(`FusionRole/roleAssigneeByRoleId/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.roleAssigneeUsers = response;
        },
        error: (error: any) => {
          this.dataLoad= false;
          this.modal.openErrorModal(error.error.message ? error.error.message : 'Failed to load users');
        },
        complete: () => {
          this.dataLoad= false;
        }
      });
  }

  createAssignee(form: FormGroup) {
    if (form.invalid) {
      return;
    }
    const payload = {
      employeeId: form.value.selected_user.employeeId,
      roleId: this.roleId,
    };
    this.http.postdata('FusionRole/roleAssignees', payload).subscribe({
      next: (data: any) => {
        this.modal.openSuccessModal('Assignee Added Successfully');
      },
      error: (err) => {
        this.modal.openErrorModal('Assignee Assignment Failed');
      },
      complete: () => {
        this.createAssigneeForm.reset();
        this.getUsersByRoleId(this.roleId);
      }
    });
  }

  onUserClick(user: IUserRoleInfo) {
    this.userId = user.employeeId;
    this.modalService.open(this.confirmationModal, { centered: true, backdrop: 'static', keyboard: false });
  }

  removeAssignee() {
    const payload = {
      employeeId: this.userId,
      roleId: this.roleId,
    };
    this.http.postdata('FusionUser/deleteFusionUserRolesByEmployeeId&RoleId', payload).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Assignee Removed Successfully');
      },
      error: (err: any) => {
        this.modalService.dismissAll();
        this.modal.openErrorModal('Assignee Removal Failed');
      },
      complete: () => {
        this.getUsersByRoleId(this.roleId);
        this.userId = undefined;
      }
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
