import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ICompensation } from './compensation-reason.model';
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-compensation-reason',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './compensation-reason.component.html',
  styleUrl: './compensation-reason.component.scss'
})
export class CompensationReasonComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  CompensationForm!: FormGroup;
  updateForm!: FormGroup;
  CompensationReason: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletereason: any = null;
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService
  ) {

  }
  ngOnInit(): void {
    this.CompensationForm = this.fb.group({
      Reason: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      UpdateReason: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getReason();
  }

  getReason() {
    this.http.getData('CompensationReason').subscribe((data: any) => {
      this.CompensationReason = data;
    });
  }
  //ADD
  addReason() {
    const request: ICompensation = {
      reason: this.CompensationForm.value.Reason.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('CompensationReason', request).subscribe({
      next: () => {
        this.getReason();
        this.conformationPopup.openSuccessModal('Compensation reason added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  // UPDATE
  updateReason(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: ICompensation = {
        reason: this.updateForm.value.UpdateReason.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`CompensationReason/UPDATER`, request).subscribe({
        next: () => {
          this.getReason();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Compensation reason updated successfully');
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
  openupdate(reasonList: any) {
    this.selectedId = reasonList.sno;
    this.updateForm.patchValue({ UpdateReason : reasonList.reason });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(reasonList: any) {
    this.selectedDeletereason = reasonList;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletereason) return;

    const deleteRequest: ICompensation = {
      reason: this.selectedDeletereason.reason,
      isdeleted: "void",
      sno: this.selectedDeletereason.sno
    };

    this.http.postdata('CompensationReason/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getReason();
        modal.close();
        this.conformationPopup.openSuccessModal('Compensation reason deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletereason = null;
  }

  resetForm() {
    this.CompensationForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
