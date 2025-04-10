import { Component, ViewChild } from '@angular/core';
import { IVisaType } from './visatype.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-visatype',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './visatype.component.html',
  styleUrl: './visatype.component.scss'
})
export class VisatypeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  VisaForm!: FormGroup;
  updateForm!: FormGroup;
  VisaDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteVisa: any = null;
  subscription!: Subscription;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.VisaForm = this.fb.group({
      Visatype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      Visatype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getVisa();
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
  getVisa() {
    this.http.getData('Visatype').subscribe((data: any) => {
      this.VisaDetail = data;
    });
  }
  //ADD
  addVisa() {
    const request: IVisaType = {
      visatype1: this.VisaForm.value.Visatype.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Visatype', request).subscribe({
      next: () => {
        this.getVisa();
        this.conformationPopup.openSuccessModal('Visa type added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  // UPDATE
  updateDepartment(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IVisaType = {
        visatype1: this.updateForm.value.Visatype.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`Visatype/UPDATER`, request).subscribe({
        next: () => {
          this.getVisa();
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
  openupdate(visalist: any) {
    this.selectedId = visalist.sno;
    this.updateForm.patchValue({ Visatype: visalist.visatype1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(visalist: any) {
    this.selectedDeleteVisa = visalist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteVisa) return;

    const deleteRequest: IVisaType = {
      visatype1: this.selectedDeleteVisa.visatype1,
      isdeleted: "void",
      sno: this.selectedDeleteVisa.sno
    };

    this.http.postdata('Visatype/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getVisa();
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
    this.selectedDeleteVisa = null;
  }

  resetForm() {
    this.VisaForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
