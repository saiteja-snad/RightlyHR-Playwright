import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IExpense, IExpenseHeaders, INewExpense } from '../../../interfaces/claimsandexpenses.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import {  NgxDocViewerModule } from 'ngx-doc-viewer';


@Component({
  selector: 'app-approved-expenses',
  imports: [CommonModule,DateformatPipe,NgxDocViewerModule],
  templateUrl: './approved-expenses.component.html',
  styleUrl: './approved-expenses.component.scss'
})
export class ApprovedExpensesComponent implements OnInit,OnDestroy{
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredApproved = new BehaviorSubject<any[]>([]);
   expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  constructor(public router: Router, private fb: FormBuilder, 
    private http: HttpService, private modalService: NgbModal, private sanitizer: DomSanitizer,) { }
 
  expenesEmplyeedata: IExpense[] = [];
  draftsCount: number = 0;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }




  getexpensesheaderbyemployeeid(_employeeId: number): void {
    //params
    const params = this.empinfo.employeeId;

    this.subscription = this.http
      .getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata = data as IExpense[];
          this.filterapprovedExpenses();
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  filterapprovedExpenses() {
    const draftExpenses = this.expenesEmplyeedata
      .filter((expense) => expense.status === 'Approved')
      .reverse();
    this.flitredApproved.next(draftExpenses);
    this.draftsCount = draftExpenses.length;
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
