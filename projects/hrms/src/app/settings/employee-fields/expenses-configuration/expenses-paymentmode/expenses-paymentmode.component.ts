import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IExpenses } from '../../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-expenses-paymentmode',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,],
  templateUrl: './expenses-paymentmode.component.html',
  styleUrl: './expenses-paymentmode.component.scss'
})
export class ExpensesPaymentmodeComponent implements OnInit, OnDestroy {
paymentmodedata = [] as any[];
  dataload = false;
  selectedExpensesId: any
  expenseForm!: FormGroup;
  paymentmodeupdateForm!: FormGroup;
  subscription!: Subscription;
  constructor(
    public router: Router, 
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService,
  ) { }
  
  ngOnInit(): void {
    this.getpaymentmode();
    this.intiationalfrom();
    this.intiationalupdatefrom()
  }


  intiationalfrom() {
    this.expenseForm = this.fb.group({
      paymentMode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
    });
  }
  
  intiationalupdatefrom() {
    this.paymentmodeupdateForm = this.fb.group({
      paymentmodeupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  postExpenses(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      entity: "ExpensesPaymentModeConfiguration",
      attribute: "PaymentMode",
      value: f.value.paymentMode.trim(),
      meta: ""
    
    };

    this.subscription = this.http.postdata("entityAttributeValues", payload).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Payment Mode added successfully");
        this.getpaymentmode();
        f.reset();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  getpaymentmode() {
    this.dataload = true
    this.subscription = this.http.getData("entityAttributeValues?entity=ExpensesPaymentModeConfiguration&attribute=PaymentMode").subscribe({
      next: (data: any) => {
        this.dataload = false
        this.paymentmodedata = data as any[];
        console.log(this.paymentmodedata);
      },
      error: () => {
        this.dataload = false
      },
      complete: () => {
        this.dataload = false
      },
    })
  }

  openupdate(content: any, expenses: any): void {
    console.log(expenses)
    this.selectedExpensesId = expenses.id

    this.paymentmodeupdateForm.patchValue({
      paymentmodeupdate: expenses.value,
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onUpdateSubmit() {
    if (this.paymentmodeupdateForm.invalid) return;

    const payload = {
      id: this.selectedExpensesId,
      value: this.paymentmodeupdateForm.value.paymentmodeupdate.trim(),
    
    };

    this.subscription = this.http.postdata("entityAttributeValues/update", payload).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Payment Mode updated successfully");
        this.getpaymentmode();
        this.paymentmodeupdateForm.reset();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  opendelete(content: any, expenses: any){
    console.log(expenses)
    this.selectedExpensesId = expenses?.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
 deleteEAV(): void {
    if (this.selectedExpensesId) {
      this.subscription = this.http.deleteData(`entityAttributeValues/${this.selectedExpensesId}`).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Payment Mode deleted successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to delete Document Type');
        },
        complete: () => {
           this.getpaymentmode();
          this.selectedExpensesId = null;
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
