import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../services/auth.service';
import { IActiveEmployee } from '../../../roles-permissions/role-assignee/active-employees.model';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { Skeleton } from 'primeng/skeleton';
import { IProjectAuthority } from '../../models/project-authority.modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
@Component({
  selector: 'app-signature-authority',
  imports: [CommonModule, Select, TranslateModule, ReactiveFormsModule, NoDataFoundComponent, Skeleton],
  templateUrl: './signature-authority.component.html',
  styleUrl: './signature-authority.component.scss'
})

export class SignatureAuthorityComponent implements OnInit, OnDestroy {
  usersList: IActiveEmployee[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  form!: FormGroup;
  dataLoad = false;
  authrityList: IProjectAuthority[] = [];
  selectedAuthority!: IProjectAuthority;
  spinnerLoader = false;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal,
    private confirmation: OpenModalService,
    public rbac : RbacService) { }

  ngOnInit(): void {
    this.getUsers();
    this.getAuthorityList();
    this.intializeForm();
  }

  getUsers() {
    this.http.getData(`Employeedata/ActiveEmployees`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.usersList = res.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  intializeForm() {
    this.form = this.fb.group({
      selected_user: [null, [Validators.required]],
    });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      this.spinnerLoader = true;
      const formData = form.value;
      let loggedInUser = this.authService.getToken();
      const payload = {
        employeeId: formData.selected_user.employeeId,
        createdBy: loggedInUser.employeeId,
        isActive: true,
        entityType: 'Project',
      }
      this.http.postdata('ProjectManagementAuthority', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.spinnerLoader = false;
          this.confirmation.openSuccessModal('Signature authority added successfully');
        },
        error: (err) => {
          this.spinnerLoader = false;
          this.confirmation.openErrorModal(err?.error?.Message || 'Something went wrong');
        },
        complete: () => {
          this.form.reset();
          this.getAuthorityList();
        }
      });
    }
  }

  getAuthorityList() {
    this.dataLoad = true;
    this.http.getData(`ProjectManagementAuthority?status=active&entity=Project`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.dataLoad = false;
        this.authrityList = res.data;
      },
      error: (err) => {
        console.log(err);
        this.dataLoad = false;
      }
    });
  }

  openDeleteModal(content: any, authority: IProjectAuthority) {
    this.selectedAuthority = authority;
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }

  deleteAuthority() {
    let loggedInUser = this.authService.getToken();
    this.spinnerLoader = true;
    const payload = {
      id: this.selectedAuthority.id,
      isActive: false,
      updatedBy: loggedInUser.employeeId
    }
    this.http.putData(`ProjectManagementAuthority/${this.selectedAuthority.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        this.confirmation.openSuccessModal('Signature authority deleted successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.confirmation.openErrorModal(err?.error?.Message || 'Something went wrong');
      },
      complete: () => {
        this.getAuthorityList();
        this.selectedAuthority = {} as IProjectAuthority;
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