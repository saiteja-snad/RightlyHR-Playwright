
import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { ChartModule } from 'primeng/chart';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { CreditCard, CreditCardValidators } from 'angular-cc-library';
import { Icardsdetails } from '../../Interfaces/cardsdetails.model';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../services/form-validations.service';
import moment from 'moment';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { Paginator } from "primeng/paginator";
import { Ibank } from '../../Interfaces/personal-modal';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-card-details',
  imports: [CommonModule, TabsModule, FormsModule, TranslateModule, RouterModule, ReactiveFormsModule,
    Select, NgbPopoverModule, ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent, TableModule],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})

export class CardDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('cardDetailsTable') cardDetailsTable!: Table;
  hasPreviousPage!: Boolean;
  hasNextPage!: Boolean;
  searchQuery = '';
  totalRecords = 0;
   // Pagination
  pageNum = 1;
  pageSize = 25;
  rows = 25;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 25, value: 25 },
    { label: 50, value: 50 },
    { label: 75, value: 75 },
    { label: 100, value: 100 },

  ];
  empinfo = {} as any;
  searchValue: any;
  loader: boolean = false;
  cardDetails = [] as Icardsdetails[];
  getAllEmployeeInfo = [] as any;
  selectedcardDetails = {} as Icardsdetails;
  actualCardNumber!: string;
  visible: boolean = false;
  updateDetailsForm!: FormGroup;
  allocateDetailsForm!: FormGroup;
  cardTypeList = [
    { label: 'Credit', value: 'Credit' },
    { label: 'Debit', value: 'Debit' },
    { label: 'Pre-Paid', value: 'Pre-Paid' },
  ];
  cardId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  banknames: Ibank[] = [];
  holdDetailsForm!: FormGroup;
   reasonDetails=[] as any;
  allocated_history=[] as any;
  originalCardDetails = [] as Icardsdetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private readonly fb: FormBuilder, private authService: AuthService, public http: HttpService,private readonly router: Router,
    private modalService: NgbModal, private conformationPopup: OpenModalService, public rbac: RbacService,
    public formValidations: FormValidationsService) {
    effect(() => {
      if (this.http.cardsregisterSignal()) {
        this.getCardDetails();
        this.http.cardsregisterSignal.set(false);
      } else {
        this.getCardDetails();
      }
    });
  }

  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    this.intialiseCardsDetails();
    this.intialiseAllocateDetails();
    this.intialiseholdDetails();
    this.getCardDetails();
    this.getAllEmployeeDetails();
    this.getbanknames();
    this.getcardsReasons('Hold')
  }
   getcardsReasons(reasonType: string) {
      this.http.getData(`entityAttributeValues?entity=CardManagement&attribute=${reasonType}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.reasonDetails = data
        },
        error: (reason) => {
          console.log(reason);
        },
        complete: () => {},
      });
    }
     //initalize hold form
  intialiseholdDetails() {
    this.holdDetailsForm = this.fb.group({
      reason: ['', Validators.required],
      addictionalcomments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }
  //drop drown
  getbanknames(): void {
    this.http.getData(`Bank`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.banknames = data.sort((a: any, b: any) => (a.bankName1 || '').localeCompare(b.bankName1 || ''));
        } else {
          this.banknames = [];
        }
      }
    });
  }

  //clear form and close popup
  cleardata() {
    this.updateDetailsForm.reset();
    this.modalService.dismissAll();
  }

  close() {
    this.allocateDetailsForm.reset();
    this.modalService.dismissAll();
  }

  //initalize form
  intialiseCardsDetails() {
    this.updateDetailsForm = this.fb.group({
      cardNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{0,16}$/)],
      ],
      cardType: ['', Validators.required],
      displayCardNumber: ['', Validators.required],
      cardCategory: ['', Validators.required],
      bankName: ['', Validators.required],
      cardHolderName: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryMonth: [
        '',
        [Validators.required, Validators.min(1), Validators.max(12), Validators.maxLength(2)],
      ],
      expiryYear: [
        '',
        [Validators.required,Validators.min(1),Validators.max(3000),Validators.maxLength(4),
        Validators.pattern(/^\d{1,4}$/),this.notPastYearValidator()],
      ],
      creditLimit: ['', [Validators.required, Validators.min(1)]],
      sharedLimit: [false],
      cardId: [null],
    });
    // Dynamically handle creditLimit validation and visibility
    this.updateDetailsForm.get('cardType')?.valueChanges.subscribe((type) => {
      const creditLimitControl = this.updateDetailsForm.get('creditLimit');
      if (type?.toLowerCase() === 'debit') {
        // Remove validators and clear value
        creditLimitControl?.clearValidators();
        creditLimitControl?.setValue(null);
        creditLimitControl?.updateValueAndValidity();
      } else {
        // Add validators back for credit cards
        creditLimitControl?.setValidators([
          Validators.required,
          Validators.min(1),
        ]);
        creditLimitControl?.updateValueAndValidity();
      }
    });
  }
   navigateToAsset(deskid: any) {
    this.router.navigate(['/card-management/card-history'], { queryParams: { id: deskid } });
  }
//no past year allowed validation.
notPastYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentYear = new Date().getFullYear();
    const enteredYear = Number(control.value);

    if (!enteredYear) return null; // if empty or invalid, other validators will handle it

    return enteredYear < currentYear
      ? { pastYear: true }
      : null;
  };
}
  allowonlynumbers(event: KeyboardEvent){
     const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    const isNumeric = /^[0-9]$/.test(key);
    if (!isNumeric) {
      event.preventDefault();
    }
  }
  //initalize allocate form
  intialiseAllocateDetails() {
    this.allocateDetailsForm = this.fb.group({
      employeeId: ['', Validators.required],
      allocatedDate: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  onallocatedDateValidation(date: string) {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      this.allocateDetailsForm.get('allocatedDate')?.setErrors({ futureDate: true });
    } else {
      this.allocateDetailsForm.get('allocatedDate')?.setErrors(null);
    }
  }

  cardDisplayNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };
      // Accept pure digits or masked numbers like XXXXXXXX1111
      const isValid =
        /^[0-9]{12,19}$/.test(value) || // full number
        /^X{6,}[0-9]{4}$/.test(value); // masked number
      return isValid ? null : { invalidCardNumber: true };
    };
  }

  //update popup open
  updatePopup(content: any, cardDetails: Icardsdetails) {
    this.cardId = cardDetails.cardId;
    this.selectedcardDetails = cardDetails;
    this.updateDetailsForm.patchValue({
      cardNumber: cardDetails.unMaskedCardNumber,
      cardType: cardDetails.cardType || null,
      cardCategory: cardDetails.cardCategory,
      bankName: cardDetails.issuedBankName,
      cardHolderName: cardDetails.cardHolderName,
      issueDate: this.formatDate(cardDetails.issuedDate),
      expiryMonth: cardDetails.expiryMonth,
      expiryYear: cardDetails.expiryYear,
      creditLimit: cardDetails.creditLimit,
      sharedLimit: cardDetails.sharedLimit,
      cardId: cardDetails.cardId,
    });
    this.viewCardNumber(this.cardId)
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  allocatePopup(content: any, cardDetails: Icardsdetails) {
    this.cardId = cardDetails.cardId;
    this.selectedcardDetails = cardDetails;
    this.modalService.open(content, {centered: true, backdrop: 'static', keyboard: false});
  }

  holdPopup(content: any, cardDetails: Icardsdetails) {
    this.cardId = cardDetails.cardId;
    this.selectedcardDetails = cardDetails;
    this.modalService.open(content, {centered: true, backdrop: 'static', keyboard: false});
  }

  toggleCardView() {
    this.visible = !this.visible;
    // Eye open → fetch and show actual card number
    this.viewCardNumber(this.updateDetailsForm.get('cardId')?.value);
  }

  //to fetch actual card number
  viewCardNumber(cardId: any) {
    if (!cardId) return;
    this.http.getData(`Card/${cardId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (this.visible) {
          // Eye open → fetch and show actual card number
          this.updateDetailsForm.patchValue({
            cardNumber: res.unMaskedCardNumber, // <-- unmasked card number from backend
          });
        } else {
          // Eye closed → show masked number again
          this.updateDetailsForm.patchValue({
            cardNumber: res.unMaskedCardNumber,
            displayCardNumber: res.cardNumberMasked,
          });
          this.updateDetailsForm.get('cardNumber')?.valueChanges.subscribe((value: string) => {
            // Detect card type
            const cardType = CreditCard.cardType(value);
            // Set the card category input
            this.updateDetailsForm.get('cardCategory')?.setValue(cardType, { emitEvent: false });
          });
        }
        //  // Auto-detect card type whenever card number changes
        //  this.updateDetailsForm
        //    .get('cardNumber')
        //    ?.valueChanges.subscribe((value) => {
        //      const detectedType = CreditCard.cardType(value);
        //      if (detectedType && detectedType !== 'Unknown') {
        //        this.updateDetailsForm.patchValue(
        //          { cardType: detectedType },
        //          { emitEvent: false }
        //        );
        //      }
        //    });
        this.loader = false;
      },
      error: (errormessage) => {
        console.log(errormessage);
      },
    });
  }

  formatDate(date: any): string {
    if (!date) return '';
    // Format to input[type="date"] compatible value
    return moment(date).format('YYYY-MM-DD');
  }

  //close dailog open
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  //get card details
  getCardDetails() {
    const status = 'Available'; // Fetch only 'Available' cards
    this.cardDetails = [];
    this.loader = true;
    if (!this.searchValue || this.searchValue == '' || this.searchValue == null || this.searchValue == undefined) {
      this.searchValue = null;
    }
    this.http.getcardDetails('Card', this.pageNum, this.pageSize, this.searchValue, status).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Transform data to include `employeeName`
        this.cardDetails = res.data.items;
        this.originalCardDetails = [...this.cardDetails];
        this.collectionSize = res.data.totalCount;
        this.hasNextPage = res.data.hasNextPage;
        this.hasPreviousPage = res.data.hasPreviousPage;
        this.loader = false;
         this.http.updateCount(res.data.status);
      },
      error: (errormessage) => {
        this.loader = false;
        console.log(errormessage);
      },
    });
  }
  approverHistoryFunction(historydata:any,content:any){
    console.log(historydata)
    this.getallocatedhistory(historydata.cardId);
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
    
  }
  getallocatedhistory(cardId:number) {
    // CardAllocation?searchTerm=t&pageNumber=1&pageSize=100
    this.http.getData(`CardAllocation?cardId=${cardId}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Transform data to include `employeeName`
              this.allocated_history=res.data;
              console.log(res)
        },
        error: (errormessage) => {
          console.log(errormessage);
        },
      });
  }
  onPageSizeChange(pageSize: any) {
    this.pageSize = pageSize;
    this.getCardDetails();
  }

  onPageChange(event: any) {
    this.first = event.first; // update the first record index
    this.rows = event.rows;
    this.pageNum = event.pageCount;
    this.getCardDetails();
  }

  // function to get the data of employees by hierarchy
  getAllEmployeeDetails() {
    // let EmployeeId=this.employeeId;
    this.empinfo = this.authService.getToken();
    const satus = ['active', 'Trainee Active'];
    this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response) {
          this.getAllEmployeeInfo = response
            .map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName ?? ''} 
                ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
              };
            });
        }
      },
    });
  }

  //update card details
  updateCardDetails(form: FormGroup) {
    const formValue = form.value;
    const loggedinuser = this.authService.getToken();
    const payload = {
      cardNumberMasked: formValue.cardNumber, // can be masked/unique name
      cardType: formValue.cardType?.value || formValue.cardType, // extract string
      cardCategory: formValue.cardCategory,
      issuedBankName: formValue.bankName?.bankName1 || formValue.bankName, // extract string
      cardHolderName: formValue.cardHolderName,
      issuedDate: new Date(formValue.issueDate).toISOString(),
      expiryMonth: Number(formValue.expiryMonth),
      expiryYear: Number(formValue.expiryYear),
      creditLimit: Number(formValue.creditLimit),
      sharedLimit: !!formValue.sharedLimit, // ensure true/false
      status: formValue.status,
      createdById: loggedinuser.employeeId,
    };
    this.http.putData(`Card/${this.cardId}`, payload).subscribe({
      next: (res) => {
        this.getCardDetails();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Card updated successfully!');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(
          err.error?.Message || 'Failed to update card.'
        );
      },
    });
  }

  holdCards(f:FormGroup) {
    const payload = {
      status: 'Hold',
      reason:this.holdDetailsForm.get('reason')?.value,
      additionalComments:this.holdDetailsForm.get('addictionalcomments')?.value,
    };
    this.http.putData(`Card/${this.cardId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.getCardDetails();
        this.conformationPopup.openSuccessModal('Card holded successfully!');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(
          err.error?.Message || 'Failed to hold the card.'
        );
      },
    });
  }

  //function to allocate form submit
  allocationformsubmit(form: FormGroup) {
    const formValue = form.value;
    const loggedinuser = this.authService.getToken();
    const payload = {
      cardId: this.cardId,
      employeeId: formValue.employeeId,
      allocatedDate: moment(formValue.allocatedDate).format('YYYY-MM-DD'),
      comments: formValue.description,
      allocationStatus: 'Allocated',
      assignedById: loggedinuser.employeeId,
    };
    this.http.postdata(`CardAllocation/allocate`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.getCardDetails();
        this.conformationPopup.openSuccessModal('Card allocated successfully');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(
          err.error?.Message || 'Failed to allocate card.'
        );
      },
    });
  }

  getFilteredAndSortedCardDetails(): Icardsdetails[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.cardDetails;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.cardDetails.filter((card: Icardsdetails) => {
      const cardNumber = card.cardNumberMasked?.toLowerCase() || '';
      const cardType = card.cardType?.toLowerCase() || '';
      const cardHolderName = card.cardHolderName?.toLowerCase() || '';
      const bankName = card.issuedBankName?.toLowerCase() || '';
      const status = card.status?.toLowerCase() || '';
      
      return cardNumber.includes(searchTerm) ||
             cardType.includes(searchTerm) ||
             cardHolderName.includes(searchTerm) ||
             bankName.includes(searchTerm) ||
             status.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.cardDetails = [...this.originalCardDetails];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.cardDetailsTable) {
          this.cardDetailsTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle different field types
      if (field === 'issuedDate') {
        val1 = new Date(a.issuedDate);
        val2 = new Date(b.issuedDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else if (field === 'expiryDate') {
        // Handle expiry date as MM/YYYY format
        val1 = new Date(a.expiryYear, a.expiryMonth - 1);
        val2 = new Date(b.expiryYear, b.expiryMonth - 1);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle string sorting for other fields
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}