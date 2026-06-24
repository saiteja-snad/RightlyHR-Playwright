import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IExpense, IExpenseHeaders } from '../../../Interfaces/claimsandexpenses.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DownloadExpenseComponent } from "../../download-expense/download-expense.component";
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
import { TranslateModule } from '@ngx-translate/core';
import { TableModule, Table } from 'primeng/table';

@Component({
  selector: 'app-pending-expenses',
  imports: [CommonModule, DateformatPipe,TranslateModule, NgxDocViewerModule, FormsModule, NoDataFoundComponent, DataLoaderContentComponent, DownloadExpenseComponent, DocumentViewIconComponent, TableModule],
  templateUrl: './pending-expenses.component.html',
  styleUrl: './pending-expenses.component.scss'
})

export class PendingExpensesComponent implements OnInit, OnDestroy {
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredWaitingforApprovalExpenses = new BehaviorSubject<any[]>([]);
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  @ViewChild('dt1') table!: Table;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  commentsrecivced = [] as any
  searchTerm: any = ''
  approverComments = [] as any[];
  seletedMouthly: any;
  loading = false
  @ViewChild('commentspopup') modalContent: any;
  expenesEmplyeedata: IExpense[] = [];
  originalExpenseData: IExpense[] = [];
  draftsCount: number = 0;
  expensesAttachment: any;
  selectedData = {} as any;
  constructor(private http: HttpService, public formValidation: FormValidationService, private modalService: NgbModal, private sanitizer: DomSanitizer, private SelectedyeartimeOffService: TimeoffYearFilterService) { }

  selectedYear: any;
  selectemp: any;
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
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
  //download expenses popup open function
  openpopupforDownload(content: any, expenseDetails: any) {
    this.selectedData = expenseDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  comments_Function(comments: any) {
    this.commentsrecivced = comments
  }

  getexpensesheaderbyemployeeid(): void {
    let empId = this.selectemp ?? this.empinfo?.employeeId;
    this.loading = true
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=Waiting for Approval&month=${this.seletedMouthly}&year=${this.selectedYear}&searchQuery=${cleanSearchQuery}`,).subscribe({
        next: (data: any) => {
          this.loading = false
          const filteredData = data.filter((item: any) => !item.expenseSummary);
          this.originalExpenseData = [...filteredData];
          this.expenesEmplyeedata = [...filteredData];

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  getFilteredAndSortedExpenses() {
    return this.expenesEmplyeedata;
  }

  customSort(event: any) {
    const field = event.field;
    const order = event.order;

    if (order === 0) {
      // Reset to original order
      this.expenesEmplyeedata = [...this.originalExpenseData];
    } else {
      this.expenesEmplyeedata.sort((a: any, b: any) => {
        let aVal, bVal;

        if (field === 'expenses_Title') {
          aVal = a.expenses_Title?.toLowerCase() || '';
          bVal = b.expenses_Title?.toLowerCase() || '';
        } else if (field === 'expense_Date') {
          aVal = new Date(a.expenseitem?.[0]?.expense_Date || 0);
          bVal = new Date(b.expenseitem?.[0]?.expense_Date || 0);
        } else if (field === 'applied_date') {
          aVal = new Date(a.applied_date || 0);
          bVal = new Date(b.applied_date || 0);
        } else if (field === 'totalExpenseAmount') {
          aVal = parseFloat(a.totalExpenseAmount) || 0;
          bVal = parseFloat(b.totalExpenseAmount) || 0;
        } else if (field === 'status') {
          aVal = a.status?.toLowerCase() || '';
          bVal = b.status?.toLowerCase() || '';
        } else {
          aVal = a[field];
          bVal = b[field];
        }

        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }
  }
  
  viewItem(expid: number,) {
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.approverComments = value;
  }
  private renameFiles(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
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
    this.openModal(this.viewattamchment)
  }

  isImageFile(url: any): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}