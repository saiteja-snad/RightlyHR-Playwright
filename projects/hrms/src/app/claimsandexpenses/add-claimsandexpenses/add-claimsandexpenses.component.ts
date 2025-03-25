import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-claimsandexpenses',
  imports: [RouterModule,Select,ReactiveFormsModule,CommonModule],
  templateUrl: './add-claimsandexpenses.component.html',
  styleUrl: './add-claimsandexpenses.component.scss'
})
export class AddClaimsandexpensesComponent {
  constructor(public router: Router, private fb: FormBuilder,) { }
  newExpenseForm!: FormGroup;
  expenestype=[
    {name: 'Travel', value: 'travel'},
    {name: 'Food', value: 'food'},
    {name: 'Miscellaneous', value: 'miscellaneous'}
  ]
  ngOnInit(): void {
    this.initiateForm();
 
  }

  initiateForm() {
    this.newExpenseForm = this.fb.group({
      expensesTitle: [null, [Validators.required, Validators.maxLength(50)]],
    
      expenseItems: this.fb.array([], this.duplicateReceiptValidator),
      additional_details: [null]
    });
  }

  createExpenseItem(): FormGroup {
    return this.fb.group({
      item_expense: [null, Validators.required],
      item_Name: [null, [Validators.required, Validators.maxLength(50)]],
      item_Description: [null, Validators.maxLength(250)],
      expense_Date: [null, Validators.required],
      expense_Amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), this.noAlphabetsOrZeroValidator()]],
      receipt_Number: [null, [Validators.required, Validators.maxLength(18)]],
      attachment_url: [null, Validators.required]
    });
  }

  addExpenseItem(): void {
    this.expenseItems.push(this.createExpenseItem());
   
  }

  get expenseItems(): FormArray {
    return this.newExpenseForm.get('expenseItems') as FormArray;
  }

  navigateMyexpenses() {
    this.router.navigate(['/claimsandexpenses/expenses/draft'])
  }
  onSubmit(){

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

    // If there are any duplicates, return an error for the FormArray, otherwise return null
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
}
