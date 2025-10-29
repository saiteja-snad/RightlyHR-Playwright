import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import {
  AttributeItem,
  IGlobalExpenses,
} from '../../../../Interfaces/claimsandexpenses.model';
import { Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { IEAV } from '../../../../Interfaces/timoff-model';
import { SettingsLoaderComponent } from '../../../../shared/settings-loader/settings-loader.component';
import { SettingsUpdateIconComponent } from '../../../../icons/settings-update-icon/settings-update-icon.component';
import { EditIconComponent } from '../../../../icons/edit-icon/edit-icon.component';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';

@Component({
  selector: 'app-global-expenses-configuration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    NgbPopoverModule,
    SettingsLoaderComponent,
    SettingsUpdateIconComponent,
    EditIconComponent,
    InfoIconComponent,
  ],
  templateUrl: './global-expenses-configuration.component.html',
  styleUrl: './global-expenses-configuration.component.scss',
})
export class GlobalExpensesConfigurationComponent implements OnInit, OnDestroy {
  globalExpense = [] as IGlobalExpenses[];
  gradedetails = [] as any;
  frequency = [] as any;
  frequencyDetails: any[] = [];
  loading = false;
  selectedExpensesId: any;
  buttons = false;
  expenseForm!: FormGroup;
  expenseupdateForm!: FormGroup;
  globalForm!: FormGroup;
  globalExpenseDetails: AttributeItem[] = [];
  dataload = false;
  subscription!: Subscription;
  empinfo = {} as any;
  constructor(
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getExpenses();
    this.getgradeid();
    this.intiationalfrom();
    this.intiationalupdatefrom();
    this.intiationalglobalform();
    this.getdatabyentriy();
  }

  intiationalfrom() {
    this.expenseForm = this.fb.group({
      gradeId: [
        null,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
      budget: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
      frequency: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
    });
  }

  intiationalglobalform() {
    this.globalForm = this.fb.group({
      budget: [{ value: null, disabled: true }, [Validators.required]],
      frequency: [{ value: null, disabled: true }, [Validators.required]],
    });
  }
  intiationalupdatefrom() {
    this.expenseupdateForm = this.fb.group({
      gradeUpdateId: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
      budgetUpdate: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
      frequencyUpdate: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
    });
  }

  getExpenses() {
    this.dataload = true;
    this.subscription = this.http
      .getData('GlobalExpenseBudgetConfigurations')
      .subscribe({
        next: (data: any) => {
          this.dataload = false;
          this.globalExpense = data as IGlobalExpenses[];
          console.log(this.globalExpense);
        },
        error: () => {
          this.dataload = false;
        },
        complete: () => {
          this.dataload = false;
        },
      });
  }
  getgradeid() {
    this.subscription = this.http.getData('GradeTable').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.gradedetails = data;
      },
    });
  }
  getdatabyentriy() {
    const params = 'Expense';
    const param = 'Frequency';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param)
      .subscribe({
        next: (data: any) => {
          this.frequencyDetails = Array.isArray(data) ? data : [];
          this.getforallemplpoyes();
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
      });
  }

  getforallemplpoyes() {
    this.loading = true;
    const params = 'Expenses';
    const param = 'Global';

    // store subscription so it can be cleaned up in ngOnDestroy
    this.subscription = this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param)
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          const parsed = (response || []).map((item: any) => {
            let metaObj: any = {};
            if (item && item.meta) {
              try {
                metaObj = JSON.parse(item.meta);
              } catch (e) {
                // log and continue with empty meta
                console.error(
                  'Invalid JSON in meta for entityAttributeValues item',
                  item,
                  e
                );
                metaObj = {};
              }
            }
            return {
              ...item,
              meta: metaObj,
            };
          });

          this.globalExpenseDetails = parsed;

          // If a global configuration exists, pre-fill the global form
          if (parsed.length > 0) {
            const first = parsed[0];
            const amount = first?.meta?.Amount ?? first?.meta?.amount ?? '';
            const frequencyValue =
              first?.meta?.Frequency ?? first?.meta?.frequency ?? '';
            const frequencyObj = this.frequencyDetails.find(
              (f: any) => f.value === frequencyValue
            );
            if (this.globalForm) {
              this.globalForm.patchValue({
                budget: amount,
                frequency: frequencyObj?.value || frequencyValue,
              });
            }
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching data:', err);
        },
      });
  }

  openModal(content: any) {
    this.expenseForm.patchValue({
      frequency: this.globalForm.get('frequency')?.value,
    });
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  postExpenses(f: FormGroup) {
    if (f.invalid) return;
    const raw = f.getRawValue();
    const frequency =
      raw.frequency ?? this.globalForm?.get('frequency')?.value ?? null;

    const payload = {
      grade_Id: f.value.gradeId,
      budget: f.value.budget,
      frequency: frequency,
      created_By: parseInt(this.empinfo.employeeId),
      is_Deleted: false,
    };

    this.subscription = this.http
      .postdata('GlobalExpenseBudgetConfigurations', payload)
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Global Expense Configuration added successfully'
          );
          this.getExpenses();
          f.reset();
        },
        error: (reason: any) => {
          console.log(reason);
          
          this.conformationPopup.openErrorModal(reason.error.message);
        },
      });
  }

  openupdate(content: any, expenses: any): void {
    console.log(expenses);
    this.selectedExpensesId = expenses.id;

    this.expenseupdateForm.patchValue({
      gradeUpdateId: expenses.grade_Id,
      budgetUpdate: expenses.budget,
      frequencyUpdate: expenses.frequency,
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onUpdateSubmit(f: FormGroup) {
    if (this.expenseupdateForm.invalid) return;

    const payload = {
      id: this.selectedExpensesId,
      grade_Id: this.expenseupdateForm.get('gradeUpdateId')?.value,
      budget: this.expenseupdateForm.get('budgetUpdate')?.value,
      frequency: this.expenseupdateForm.get('frequencyUpdate')?.value,
      updated_By: parseInt(this.empinfo.employeeId),
      is_Deleted: false,
    };

    this.subscription = this.http
      .postdata('GlobalExpenseBudgetConfigurations/Update', payload)
      .subscribe({
        next: (res) => {
          if (res) {
            this.selectedExpensesId = null;
            this.modalService.dismissAll();
            this.getExpenses();
            this.conformationPopup.openSuccessModal(
              'Global Expense Configuration updated successfully'
            );
          }
        },
        error: (err) => {
          this.conformationPopup.openErrorModal(err.error.Message);
        },
      });
  }

  opendelete(content: any, expenses: any) {
    this.selectedExpensesId = expenses.id;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  expemsesDelete() {
    this.subscription = this.http
      .deleteData(
        `GlobalExpenseBudgetConfigurations/Deletebyid/${this.selectedExpensesId}`
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.selectedExpensesId = null;
            this.modalService.dismissAll();
            this.getExpenses();
            this.conformationPopup.openSuccessModal(
              'Global Expense Configuration deleted successfully'
            );
          }
        },
        error: (err) => {
          this.conformationPopup.openErrorModal(err.error.Message);
        },
      });
  }

  showButtons(): void {
    this.buttons = !this.buttons;
     this.getforallemplpoyes();
    if (this.buttons) {
      this.globalForm.get('budget')?.enable();
      this.globalForm.get('frequency')?.enable();
    } else {
      this.globalForm.get('budget')?.disable();
      this.globalForm.get('frequency')?.disable();
    }
  }

  onSubmit() {
    if (this.globalForm.invalid) {
      this.globalForm.markAllAsTouched();
      return;
    }
    const formValue = this.globalForm.getRawValue();
    const payload = {
      id:
        this.globalExpenseDetails.length > 0
          ? this.globalExpenseDetails[0].id
          : 0,

      value: 'true',
      meta: JSON.stringify({
        Amount: formValue.budget,
        Frequency: formValue.frequency,
      }),
    };
    this.subscription = this.http
      .postdata('entityAttributeValues/update', payload)
      .subscribe({
        next: (res) => {
          if (res) {
            this.selectedExpensesId = null;
            this.globalForm.reset();
            this.getforallemplpoyes();
            this.globalForm?.disable();
            this.buttons = !this.buttons;
            this.getExpenses();
            this.conformationPopup.openSuccessModal(
              'Global Expense Configuration updated successfully'
            );
          }
        },
        error: (err) => {
          this.conformationPopup.openErrorModal(err.error.Message);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
