import { Component, ViewChild } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { IExpense, IExpenseHeaders, INewExpense } from '../../../Interfaces/claimsandexpenses.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-processed-expenses',
  imports: [CommonModule, DateformatPipe, NgxDocViewerModule, FormsModule, NoDataFoundComponent],
  templateUrl: './processed-expenses.component.html',
  styleUrl: './processed-expenses.component.scss'
})
export class ProcessedExpensesComponent {
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  commentsrecivced = [] as any
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  constructor(
    private http: HttpService, private modalService: NgbModal, private sanitizer: DomSanitizer, public rbac: RbacService) { }
    searchTerm: any = ''
    expenesEmplyeedata=new BehaviorSubject< IExpense[]>([])
  draftsCount: number = 0;
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensesheaderbyemployeeid();
  }
  opencommentsModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
  getexpensesheaderbyemployeeid(): void {
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${this.empinfo.employeeId}&status=Processed&searchQuery=${cleanSearchQuery}`, ).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata.next(data) 

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  comments_Function(comments: any) {
    this.commentsrecivced = comments
  }

  viewItem(expid: number,) {
    console.log(expid);
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

  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.value).subscribe({
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
          const filePath = file.value;
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
