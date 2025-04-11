import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { GenderData } from './gender.model';

@Component({
  selector: 'app-gender',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './gender.component.html',
  styleUrl: './gender.component.scss'
})
export class GenderComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  GenderForm!: FormGroup;
  updateForm!: FormGroup;
  GenderDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteGender: any = null;
  subscription!: Subscription;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.GenderForm = this.fb.group({
      Gender: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      Gender: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getGender();
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
  getGender() {
    this.http.getData('Gender').subscribe((data: any) => {
      this.GenderDetail = data;
    });
  }
  //ADD
  addGender() {
    const request: GenderData = {
      genderName: this.GenderForm.value.Gender.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Gender', request).subscribe({
      next: () => {
        this.getGender();
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
  updateGender(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: GenderData = {
        genderName: this.updateForm.value.Gender.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`Gender/UPDATER`, request).subscribe({
        next: () => {
          this.getGender();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Gender Name updated successfully');
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
  openupdate(genderlist: any) {
    this.selectedId = genderlist.sno;
    this.updateForm.patchValue({ Gender: genderlist.genderName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(genderlist: any) {
    this.selectedDeleteGender = genderlist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteGender) return;

    const deleteRequest: GenderData = {
      genderName: this.selectedDeleteGender.genderName,
      isdeleted: "void",
      sno: this.selectedDeleteGender.sno
    };

    this.http.postdata('Gender/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getGender();
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
    this.GenderForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
