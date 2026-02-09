import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { Icardsdetails } from '../../Interfaces/cardsdetails.model';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
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
  imports: [CommonModule, TabsModule, FormsModule,Select, TranslateModule, RouterModule, ReactiveFormsModule,
    NgbPopoverModule, ChartModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, Paginator, InfoIconComponent],
  templateUrl: './card-allocated-details.component.html',
  styleUrl: './card-allocated-details.component.scss',
})

export class CardAllocatedDetailsComponent implements OnInit, OnDestroy {
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
  releaseDetailsForm!: FormGroup;
  cardDetails = [] as Icardsdetails[];
  reasonDetails=[
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
  allocated_history=[] as any;
  constructor(private authService: AuthService,private readonly router: Router, public http: HttpService, private modalService: NgbModal,private fb: FormBuilder,
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
        complete: () => {},
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
  approverHistoryFunction(historydata:any,content:any){
    console.log(historydata)
    this.getallocatedhistory(historydata.cardId);
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
    
  }
  close(){
    this.releaseDetailsForm.reset();
    this.modalService.dismissAll();
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
  releaseCards(f:FormGroup) {
    const loggedinuser = this.authService.getToken();
    const payload = {
      allocationStatus: 'Released',
      reason:this.releaseDetailsForm.get('reason')?.value,
      additionalComments:this.releaseDetailsForm.get('addictionalcomments')?.value,
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
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}