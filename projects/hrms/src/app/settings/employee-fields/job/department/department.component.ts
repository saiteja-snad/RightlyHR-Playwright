import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { DepartmentData } from './department-module';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-department',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  DepartmentForm!: FormGroup;
  updateForm!: FormGroup;
  DepartmentDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}
  ngOnInit(): void {
    this.DepartmentForm = this.fb.group({
      Department: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(51),
          Validators.pattern(/^[^\s].*$/)
        ],
      ],
    });
    this.updateForm = this.fb.group({
      Department: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(51),
          Validators.pattern(/^[^\s].*$/)
        ],
      ],
    });

    this.getDepartment();
  }

  getDepartment() {
    this.http.getData('Department').subscribe((data: any) => {
      this.DepartmentDetail = data;
    });
  }
  //ADD
  addDepartment() {
    const request: DepartmentData = {
      departmentName: this.DepartmentForm.value.Department.trim(),
      isdeleted: 'Active',
    };

    this.subscription = this.http.postdata('Department', request).subscribe({
      next: () => {
        this.getDepartment();
        this.conformationPopup.openSuccessModal(
          'Department added successfully'
        );
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }
  // UPDATE
  updateDepartment(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: DepartmentData = {
        departmentName: this.updateForm.value.Department.trim(),
        isdeleted: 'Active',
        sno: this.selectedId,
      };

      this.subscription = this.http
        .postdata('Department/UPDATER', request)
        .subscribe({
          next: () => {
            this.getDepartment();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal(
              'Department updated successfully'
            );
          },
          error: (err: any) => {
            const errorMessage = err.error?.Message;
            this.conformationPopup.openErrorModal(
              errorMessage
            );
          },
        });
    }
  }
  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(departmentlist: any) {
    this.selectedId = departmentlist.sno;
    this.DepartmentForm.reset();
    this.updateForm.patchValue({ Department: departmentlist.departmentName });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  // DELETE
  opendelete(bussinessdetails: any) {
    this.selectedDeleteDep = bussinessdetails;
    this.DepartmentForm.reset();
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteDep) return;

    const deleteRequest: DepartmentData = {
      departmentName: this.selectedDeleteDep.departmentName,
      isdeleted: 'void',
      sno: this.selectedDeleteDep.sno,
    };

    this.http.postdata('Department/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getDepartment();
        modal.close();
        this.conformationPopup.openSuccessModal(
          'Department deleted successfully'
        );
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteDep = null;
  }

  resetForm() {
    this.DepartmentForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
