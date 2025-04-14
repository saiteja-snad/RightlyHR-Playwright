import { Component, ViewChild } from '@angular/core';
import { IPaytype } from './paytype.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-paytype',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './paytype.component.html',
  styleUrl: './paytype.component.scss'
})
export class PaytypeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  PaytypeForm!: FormGroup;
  updateForm!: FormGroup;
  PaytypeDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletetype: any = null;
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
  ) {

  }
  ngOnInit(): void {
    this.PaytypeForm = this.fb.group({
      Paytype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      Paytype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.gePayType();
  }

  gePayType() {
    this.http.getData('PayType').subscribe((data: any) => {
      this.PaytypeDetail = data;
    });
  }
  //ADD
  addPaytype() {
    const request: IPaytype = {
      paytype1: this.PaytypeForm.value.Paytype.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('PayType', request).subscribe({
      next: () => {
        this.gePayType();
        this.conformationPopup.openSuccessModal('Paytype added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  // UPDATE
  updatePaytype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IPaytype = {
        paytype1: this.updateForm.value.Paytype.trim(),
        isdeleted:"Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`PayType/UPDATER`, request).subscribe({
        next: () => {
          this.gePayType();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Paytype updated successfully');
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
  openupdate(paytypelist: any) {
    this.selectedId = paytypelist.sno;
    this.updateForm.patchValue({ Paytype: paytypelist.paytype1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(paytypelist: any) {
    this.selectedDeletetype = paytypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletetype) return;

    const deleteRequest: IPaytype = {
      paytype1: this.selectedDeletetype.paytype1,
      isdeleted: "void",
      sno: this.selectedDeletetype.sno
    };

    this.http.postdata('PayType/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.gePayType();
        modal.close();
        this.conformationPopup.openSuccessModal('Paytype deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletetype = null;
  }

  resetForm() {
    this.PaytypeForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
