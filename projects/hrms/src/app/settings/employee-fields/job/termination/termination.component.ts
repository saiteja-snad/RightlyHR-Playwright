import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Termination } from './terminationModule';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";

@Component({
  selector: 'app-termination',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
  templateUrl: './termination.component.html',
  styleUrl: './termination.component.scss'
})
export class TerminationComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  ExistForm!: FormGroup;
  updateForm!: FormGroup;
  subscription: any;
  terminationDetails: any[] = [];
  loader = false;
  terminationdata = {} as Termination;
  selectedId: number | null = null;
  selectedDeleteTermination: any = null;
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
    this.ExistForm = this.fb.group({

      TERMINATION: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      TERMINATION: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]
    });

    this.getTermination();
  }

  getTermination() {
    this.loader = true;
    this.http.getData('TerminationReason').subscribe((data: any) => {
      this.terminationDetails = data;
      this.loader = false;
    }, (error: any) => {
      this.loader = false;
  
    });
  }

  //ADD
  addTerminationReason() {
    const request: Termination = {
      reason: this.ExistForm.value.TERMINATION.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('TerminationReason', request).subscribe({
      next: () => {
        this.getTermination();
        this.conformationPopup.openSuccessModal('Exit Reason added successfully');
         this.resetForm();
      },
      error: (error: any) => {
          const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }
  // UPDATE
  updateTermination(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: Termination = {
        reason: this.updateForm.value.TERMINATION.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata('TerminationReason/UPDATER', request).subscribe({
        next: () => {
          this.getTermination();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Exit Reason updated successfully');
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
  openupdate(terminationDATA: any) {
    this.selectedId = terminationDATA.sno;
    this.ExistForm.reset();
    this.updateForm.patchValue({ TERMINATION: terminationDATA.reason });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  opendelete(termination: any) {
    this.selectedDeleteTermination = termination;
    this.ExistForm.reset();
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  onDelete(modal: any) {
    if (!this.selectedDeleteTermination) return;

    const deleteRequest: Termination = {
      reason: this.selectedDeleteTermination.reason,
      isdeleted: "void",
      sno: this.selectedDeleteTermination.sno

    };

    this.http.postdata('TerminationReason/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getTermination();
        modal.close();
        this.conformationPopup.openSuccessModal('Exit Reason deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteTermination = null;
  }

  resetForm() {
    this.ExistForm.reset();
    // this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
