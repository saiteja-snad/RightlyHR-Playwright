import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { IExpense, Iexpensetype, } from '../../Interfaces/claimsandexpenses.model';
import { BehaviorSubject, filter, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { TabsModule } from 'primeng/tabs';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { AuthService } from '../../services/auth.service';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { SignalsService } from '../../services/signals.service';
@Component({
  selector: 'app-add-claimsandexpenses',
  imports: [RouterModule, Select, ReactiveFormsModule, TranslateModule, NgbPopoverModule, CommonModule, TabsModule, ModuleInfoIconComponent, ModuleInformationComponent, ModuleInfoIconComponent],
  templateUrl: './add-claimsandexpenses.component.html',
  styleUrl: './add-claimsandexpenses.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})

export class AddClaimsandexpensesComponent implements OnInit, OnDestroy {
  empinfo: any;
  Myexpense: any;
  moduleinfo: any
  totalexpensesamount = 0;
  selectedExpenseType: any;
  selectedexpensesid: any;
  newExpenseForm!: FormGroup;
  subscription!: Subscription
  minDate!: string;
  maxDate!: string;
  spinnerLoader = false;
  saveasDraftloder = false
  emails = [];
  timeoffValid = false;
  istimeoffValid = true;
  currentDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  joiningDate: any
  removeindex: any
  expensetype = [] as Iexpensetype[];
  expenseemployeedata: IExpense[] = [];
  private destroy$ = new Subject<boolean>();
  selectedEmpId: number | null = null;
  selectedEmpName: string | null = null;
  selectedEmpFusionId: string | null = null;
  @ViewChild('deleteconformation') private deleteconformation!: NgbModal;
  employeeiddetails = [] as any;
  navTabs: any[] = [
    { label: 'Create Expenses', link: '/claimsandexpenses/addexpense' },
  ];
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([]);
  totalCount: any;

  constructor(public router: Router, private fb: FormBuilder, private datepipe: DatePipe, private conformationPopup: OpenModalService,
    private http: HttpService, private modalService: NgbModal, public formValidation: FormValidationService, private authService: AuthService,private signalService : SignalsService) {
    effect(() => {
      if (this.http.onBehlafOfExpensesSignal()) {
        console.log('Expenses signal triggered');
        this.http.onBehlafOfExpensesSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.getEmployeeId()
    this.initiateForm();
    this.getExpensetype();
    this.getdatabyentriy();
    this.updateModuleInfo()

    this.getexpensesheaderbyid(this.empinfo.employeeid)
    this.setDate()
    this.getAllEmployeeId()
    this.newExpenseForm.valueChanges.subscribe(() => {
      this.calculateTotalExpensesAmount();
    });
    const savedEmp = localStorage.getItem('selectedEmployee');
    if (savedEmp) {
      const emp = JSON.parse(savedEmp);
      this.selectedEmpId = emp.employeeId;
      this.selectedEmpName = emp.employeeName;
      this.selectedEmpFusionId = emp.fusionEmpId;

      // Also update service observable if needed

      this.http.setOnBehalfOfExpensesSelectedEmp(emp);
      this.getExpensesHeaderByEmployeeId(emp.employeeId);
    }
    this.http.onBehalfOfExpensesSelectedEmp$.pipe(takeUntil(this.destroy$)).subscribe((emp) => {
      if (emp) {
        this.selectedEmpId = emp.employeeId;
        this.selectedEmpName = emp.employeeName;
        this.selectedEmpFusionId = emp.fusionEmpId;
        console.log(this.empinfo.employeeId)
      }
    });
  }


  initiateForm() {
    this.newExpenseForm = this.fb.group({
      expensesTitle: [null, [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      // approvalemail: [null, Validators.required],
      expenseItems: this.fb.array([], this.duplicateReceiptValidator),
      additional_details: [null]
    });
  }
  get isOnBehalfAddPage(): boolean {
    return this.router.url.includes('/on-behalf-of/on-behalf-of-expenses/add');
  }
  createExpenseItem(): FormGroup {
    return this.fb.group({
      item_expense: [null, Validators.required],
      item_Name: [null, [Validators.required, Validators.maxLength(50), Validators.pattern(/.*\S.*/)]],
      item_Description: [null, Validators.maxLength(250)],
      expense_Date: [null, Validators.required],
      expense_Amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), this.noAlphabetsOrZeroValidator()]],
      receipt_Number: [null, [Validators.required, Validators.maxLength(18)]],
      attachment_url: ['', Validators.required],
    });
  }

  addExpenseItem(): void {
    this.expenseItems.push(this.createExpenseItem());
    this.calculateTotalExpensesAmount();
  }

  get expenseItems(): FormArray {
    return this.newExpenseForm.get('expenseItems') as FormArray;
  }

  navigateMyexpenses() {
    this.router.navigate(['/claimsandexpenses/expenses/draft'])
  }

  navigateonBehalfof() {
    this.router.navigate(['/on-behalf-of/on-behalf-of-expenses/waiting-for-approval'])
  }
  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }


  updateModuleInfo() {
    const url = this.router.url;

    if (url.includes('/claimsandexpenses/addexpense')) {
      this.moduleinfo = MODULE_INFOS.EXPENSES_MODULE_INFO;
    }
    else if (url.includes('/on-behalf-of/on-behalf-of-expenses/add')) {
      this.moduleinfo = MODULE_INFOS.ONBEHALF_OF_ADD_EXPENSES_MODULE_INFO;
    }
    else {
      this.moduleinfo = '';
    }
  }
  calculateTotalExpensesAmount(): void {
    this.totalexpensesamount = this.expenseItems.controls.reduce((total, item) => {
      const value = Number(item.get('expense_Amount')?.value) || 0;
      return total + value;
    }, 0);
  }
  opendeletModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  delteitem(i: number) {
    this.removeindex = i
    this.modalService.dismissAll();
    this.opendeletModal(this.deleteconformation)
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.joiningDate = this.formatDateToLocal(data.dateOfJoining)
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  removeExpense() {
    this.expenseItems.removeAt(this.removeindex);
    this.calculateTotalExpensesAmount();
    this.modalService.dismissAll()
    this.conformationPopup.openSuccessModal("Expense item deleted successfully")
  }

  setDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.maxDate = `${yyyy}-${mm}-${dd}`;
    const dateOfJoining = new Date(this.empinfo.dateOfJoining);
    const yyyyMin = dateOfJoining.getFullYear();
    const mmMin = String(dateOfJoining.getMonth() + 1).padStart(2, '0');
    const ddMin = String(dateOfJoining.getDate()).padStart(2, '0');
    this.minDate = `${yyyyMin}-${mmMin}-${ddMin}`;
  }

  duplicateReceiptValidator(formArray: AbstractControl): ValidationErrors | null {
    const formArrayControls = formArray as FormArray; // Cast to FormArray
    const receiptNumbers = formArrayControls.value.map((item: any) => item.receipt_Number);
    const duplicates = receiptNumbers.filter((number: any, index: any) => receiptNumbers.indexOf(number) !== index);
    formArrayControls.controls.forEach((control: AbstractControl) => {
      const receiptNumberControl = control.get('receipt_Number');
      if (receiptNumberControl) {
        const currentNumber = receiptNumberControl.value;
        // Check if this control's receipt number is duplicated
        if (duplicates.includes(currentNumber)) {
          receiptNumberControl.setErrors({ duplicate: true });
        } else {
          if (receiptNumberControl.hasError('duplicate')) {
            receiptNumberControl.setErrors(null); // Clear the duplicate error
            receiptNumberControl.updateValueAndValidity(); // Update the control's validity
          }
        }
      }
    });
    return duplicates.length > 0 ? { duplicateReceipt: true } : null;
  }

  noAlphabetsOrZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Allow empty values (handled by 'required' validator)
      if (/[a-zA-Z]/.test(value)) {
        return { noAlphabets: true }; // Rejects alphabets
      }
      if (parseFloat(value) === 0) {
        return { nonZero: true }; // Rejects zero
      }
      return null; // Valid input
    };
  }

  getExpensetype() {
    this.subscription = this.http.getData('Expense').subscribe({
      next: (data: any) => {
        this.expensetype = data as Iexpensetype[];
      },
    });
  }

  getdatabyentriy() {
    const params = 'Expense';
    const param = 'approverEmails';
    this.subscription = this.http.getDatabyentriyvalue('entityAttributeValues', params, param).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          // Split the string and map into { value: email, label: email } objects
          const emailArray = data[0].value.split(',');
          this.emails = emailArray.map((email: string) => ({
            value: email.trim(), // remove extra spaces
            label: email.trim()
          }));
        }
      },
      error: (err) => {
        console.log("errors", err);
      },
    });
  }

  fileupload(event: any, index: number): void {
    const file = event.target.files[0]; // Get the selected file

    const control = this.expenseItems.at(index)?.get('attachment_url');

    // Handle file dialog cancel or no file selected
    if (!file) {

      control?.reset();
      control?.setErrors({ required: true });
      control?.markAsTouched();
      control?.updateValueAndValidity();
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);

    // File type validation
    if (!allowedTypes.includes(file.type)) {
      this.conformationPopup.openErrorModal('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.');
      control?.reset();
      control?.markAsTouched();
      control?.updateValueAndValidity();
      event.target.value = ''; // Reset the file input
      return;
    }

    // File size validation
    if (fileSizeInMB > maxSizeInMB) {
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      control?.reset();
      control?.markAsTouched();
      control?.updateValueAndValidity();
      event.target.value = ''; // Reset the file input
      return;
    }

    const filepath = `/Expenses/${this.empinfo.employeeId}`;
    // Upload the file
    const fileUpload$ = this.http.uploadFileWithQuery(
      'FileSystem/uploadfiletodirectory',
      filepath,
      file
    );

    fileUpload$.subscribe({
      next: (data: any) => {
        const uploadedFilePath = data.path;
        control?.setValue(uploadedFilePath);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      },
      error: (error: any) => {
        console.error('Error uploading file:', error);
        this.conformationPopup.openErrorModal('Error uploading file.');
        control?.reset(); // Reset the control if upload fails
        control?.setErrors({ required: true });
        control?.markAsTouched();
        control?.updateValueAndValidity();
      }
    });
  }
  markFileTouched(index: number): void {
    const control = this.expenseItems.at(index)?.get('attachment_url');
    if (!control?.value) {
      control?.markAsTouched();
      control?.setErrors({ required: true });
      control?.updateValueAndValidity();
    }
  }

  onchangeexpnes(event: any, index: number) {
    const selectedId = event.value;
    this.onExpenseChanged(selectedId, index);
  }

  onExpenseChanged(selectedId: number, index: number) {
    this.selectedexpensesid = selectedId;
    this.http.getData(`Expense/getbyid/${this.selectedexpensesid}`).subscribe({
      next: (data: any) => {
        console.log('Fetched expense data:', data);
        // You can patch this.expenseItems.at(index).patchValue({...})
      },
      error: (err) => {
        console.error('Error fetching expense by ID:', err);
      }
    });
  }

  fromdata(form: FormGroup): void {
    if (form.valid) {
      this.spinnerLoader = true
      const payload = {
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        // approverEmail: form.value.approvalemail.value,
        additional_details: form.value.additional_details,
        status: 'Waiting for Approval',
        employeeId: this.empinfo.employeeId,
        expenseItem: form.value.expenseItems.map((item: any) => ({
          expenseId: item.item_expense,
          item_Name: item.item_Name,
          item_Description: item.item_Description,
          expense_Date: item.expense_Date,
          expense_Amount: item.expense_Amount,
          receipt_Number: item.receipt_Number,
          status: 'Waiting for Approval',
          attachment_url: item.attachment_url,
        })),
        attachment_url: undefined
      };
      const filepath = `/Expenses/${this.empinfo.employeeId}`;
      // Check if there is any file to upload
      if (this.Myexpense) {
        const fileUpload$ = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory',
          filepath, this.Myexpense);
        fileUpload$.pipe(
          switchMap((data: any) => {
            // Update the payload with the uploaded file path
            payload.expenseItem.forEach((item: { attachment_url: any; }) => {
              if (item.attachment_url === this.Myexpense.name) {
                item.attachment_url = data.path;
              }
            });
            // Now post the updated payload
            return this.http.postdata(`Expenses_Header`, payload);
          })
        ).subscribe({
          next: (data: any) => {
            if (data) {
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.conformationPopup.openSuccessModal('Your expense request has been submitted');
              this.router.navigate(['/claimsandexpenses/expenses/draft'])
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              this.getApprovalStatusCounts();
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);

            }
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal(error.error.message)
            this.spinnerLoader = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          }, complete: () => {
            this.spinnerLoader = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.http.setnewcountDetailsforonBehalfof();
              this.conformationPopup.openSuccessModal('Your expense request has been submitted');
              this.newExpenseForm.reset();
              this.router.navigate(['/claimsandexpenses/expenses/draft'])
              this.http.setnewcountDetails();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              this.getApprovalStatusCounts();
              this.spinnerLoader = false;
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            }
          },
          error: (error: any) => {
            this.spinnerLoader = false;
            this.conformationPopup.openErrorModal(error.error.message);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
          complete: () => {
            this.spinnerLoader = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
        });
      }
    } else {
      console.log('Form is invalid');
      this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
      this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
    }
  }

  saveasDraft(form: FormGroup): void {
    if (form.valid) {
      this.saveasDraftloder = true
      const payload = {
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        // approverEmail: form.value.approvalemail.value,
        additional_details: form.value.additional_details,
        status: 'Draft',
        employeeId: this.empinfo.employeeId,
        expenseItem: form.value.expenseItems.map((item: any) => ({
          expenseId: item.item_expense,
          item_Name: item.item_Name,
          item_Description: item.item_Description,
          expense_Date: item.expense_Date,
          expense_Amount: item.expense_Amount,
          receipt_Number: item.receipt_Number,
          status: 'Draft',
          attachment_url: item.attachment_url,
        })),
        attachment_url: undefined
      };
      const filepath = `/Expenses/${this.empinfo.employeeId}`;
      // Check if there is any file to upload
      if (this.Myexpense) {
        const fileUpload$ = this.http.uploadFileWithQuery(
          'FileSystem/uploadfiletodirectory',
          filepath,
          this.Myexpense
        );
        fileUpload$.pipe(
          switchMap((data: any) => {
            // Update the payload with the uploaded file path
            payload.expenseItem.forEach((item: { attachment_url: any; }) => {

              if (item.attachment_url === this.Myexpense.name) {
                item.attachment_url = data.path;
              }
            });
            // Now post the updated payload
            return this.http.postdata(`Expenses_Header`, payload);
          })
        ).subscribe({
          next: (data: any) => {
            if (data) {
              this.http.setnewcountDetails();
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.conformationPopup.openSuccessModal(' Expense request saved as draft ');
              this.router.navigate(['/claimsandexpenses/expenses/draft'])
              // this.filterAllExpenses()
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              // Call the get function after posting
            }
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
            this.saveasDraftloder = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
          complete: () => {
            this.saveasDraftloder = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.conformationPopup.openSuccessModal('Expense request saved as draft');
              this.router.navigate(['/claimsandexpenses/expenses/draft'])
              this.http.setnewcountDetails();
              //this.filterAllExpenses()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
              this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            }
          },
          error: (error: any) => {
            console.log("error" + error)
            this.conformationPopup.openErrorModal(error.error.message)
            this.saveasDraftloder = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
          complete: () => {
            this.saveasDraftloder = false;
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          },
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }

  submitOnBehalfExpense(form: FormGroup): void {
    if (!form.valid) {
      console.log('Form is invalid');
      return;
    }

    this.spinnerLoader = true;

    const payload = {
      applied_date: new Date().toISOString(),
      expenses_Title: form.value.expensesTitle,
      expenseId: this.selectedexpensesid,
      additional_details: form.value.additional_details,
      status: 'Approved',
      employeeId: this.selectedEmpId,
      requestedBy: this.empinfo.employeeId,
      expenseItem: form.value.expenseItems.map((item: any) => ({
        expenseId: item.item_expense,
        item_Name: item.item_Name,
        item_Description: item.item_Description,
        expense_Date: item.expense_Date,
        expense_Amount: item.expense_Amount,
        receipt_Number: item.receipt_Number,
        status: 'Approved',
        attachment_url: item.attachment_url,
        isVerified: true,
        onBehalfOfApproval: true,
        verifiedBy: this.empinfo.employeeId?.toString(),
      })),
      attachment_url: undefined,
    };

    const filepath = `/Expenses/${this.empinfo.employeeId}`;
    const empToRefresh = this.selectedEmpId || this.empinfo.employeeId;

    // ---- FILE UPLOAD + SUBMIT ----
    let submit$;

    if (this.Myexpense) {
      submit$ = this.http.uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filepath,
        this.Myexpense
      ).pipe(
        switchMap((data: any) => {
          payload.expenseItem.forEach((i: { attachment_url: any; }) => {
            if (i.attachment_url === this.Myexpense.name) {
              i.attachment_url = data.path;
            }
          });
          this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          return this.http.postdata(`Expenses_Header`, payload);
        })
      );
    } else {
      
      submit$ = this.http.postdata(`Expenses_Header`, payload);
      this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
      this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
      this.getApprovalStatusCounts();
    }

    submit$.subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Expense request has been submitted');
        this.newExpenseForm.reset();
        (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();

        // Navigate back
        this.navigateonBehalfof();

        // 🔥 MOST IMPORTANT — tell OnBehalf Dashboard to refresh summary
        this.http.setOnBehalfExpensesUpdated(empToRefresh);

        // 🔥 optional immediate fetch to update UI without waiting for event
        this.getexpensesheaderbyid(empToRefresh);
        this.getApprovalStatusCounts();

        this.spinnerLoader = false;
      },
      error: (error: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(error.error.message);
      },
      complete: () => {
        this.spinnerLoader = false;
        this.getApprovalStatusCounts();
      }
    });
  }
  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=19&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
      this.http.updatePendingApprovalCounts(this.totalCount);
    });
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
      this.newExpenseForm.get('expense_Amount')?.setValue(sanitizedValue);
    }
    // Calculate total expenses amount if valid
    if (this.newExpenseForm.get('expense_Amount')?.valid) {
      this.calculateTotalExpensesAmount();
    }
  }


  getexpensesheaderbyid(_employeeId: number): void {
    //params
    const params = this.empinfo.employeeId;
    this.subscription = this.http
      .getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
        next: (data: any) => {
          this.expenseemployeedata = data as IExpense[];
          //this.filterAllExpenses();
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  getAllEmployeeId() {
    let loggedInUser = this.authService.getToken();
    this.http
      .getData('Employeedata/ActiveEmployees')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.employeeiddetails = data
            .filter((emp: any) => emp.employeeId != loggedInUser.employeeId)
            .map((emp: any) => {
              const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
              const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''}`.trim();
              const leaveRequestName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName ?? ''} ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''
                }`.trim();
              return {
                ...emp,
                fullName,
                leaveRequestName,
              };
            })
            // Alphabetical sorting by firstName
            .sort((a: any, b: any) =>
              a.firstName.localeCompare(b.firstName, 'en', {
                sensitivity: 'base',
              })
            );
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }
  getExpensesHeaderByEmployeeId(empId: any): void {
    const year = new Date().getFullYear();
    console.log('Employee ID passed:', empId);

    this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&year=${year}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Expenses Header Response:', response);
          this.expenesEmplyeedata = response;
        },
        error: (error: any) => {
          console.error('Error fetching expense header by employee ID:', error);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
