import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IBank } from './bank-name.model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-bank-name',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './bank-name.component.html',
  styleUrl: './bank-name.component.scss',
})
export class BankNameComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  bankdetails = [] as any[];
  updateBankdetails = {} as any;
  selectedDeleteBank = {} as any;
  subscription!: Subscription;
  bank = [] as any[];
  selectedId: number | null = null;

  // salDeletedata: any;
  constructor(
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {}

  bankForm!: FormGroup;
  updateForm!: FormGroup;

  ngOnInit(): void {
    this.bankForm = this.fb.group({
      bank: [null, [Validators.required]],
    });
    this.updateForm = this.fb.group({
      bankName2: ['', Validators.required],
    });
    this.getBank();
  }
  getBank() {
    this.subscription = this.http.getData('Bank').subscribe({
      next: (data: any) => {
        console.log(data);
        this.bankdetails = data as any[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  onSubmit() {
    const request = {
      bankName1: this.bankForm?.get('bank')?.value,
      IsDeleted: 'Active',
    };

    console.log('Sending request:', request);

    this.subscription = this.http.postdata('Bank', request).subscribe({
      next: (data: any) => {
        console.log('Response:', data);
        this.modalService.dismissAll();
        this.bankForm.reset();
        this.getBank();
        this.conformationPopup.openSuccessModal('Bank added successfully');
      },
      error: (reason: any) => {
        console.error('Error:', reason);
        this.conformationPopup.openErrorModal('Failed to add bank data');
      },
    });
  }

  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }

  opendelete(bank: any) {
    console.log(bank);
    this.selectedDeleteBank = bank;
    this.modalService.open(this.deletepopup, {
      centered: true,
      backdrop: 'static',
    });
  }

  openupdate(banklist: any) {
    this.selectedId = banklist.sno;
    this.updateForm.patchValue({ bankName2: banklist.bankName1 });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  updateBank(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IBank = {
        bankName1: this.updateForm.value.bankName2.trim(),
        isdeleted: 'Active',
        sno: this.selectedId,
      };
      this.subscription = this.http
        .postdata(`Bank/UPDATER`, request)
        .subscribe({
          next: () => {
            this.getBank();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal(
              'Bank updated successfully'
            );
          },
          error: (err: any) => {
            this.conformationPopup.openErrorModal(
              'Update failed. Please try again.'
            );
          },
        });
    }
  }

  onDeleteBank(modal: any) {
    if (!this.selectedDeleteBank) return;

    const deleteRequest = {
      sno: this.selectedDeleteBank.sno,
      bankName1: this.selectedDeleteBank.bankName1,
      isdeleted: 'void',
    };

    this.http.postdata('Bank/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getBank();
        modal.close();
        this.conformationPopup.openSuccessModal('Bank deleted successfully');
      },
      error: (err: any) => {
        console.error('Delete bank failed:', err);
        this.conformationPopup.openErrorModal('Failed to delete bank data');
      },
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteBank = null;
  }
}