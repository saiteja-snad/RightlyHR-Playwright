import { CommonModule } from '@angular/common';
import { Component, effect, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Subscription, BehaviorSubject, takeUntil, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DownloadExpenseComponent } from '../../../../claimsandexpenses/download-expense/download-expense.component';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';
import { IExpenseHeaders, IExpense } from '../../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../../services/http.service';
import { TimeoffYearFilterService } from '../../../../services/timeoff-year-filter.service';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-on-behalf-of-expenses-approved',
  imports: [CommonModule, DateformatPipe, NgxDocViewerModule, FormsModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, InfoIconComponent, DownloadExpenseComponent],
  templateUrl: './on-behalf-of-expenses-approved.component.html',
  styleUrl: './on-behalf-of-expenses-approved.component.scss'
})
export class OnBehalfOfExpensesApprovedComponent {
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
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([])
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(public router: Router, private http: HttpService, private SelectedyeartimeOffService: TimeoffYearFilterService,
    private modalService: NgbModal, private sanitizer: DomSanitizer,) { }

  ngOnInit(): void {
    this.http.selectedEmployeeIdExpensesforonbehalf$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      console.log(id)
      if (id) {
        this.selectemp = id;
        this.getexpensesheaderbyemployeeid();
      } else {
        this.selectemp = null;
        this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
        this.expenesEmplyeedata.next([]);
      }
    });

    // Listen for year changes
    this.SelectedyeartimeOffService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.selectemp) {
        this.getexpensesheaderbyemployeeid();
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
    this.commentsrecivced = comments
  }
  //download expenses popup open function
  openpopupforDownload(content: any, expenseDetails: any) {
    this.selectedData = expenseDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  getexpensesheaderbyemployeeid(): void {
    const empId = this.selectemp;
    const selectedYear = this.SelectedyeartimeOffService.getSelectedYear();
    const month = this.seletedMouthly ?? new Date().getMonth() + 1;
    const status = 'Approved';
    const searchQuery = this.searchTerm?.trim() || '';
    this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=${status}&month=${month}&year=${selectedYear}&searchQuery=${searchQuery}`,).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata.next(data);
          const filteredData = data.filter((item: any) => !item.expenseSummary);
          this.expenesEmplyeedata.next(filteredData)
        }, error: (err: any) => {
          console.log("expensesheadererror", err);
          this.loading = false;
          this.expenesEmplyeedata.next([]);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
  viewItem(expid: number,) {
    this.updataid = expid;
    this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data;
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  onSelectDownload(file: any): void {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).pipe(takeUntil(this.destroy$)).subscribe({
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
      this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url).pipe(takeUntil(this.destroy$))
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
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }

  ngOnDestroy(): void {
    this.expenesEmplyeedata.next([]);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
