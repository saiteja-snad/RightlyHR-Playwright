import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { Icardsdetails } from '../../Interfaces/cardsdetails.model';
import { AuthService } from '../../services/auth.service';
import { FormValidationsService } from '../../services/form-validations.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { Paginator } from "primeng/paginator";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-card-hold-details',
  imports: [CommonModule, TabsModule, FormsModule, TranslateModule, RouterModule, ReactiveFormsModule, NgbPopoverModule,
    ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent, TableModule],
  templateUrl: './card-hold-details.component.html',
  styleUrl: './card-hold-details.component.scss'
})

export class CardHoldDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('cardHoldTable') cardHoldTable!: Table;
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
  cardDetails = [] as Icardsdetails[];
  selectedcardDetails = {} as Icardsdetails;
  actualCardNumber!: string;
  visible: boolean = false;
  updateDetailsForm!: FormGroup;
  cardTypeList = [
    { label: 'Credit', value: 'Credit' },
    // { label: 'Debit', value: 'Debit' }
  ];
  cardId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  allocated_history=[] as any;
  originalCardDetails = [] as Icardsdetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private authService: AuthService, public http: HttpService, private modalService: NgbModal,private readonly router: Router,
    private conformationPopup: OpenModalService, public rbac: RbacService, public formValidations: FormValidationsService) { }

  ngOnInit(): void {
    this.getCardDetails();
  }
  

  //clear form and close popup
  cleardata() {
    this.updateDetailsForm.reset();
    this.modalService.dismissAll();
  }

  //update popup open
  updatePopup(content: any, cardDetails: Icardsdetails) {
    this.cardId = cardDetails.cardId;
    this.selectedcardDetails = cardDetails;
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
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
    const status = 'Hold'; // Fetch only 'Available' cards
    this.cardDetails = [];
    this.loader = true;
    if (!this.searchValue || this.searchValue == '' || this.searchValue == null || this.searchValue == undefined) {
      this.searchValue = null;
    }
    this.http.getcardDetails('Card', this.pageNum, this.pageSize, this.searchValue, status,).pipe(takeUntil(this.destroy$)).subscribe({
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
      error: (errormessage: any) => {
        this.loader = false;
        console.log(errormessage);
      }
    });
  }
    approverHistoryFunction(historydata:any,content:any){
    console.log(historydata)
    this.getallocatedhistory(historydata.cardId);
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
    
  }
   navigateToAsset(deskid: any) {
    this.router.navigate(['/card-management/card-history'], { queryParams: { id: deskid } });
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

  availCards() {
    const loggedinuser = this.authService.getToken();
    const payload = {
      status: 'Available'
    };
    this.http.putData(`Card/${this.cardId}`, payload).subscribe({
      next: (res) => {
        this.getCardDetails();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Card has been successfully marked as available');
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
        if (this.cardHoldTable) {
          this.cardHoldTable.reset();
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
        const expiry1 = `${a.expiryMonth}/${a.expiryYear}`;
        const expiry2 = `${b.expiryMonth}/${b.expiryYear}`;
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