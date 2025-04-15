import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IExpense, IExpensedatabyid, IExpenseHeader, IExpenses, Iexpensetype, INewExpense } from '../../../Interfaces/claimsandexpenses.model';
import { BehaviorSubject, Subscribable, Subscription, switchMap } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { OpenModalService } from '../../../services/open-modal.service';
import { Select } from 'primeng/select';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@Component({
  selector: 'app-drafts-expenses',
  imports: [CommonModule, DateformatPipe,NgxDocViewerModule, ReactiveFormsModule, Select],
  templateUrl: './drafts-expenses.component.html',
  styleUrl: './drafts-expenses.component.scss',
  providers: [DatePipe]
})
export class DraftsExpensesComponent {
  empinfo: any
  Myexpense: any;
  removeindex:any
  totalexpensesamount = 0;
  selectedExpenseType: any;
  selectedexpensesid: any;
  newExpenseForm!: FormGroup;
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredDrafts = new BehaviorSubject<any[]>([]);
  minDate!: string;
  maxDate!: string;
  emails = [];
  expensetype = [] as Iexpensetype[];
  expenseheaderiteams: INewExpense[] = [];
  updataid!: number;
  matchingExpense: any;
  @ViewChild('updateModal') private updateModal!: NgbModal;
  @ViewChild('deleteconformation') private deleteconformation!: NgbModal;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  constructor(public router: Router, private fb: FormBuilder, private datepipe: DatePipe,
    private http: HttpService, private conformationPopup: OpenModalService, private modalService: NgbModal, private sanitizer: DomSanitizer,) { }

  expenesEmplyeedata: IExpense[] = [];
  draftsCount: number = 0;
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.initiateForm();
    this.getExpensetype();
    this.getdatabyentriy();
    this.getexpensesheaderbyemployeeid(this.empinfo.employeeid)
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
      attachment_url: [null,]
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


  submitepxenses(form: FormGroup): void {
    if (form.valid) {
      const payload = {
        expenses_ID: this.updataid,
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        approverEmail: form.value.approvalemail.value,
        additional_details: form.value.additional_details,
        status: 'Waiting for Approval',
        employeeId: this.empinfo.employeeId,
        expenseitem: form.value.expenseItems.map((item: any) => ({
          expenseId: item.item_expense,
          item_Name: item.item_Name,
          item_Description: item.item_Description,
          expense_Date: item.expense_Date,
          expense_Amount: item.expense_Amount,
          receipt_Number: item.receipt_Number,
          status: 'Waiting for Approval',
          attachment_url: item.attachment_url,
        })),
     
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
            payload.expenseitem.forEach((item: { attachment_url: any; }) => {

              if (item.attachment_url === this.Myexpense.name) {
                item.attachment_url = data.path;
              }
            });

            // Now post the updated payload
            return this.http.putData(`Expenses_Header/${this.updataid}`, payload);
          })
        ).subscribe({
          next: (data: any) => {
          
              this.modalService.dismissAll()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');

              this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
              // Call the get function after posting
            
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.putData(`Expenses_Header/${this.updataid}`, payload).subscribe({
          next: (data: any) => {
          
              this.modalService.dismissAll()
              this.conformationPopup.openSuccessModal('Expenses submitted successfully');
           
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
            
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
      const payload = {
        expenses_ID: this.updataid,
        applied_date: new Date().toISOString(),
        expenses_Title: form.value.expensesTitle,
        expenseId: this.selectedexpensesid,
        approverEmail: form.value.approvalemail.value,
        additional_details: form.value.additional_details,
        status: 'Draft',
        employeeId: this.empinfo.employeeId,
        expenseitem: form.value.expenseItems.map((item: any) => ({
          expenseId: item.item_expense,
          item_Name: item.item_Name,
          item_Description: item.item_Description,
          expense_Date: item.expense_Date,
          expense_Amount: item.expense_Amount,
          receipt_Number: item.receipt_Number,
          status: 'Draft',
          attachment_url: item.attachment_url,
        })),
     
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
            payload.expenseitem.forEach((item: { attachment_url: any; }) => {

              if (item.attachment_url === this.Myexpense.name) {
                item.attachment_url = data.path;
              }
            });

            // Now post the updated payload
            return this.http.putData(`Expenses_Header/${this.updataid}`, payload);
          })
        ).subscribe({
          next: (data: any) => {
          
              this.modalService.dismissAll()
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.conformationPopup.openSuccessModal('Expenses save as draft successfully');

              this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
              // Call the get function after posting
            
          },
          error: (error: any) => {
            console.log('errror' + error)
            this.conformationPopup.openErrorModal(error.error.message)
          }
        });
      } else {
        // No file to upload, directly post the payload
        this.http.putData(`Expenses_Header/${this.updataid}`, payload).subscribe({
          next: (data: any) => {
          
              this.modalService.dismissAll()
              this.conformationPopup.openSuccessModal('Expenses save as draft successfully');
           
              this.newExpenseForm.reset();
              (this.newExpenseForm.controls['expenseItems'] as FormArray).clear();
              this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
            
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
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }

  opendeletModal(content: any) {
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
      this.newExpenseForm.get('expense_Amount')?.setValue(sanitizedValue);
    }

    // Calculate total expenses amount if valid
    if (this.newExpenseForm.get('expense_Amount')?.valid) {
      this.calculateTotalExpensesAmount();
    }
  }


  getexpensesheaderbyemployeeid(_employeeId: number): void {
    //params
    const params = this.empinfo.employeeId;

    this.subscription = this.http
      .getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata = data as IExpense[];
          this.filterDraftsExpenses();
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  filterDraftsExpenses() {
    const draftExpenses = this.expenesEmplyeedata
      .filter((expense) => expense.status === 'Draft')
      .reverse();
    this.flitredDrafts.next(draftExpenses);
    this.draftsCount = draftExpenses.length;
  }



  viewItem(expid: number,) {
    console.log(expid);
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data.expenseitem
          this.getdatabyentriy();
          this.getExpensetype();
          this.populateForm(data)
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });

  }


  populateForm(data: any): void {

    // Ensure that the expenses array is populated
    const expensesArray = this.expensetype

    const expenseIdToFind = data.expenseitem[0].expenseId; // Assuming data.expenseitem is an array

    console.log('Expenses Array:', expensesArray);
    console.log('Expense ID to find:', expenseIdToFind);

    this.matchingExpense = expensesArray.find(exp => exp.expenseId === expenseIdToFind);

    console.log('Matching Expense:', this.matchingExpense);
    this.newExpenseForm.patchValue({
      expensesTitle: data.expenses_Title,
      approvalemail: this.emails.find((email:any) => email.value === data.approverEmail),
      // expense: matchingExpense ? matchingExpense.expenseId : null,
      additional_details: data.additional_details
    });


    this.expenseItems.clear();
    data.expenseitem.forEach((item: any) => {
      this.patchExpenseItem(item);
    });



  }

  patchExpenseItem(item: any): void {

  
    this.expenseItems.push(this.fb.group({
      item_Name: [item.item_Name, [Validators.required, Validators.maxLength(50)]],
      item_expense: [item.item_expense, Validators.required],
      item_Description: [item.item_Description],
      expense_Date: [this.datepipe.transform(item.expense_Date, 'yyyy-MM-dd'), Validators.required],
      expense_Amount: [item.expense_Amount, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), this.noAlphabetsOrZeroValidator()]],
      receipt_Number: [item.receipt_Number, [Validators.required, Validators.maxLength(18)]],
      attachment_url: [item.attachment_url, Validators.required]
    }));
  }


  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.value).subscribe({
      next: (res: any) => {
        // Check if the response body is of type Blob
        const blob: Blob = res.body as Blob;
        if (!blob) {
          return;
        }

        // Extract filename from 'content-disposition' header if available
        const contentDisposition = res.headers.get('content-disposition');
        let fileName = 'defaultFileName.pdf'; // Default filename

        if (contentDisposition) {
          const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (fileNameMatch !== null && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Extract filename from the original file path if 'content-disposition' is not available
          const filePath = file.value;
          const parts = filePath.split('/');
          fileName = parts[parts.length - 1] || 'defaultFileName.pdf';
        }

        // Create a link element and trigger the download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (reason) => {
        console.error('File download error:', reason);
      }
    });
  }

  onViewAttachement(url: any) {
    if (url.endsWith('jpg') || url.endsWith('png') || url.endsWith('jpeg') ) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.toggleViewModal();
          },

          error: (reason) => console.log(reason),
        });
    } else {
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }


  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment)
  }

  delteitem(i: number) {
    this.removeindex = i
    this.modalService.dismissAll();
    this.opendeletModal(this.deleteconformation)

  }
  
  removeExpense() {
    this.expenseItems.removeAt(this.removeindex);
    this.calculateTotalExpensesAmount();
    this.modalService.dismissAll()
    this.conformationPopup.openSuccessModal("Expene iteam deleted successfully")
    setTimeout(() => {
      this.openModal(this.updateModal)
    }, 2000);
  }
  notdeleted(){
    this.modalService.dismissAll();
    this.openModal(this.updateModal)
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }






}
