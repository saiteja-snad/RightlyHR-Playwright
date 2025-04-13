import { Component, ViewChild } from '@angular/core';
import { IVisaType } from './visatype.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';

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
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService, public formValidations: FormValidationsService) {

  }
  ngOnInit(): void {
    this.VisaForm = this.fb.group({
      Visatype: ['', [Validators.required]]
    });
    this.updateForm = this.fb.group({
      Visatype: ['', [Validators.required]]
    });

    this.getVisa();
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
  updateVisa(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IVisaType = {
        visatype1: this.updateForm.value.Visatype.trim(),
        isdeleted: "Active",
        id: this.selectedId
      };

      this.subscription = this.http.postdata(`Visatype/UPDATER`, request).subscribe({
        next: () => {
          this.getVisa();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Visa type updated successfully');
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
    this.selectedId = visalist.id;
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
      id: this.selectedDeleteVisa.id
    };

    this.http.postdata('Visatype/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getVisa();
        modal.close();
        this.conformationPopup.openSuccessModal('Visa deleted successfully');
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
