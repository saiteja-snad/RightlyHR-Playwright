import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { IRoleAndResponsibility } from './roles-and-responsiblities';
import { EditorModule } from 'primeng/editor';
@Component({
  selector: 'app-roles-and-responsibilities',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, EditorModule , NoDataFoundComponent,Select],
  templateUrl: './roles-and-responsibilities.component.html',
  styleUrl: './roles-and-responsibilities.component.scss'
})
export class RolesAndResponsibilitiesComponent implements OnInit,OnDestroy {
 addRolesResForm!: FormGroup;
  updateRolesResForm!: FormGroup;
  RoleAndResDetails: IRoleAndResponsibility[] = [];
  selectedRolesAndRes: IRoleAndResponsibility | undefined;
  jobRoleDetails = [] as any;
  gradeIdValue: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private modalService: NgbModal,
    private http: HttpService,
    private fb: FormBuilder,
    public formValidations: FormValidationsService,
    private conformationPopup: OpenModalService
  ) { }

  ngOnInit(): void {
    this.getRolesAndRes();
    this.initializeForm('add');
    this.getJobrole();
  }

  initializeForm(formType: 'add' | 'update') {
    const formGroup = this.fb.group({
      designationName: ['', [Validators.required]],
      rolesAndResponsibilities: ['', Validators.required],
      jobId:[null]
    });

    if (formType === 'add') {
      this.addRolesResForm = formGroup;
    } else {
      this.updateRolesResForm = formGroup;
    }
  }

  getRolesAndRes() {
    this.http.getData('RolesAndResponsibilites').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.RoleAndResDetails = data as IRoleAndResponsibility[];
      },
    });
  }

  selectgradId(event: any) {
    if (event) {
      this.addRolesResForm.patchValue({
        designationName:event.designationName,
        jobId:event.id
      })
    }
  }

  getJobrole() {
    this.http.getData('DesignationGradeMapper').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.jobRoleDetails = data;
      },
      error: (error) => console.error('Error fetching job roles:', error),
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }

  openUpdate(content: any, selectedData: IRoleAndResponsibility) {
    this.initializeForm('update');
    this.selectedRolesAndRes = selectedData;
    this.patchData();
    this.openModal(content);
  }

  patchData() {
    if (!this.selectedRolesAndRes) return;

     const selectedDesignation = this.jobRoleDetails.find(
       (role: any) =>
         role.id === this.selectedRolesAndRes?.jobId
     );

     this.updateRolesResForm.patchValue({
       jobId: this.selectedRolesAndRes?.jobId,
       designationName: selectedDesignation,
       rolesAndResponsibilities:
         this.selectedRolesAndRes.rolesAndResponsibilitesData,
     });
  }

  openDelete(content: any, selectedData: IRoleAndResponsibility) {
    this.selectedRolesAndRes = selectedData;
    this.openModal(content);
  }

  resetAddForm(){
    this.modalService.dismissAll();
    this.addRolesResForm.reset();
  }

  resetUpdateForm(){
    this.modalService.dismissAll();
    this.updateRolesResForm.reset();
  }

  postRolesAndRes(form: FormGroup) {
    if (this.addRolesResForm.invalid) {
      this.addRolesResForm.markAllAsTouched();
      return;
    }

    const formData = form.value;
    const payload = {
      jobId: formData.jobId,
      jobRoleName: formData.designationName,
      isdeleted: false,
      rolesAndResponsibilitesData: formData.rolesAndResponsibilities,
    };

    this.http.postdata('RolesAndResponsibilites', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Roles and Responsibilities added successfully');
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Failed to add Roles and Responsibilities');
      },
      complete: () => {
        this.addRolesResForm.reset();
        this.getRolesAndRes();
      }
    });
  }

  updateRolesAndRes(form: FormGroup) {
    if (this.updateRolesResForm.invalid) {
      this.updateRolesResForm.markAllAsTouched();
      return;
    }

    const formData = form.value;
    const payload = {
      id: this.selectedRolesAndRes?.id,
      jobId: formData.jobId,
      jobRoleName: formData.designationName.designationName,
      isdeleted: false,
      rolesAndResponsibilitesData: formData.rolesAndResponsibilities,
    };

    this.http.postdata('RolesAndResponsibilites/Update', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Roles and Responsibilities updated successfully');
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Failed to update Roles and Responsibilities');
      },
      complete: () => {
        this.updateRolesResForm.reset();
        this.getRolesAndRes();
        this.selectedRolesAndRes = undefined;
      }
    });
  }

  deleteRoleAndResdata() {
    this.http.getData(`RolesAndResponsibilites/deletebyid/${this.selectedRolesAndRes?.id}`)
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Roles and Responsibilities deleted successfully');
        },
        error: (error) => {
          this.conformationPopup.openErrorModal('Failed to delete Roles and Responsibilities');
        },
        complete: ()=>{
          this.selectedRolesAndRes = undefined;
          this.getRolesAndRes();
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
