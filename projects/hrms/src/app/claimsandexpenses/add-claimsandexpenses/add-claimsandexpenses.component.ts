import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, NgModel, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { IExpense, IExpenseHeader, IExpenseItem, Iexpensetype, Inewexpense, INewExpense } from '../../interfaces/claimsandexpenses.model';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-add-claimsandexpenses',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule,],
  templateUrl: './add-claimsandexpenses.component.html',
  styleUrl: './add-claimsandexpenses.component.scss',
  providers: [DatePipe]
})
export class AddClaimsandexpensesComponent implements OnInit,OnDestroy{
  empinfo: any;
  Myexpense: any;
  totalexpensesamount = 0;
  selectedExpenseType: any;
  selectedexpensesid: any;
  newExpenseForm!: FormGroup;
  subscription!: Subscription
  minDate!: string;
  maxDate!: string;
  emails =[];
  timeoffValid = false;
  istimeoffValid = true;
  currentDate = new Date();
  expensetype = [] as Iexpensetype[];
  expenseemployeedata: IExpense[] = [];


  constructor(public router: Router, private fb: FormBuilder, private datepipe: DatePipe, private conformationPopup: OpenModalService,
    private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.initiateForm();
    this.getExpensetype();
    this.getdatabyentriy();
    this.getexpensesheaderbyid(this.empinfo.employeeid)
    this.setDate()

    this.newExpenseForm.valueChanges.subscribe(() => {
      this.calculateTotalExpensesAmount();
    });
  }

  initiateForm() {
    this.newExpenseForm = this.fb.group({
      expensesTitle: [null, [Validators.required, Validators.maxLength(50)]],
      approvalemail: [null, Validators.required],
      expenseItems: this.fb.array([], this.duplicateReceiptValidator),
      additional_details: [null]
    });
  }

  createExpenseItem(): FormGroup {
    return this.fb.group({
      item_expense: [null,],
      item_Name: [null, [Validators.required, Validators.maxLength(50)]],
      item_Description: [null, Validators.maxLength(250)],
      expense_Date: [null, Validators.required],
      expense_Amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), this.noAlphabetsOrZeroValidator()]],
      receipt_Number: [null, [Validators.required, Validators.maxLength(18)]],
      attachment_url: [null, ]
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

  calculateTotalExpensesAmount(): void {
    this.totalexpensesamount = this.expenseItems.controls.reduce((total, item) => {
      return total + parseFloat(item.get('expense_Amount')?.value || null);
    }, 0);
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
    console.log(this.maxDate, this.minDate);
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
    this.subscription = this.http
      .getDatabyentriyvalue('entityAttributeValues', params, param)
      .subscribe({
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
    if (file) {
      const filepath = `/Expenses/${this.empinfo.employeeId}`;
      // Upload the file
      const fileUpload$ = this.http.uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filepath,
        file
      );

      fileUpload$.subscribe({
        next: (data: any) => {

          // Assuming data.path contains the uploaded file path
          const uploadedFilePath = data.path;
          this.expenseItems.at(index).get('attachment_url')?.setValue(uploadedFilePath);
        },
        error: (error: any) => {
          console.error('Error uploading file:', error);
          // Handle error if needed
        }
      });
    }
  }

  onchangeexpnes(event: any, index: number) {
    const selectedId = event.value; // <-- PrimeNG sends the selected value in `event.value`
  
    console.log('Selected Expense ID:', selectedId);
  
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
      const payload: INewExpense = {
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        approverEmail: form.value.approvalemail.value,
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
        const fileUpload$ = this.http.uploadFileWithQuery(
          'FileSystem/uploadfiletodirectory',
          filepath,
          this.Myexpense
        );

        fileUpload$.pipe(
          switchMap((data: any) => {
            // Update the payload with the uploaded file path
            payload.expenseItem.forEach((item) => {

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
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');
              // this.filterAllExpenses()
      
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              // Call the get function after posting
            }
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');
              //this.filterAllExpenses()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
            }
          },
          error: (error: any) => {
            console.log("error" + error)
            this.conformationPopup.openErrorModal(error.error.message)

          }
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }



  saveasDraft(form: FormGroup): void {
    if (form.valid) {
      const payload: INewExpense = {
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        approverEmail: form.value.approvalemail.value,
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
            payload.expenseItem.forEach((item) => {

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
              this.conformationPopup.openSuccessModal(' Expenses save as draft successfully ');
              // this.filterAllExpenses()
      
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              // Call the get function after posting
            }
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.conformationPopup.openSuccessModal('Expenses save as draft successfully');
              //this.filterAllExpenses()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
            }
          },
          error: (error: any) => {
            console.log("error" + error)
            this.conformationPopup.openErrorModal(error.error.message)

          }
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }

  validateDate(expensedate: NgModel) {
    const inputDate = new Date(expensedate.value);
    if (inputDate > this.currentDate) {
      expensedate.control.setErrors({ futureDate: true });
    } else {
      expensedate.control.setErrors(null);
    }
  }
  //date validation
  // vldateofjoin1(): void {
  //   if (this.expenseheader.expensedate < this.empinfo.dateOfJoining) {
  //     this.istimeoffValid = false;
  //     this.timeoffValid = false;
  //   } else {
  //     this.istimeoffValid = true;
  //     this.timeoffValid = true;
  //   }
  // }
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
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
