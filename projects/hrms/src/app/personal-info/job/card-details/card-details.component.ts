import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { IcardAllocatedDetails, Icardsdetails } from '../../../cards-management/card-allocated-details/card-allocatedmodel';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { translate } from 'pdf-lib';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-details',
  imports: [NoDataFoundComponent, DataLoaderContentComponent, TranslateModule, DateformatPipe,CommonModule],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss'
})
export class CardDetailsComponent implements OnInit,OnDestroy {
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
  cardDetails = [] as IcardAllocatedDetails[];
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
  empinfo={} as any;
  constructor(private authService: AuthService, public http: HttpService, private modalService: NgbModal,private router: Router,
    private conformationPopup: OpenModalService, public rbac: RbacService, public formValidations: FormValidationsService) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
  }

  //clear form and close popup
  cleardata() {
    this.updateDetailsForm.reset();
    this.modalService.dismissAll();
  }
  //close dailog open
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
 getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getCardDetails();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getCardDetails();
    }
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
    this.http.getData(`CardAllocation?employeeId=${this.empinfo.employeeId}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // Transform data to include `employeeName`
          this.cardDetails = res.data.allocations;
          this.collectionSize = res.data.totalCount;
          this.hasNextPage = res.data.hasNextPage;
          this.hasPreviousPage = res.data.hasPreviousPage;
          this.loader = false;
        },
        error: (errormessage) => {
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


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
