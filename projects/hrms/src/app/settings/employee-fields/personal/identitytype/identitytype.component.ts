import { Component, ViewChild } from '@angular/core';
import { IIdentityType } from './identitytype.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-identitytype',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './identitytype.component.html',
  styleUrl: './identitytype.component.scss'
})
export class IdentitytypeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  IdentityForm!: FormGroup;
  updateForm!: FormGroup;
  IdentityDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteGender: any = null;
  subscription!: Subscription;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.IdentityForm = this.fb.group({
      IdentityType: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      IdentityType: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getIdentityType();
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
  getIdentityType() {
    this.http.getData('IdentityType').subscribe((data: any) => {
      this.IdentityDetail = data;
    });
  }
  //ADD
  addDepartment() {
    const request: IIdentityType = {
      identityType1: this.IdentityForm.value.IdentityType.trim(),
      isdeleted: true
    };

    this.subscription = this.http.postdata('IdentityType', request).subscribe({
      next: () => {
        this.getIdentityType();
        this.conformationPopup.openSuccessModal('Gender Name added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  // UPDATE
  updateIdentity(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IIdentityType = {
        identityType1: this.updateForm.value.Gender.trim(),
        isdeleted: true,
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`IdentityType/UPDATER`, request).subscribe({
        next: () => {
          this.getIdentityType();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Identity type updated successfully');
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
  openupdate(identitylist: any) {
    this.selectedId = identitylist.sno;
    this.updateForm.patchValue({ Gender: identitylist.genderName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(identitylist: any) {
    this.selectedDeleteGender = identitylist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteGender) return;

    const deleteRequest: IIdentityType = {
      identityType1: this.selectedDeleteGender.genderName,
      isdeleted: false,
      sno: this.selectedDeleteGender.sno
    };

    this.http.postdata('IdentityType/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getIdentityType();
        modal.close();
        this.conformationPopup.openSuccessModal('Gender deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteGender = null;
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
