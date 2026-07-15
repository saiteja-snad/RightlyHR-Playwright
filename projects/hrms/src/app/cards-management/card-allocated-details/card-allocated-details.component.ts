import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Icardsdetails } from '../../Interfaces/cardsdetails.model';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { AuthService } from '../../services/auth.service';
import { FormValidationsService } from '../../services/form-validations.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { IcardAllocatedDetails } from './card-allocatedmodel';
import { Paginator } from "primeng/paginator";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { Select } from 'primeng/select';
@Component({
  selector: 'app-card-allocated-details',
  imports: [CommonModule, TabsModule, FormsModule, Select, TranslateModule, RouterModule, ReactiveFormsModule,
    NgbPopoverModule, ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent, TableModule],
  templateUrl: './card-allocated-details.component.html',
  styleUrl: './card-allocated-details.component.scss',
})

export class CardAllocatedDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('cardAllocatedTable') cardAllocatedTable!: Table;
  hasPreviousPage!: Boolean;
  hasNextPage!: Boolean;

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
  searchQuery = '';
  searchValue: any;
  loader: boolean = false;
  releaseDetailsForm!: FormGroup;
  cardDetails = [] as Icardsdetails[];
  reasonDetails = [
    // {reason:'Access required for new department/floor',value:'Access required for new department/floor'},
    // {reason:'New credit card application approved',value:'New credit card application approved'}
  ] as any;
  selectedcardDetails = {} as Icardsdetails;
  actualCardNumber!: string;
  visible: boolean = false;
  updateDetailsForm!: FormGroup;
  cardTypeList = [
    { label: 'Credit', value: 'Credit' },
    { label: 'Debit', value: 'Debit' },
  ];
  allocatedId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  employeeId: any;
  allocated_history = [] as any;
  originalCardDetails = [] as Icardsdetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private authService: AuthService, private readonly router: Router, public http: HttpService, private modalService: NgbModal, private fb: FormBuilder,
    private conformationPopup: OpenModalService, public rbac: RbacService, public formValidations: FormValidationsService) { }

  ngOnInit(): void {
    this.getCardDetails();
    this.intialiseReleaseDetails();
    this.getcardsReasons('Release');
  }
  getcardsReasons(reasonType: string) {
    this.http.getData(`entityAttributeValues?entity=CardManagement&attribute=${reasonType}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.reasonDetails = data
      },
      error: (reason) => {
        console.log(reason);
      },
      complete: () => { },
    });
  }
  //initalize release form
  intialiseReleaseDetails() {
    this.releaseDetailsForm = this.fb.group({
      reason: ['', Validators.required],
      addictionalcomments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }
  //clear form and close popup
  cleardata() {
    this.updateDetailsForm.reset();
    this.modalService.dismissAll();
  }

  //update popup open
  updatePopup(content: any, cardDetails: any) {
    this.allocatedId = cardDetails?.allocations?.allocationId;
    this.selectedcardDetails = cardDetails.card;
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }
  approverHistoryFunction(historydata: any, content: any) {
    console.log(historydata)
    this.getallocatedhistory(historydata.cardId);
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }
  close() {
    this.releaseDetailsForm.reset();
    this.modalService.dismissAll();
  }
  navigateToAsset(deskid: any) {
    this.router.navigate(['/card-management/card-history'], { queryParams: { id: deskid } });
  }
  getallocatedhistory(cardId: number) {
    // CardAllocation?searchTerm=t&pageNumber=1&pageSize=100
    this.http.getData(`CardAllocation?cardId=${cardId}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Transform data to include `employeeName`
          this.allocated_history = res.data;
          console.log(res)
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
    const status = 'Allocated'; // Fetch only 'Available' cards
    this.cardDetails = [];
    this.loader = true;
    if (!this.searchValue || this.searchValue == '' || this.searchValue == null || this.searchValue == undefined) {
      this.searchValue = null;
    }
    // CardAllocation?searchTerm=t&pageNumber=1&pageSize=100
    this.http.getcardDetails('Card', this.pageNum, this.pageSize, this.searchValue, status,)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Transform data to include `employeeName`
          this.cardDetails = res.data.items;
          this.originalCardDetails = [...this.cardDetails];
          this.collectionSize = res.data.totalCount;
          this.hasNextPage = res.data.hasNextPage;
          this.hasPreviousPage = res.data.hasPreviousPage;
          this.http.updateCount(res.data.status);
          this.loader = false;
        },
        error: (errormessage) => {
          this.loader = false;
          console.log(errormessage);
        },
      });
  }

  onPageSizeChange(pageSize: any) {
    this.pageSize = pageSize;
    this.rows = pageSize;
    this.getCardDetails();
  }

  onPageChange(event: any) {
    this.first = event.first; // update the first record index
    this.rows = event.rows;
    this.pageNum = event.pageCount;
    this.getCardDetails();
  }

  //update card details
  releaseCards(f: FormGroup) {
    const loggedinuser = this.authService.getToken();
    const payload = {
      allocationStatus: 'Released',
      reason: this.releaseDetailsForm.get('reason')?.value,
      additionalComments: this.releaseDetailsForm.get('addictionalcomments')?.value,
    };
    this.http.putData(`CardAllocation/${this.allocatedId}`, payload).subscribe({
      next: (res) => {
        this.getCardDetails();
        this.modalService.dismissAll();
        this.releaseDetailsForm.reset();
        this.conformationPopup.openSuccessModal('Card released successfully!');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(err.error?.Message || 'Failed to update card.');
      },
    });
  }
  //availablecard function
  availCards() {
    const payload = {
      status: 'Available'
    };
    this.http.putData(`Card/${this.selectedcardDetails.cardId}`, payload).subscribe({
      next: (res) => {
        this.getCardDetails();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Card availability updated successfully!');
      },
      error: (err) => {
        console.error('Error creating card', err);
        this.conformationPopup.openErrorModal(err.error?.Message || 'Failed to update card.');
      }
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
      const allocatedTo = card.allocations?.employee?.name?.toLowerCase() || '';
      const allocatedBy = card.allocations?.assignedBy?.name?.toLowerCase() || '';
      
      return cardNumber.includes(searchTerm) ||
             cardType.includes(searchTerm) ||
             cardHolderName.includes(searchTerm) ||
             bankName.includes(searchTerm) ||
             status.includes(searchTerm) ||
             allocatedTo.includes(searchTerm) ||
             allocatedBy.includes(searchTerm);
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
        if (this.cardAllocatedTable) {
          this.cardAllocatedTable.reset();
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

      // Handle nested allocation fields
      if (field === 'allocatedTo') {
        val1 = a.allocations?.employee?.name;
        val2 = b.allocations?.employee?.name;
      } else if (field === 'allocatedBy') {
        val1 = a.allocations?.assignedBy?.name;
        val2 = b.allocations?.assignedBy?.name;
      } else if (field === 'allocatedDate') {
        val1 = new Date(a.allocations?.allocatedDate);
        val2 = new Date(b.allocations?.allocatedDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else if (field === 'issuedDate') {
        val1 = new Date(a.issuedDate);
        val2 = new Date(b.issuedDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else if (field === 'expiryDate') {
        // Handle expiry date as MM/YYYY format
        val1 = new Date(a.expiryYear, a.expiryMonth - 1);
        val2 = new Date(b.expiryYear, b.expiryMonth - 1);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}