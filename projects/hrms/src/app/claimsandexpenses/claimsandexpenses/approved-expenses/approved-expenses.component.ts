import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ExpenseEntity, IExpense, IExpenseHeaders, } from '../../../Interfaces/claimsandexpenses.model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DownloadExpenseComponent } from '../../download-expense/download-expense.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
@Component({
  selector: 'app-approved-expenses',
  imports: [CommonModule, DateformatPipe, NgxDocViewerModule, TableModule, FormsModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, InfoIconComponent, DownloadExpenseComponent, DocumentViewIconComponent,NgbPopoverModule],
  templateUrl: './approved-expenses.component.html',
  styleUrl: './approved-expenses.component.scss'
})

export class ApprovedExpensesComponent implements OnInit, OnDestroy {
  @ViewChild('expensesTable') expensesTable!: Table;
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  commentsrecivced = [] as any
  loading = false
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  seletedMouthly: any
  searchTerm: any = ''
  selectemp: any;
  selectedYear: any;
  selectedData = {} as any;
  @Input() downloadData: any;
  expensesData: IExpense[] = [];
  originalExpensesData: IExpense[] = []; // Store original unsorted data
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(public router: Router, private http: HttpService, private SelectedyeartimeOffService: TimeoffYearFilterService, private modalService: NgbModal, private sanitizer: DomSanitizer,) { }

  ngOnInit(): void {
    this.SelectedyeartimeOffService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.SelectedyeartimeOffService.selectedMounthly$.subscribe(mounthly => {
          if (mounthly !== null) {
            this.seletedMouthly = mounthly;
    
          }
        })
        this.http.selectedEmployeeIdExpenses$.subscribe((id) => {
          if (id) {
            this.selectemp = id;
            this.getexpensesheaderbyemployeeid();
          } else {
            this.selectemp = null;
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getexpensesheaderbyemployeeid();
          }
        });
      }
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openupdateModal(content: any) {

    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }

  comments_Function(comments: any) {
    let filteredComments = comments?.filter((ele: any) => ele?.action !== 'Required Clarification');
    this.commentsrecivced = filteredComments;
  }
  //download expenses popup open function
  openpopupforDownload(content: any, expenseDetails: any) {
    this.selectedData = expenseDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  getexpensesheaderbyemployeeid(): void {
    let empId = this.selectemp ?? this.empinfo?.employeeId;
    this.loading = true
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=Approved&month=${this.seletedMouthly}&year=${this.selectedYear}&searchQuery=${cleanSearchQuery}`,).subscribe({
        next: (data: any) => {
          this.loading = false
         const filteredData = data.filter((item: any) => !item.expenseSummary);
          this.expensesData = filteredData;
          this.originalExpensesData = [...this.expensesData];
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  getFilteredAndSortedExpenses(): IExpense[] {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return this.expensesData;
    }
    
    const searchTerm = this.searchTerm.toLowerCase().trim();
    return this.expensesData.filter((expense: IExpense) => {
      const expenseTitle = expense.expenses_Title?.toLowerCase() || '';
      const totalAmount = expense.totalExpenseAmount?.toString() || '';
      const appliedDate = expense.applied_date || '';
      const expenseDate = expense.expenseitem?.[0]?.expense_Date || '';
      const status = expense.status?.toLowerCase() || '';
      
      return expenseTitle.includes(searchTerm) ||
             totalAmount.includes(searchTerm) ||
             appliedDate.includes(searchTerm) ||
             expenseDate.includes(searchTerm) ||
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
        this.expensesData = [...this.originalExpensesData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.expensesTable) {
          this.expensesTable.reset();
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

      // Handle expense fields
      switch (field) {
        case 'expenseTitle':
          val1 = a.expenses_Title;
          val2 = b.expenses_Title;
          break;
        case 'expenseDate':
          val1 = a.expenseitem?.[0]?.expense_Date;
          val2 = b.expenseitem?.[0]?.expense_Date;
          break;
        case 'appliedDate':
          val1 = a.applied_date;
          val2 = b.applied_date;
          break;
        case 'totalAmount':
          val1 = a.totalExpenseAmount;
          val2 = b.totalExpenseAmount;
          break;
        case 'status':
          val1 = a.status;
          val2 = b.status;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (['expenseDate', 'appliedDate'].includes(field)) {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for amounts
      if (field === 'totalAmount') {
        const num1 = parseFloat(val1) || 0;
        const num2 = parseFloat(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
  viewItem(expid: number,) {
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
         // this.expenseheaderiteams = data;
          this.expenseheaderiteams = {
            ...data,
            expenseitem: data.expenseitem?.map((item: any) => ({
              ...item,
              meta: item.meta ? JSON.parse(item.meta) : null
            }))
          };

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
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
          const filePath = file;
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
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.ExpenseViewURL = null;
            this.toggleViewModal();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
    } else {
      // fallback for other types if needed
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }

  toggleViewModal() {
    this.modalService.dismissAll();
    this.openimgaeModal(this.viewattamchment)
  }

  isImageFile(url: any): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png');
  }

  openimgaeModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}