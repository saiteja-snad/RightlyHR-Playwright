import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IPermissionType, Ipermissions } from '../../../../Interfaces/timoff-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-attendance-regularization-types',
  imports: [CommonModule, NoDataFoundComponent, ReactiveFormsModule, DataLoaderContentComponent],
  templateUrl: './attendance-regularization-types.component.html',
  styleUrl: './attendance-regularization-types.component.scss'
})
export class AttendanceRegularizationTypesComponent implements OnInit, OnDestroy {
  permissionsType = [] as IPermissionType[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  permissionsForm!: FormGroup;
  permissionUpdateForm!: FormGroup;
  selectedPermission = {} as IPermissionType;
  dataLoad = false;
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
    this.formIntalition();
  }

  formIntalition() {
    this.permissionsForm = this.fb.group({
      name: [null, Validators.required],
    });
    
  }

  getPermissionTypes(): void {
    const params = 'Regularization';
    this.dataLoad = true;
    this.http
      .getDatabytype(`PermissionTypes`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.permissionsType = (data as IPermissionType[])?.sort((a, b) => a.id - b.id);
          this.dataLoad = false;
        },
        error:(err) => {
          console.log('errors', err);
          this.dataLoad = false;
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
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  
  openDeleteModal(content: any, selectedPermission: IPermissionType) {
    this.selectedPermission = selectedPermission;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updateRegularization(form: FormGroup) {
    if (form.invalid) {
      return;
    }
    const now = new Date();
    const formattedDate = now.toISOString().replace(/(\.\d{3})\d+Z$/, '$1');
    const payload: any = {
      id: this.selectedPermission.id,
      name: this.permissionUpdateForm.value.name,
      isDeleted: this.selectedPermission.isDeleted,
      type: 'Regularization',
      createdAt: formattedDate,
      updatedAt: this.selectedPermission.updatedAt,
    };
    console.log(payload);
    this.http
      .put(`PermissionTypes/${this.selectedPermission.id}`, payload, {
        responseType: 'text',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.permissionsForm.reset();
          this.sharedModalService.openSuccessModal(
            'Attendance Regularization type updated successfully'
          );
        },
        error: (err) => {
          
          if(err.error === 'Permission Type already exists'){
            this.sharedModalService.openErrorModal('Attendance regularization type with the same name already exists');
          }else{this.sharedModalService.openErrorModal(err.error);}
          
        },
        complete: () => {
          this.getPermissionTypes();
        },
      });
  }

  addRegularization(permissionForm: FormGroup) {
    if (permissionForm.valid) {
      const payload: Ipermissions = {
        name: permissionForm.value.name,
        isDeleted: false,
        type: 'Regularization',
      };
      this.http.postdata(`PermissionTypes`, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.permissionsForm.reset();
          this.sharedModalService.openSuccessModal(
            'Attendance Regalarization type added successfully'
          );
        },
        error: (err: any) => {
          if(err.error.message === 'Permission type with the same name already exists.'){
            this.sharedModalService.openErrorModal('Attendance regularization type with the same name already exists');
          }else{
            this.sharedModalService.openErrorModal(err.error.message);
          }
          
        },
        complete: () => {
          this.getPermissionTypes();
        },
      });
    }
  }

  deleteRegularization() {
    this.http.deleteData(`PermissionTypes/${this.selectedPermission.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.sharedModalService.openSuccessModal(
          'Attendance Regalarization type deleted successfully'
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
