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
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { Iroles } from '../../../roles-permissions/roles/roles.model';

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
    NoDataFoundComponent
  ],
  templateUrl: './global-expenses-configuration.component.html',
  styleUrl: './global-expenses-configuration.component.scss',
})
export class GlobalExpensesConfigurationComponent implements OnInit, OnDestroy {
  globalExpense = [] as IGlobalExpenses[];
  gradedetails = [] as any;
  frequency = [] as any;
  frequencyDetails: any[] = [];
  rolesdetails: Iroles[] = [];
  loading = false;
  empdata = {} as Ipersonal;
  selectedExpensesId: any;
  getAllEmployeeInfo = [] as any;
  buttons = false;
  expenseForm!: FormGroup;
  expenseupdateForm!: FormGroup;
  globalForm!: FormGroup;
  globalExpenseDetails: AttributeItem[] = [];
  dataload = false;
  approverList: { label: string; value: any }[] = [];
  approverOptions = [
    { label: 'Employee', value: 'EMP' },
    // { label: 'Manager', value: 'Manager' },
    { label: 'Role', value: 'Role' },
  ];
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: number[] = [];
  subscription!: Subscription;
  empinfo = {} as any;

  get approverLabel(): string {
    const selectedType = this.expenseupdateForm?.get('approverupdate')?.value
    if (selectedType === 'EMP') {
      return 'Select Employee';
    } else if (selectedType === 'Role') {
      return 'Select Role';
    }
    return 'Select ';
  }



  get approverLabelforadd(): string {
    const selectedType = this.expenseForm?.get('approver')?.value
    if (selectedType === 'EMP') {
      return 'Select Employee';
    } else if (selectedType === 'Role') {
      return 'Select Role';
    }
    return 'Select ';
  }



  constructor(
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getExpenses();
    this.getgradeid();
    this.intiationalfrom();
    this.intiationalupdatefrom();
    this.intiationalglobalform();
    this.getdatabyentriy();

    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    // Now initialize the form with the selectedYear
    ;
  }

  intiationalfrom() {
    this.expenseForm = this.fb.group({
      selectedYear: [(this.selectedYear),Validators.required],
      approver: [null, [Validators.required]],
      approverValue: [null, [Validators.required]],
      budget: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ],
      ],
      frequency: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.maxLength(50),

        ],
      ],
    });
  }

  intiationalupdatefrom() {
    this.expenseupdateForm = this.fb.group({
      selectedYear: ['', [Validators.required]],
      approverupdate: [null, [Validators.required]],
      approverValueupdate: [null, [Validators.required]],
      budgetUpdate: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
         Validators.pattern(/^\d+(\.\d{1,2})?$/)
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
  intiationalglobalform() {
    this.globalForm = this.fb.group({
      budget: [{ value: null, disabled: true }, [Validators.required,Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      frequency: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

resetData(){
  this.expenseForm.get('approverValue')?.reset();
  this.expenseForm.get('approver')?.reset();
  this.expenseForm.get('frequency')?.reset();
  this.expenseForm.get('budget')?.reset();
  this.expenseForm.get('selectedYear')?.setValue(this.currentYear);
   this.intiationalfrom();
}




  onApproverChange(selectedType: string, restoreValue?: any) {
    // this.allowthresholdLimitForm.patchValue({ approverValue: null });
    this.expenseupdateForm.get('approverValueupdate')?.reset()
    this.approverList = [];
    if (selectedType === 'EMP') {
      this.getAllEmployees(restoreValue);
    } else if (selectedType === 'Manager') {
      this.getManagers(restoreValue);
    } else if (selectedType === 'Role') {
      this.getRoles(restoreValue);
    }
  }


  getAllEmployees(restoreValue?: any) {
    const satus = ['active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`).subscribe({
      next: (response: any) => {
        if (response) {
          this.getAllEmployeeInfo = response
            // .filter((employee: any) => employee.employeeId !== this.empdata.employeeId)
            .map((employee: any) => ({
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName ?? ''}
                ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim(),
            }));
          this.approverList = this.getAllEmployeeInfo.map((emp: any) => ({
            label: emp.fullName,
            value: emp.employeeId
          }));
          // restore approverValue after list populated
          // if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
          //   // ensure types match (string vs number)
          //   const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
          //   if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
          // }
        }
      },
      error: () => {
        this.approverList = [];
      }
    });
  }

  getManagers(restoreValue?: any) {
    this.approverList = [
      { label: 'Reporting Manager (RM)', value: 'RM' },
      { label: 'Team Manager (TM)', value: 'TM' },
    ];
    // if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
    //   const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
    //   if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
    // }
  }

  getRoles(restoreValue?: any) {
    this.subscription = this.http.getData("RightlyHrRole").subscribe({
      next: (data: any) => {
        this.rolesdetails = data as Iroles[];
        this.approverList = this.rolesdetails.map((role: any) => ({
          label: role.name,
          value: role.id
        }));
        // if (restoreValue !== undefined && restoreValue !== null && restoreValue !== '') {
        //   const match = this.approverList.find(a => `${a.value}` === `${restoreValue}`);
        //   if (match) this.allowthresholdLimitForm.patchValue({ approverValue: match.value });
        // }
      },
      error: () => {
        this.approverList = [];
      }
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

onAmountInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let sanitizedValue = inputElement.value.replace(/[^0-9.]/g, '');
    // Replace multiple decimals with a single one
    const decimalCheck = sanitizedValue.split('.');
    if (decimalCheck.length > 2) {
      sanitizedValue = decimalCheck[0] + '.' + decimalCheck[1];
    }
    // Set the sanitized value back to the input
    inputElement.value = sanitizedValue;
    // Update the form control value only if the value contains digits or a valid decimal
    if (/^\d*\.?\d*$/.test(sanitizedValue)) {
      this.globalForm.get('budget')?.setValue(sanitizedValue);
    }
    // Calculate total expenses amount if valid

  }

  onBudgetInput(event: Event, formType: 'add' | 'update'): void {
    const inputElement = event.target as HTMLInputElement;
    let sanitizedValue = inputElement.value.replace(/[^0-9.]/g, '');
    // Replace multiple decimals with a single one
    const decimalCheck = sanitizedValue.split('.');
    if (decimalCheck.length > 2) {
      sanitizedValue = decimalCheck[0] + '.' + decimalCheck[1];
    }
    // Set the sanitized value back to the input
    inputElement.value = sanitizedValue;
    // Update the form control value only if the value contains digits or a valid decimal
    if (/^\d*\.?\d*$/.test(sanitizedValue)) {
      if (formType === 'add') {
        this.expenseForm.get('budget')?.setValue(sanitizedValue);
      } else {
        this.expenseupdateForm.get('budgetUpdate')?.setValue(sanitizedValue);
      }
    }
  }


  postExpenses(f: FormGroup) {
    if (f.invalid) return;
    const raw = f.getRawValue();
    const frequency =
      raw.frequency ?? this.globalForm?.get('frequency')?.value ?? null;

    const payload = {

      budget: f.value.budget,
      applicable_Year: f.value.selectedYear,
      frequency: frequency,
      created_By: parseInt(this.empinfo.employeeId),
      is_Deleted: false,
      emp_Type: f.value.approver,
      emp_Type_ReferenceId: f.value.approverValue.toString(),
    };

    this.subscription = this.http
      .postdata('GlobalExpenseBudgetConfigurations', payload)
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Budget configuration added successfully'
          );
          this.getExpenses();
          f.reset();
        },
        error: (reason: any) => {
          console.log(reason);

          this.conformationPopup.openErrorModal(reason?.error?.message);
        },
      });
  }

  openupdate(content: any, expenses: any): void {
    console.log(expenses);

    this.selectedExpensesId = expenses.id;
    if (expenses.emp_Type === 'EMP') {
      this.onApproverChange(expenses.emp_Type, expenses.emp_Type_ReferenceId);
      // Set approverValue after the list is populated
      setTimeout(() => {
        const approverValue = expenses.emp_Type === 'EMP' || 'Emp' ? parseInt(expenses.emp_Type_ReferenceId) : expenses.emp_Type_ReferenceId;
        this.expenseupdateForm.patchValue({
          approverValueupdate: approverValue
        });
        console.log('approverValue set in timeout:', approverValue);
      }, 100);
    }
    else if (expenses.emp_Type === 'ROLE' || expenses.emp_Type === 'Role') {
      console.log('gg');
      this.onApproverChange('Role', expenses.emp_Type_ReferenceId);
      setTimeout(() => {
        this.expenseupdateForm.patchValue({
          approverValueupdate: expenses.emp_Type_ReferenceId
        });
      }, 100);
    }
    const approverType = expenses.emp_Type === 'ROLE' ? 'Role' : expenses.emp_Type;
    this.expenseupdateForm.patchValue({
      selectedYear: expenses.applicable_Year,
      approverupdate: approverType,
      budgetUpdate: expenses.budget,
      frequencyUpdate: expenses.frequency,
    });

    // Manually trigger approver change to populate the list


    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onUpdateSubmit(f: FormGroup) {
    if (this.expenseupdateForm.invalid) {
      this.expenseupdateForm.markAllAsTouched();
      return;
    }

    const selectedYear = this.expenseupdateForm.get('selectedYear')?.value;
    console.log('Selected Year:', selectedYear);

    const payload = {
      id: this.selectedExpensesId,
      applicable_Year: selectedYear,
      emp_Type: this.expenseupdateForm.get('approverupdate')?.value,
      emp_Type_ReferenceId: this.expenseupdateForm.get('approverValueupdate')?.value.toString(),
      budget: this.expenseupdateForm.get('budgetUpdate')?.value,
      frequency: this.expenseupdateForm.get('frequencyUpdate')?.value,
      updated_By: parseInt(this.empinfo.employeeId),
      is_Deleted: false,
    };
    console.log('Payload:', payload);


    this.subscription = this.http
      .putData('GlobalExpenseBudgetConfigurations/Update', payload)
      .subscribe({
        next: (res) => {
          if (res) {
            this.selectedExpensesId = null;
            this.modalService.dismissAll();
            this.getExpenses();
            this.conformationPopup.openSuccessModal(
              'Budget configuration updated successfully'
            );
          }
        },
        error: (err) => {
          this.conformationPopup.openErrorModal(err?.error?.message);
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
              'Budget configuration deleted successfully'
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
              'Budget configuration updated successfully'
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
