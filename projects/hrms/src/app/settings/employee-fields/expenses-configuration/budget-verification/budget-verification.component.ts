import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IExpensePolicy } from '../../../../Interfaces/claimsandexpenses.model';
import { SelectModule } from 'primeng/select';
import moment from 'moment';

@Component({
  selector: 'app-budget-verification',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule,SelectModule,NgbPopoverModule],
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
  applicableforoption = [
    // { label: 'TM', value: 'TM' },
    // { label: 'RM', value: 'RM' },
    { label: 'HR', value: 'HR' },
    // { label: 'Role', value: 'ROLE' }
  ];
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
      description: ['',[Validators.maxLength(250)]],
      isMandatory: [false]
    });
  }

  intiationalupdatefrom() {
    this.expensebudgetUpdateForm = this.fb.group({
      policyTypeupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      applicableForupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      descriptionupdate: [ '',[Validators.maxLength(250)],],
      isMandatoryupdate: [false]
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  postExpenses(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      policyType: f.value.policyType,
      applicableFor: f.value.applicableFor,
      description: f.value.description,
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: moment().format('YYYY-MM-DD'),
      isMandatory: f.value.isMandatory ? f.value.isMandatory : false,
    };

    this.subscription = this.http.postdata("ExpensesCheckListConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Expense Checklist added successfully");
        f.reset();
        this.getExpenses();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message);
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
      descriptionupdate: expenses.description,
      isMandatoryupdate: expenses.isMandatory
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  onUpdateSubmit() {
    if (this.expensebudgetUpdateForm.invalid) return;

    const payload = {
      id: this.selectedExpensesId,
      policyType: this.expensebudgetUpdateForm.value.policyTypeupdate,
      applicableFor: this.expensebudgetUpdateForm.value.applicableForupdate,
      description: this.expensebudgetUpdateForm.value.descriptionupdate,
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: new Date(),
      updatedBy: parseInt(this.empinfo.employeeId),
      updatedAt: new Date(), 
      isMandatory: this.expensebudgetUpdateForm.value.isMandatoryupdate ? this.expensebudgetUpdateForm.value.isMandatoryupdate : false
    };

    this.subscription = this.http.putData(`ExpensesCheckListConfiguration/${this.selectedExpensesId}`, payload).subscribe({
      next: (res) => {
        if (res) {
          this.selectedExpensesId = null
          this.modalService.dismissAll()
          this.getExpenses()
          this.conformationPopup.openSuccessModal('Expense Checklist updated successfully')
        }
      },
      error: (err) => {
        console.error('Update failed', err);
        this.conformationPopup.openErrorModal(err.error.message)
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
        this.conformationPopup.openSuccessModal("Expense Checklist deleted successfully")
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
