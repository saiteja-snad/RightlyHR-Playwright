import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRoles } from '../permissions/permission.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserRoleInfo } from './assigne-users.model';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-role-assignee',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MultiSelectModule],
  templateUrl: './role-assignee.component.html',
  styleUrl: './role-assignee.component.scss'
})
export class RoleAssigneeComponent implements OnInit, OnDestroy {
  selectedRole: IRoles | undefined;
  usersList!: any;
  roleId: string | undefined;
  userId: number | undefined;
  createAssigneeForm!: FormGroup;
  roleAssigneeUsers: IUserRoleInfo[] = [];
  roles: IRoles[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
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
        console.log(data);
        this.roles = data as IRoles[]
        console.log(this.roles)
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
  

  selectedUsersCount!: any;
  customLabelTemplate!: string;
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

  getUsersByRoleId(id: any, page?: number, pageSize?: number, searchTerm?: string) {
    this.http.getData(`FusionRole/roleAssigneeByRoleId/${this.roleId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.roleAssigneeUsers = response;
        },
        error: (error: any) => {
          console.log(error);
        }
      });
  }

  createAssignee(form: FormGroup) {
    if (form.invalid) {
      return;
    }
    const datalist: any = form.value.selected_user;
    const user_ids: any = [];
    datalist.forEach((t: any) => {
      user_ids.push(t.employeeId);
    });
    const payload = {
      employeeId: user_ids,
      roleId: this.roleId,
    };
    this.http.postdata('FusionRole/roleAssignees', payload).subscribe({
      next: (data: any) => {
      },
      error: (err) => {
        this.createAssigneeForm.reset();
      },
      complete: () => {
        this.createAssigneeForm.reset();
        this.getUsersByRoleId(this.roleId);
      }
    });
  }

  onUserClick(user: IUserRoleInfo) {
    console.log(user);
    this.userId = user.employeeId;
    console.log(this.userId);
    this.removeAssignee();
  }

  removeAssignee() {
    const payload = {
      employeeId: this.userId,
      roleId: this.roleId,
    };
    this.http.postdata('FusionRole/roleAssignees', payload).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.getUsersByRoleId(this.roleId);
        this.userId = undefined;
        this.roleId = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
