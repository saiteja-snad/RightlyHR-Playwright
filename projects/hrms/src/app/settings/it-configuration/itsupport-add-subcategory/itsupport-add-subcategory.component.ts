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
import { SelectModule } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-itsupport-add-subcategory',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, SettingsLoaderComponent, NoDataFoundComponent],
  templateUrl: './itsupport-add-subcategory.component.html',
  styleUrl: './itsupport-add-subcategory.component.scss'
})
export class ItsupportAddSubcategoryComponent {
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  subcategoryForm!: FormGroup;
  updateForm!: FormGroup;
  subCategoryDetails: any[] = [];
  categoryDetails: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  subscription!: Subscription;
  selecteddetails = {} as any;
  loader = false;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.subcategoryForm = this.fb.group({
      categoryId: ['', [Validators.required,]],
      subCategoryname: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]

    });
    this.updateForm = this.fb.group({
      categoryId: ['', [Validators.required,]],
      subCategoryname: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });

    this.getsubcategoryName();
    this.getcategoryName();
  }
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //get category details for dropdown
  getcategoryName() {
    this.loader = true;
    this.subscription = this.http.getData('entityAttributeValues/getv1?entity=ItSupport&attribute=Category').subscribe({
      next: (data: any) => {
        this.loader = false;
        console.log(data);
        this.categoryDetails = data;
      },
      error: (error: any) => {
        this.loader = false;

      }
    });
  }
  //GET sub category details
  getsubcategoryName() {
    this.loader = true;
    this.subscription = this.http.getData('entityAttributeValues/getv1?entity=ItSupport&attribute=SubCategory').subscribe({
      next: (data: any) => {
        this.loader = false;
        // Map through data to convert meta string → object
        this.subCategoryDetails = data.map((item: any) => ({
          ...item,
          meta: item.meta ? JSON.parse(item.meta) : null,
        }));
      },
      error: (error: any) => {
        this.loader = false;

      }
    });
  }

  //ADD
  addcategoryName() {
    console.log(this.subcategoryForm.value);
    const request: any = {
      entity: 'ItSupport',
      attribute: 'SubCategory',
      value: this.subcategoryForm.value.subCategoryname.trim(),
      meta: JSON.stringify(this.subcategoryForm.value?.categoryId)
    };

    this.subscription = this.http.postdata('entityAttributeValues', request).subscribe({
      next: () => {

        this.getsubcategoryName();
        this.modalService.dismissAll();
        this.subcategoryForm.reset()
        this.conformationPopup.openSuccessModal('Sub Category added successfully');

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
        value: this.updateForm.value.subCategoryname.trim(),
        meta: JSON.stringify(this.updateForm.value?.categoryId)
      };

      this.subscription = this.http.postdata('entityAttributeValues/update', request).subscribe({
        next: () => {
          this.getsubcategoryName();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Sub Category updated successfully');
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
    console.log(categoryNamelist);
    const selectedCategory = this.categoryDetails.find(
      (c: any) => c.id === categoryNamelist.meta?.id
    );
    this.selectedId = categoryNamelist.id;
    this.subcategoryForm.reset();
    this.updateForm.patchValue({
      categoryId: selectedCategory ? selectedCategory : '',
      subCategoryname: categoryNamelist.value
    });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(categoryNamelist: any) {
    this.subcategoryForm.reset();
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
        this.getsubcategoryName();
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
    this.subcategoryForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
