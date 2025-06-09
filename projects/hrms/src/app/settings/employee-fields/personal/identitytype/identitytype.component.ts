import { Component, ViewChild } from '@angular/core';
import { IIdentityType } from './identitytype.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";

@Component({
  selector: 'app-identitytype',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
  templateUrl: './identitytype.component.html',
  styleUrl: './identitytype.component.scss'
})
export class IdentitytypeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  IdentityForm!: FormGroup;
  updateForm!: FormGroup;
  loading = false;
  IdentityDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletetype: any = null;
  subscription!: Subscription;
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
    this.IdentityForm = this.fb.group({
      IdentityType: ['', [Validators.required,this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      IdentityType: ['', [Validators.required, this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });

    this.getIdentityType();
  }

  getIdentityType() {
    this.loading = true;
    this.http.getData('IdentityType').subscribe((data: any) => {
      this.IdentityDetail = data;
      this.loading = false;
    }, (error: any) => {  
      this.loading = false;
      
    });
  }
  //ADD
  addIdentityType() {
    const request: IIdentityType = {
      identityType1: this.IdentityForm.value.IdentityType.trim(),
      isdeleted: false
    };

    this.subscription = this.http.postdata('IdentityType', request).subscribe({
      next: () => {
        this.getIdentityType();
        this.conformationPopup.openSuccessModal('Identity Type added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
        // this.resetForm();
      }
    });
  }
  // UPDATE
  updateIdentity(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IIdentityType = {
        identityType1: this.updateForm.value.IdentityType.trim(),
        isdeleted: false,
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`IdentityType/UPDATER`, request).subscribe({
        next: () => {
          this.getIdentityType();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Identity Type updated successfully');
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
  openupdate(identitylist: any) {
    this.resetForm();
    this.selectedId = identitylist.sno;
    this.updateForm.patchValue({ IdentityType: identitylist.identityType1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(identitylist: any) {
    this.resetForm();
    this.selectedDeletetype = identitylist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletetype) return;

    const deleteRequest: IIdentityType = {
      identityType1: this.selectedDeletetype.identityType1,
      isdeleted: true,
      sno: this.selectedDeletetype.sno
    };

    this.http.postdata('IdentityType/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getIdentityType();
        modal.close();
        this.conformationPopup.openSuccessModal('Identity Type deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletetype = null;
  }

  resetForm() {
    this.IdentityForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
