import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { IExpense, Iexpensetype, } from '../../Interfaces/claimsandexpenses.model';
import { Subscription, switchMap } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { TabsModule } from 'primeng/tabs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
@Component({
  selector: 'app-add-claimsandexpenses',
  imports: [RouterModule, Select, ReactiveFormsModule, TranslateModule, CommonModule, TabsModule],
  templateUrl: './add-claimsandexpenses.component.html',
  styleUrl: './add-claimsandexpenses.component.scss',
  providers: [DatePipe],
  encapsulation:ViewEncapsulation.None
})

export class AddClaimsandexpensesComponent implements OnInit, OnDestroy {
  empinfo: any;
  Myexpense: any;
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
    file: any;
  expensetype = [] as Iexpensetype[];
  expenseemployeedata: IExpense[] = [];
  @ViewChild('deleteconformation') private deleteconformation!: NgbModal;
  navTabs: any[] = [
    { label: 'Create Expenses', link: '/claimsandexpenses/addexpense' },
  ];

  constructor(public router: Router,private formValidationService:FormValidationService, private fb: FormBuilder, private datepipe: DatePipe, private conformationPopup: OpenModalService,
    private http: HttpService, private modalService: NgbModal, public formValidation: FormValidationService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getEmployeeId()
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
      item_expense: [null, Validators.required],
      item_Name: [null, [Validators.required, Validators.maxLength(50),Validators.pattern(/^[^\s].*$/)]],
      item_Description: [null, Validators.maxLength(250)],
      expense_Date: [null, Validators.required],
      expense_Amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), this.noAlphabetsOrZeroValidator()]],
      receipt_Number: [null, [Validators.required, Validators.maxLength(18)]],
      attachment_url: [null, Validators.required],
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

  private renameFiles(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

expensesAttachment:any;
  fileupload(event: any, index: number): void {
    const file = event.target.files[0]; // Get the selected file

    //if (!file) return;
    let d: Date = new Date()
     const removeSpaceFileName = this.formValidationService.sanitizeFileName(file.name);
        const newFileName = `${this.empinfo.employeeId}_${d.getTime()}_${removeSpaceFileName}`;
    this.expensesAttachment = this.renameFiles(file, newFileName)
  //}
    // Allowed file types and size
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
      this.expenseItems.at(index)?.get('attachment_url')?.reset();
      event.target.value = ''; // Reset the file input
      return;
    }

    // File size validation
    if (fileSizeInMB > maxSizeInMB) {
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.expenseItems.at(index)?.get('attachment_url')?.reset();
      event.target.value = ''; // Reset the file input
      return;
    }

    const filepath = `/Expenses/${this.empinfo.employeeId}`;
    // Upload the file
    const fileUpload$ = this.http.uploadFileWithQuery(
      'FileSystem/uploadfiletodirectory',
      filepath,
      this.expensesAttachment
    );
    fileUpload$.subscribe({
      next: (data: any) => {
        // Assuming data.path contains the uploaded file path
        const uploadedFilePath = data.path;
        this.expenseItems.at(index)?.get('attachment_url')?.setValue(uploadedFilePath);
      },
      error: (error: any) => {
        console.error('Error uploading file:', error);
        this.conformationPopup.openErrorModal('Error uploading file.');
        this.expenseItems.at(index)?.get('attachment_url')?.setValue('');
      }
    });
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
          attachment_url: this.expensesAttachment,
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
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');
              this.getexpensesheaderbyid(this.empinfo.employeeId);
            }
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal(error.error.message)
            this.spinnerLoader = false;
          }, complete: () => {
            this.spinnerLoader = false;
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              this.spinnerLoader = false;
            }
          },
          error: (error: any) => {
            this.spinnerLoader = false;
            this.conformationPopup.openErrorModal(error.error.message);
          },
          complete: () => {
            this.spinnerLoader = false
          },
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }

  saveasDraft(form: FormGroup): void {
    if (form.valid) {
      this.saveasDraftloder = true
      const payload = {
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
              this.conformationPopup.openSuccessModal(' Expenses saved as draft successfully ');
              // this.filterAllExpenses()
              this.getexpensesheaderbyid(this.empinfo.employeeId);
              // Call the get function after posting
            }
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
            this.saveasDraftloder = false
          },
          complete: () => {
            this.saveasDraftloder = false
          },
        });
      } else {
        // No file to upload, directly post the payload
        this.http.postdata(`Expenses_Header`, payload).subscribe({
          next: (data: any) => {
            if (data) {
              this.conformationPopup.openSuccessModal('Expenses saved as draft successfully');
              //this.filterAllExpenses()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyid(this.empinfo.employeeId);
            }
          },
          error: (error: any) => {
            console.log("error" + error)
            this.conformationPopup.openErrorModal(error.error.message)
            this.saveasDraftloder = false
          },
          complete: () => {
            this.saveasDraftloder = false
          },
        });
      }
    } else {
      console.log('Form is invalid');
    }
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}