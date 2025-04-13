import { Component, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IExpense, IExpenseHeaders } from '../../../Interfaces/claimsandexpenses.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';

@Component({
  selector: 'app-rejected-expenses',
  imports: [DateformatPipe,CommonModule,NgxDocViewerModule,FormsModule],
  templateUrl: './rejected-expenses.component.html',
  styleUrl: './rejected-expenses.component.scss'
})
export class RejectedExpensesComponent {
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;

  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  constructor(
    private http: HttpService, private modalService: NgbModal, private sanitizer: DomSanitizer,) { }
 
    searchTerm: any = ''
    expenesEmplyeedata=new BehaviorSubject< IExpense[]>([])
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensesheaderbyemployeeid();
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getexpensesheaderbyemployeeid(): void {
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${this.empinfo.employeeId}&status=Rejected&searchQuery=${cleanSearchQuery}`, ).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata.next(data) 

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
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
    if (url?.endsWith('jpg') || url?.endsWith('png') || url?.endsWith('jpeg') ) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.toggleViewModal();
          },

          error: (reason) => console.log(reason),
        });
    } else {
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }
  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment)
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
