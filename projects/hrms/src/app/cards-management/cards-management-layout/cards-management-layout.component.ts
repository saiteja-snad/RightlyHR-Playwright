import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CreditCard, CreditCardValidators } from 'angular-cc-library';
import { ChartModule } from 'primeng/chart';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { Subscription, Subject, filter } from 'rxjs';
import { Ibank } from '../../Interfaces/personal-modal';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { Location } from '@angular/common';
import { MODULE_INFOS } from '../../shared/modules-info';
import { ModuleInfoIconComponent } from "../../icons/module-info-icon/module-info-icon.component";
import { CardsmanagementTabsComponent } from '../../shared/cardsmanagement-tabs/cardsmanagement-tabs.component';
@Component({
  selector: 'app-cards-management-layout',
  imports: [CommonModule, CommonModule, TabsModule, TranslateModule, RouterModule,
    ReactiveFormsModule, Select, ModuleInformationComponent, NgbPopoverModule, ChartModule, CardsmanagementTabsComponent, ModuleInfoIconComponent],
  templateUrl: './cards-management-layout.component.html',
  styleUrl: './cards-management-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class CardsManagementLayoutComponent implements OnInit, OnDestroy {
  banknames: Ibank[] = [];
  cardDetailsForm!: FormGroup;
  moduleinfo: string = '';
  subscription!: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedEmployeeid: any;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  cardsDeltailsData: any;
  empinfo = {} as any;
  loading = false;
  cardTypeList = [
    { label: 'Credit', value: 'Credit' },
    { label: 'Debit', value: 'Debit' }
  ];

  constructor(private readonly fb: FormBuilder, private authService: AuthService, public http: HttpService, 
    private modalService: NgbModal, private conformationPopup: OpenModalService,private location: Location,
    public router: Router, public rbac: RbacService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.intialiseCardsDetails();
    this.getbanknames();
    this.cardDetailsForm.get('cardNumber')?.valueChanges.subscribe((value: string) => {
      // Detect card type
      const cardCategory = CreditCard.cardType(value);
      // Set the card category input
      this.cardDetailsForm.get('cardCategory')?.setValue(cardCategory, { emitEvent: false });
    });
  }
   initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/card-management/details': MODULE_INFOS.CARDS_MANAGEMENT_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  goBack(): void {
    this.location.back(); // goes to previous route
  }
  //keypress
  restrictInput(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    const isAlphabetic = /^[A-Za-z\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
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
  intialiseCardsDetails() {
    this.cardDetailsForm = this.fb.group({
      cardNumber: ['', [Validators.required,Validators.pattern(/^\d{0,16}$/) ]],
      cardType: ['', Validators.required],
      cardCategory: ['', Validators.required],
      bankName: ['', Validators.required],
      cardHolderName: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12), Validators.maxLength(2)],],
      expiryYear: ['', [Validators.required,Validators.min(1),Validators.max(3000),Validators.maxLength(4),
        Validators.pattern(/^\d{1,4}$/),this.notPastYearValidator()],],
      creditLimit: ['', [Validators.required, Validators.min(0)]],
      sharedLimit: [false],
    });
    
    // Auto-detect card type whenever card number changes
    this.cardDetailsForm.get('cardNumber')?.valueChanges.subscribe(value => {
      const detectedType = CreditCard.cardType(value);
      if (detectedType && detectedType !== 'Unknown') {
        this.cardDetailsForm.patchValue({ cardCategory: detectedType }, { emitEvent: false });
      }
    });
    // Dynamically handle creditLimit validation and visibility
    this.cardDetailsForm.get('cardType')?.valueChanges.subscribe(type => {
      const creditLimitControl = this.cardDetailsForm.get('creditLimit');
      if (type) {
        if (type?.value.toLowerCase() === 'debit') {
          // Remove validators and clear value
          creditLimitControl?.clearValidators();
          creditLimitControl?.setValue(null);
          creditLimitControl?.updateValueAndValidity();
        } else {
          // Add validators back for credit cards
          creditLimitControl?.setValidators([Validators.required, Validators.min(1)]);
          creditLimitControl?.updateValueAndValidity();
        }
      }

    });
  }
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
  restrictMonthInput(event: KeyboardEvent) {
    const allowed = /[0-9]/;
    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  }

  getbanknames(): void {
    this.subscription = this.http.getData(`Bank`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.banknames = data.sort((a: any, b: any) => (a.bankName1 || '').localeCompare(b.bankName1 || ''));
        } else {
          this.banknames = [];
        }
      }
    });
  }

  //modal open
  openModal(content: any) {
    this.cardDetailsForm.reset();
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // reset form
  resetfrom() {
    this.cardDetailsForm.reset();
  }

  // submit method
  postcarddetails(form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
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
      status: 'Available',
      createdById: loggedinuser.employeeId
    };
    this.http.postdata('Card', payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.http.cardsregisterSignal.set(true);
        this.router.navigate(['/card-management/details']);
        this.conformationPopup.openSuccessModal('Card Registered Successfully!');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to register card.');
      }
    });
  }

  onCardNumberInput() {
    const control = this.cardDetailsForm.get('cardNumber');
    if (control) {
      const cleanedValue = control.value?.replace(/\s+/g, '') || '';
      if (control.value !== cleanedValue) {
        control.setValue(cleanedValue, { emitEvent: true }); //  trigger revalidation
      }
    }
  }

  onCardNumberPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanedValue = pastedText.replace(/\s+/g, '');
    const control = this.cardDetailsForm.get('cardNumber');
    if (control) {
      control.setValue(cleanedValue, { emitEvent: true }); // triggers validator
      control.updateValueAndValidity(); // force immediate revalidation
    }
  }

  //close dailog open
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.cardDetailsForm.reset();
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}