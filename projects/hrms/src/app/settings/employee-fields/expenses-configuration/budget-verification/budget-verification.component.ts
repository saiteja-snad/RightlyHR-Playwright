import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IExpensePolicy } from '../../../../Interfaces/claimsandexpenses.model';

@Component({
  selector: 'app-budget-verification',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './budget-verification.component.html',
  styleUrl: './budget-verification.component.scss'
})
export class BudgetVerificationComponent {
  expensebudgetForm!: FormGroup;
  expensebudgetUpdateForm!: FormGroup;
  empinfo = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  budgetchecklist: IExpensePolicy[] = [];
  dataload = false;
  selectedExpensesId: any;
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
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intiationalfrom();
    this.intiationalupdatefrom();
    this.getExpenses();
  }
  intiationalfrom() {
    this.expensebudgetForm = this.fb.group({
      policyType: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      applicableFor: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      description: [
        '',
        [
          Validators.maxLength(250)
        ]
      ],
    });
  }

  intiationalupdatefrom() {
    this.expensebudgetUpdateForm = this.fb.group({
      policyTypeupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      applicableForupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      descriptionupdate: [
        '',
        [
          Validators.maxLength(250)
        ]
      ],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  postExpenses(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      policyType: f.value.policyType.trim(),
      applicableFor: f.value.applicableFor.trim(),
      description: f.value.description.trim(),
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: new Date(),

    };

    this.subscription = this.http.postdata("ExpensesCheckListConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Expense Type added successfully");
        f.reset();
        this.getExpenses();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.Message);
      },
    });
  }

  getExpenses() {
    this.dataload = true
    this.http.getData("ExpensesCheckListConfiguration/getall").pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.budgetchecklist = res.data as IExpensePolicy[];
        this.dataload = false
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

    this.expensebudgetUpdateForm.patchValue({
      applicableForupdate: expenses.applicableFor,
      policyTypeupdate: expenses.policyType,
      descriptionupdate: expenses.description
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  onUpdateSubmit() {
    if (this.expensebudgetUpdateForm.invalid) return;

    const payload = {
      id: this.selectedExpensesId,
      policyType: this.expensebudgetUpdateForm.value.policyTypeupdate.trim(),
      applicableFor: this.expensebudgetUpdateForm.value.applicableForupdate.trim(),
      description: this.expensebudgetUpdateForm.value.descriptionupdate.trim(),
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: new Date(),
      updatedBy: parseInt(this.empinfo.employeeId),
      updatedAt: new Date()

    };

    this.subscription = this.http.putData(`ExpensesCheckListConfiguration/${this.selectedExpensesId}`, payload).subscribe({
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
        this.conformationPopup.openErrorModal(err.error.Message)
      }
    });
  }

  opendelete(content: any, expenses: any) {
    this.selectedExpensesId = expenses.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  expemsesDelete() {
    this.subscription = this.http.deleteData(`ExpensesCheckListConfiguration/${this.selectedExpensesId}`).subscribe({
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
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
