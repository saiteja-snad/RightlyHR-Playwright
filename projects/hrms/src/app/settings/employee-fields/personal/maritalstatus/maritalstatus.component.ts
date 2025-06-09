import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IMaritialStatus } from './maritalstatus.model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";

@Component({
  selector: 'app-maritalstatus',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
  templateUrl: './maritalstatus.component.html',
  styleUrl: './maritalstatus.component.scss'
})
export class MaritalstatusComponent {

  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  MaritalStatusForm!: FormGroup;
  updateForm!: FormGroup;
  MaritalStatusDetail: any[] = [];
  loading = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletestatus: any = null;
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
    this.MaritalStatusForm = this.fb.group({
      MaritalStatus: ['', [
        Validators.required,
        this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)
      ]]
    });
    this.updateForm = this.fb.group({
      MaritalStatus: ['', [
        Validators.required,
        this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)
      ]]
    });

    this.getMaritialStatus();
  }

  getMaritialStatus() {
    this.loading = true;
    this.http.getData('Maritalstatus').subscribe((data: any) => {
      this.MaritalStatusDetail = data;
      this.loading = false;
    }
      , (error: any) => {
        this.loading = false;
        console.error(error);
      });

  }
  //ADD
  addMaritalStatus() {
    const request: IMaritialStatus = {
      maritalstatus1: this.MaritalStatusForm.value.MaritalStatus.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Maritalstatus', request).subscribe({
      next: () => {
        this.getMaritialStatus();
        this.conformationPopup.openSuccessModal('Marital Status added successfully');
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
  updateMaritalStatus(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IMaritialStatus = {
        maritalstatus1: this.updateForm.value.MaritalStatus.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`Maritalstatus/UPDATER`, request).subscribe({
        next: () => {
          this.getMaritialStatus();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Marital Status updated successfully');
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
  openupdate(maritalStatus: any) {
    this.resetForm();
    this.selectedId = maritalStatus.sno;
    this.updateForm.patchValue({ MaritalStatus: maritalStatus.maritalstatus1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(maritalStatus: any) {
    this.resetForm();
    this.selectedDeletestatus = maritalStatus;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletestatus) return;

    const deleteRequest: IMaritialStatus = {
      maritalstatus1: this.selectedDeletestatus.maritalstatus1,
      isdeleted: "void",
      sno: this.selectedDeletestatus.sno
    };

    this.http.postdata('Maritalstatus/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getMaritialStatus();
        modal.close();
        this.conformationPopup.openSuccessModal('Marital Status deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletestatus = null;
  }

  resetForm() {
    this.MaritalStatusForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
