import { Component, ViewChild } from '@angular/core';
import { IRehire } from './eligible-for-rehire.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';

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
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.EligibilityForm = this.fb.group({
      Rehire: ['', [Validators.required], Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]
    });
    this.updateForm = this.fb.group({
      Rehire: ['', [Validators.required], Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]
    });

    this.getEligibility();
  }
  // alphabet allowed only
  blockNonAlphabets(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    const char = String.fromCharCode(event.keyCode);
    // const pattern = /^[a-zA-Z][a-zA-Z ]*$/;
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    // if (!pattern.test(inputChar)) {
    //   event.preventDefault(); // blocks numbers or symbols
    // }
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
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
        this.conformationPopup.openSuccessModal('Eligibility for rehire added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
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
          this.conformationPopup.openSuccessModal('Eligibile for rehire updated successfully');
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
  openupdate(rehirelist: any) {
    this.selectedId = rehirelist.sno;
    this.updateForm.patchValue({ Rehire: rehirelist.eligibleforrehire1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(rehirelist: any) {
    this.selectedDeleteeligibility = rehirelist;
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
        this.conformationPopup.openSuccessModal('Eligible for rehire deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
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
