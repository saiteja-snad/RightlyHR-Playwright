import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IPermissionType, Ipermissions } from '../../../../Interfaces/timoff-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-global-permissions',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule],
  templateUrl: './global-permissions.component.html',
  styleUrl: './global-permissions.component.scss'
})
export class GlobalPermissionsComponent {
  permissionsType = [] as IPermissionType[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  permissionsForm!: FormGroup;
  permissionUpdateForm!: FormGroup;
  selectedPermission = {} as IPermissionType;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.getPermissionTypes();
    this.fromdataintalition();
  }

  fromdataintalition() {
    this.permissionsForm = this.fb.group({
      name: [null, Validators.required],
    });
    
  }

  getPermissionTypes(): void {
    const params = 'Global Permissions';
    this.http
      .getDatabytype(`PermissionTypes`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.permissionsType = data as IPermissionType[];
        },
        error(err) {
          console.log('errors', err);
        },
      });
  }

  openModal(content: any, selectedPermission: IPermissionType) {
    this.permissionUpdateForm = this.fb.group({
      name: [null, Validators.required],
    });
    this.selectedPermission = selectedPermission;
    this.permissionUpdateForm.patchValue({
      name: selectedPermission.name,
    });
    console.log(this.permissionUpdateForm.value);

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  
  openDeleteModal(content: any, selectedPermission: IPermissionType) {
    this.selectedPermission = selectedPermission;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updatePermission(form: FormGroup) {
    if (form.invalid) {
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace(/(\.\d{3})\d+Z$/, '$1');

    const payload: any = {
      id: this.selectedPermission.id,
      name: this.permissionUpdateForm.value.name,
      isDeleted: this.selectedPermission.isDeleted,
      type: 'Global Permissions',
      createdAt: formattedDate,
      updatedAt: this.selectedPermission.updatedAt,
    };
    console.log(payload);
    this.http
      .put(`PermissionTypes/${this.selectedPermission.id}`, payload, {
        responseType: 'text',
      })
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.permissionsForm.reset();
          this.sharedModalService.openSuccessModal(
            'Global permission updated successfully'
          );
        },
        error: (err) => {
          // this.permissionsForm.reset();
          this.sharedModalService.openErrorModal(err.error);
        },
        complete: () => {
          this.getPermissionTypes();
        },
      });
  }

  addPermission(permissionForm: FormGroup) {
    if (permissionForm.valid) {
      const payload: Ipermissions = {
        name: permissionForm.value.name,
        isDeleted: false,
        type: 'Global Permissions',
      };
      this.http.postdata(`PermissionTypes`, payload).subscribe({
        next: (data: any) => {
          this.permissionsForm.reset();
          this.sharedModalService.openSuccessModal(
            'Global permission added successfully'
          );
        },
        error: (err: any) => {
          this.sharedModalService.openErrorModal(err.error.message);
        },
        complete: () => {
          this.getPermissionTypes();
        },
      });
    }
  }

  deletePermission() {
    this.http.deleteData(`PermissionTypes/${this.selectedPermission.id}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.sharedModalService.openSuccessModal(
          'Global permission deleted successfully'
        );
      },
      error: (err) => {
      this.sharedModalService.openErrorModal(err.error.message);  
      },complete: () => {
        this.getPermissionTypes();
      }
    })

  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
