import { CommonModule } from '@angular/common';
import { Component, model, ViewChild } from '@angular/core';
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
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-department',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent, DataLoaderContentComponent],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent {
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  DepartmentForm!: FormGroup;
  updateForm!: FormGroup;
  DepartmentDetail: any[] = [];
  loading = false;
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
      Department: ['',[ Validators.required, this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)],],
      color : ['']
    });
    this.updateForm = this.fb.group({
      Department: ['', [ Validators.required, this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)],],
      updatecolor : ['']
    });

    this.getDepartment();
  }

  getDepartment() {
    this.loading = true;
    this.http.getData('Department').subscribe((data: any) => {
      this.DepartmentDetail = data.map((dep: any) => ({
      ...dep,
      meta: dep.meta ? JSON.parse(dep.meta) : null
    }));
      this.loading = false;
    }, (error: any) => {  
      this.loading = false;
      console.error(error);
    });
  }
  //ADD
  addDepartment(modal: any) {
    const request: DepartmentData = {
      departmentName: this.DepartmentForm.value.Department.trim(),
      isdeleted: 'Active',
      meta: JSON.stringify({
        graphData: {
          color: this.DepartmentForm.value.color
        }
      })
    };

    this.subscription = this.http.postdata('Department', request).subscribe({
      next: () => {
        this.getDepartment();
        this.conformationPopup.openSuccessModal(
          'Department added successfully'
        );
        modal.close();
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
        meta: JSON.stringify({
          graphData: {
            color: this.updateForm.value.updatecolor
          }
        })
      };

      this.subscription = this.http
        .postdata('Department/UPDATER', request)
        .subscribe({
          next: () => {
            this.getDepartment();
            this.modalService.dismissAll();
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
  close() {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }
  openupdate(departmentlist: any) {  
    this.selectedId = departmentlist.sno;
    this.DepartmentForm.reset();
    this.updateForm.patchValue({ 
      Department: departmentlist.departmentName,
      updatecolor: departmentlist.meta?.graphData?.color || ''
    });
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
       meta : JSON.stringify({
        graphData : {
          color : this.selectedDeleteDep.meta.graphData.color
        }
      })
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

  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }

  closed(modal: any) {
    modal.close();
    this.DepartmentForm.reset();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
