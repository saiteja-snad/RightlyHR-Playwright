import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
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
    ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent],
  templateUrl: './card-hold-details.component.html',
  styleUrl: './card-hold-details.component.scss'
})

export class CardHoldDetailsComponent implements OnInit, OnDestroy {
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
    // { label: 'Debit', value: 'Debit' }
  ];
  cardId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  allocated_history=[] as any;
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
        this.collectionSize = res.data.totalCount;
        this.hasNextPage = res.data.hasNextPage;
        this.hasPreviousPage = res.data.hasPreviousPage;
        this.http.updateCount(res.data.status);
        this.loader = false;
      },
      error: (errormessage: any) => {
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}