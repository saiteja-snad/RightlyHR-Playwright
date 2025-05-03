import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IExpenses } from '../../../Interfaces/claimsandexpenses.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';


@Component({
  selector: 'app-expenses-configuration',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,],
  templateUrl: './expenses-configuration.component.html',
  styleUrl: './expenses-configuration.component.scss'
})
export class ExpensesConfigurationComponent {
  expense = [] as IExpenses[];
  dataload = false;
  selectedExpensesId: any
  expenseForm!: FormGroup;
  expenseupdateForm!: FormGroup;
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
    this.getExpenses();
    this.intiationalfrom();
    this.intiationalupdatefrom()
  }


  intiationalfrom() {
    this.expenseForm = this.fb.group({
      expenseType: ['', [Validators.required, Validators.maxLength(50)]],
      expensesCode: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }



  intiationalupdatefrom() {
    this.expenseupdateForm = this.fb.group({
      expenseTypeupdate: ['', [Validators.required, Validators.maxLength(50)]],
      expensesCodeupade: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  postExpenses(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      expenseType: f.value.expenseType,
      expensesCode: f.value.expensesCode.toUpperCase(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata("Expense", payload).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Expense Type added successfully");
        this.getExpenses();
        f.reset();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.Message);
      },
    });
  }

  getExpenses() {
    this.dataload = true
    this.subscription = this.http.getData("Expense").subscribe({
      next: (data: any) => {
        this.dataload = false
        this.expense = data as IExpenses[];
        console.log(this.expense);
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
    this.selectedExpensesId = expenses.expenseId

    this.expenseupdateForm.patchValue({
      expenseTypeupdate: expenses.expenseType,
      expensesCodeupade: expenses.expensesCode
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onUpdateSubmit() {
    if (this.expenseupdateForm.invalid) return;

    const payload = {
      
      expenseType: this.expenseupdateForm.value.expenseTypeupdate,
      expenseId: this.selectedExpensesId,
      expensesCode: this.expenseupdateForm.value.expensesCodeupade,
      isdeleted: 'Active'
    };

    this.http.postdata('Expense/UPDATER', payload).subscribe({
      next: (res) => {
        if (res) {
          this.selectedExpensesId = null
          this.modalService.dismissAll()
          this.getExpenses()
          this.conformationPopup.openSuccessModal('Expense Type updated successfully')
        }
      },
      error: (err) => {
        console.error('Update failed', err);
        this.conformationPopup.openErrorModal('Expense Type updated failed')
      }
    });
  }

  opendelete(content: any, expenses: any){
    this.selectedExpensesId = expenses.expenseId
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  expemsesDelete(){
    this.subscription = this.http.deleteData(`Expense/${this.selectedExpensesId}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Expense Type  deleted successfully")
        this.getExpenses();
      },
      error: (reason: any) => {
        console.log(reason);
        
      }
    });
  }

}
