import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { Icardsdetails } from '../../Interfaces/cardsdetails.model';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { FormValidationsService } from '../../services/form-validations.service';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Paginator } from "primeng/paginator";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-card-expiry-details',
  imports: [CommonModule, TabsModule, FormsModule, TranslateModule, RouterModule, ReactiveFormsModule,
    NgbPopoverModule, ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent],
  templateUrl: './card-expiry-details.component.html',
  styleUrl: './card-expiry-details.component.scss'
})

export class CardExpiryDetailsComponent implements OnInit, OnDestroy {
  hasPreviousPage!: Boolean;
  hasNextPage!: Boolean;
  pageSize = 10;
  pageNum = 1;
  rows = 10;
  collectionSize!: number;
  searchQuery = '';
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  searchValue: any;
  loader: boolean = false;
  cardDetails = [] as Icardsdetails[];
  selectedcardDetails = {} as Icardsdetails;
  actualCardNumber!: string;
  visible: boolean = false;
  updateDetailsForm!: FormGroup;
  cardTypeList = [
    { label: 'Credit', value: 'Credit' },
    { label: 'Debit', value: 'Debit' }
  ];
  cardId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  allocated_history=[] as any;
  constructor(public http: HttpService,private readonly router: Router, private modalService: NgbModal, public rbac: RbacService, public formValidations: FormValidationsService) { }

  ngOnInit(): void {
    this.getCardDetails();
  }

  //clear form and close popup
  cleardata() {
    this.updateDetailsForm.reset();
    this.modalService.dismissAll();
  }
  //to fetch actual card number
  viewCardNumber(cardId: any) {
    if (!cardId) return;
    this.http.getData(`Card/${cardId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (this.visible) {
          // Eye open → fetch and show actual card number
          this.updateDetailsForm.patchValue({
            disaplycardNumber: res.cardNumberMasked,
            cardNumber: res.cardNumberMasked, // <-- unmasked card number from backend
          });
        } else {
          // Eye closed → show masked number again
          this.updateDetailsForm.patchValue({
            disaplycardNumber: this.selectedcardDetails.cardNumberMasked,
            cardNumber: res.cardNumberMasked,
          });
        }
        this.loader = false;
      },
      error: (errormessage) => {
        console.log(errormessage);
      }
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
    const status = 'Expired'; // Fetch only 'Available' cards
    this.cardDetails = [];
    this.loader = true;
    if (!this.searchValue || this.searchValue == '' || this.searchValue == null || this.searchValue == undefined) {
      this.searchValue = null;
    }
    this.http.getcardDetails('Card', this.pageNum, this.pageSize, this.searchValue, status,).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Transform data to include `employeeName`
        this.cardDetails = res.data.items;
        this.collectionSize = res.data.totalCount;
        this.hasNextPage = res.data.hasNextPage;
        this.hasPreviousPage = res.data.hasPreviousPage;
        this.http.updateCount( res.data.status);
        this.loader = false;
      },
      error: (errormessage) => {
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}