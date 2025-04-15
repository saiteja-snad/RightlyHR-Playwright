import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Termination } from './terminationModule';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-termination',
  imports: [CommonModule,ReactiveFormsModule, TranslateModule],
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
  terminationdata = {} as Termination;
  selectedId: number | null = null;
  selectedDeleteTermination: any = null;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
  ) {

  }
  ngOnInit(): void {
    this.ExistForm = this.fb.group({

      TERMINATION: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      TERMINATION: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getTermination();
  }

  getTermination() {
    this.http.getData('TerminationReason').subscribe((data: any) => {
      this.terminationDetails = data;
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
        this.conformationPopup.openSuccessModal('Exit reason added successfully');
         this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
         this.resetForm();
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
          this.conformationPopup.openSuccessModal('Exit reason updated successfully');
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
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
    this.updateForm.patchValue({ TERMINATION: terminationDATA.reason });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  opendelete(termination: any) {
    this.selectedDeleteTermination = termination;
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
        this.conformationPopup.openSuccessModal('Exit reason deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the data');
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
