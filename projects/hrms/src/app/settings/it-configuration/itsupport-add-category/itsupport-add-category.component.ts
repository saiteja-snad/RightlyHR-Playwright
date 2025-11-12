import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SettingsLoaderComponent } from '../../../shared/settings-loader/settings-loader.component';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-itsupport-add-category',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent, NoDataFoundComponent],
  templateUrl: './itsupport-add-category.component.html',
  styleUrl: './itsupport-add-category.component.scss'
})

export class ItsupportAddCategoryComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  categoryForm!: FormGroup;
  updateForm!: FormGroup;
  categoryDetails: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  subscription!: Subscription;
  loader = false;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService,
    private conformationPopup: OpenModalService, public formValidations: FormValidationsService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });
    this.updateForm = this.fb.group({
      categoryName: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });
    this.getcategoryName();
  }

  //get category
  getcategoryName() {
    this.loader = true;
    this.subscription = this.http.getData('entityAttributeValues/getv1?entity=ItSupport&attribute=Category').subscribe({
      next: (data: any) => {
        this.loader = false;
        this.categoryDetails = data;
      },
      error: (error: any) => {
        this.loader = false;
      }
    });
  }

  //ADD
  addcategoryName() {
    const request: any = {
      entity: 'ItSupport',
      attribute: 'Category',
      value: this.categoryForm.value.categoryName.trim(),
    };
    this.subscription = this.http.postdata('entityAttributeValues', request).subscribe({
      next: () => {
        this.getcategoryName();
        this.conformationPopup.openSuccessModal('Category added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  // UPDATE
  updatecategoryName(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: any = {
        id: this.selectedId,
        value: this.updateForm.value.categoryName.trim(),
      };
      this.subscription = this.http.postdata('entityAttributeValues/update', request).subscribe({
        next: () => {
          this.getcategoryName();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Category updated successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }

  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }

  openupdate(categoryNamelist: any) {
    this.selectedId = categoryNamelist.id;
    this.categoryForm.reset();
    this.updateForm.patchValue({ categoryName: categoryNamelist.value });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  // DELETE
  opendelete(categoryNamelist: any) {
    this.categoryForm.reset();
    this.selectedDeleteDep = categoryNamelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    if (!this.selectedDeleteDep) return;
    const deleteRequest: any = {
      categoryName1: this.selectedDeleteDep.categoryName1,
      isdeleted: "void",
      sno: this.selectedDeleteDep.sno
    };
    this.http.postdata('categoryName/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getcategoryName();
        modal.close();
        this.conformationPopup.openSuccessModal('Job type deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteDep = null;
  }

  resetForm() {
    this.categoryForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}