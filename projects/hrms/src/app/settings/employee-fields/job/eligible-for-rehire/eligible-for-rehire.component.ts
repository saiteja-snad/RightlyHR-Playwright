import { Component, ViewChild } from '@angular/core';
import { IRehire } from './eligible-for-rehire.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-eligible-for-rehire',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './eligible-for-rehire.component.html',
  styleUrl: './eligible-for-rehire.component.scss'
})
export class EligibleForRehireComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  EligibilityForm!: FormGroup;
  updateForm!: FormGroup;
  EligibilityDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteeligibility: any = null;
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations : FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.EligibilityForm = this.fb.group({
      Rehire: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });
    this.updateForm = this.fb.group({
      Rehire: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });

    this.getEligibility();
  }

  getEligibility() {
    this.http.getData('Eligibleforrehire').subscribe((data: any) => {
      this.EligibilityDetail = data;
    });
  }
  //ADD
  addIdentityType() {
    const request: IRehire = {
      eligibleforrehire1: this.EligibilityForm.value.Rehire.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Eligibleforrehire', request).subscribe({
      next: () => {
        this.getEligibility();
        this.conformationPopup.openSuccessModal('Eligibility For Rehire added successfully');
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
  updateEligibility(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IRehire = {
        eligibleforrehire1: this.updateForm.value.Rehire.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`Eligibleforrehire/UPDATER`, request).subscribe({
        next: () => {
          this.getEligibility();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Eligibile For Rehire updated successfully');
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
  openupdate(rehirelist: any) {
    this.selectedId = rehirelist.sno;
    this.EligibilityForm.reset();
    this.updateForm.patchValue({ Rehire: rehirelist.eligibleforrehire1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(rehirelist: any) {
    this.selectedDeleteeligibility = rehirelist;
    this.EligibilityForm.reset();
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteeligibility) return;

    const deleteRequest: IRehire = {
      eligibleforrehire1: this.selectedDeleteeligibility.eligibleforrehire1,
      isdeleted: "void",
      sno: this.selectedDeleteeligibility.sno
    };

    this.http.postdata('Eligibleforrehire/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getEligibility();
        modal.close();
        this.conformationPopup.openSuccessModal('Eligible For Rehire deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteeligibility = null;
  }

  resetForm() {
    this.EligibilityForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
